import { auth } from '../firebase';

export class ApiRequestError extends Error {
  status: number;
  code: string;
  retryable: boolean;

  constructor(
    message: string,
    status = 500,
    code = 'API_ERROR',
    retryable = false
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

type AuthRequiredListener = (code: string) => void;
const authRequiredListeners = new Set<AuthRequiredListener>();

export function onApiAuthRequired(listener: AuthRequiredListener): () => void {
  authRequiredListeners.add(listener);
  return () => {
    authRequiredListeners.delete(listener);
  };
}

function notifyAuthRequired(code: string) {
  for (const listener of authRequiredListeners) {
    try {
      listener(code);
    } catch {
      // ignore listener errors
    }
  }
}

export function getFriendlyErrorMessage(err: unknown, fallbackMessage: string): string {
  if (err instanceof ApiRequestError) {
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallbackMessage;
}

async function fetchWithBearerToken(url: string, body: unknown, idToken: string): Promise<Response> {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      redirect: 'manual',
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(
      'Unable to reach the SME Brand Studio server. Please check your connection and try again.',
      0,
      'NETWORK_ERROR',
      true
    );
  }
}

function classifyHtmlInterceptionError(status: number, rawHtml: string, redirected = false): ApiRequestError {
  const lower = rawHtml.toLowerCase();

  // Google AI Studio Development Preview warmup page (Nginx 502/503/504 -> /warmup.html as HTTP 200)
  if (
    lower.includes('<title>starting server...</title>') ||
    lower.includes('starting server...') ||
    lower.includes('/warmup.html')
  ) {
    return new ApiRequestError(
      'The preview server is still starting up. Please wait a few seconds and try again.',
      503,
      'SERVER_WARMING_UP',
      true
    );
  }

  // Google AI Studio Development Preview auth-bridge / cookie-check HTML interception
  if (
    redirected ||
    lower.includes('<title>cookie check</title>') ||
    lower.includes('__cookie_check') ||
    lower.includes('applet-auth-bridge') ||
    lower.includes('__aistudio_auth') ||
    lower.includes('_aistudio-iframe.js')
  ) {
    return new ApiRequestError(
      'Your Google AI Studio Preview session needs to be refreshed. Please reload the Preview window and try again.',
      503,
      'PREVIEW_AUTH_REQUIRED',
      true
    );
  }

  const normalizedStatus = status >= 400 ? status : 502;
  return new ApiRequestError(
    `The server returned an unexpected web page instead of JSON data (HTTP ${status || 500}). Please refresh the Preview session or wait a moment before retrying.`,
    normalizedStatus,
    'UNEXPECTED_HTML_RESPONSE',
    true
  );
}

export async function parseApiJsonResponse<T>(response: Response): Promise<T> {
  // Detect blocked or manual-mode 3xx redirects (e.g., AI Studio Preview auth-bridge redirect)
  if (
    response.type === 'opaqueredirect' ||
    (response.status >= 300 && response.status < 400)
  ) {
    throw new ApiRequestError(
      'Your Google AI Studio Preview session redirected for authentication. Please refresh the Preview window and try again.',
      503,
      'PREVIEW_SESSION_REDIRECT',
      true
    );
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const rawText = await response.text();
  const trimmed = rawText.trimStart();
  const trimmedLower = trimmed.toLowerCase();

  // Detect HTML returned instead of JSON (never treat an HTML page as a valid API response)
  if (
    contentType.includes('text/html') ||
    trimmedLower.startsWith('<!doctype') ||
    trimmedLower.startsWith('<html') ||
    trimmed.startsWith('<')
  ) {
    throw classifyHtmlInterceptionError(response.status, rawText, Boolean(response.redirected));
  }

  if (!rawText) {
    throw new ApiRequestError(
      `The server returned an empty response (HTTP ${response.status}). Please try again.`,
      response.status || 502,
      'EMPTY_RESPONSE',
      response.status >= 500
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new ApiRequestError(
      'Received an unexpected or malformed response format from the server. Please try again.',
      response.status || 502,
      'INVALID_JSON',
      true
    );
  }

  if (!response.ok || parsed?.success === false) {
    const status = response.status || 500;
    const errorCode: string =
      parsed?.code ||
      (status === 401
        ? 'AUTH_REQUIRED'
        : status === 503
        ? 'SERVICE_UNAVAILABLE'
        : 'API_ERROR');

    if (status === 401 || errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
      notifyAuthRequired(errorCode);
    }

    const message: string =
      parsed?.error ||
      (status === 503
        ? 'The AI generation service is experiencing high demand right now. Please wait a few seconds and retry.'
        : status === 429
        ? 'Too many requests are being processed right now. Please wait a moment and try again.'
        : status === 413
        ? 'The uploaded image is too large to process. Please compress it or choose a smaller image.'
        : status === 401
        ? 'Please log in to your SME Brand Studio account to continue.'
        : status === 403
        ? 'Your account does not have permission for this action, or email verification is required.'
        : `Request failed (HTTP ${status}). Please try again.`);

    const retryable =
      typeof parsed?.retryable === 'boolean'
        ? parsed.retryable
        : status === 503 || status === 429 || status === 502 || status === 504;

    throw new ApiRequestError(message, status, errorCode, retryable);
  }

  return parsed as T;
}

export async function postJsonApi<T>(url: string, body: unknown): Promise<T> {
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    notifyAuthRequired('AUTH_REQUIRED');
    throw new ApiRequestError(
      'Please log in or create a free account to use SME Brand Studio AI tools.',
      401,
      'AUTH_REQUIRED',
      false
    );
  }

  let idToken: string;
  try {
    idToken = await currentUser.getIdToken();
  } catch {
    notifyAuthRequired('AUTH_REQUIRED');
    throw new ApiRequestError(
      'Could not verify your active login session. Please log in again.',
      401,
      'AUTH_REQUIRED',
      false
    );
  }

  let response = await fetchWithBearerToken(url, body, idToken);

  // Retry once with a force-refreshed Firebase ID token if server returned HTTP 401
  if (response.status === 401) {
    try {
      const refreshedToken = await currentUser.getIdToken(true);
      if (refreshedToken && refreshedToken !== idToken) {
        response = await fetchWithBearerToken(url, body, refreshedToken);
      }
    } catch {
      // Fall through to normal 401 response handling
    }
  }

  return parseApiJsonResponse<T>(response);
}
