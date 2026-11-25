import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ImageInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export interface DnsResolvedAddress {
  address: string;
  family: 4 | 6;
}

export type DnsLookupAllFn = (
  hostname: string,
  options: { all: true; verbatim: true }
) => Promise<DnsResolvedAddress[]>;

export type HttpRequestFn = (
  options: https.RequestOptions,
  callback: (res: http.IncomingMessage) => void
) => http.ClientRequest;

export interface ResolveImageOptions {
  dnsLookup?: DnsLookupAllFn;
  httpRequest?: HttpRequestFn;
  httpsRequest?: HttpRequestFn;
  timeoutMs?: number;
  maxRemoteBytes?: number;
  maxDataUriBytes?: number;
  maxRedirects?: number;
  assetRoots?: string[];
}

export const DEFAULT_FETCH_TIMEOUT_MS = 8000;
export const DEFAULT_MAX_REMOTE_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const DEFAULT_MAX_DATA_URI_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const DEFAULT_MAX_REDIRECTS = 3;
export const MAX_REMOTE_URL_LENGTH = 2048;

export const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const BLOCKED_EXACT_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
  'kubernetes',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.localdomain',
  '.cluster.local',
  '.svc',
];

function resolveDefaultAppRoot(): string {
  const thisFile = fileURLToPath(import.meta.url);
  const thisDir = path.dirname(thisFile);
  const dirName = path.basename(thisDir);
  if (dirName === 'dist-server' || dirName === 'server') {
    return path.resolve(thisDir, '..');
  }
  return thisDir;
}

export function normalizeImageMimeType(rawMime: string | null | undefined): string | null {
  if (!rawMime || typeof rawMime !== 'string') return null;
  const mediaType = rawMime.split(';')[0].trim().toLowerCase();
  if (!SUPPORTED_IMAGE_MIME_TYPES.has(mediaType)) {
    return null;
  }
  return mediaType === 'image/jpg' ? 'image/jpeg' : mediaType;
}

/**
 * Inspects binary magic bytes to verify the payload is genuinely a supported raster image.
 * Rejects HTML, JSON, SVG/XML, plain text, or arbitrary binary masquerading with image headers.
 */
export function detectRasterImageMime(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 3) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // GIF87a / GIF89a
  if (buffer.length >= 6) {
    const gifHeader = buffer.subarray(0, 6).toString('ascii');
    if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
      return 'image/gif';
    }
  }

  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  // HEIC / HEIF ISO BMFF: ....ftyp<brand>
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('ascii').toLowerCase();
    if (brand === 'heic' || brand === 'heix' || brand === 'hevc' || brand === 'hevx') {
      return 'image/heic';
    }
    if (brand === 'mif1' || brand === 'msf1') {
      return 'image/heif';
    }
  }

  return null;
}

function ipv4ToUint32(ip: string): number | null {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  let value = 0;
  for (let i = 1; i <= 4; i++) {
    const part = match[i];
    if (part.length > 1 && part.startsWith('0')) {
      return null;
    }
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = ((value << 8) | octet) >>> 0;
  }
  return value;
}

function isIpv4InCidr(ipUint32: number, networkUint32: number, prefixLen: number): boolean {
  const mask = prefixLen === 0 ? 0 : (0xffffffff << (32 - prefixLen)) >>> 0;
  return (ipUint32 & mask) === (networkUint32 & mask);
}

export function isPublicIpv4(ip: string): boolean {
  if (!net.isIPv4(ip)) return false;
  const addr = ipv4ToUint32(ip);
  if (addr === null) return false;

  // Reject all non-public, reserved, loopback, private, link-local, CGNAT, metadata, test, multicast, and broadcast ranges
  const blockedCidrs: Array<[number, number]> = [
    [0x00000000, 8], // 0.0.0.0/8 ("this network")
    [0x0a000000, 8], // 10.0.0.0/8 (RFC 1918 private)
    [0x64400000, 10], // 100.64.0.0/10 (RFC 6598 CGNAT & Alibaba metadata 100.100.100.200)
    [0x7f000000, 8], // 127.0.0.0/8 (Loopback)
    [0xa9fe0000, 16], // 169.254.0.0/16 (Link-local & AWS/GCP/Azure IMDS 169.254.169.254)
    [0xac100000, 12], // 172.16.0.0/12 (RFC 1918 private)
    [0xc0000000, 24], // 192.0.0.0/24 (IETF protocol assignments)
    [0xc0000200, 24], // 192.0.2.0/24 (TEST-NET-1)
    [0xc0586300, 24], // 192.88.99.0/24 (6to4 relay anycast)
    [0xc0a80000, 16], // 192.168.0.0/16 (RFC 1918 private)
    [0xc6120000, 15], // 198.18.0.0/15 (Benchmarking)
    [0xc6336400, 24], // 198.51.100.0/24 (TEST-NET-2)
    [0xcb007100, 24], // 203.0.113.0/24 (TEST-NET-3)
    [0xe0000000, 4], // 224.0.0.0/4 (Multicast)
    [0xf0000000, 4], // 240.0.0.0/4 (Reserved & Broadcast 255.255.255.255)
  ];

  for (const [netAddr, prefix] of blockedCidrs) {
    if (isIpv4InCidr(addr, netAddr, prefix)) {
      return false;
    }
  }
  return true;
}

function parseIpv6Hextets(rawIp: string): number[] | null {
  if (!rawIp || rawIp.includes('%')) return null;
  if (!net.isIPv6(rawIp)) return null;

  let ip = rawIp.toLowerCase();

  // Convert trailing embedded IPv4 (e.g. ::ffff:127.0.0.1) into two hex groups
  const lastColon = ip.lastIndexOf(':');
  if (lastColon !== -1 && ip.slice(lastColon + 1).includes('.')) {
    const ipv4Part = ip.slice(lastColon + 1);
    const v4 = ipv4ToUint32(ipv4Part);
    if (v4 === null) return null;
    const hi = ((v4 >>> 16) & 0xffff).toString(16);
    const lo = (v4 & 0xffff).toString(16);
    ip = `${ip.slice(0, lastColon + 1)}${hi}:${lo}`;
  }

  const doubleColonParts = ip.split('::');
  if (doubleColonParts.length > 2) return null;

  const parseGroups = (segment: string): number[] | null => {
    if (!segment) return [];
    const parts = segment.split(':');
    const out: number[] = [];
    for (const p of parts) {
      if (!/^[0-9a-f]{1,4}$/.test(p)) return null;
      out.push(Number.parseInt(p, 16));
    }
    return out;
  };

  if (doubleColonParts.length === 1) {
    const groups = parseGroups(ip);
    return groups && groups.length === 8 ? groups : null;
  }

  const left = parseGroups(doubleColonParts[0]);
  const right = parseGroups(doubleColonParts[1]);
  if (!left || !right) return null;
  const zeroFillCount = 8 - (left.length + right.length);
  if (zeroFillCount < 1) return null;

  return [...left, ...new Array<number>(zeroFillCount).fill(0), ...right];
}

export function isPublicIpv6(ip: string): boolean {
  const hextets = parseIpv6Hextets(ip);
  if (!hextets) return false;

  const [h0, h1, h2, h3, h4, h5, h6, h7] = hextets;

  // Handle IPv4-mapped IPv6 ::ffff:0:0/96 by validating the embedded IPv4 address strictly
  if (h0 === 0 && h1 === 0 && h2 === 0 && h3 === 0 && h4 === 0 && h5 === 0xffff) {
    const embeddedIpv4 = `${(h6 >>> 8) & 0xff}.${h6 & 0xff}.${(h7 >>> 8) & 0xff}.${h7 & 0xff}`;
    return isPublicIpv4(embeddedIpv4);
  }

  // Only allow IANA Global Unicast (2000::/3).
  // This rejects ::/128, ::1/128, ::/96, 64:ff9b::/96 (NAT64), 100::/64 (discard),
  // fc00::/7 (ULA incl. AWS IPv6 IMDS fd00:ec2::254), fe80::/10 (link-local),
  // fec0::/10 (site-local), and ff00::/8 (multicast).
  if ((h0 & 0xe000) !== 0x2000) {
    return false;
  }

  // Reject special-purpose / tunneling / non-routable subranges inside 2000::/3
  if (h0 === 0x2001 && h1 === 0x0000) return false; // 2001::/32 Teredo
  if (h0 === 0x2001 && h1 === 0x0002 && h2 === 0x0000) return false; // 2001:2::/48 Benchmarking
  if (h0 === 0x2001 && (h1 & 0xfff0) === 0x0010) return false; // 2001:10::/28 ORCHID & 2001:20::/28 ORCHIDv2
  if (h0 === 0x2001 && (h1 & 0xfff0) === 0x0020) return false; // 2001:20::/28 ORCHIDv2
  if (h0 === 0x2001 && h1 === 0x0db8) return false; // 2001:db8::/32 Documentation
  if (h0 === 0x2002) return false; // 2002::/16 6to4 (can embed private/loopback IPv4)
  if (h0 === 0x3ffe) return false; // 3ffe::/16 Deprecated 6bone

  return true;
}

export function isPublicIpAddress(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const cleaned = ip.trim().replace(/^\[|\]$/g, '');
  if (!cleaned || cleaned.includes('%')) return false;
  const kind = net.isIP(cleaned);
  if (kind === 4) return isPublicIpv4(cleaned);
  if (kind === 6) return isPublicIpv6(cleaned);
  return false;
}

export interface ValidatedRemoteTarget {
  url: URL;
  hostname: string;
  isHttps: boolean;
  port: number;
  isIpLiteral: boolean;
}

export function validateRemoteImageUrl(rawUrl: string): ValidatedRemoteTarget {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('URL is empty');
  }
  if (rawUrl.length > MAX_REMOTE_URL_LENGTH) {
    throw new Error('URL exceeds maximum allowed length');
  }
  if (/[\x00-\x1f\x7f\s]/.test(rawUrl)) {
    throw new Error('URL contains invalid whitespace or control characters');
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL syntax');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Disallowed protocol: ${parsed.protocol}`);
  }

  if (parsed.username !== '' || parsed.password !== '') {
    throw new Error('Credentials in URL are not permitted');
  }

  const isHttps = parsed.protocol === 'https:';
  if (parsed.port !== '') {
    const allowedPort = isHttps ? '443' : '80';
    if (parsed.port !== allowedPort) {
      throw new Error(`Disallowed port: ${parsed.port}`);
    }
  }
  const port = isHttps ? 443 : 80;

  const rawHost = parsed.hostname.toLowerCase();
  const unbracketedHost = rawHost.replace(/^\[|\]$/g, '').replace(/\.+$/, '');
  if (!unbracketedHost || unbracketedHost.includes('%')) {
    throw new Error('Invalid or empty hostname');
  }

  if (BLOCKED_EXACT_HOSTNAMES.has(unbracketedHost)) {
    throw new Error(`Blocked non-public hostname: ${unbracketedHost}`);
  }
  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (unbracketedHost.endsWith(suffix)) {
      throw new Error(`Blocked internal hostname suffix: ${unbracketedHost}`);
    }
  }

  const ipKind = net.isIP(unbracketedHost);
  if (ipKind !== 0) {
    if (!isPublicIpAddress(unbracketedHost)) {
      throw new Error(`Blocked non-public IP literal: ${unbracketedHost}`);
    }
    return {
      url: parsed,
      hostname: unbracketedHost,
      isHttps,
      port,
      isIpLiteral: true,
    };
  }

  return {
    url: parsed,
    hostname: unbracketedHost,
    isHttps,
    port,
    isIpLiteral: false,
  };
}

async function defaultDnsLookupAll(
  hostname: string,
  options: { all: true; verbatim: true }
): Promise<DnsResolvedAddress[]> {
  const results = await dns.promises.lookup(hostname, options);
  return results.map((entry) => ({
    address: entry.address,
    family: entry.family === 6 ? 6 : 4,
  }));
}

export async function resolveAndValidateTargetIps(
  target: ValidatedRemoteTarget,
  dnsLookup: DnsLookupAllFn = defaultDnsLookupAll
): Promise<DnsResolvedAddress[]> {
  if (target.isIpLiteral) {
    const family: 4 | 6 = net.isIPv6(target.hostname) ? 6 : 4;
    if (!isPublicIpAddress(target.hostname)) {
      throw new Error(`Blocked non-public IP literal: ${target.hostname}`);
    }
    return [{ address: target.hostname, family }];
  }

  const records = await dnsLookup(target.hostname, { all: true, verbatim: true });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`DNS lookup returned no addresses for ${target.hostname}`);
  }

  const validated: DnsResolvedAddress[] = [];
  for (const record of records) {
    const address = typeof record?.address === 'string' ? record.address.trim() : '';
    if (!isPublicIpAddress(address)) {
      throw new Error(
        `Blocked hostname ${target.hostname} resolving to non-public IP ${address || 'unknown'}`
      );
    }
    const family: 4 | 6 = net.isIPv6(address) ? 6 : 4;
    validated.push({ address, family });
  }

  return validated;
}

function createPinnedLookup(validatedAddresses: DnsResolvedAddress[]) {
  return (
    _hostname: string,
    options:
      | dns.LookupOptions
      | ((
          err: NodeJS.ErrnoException | null,
          address: string | dns.LookupAddress[],
          family?: number
        ) => void),
    callback?: (
      err: NodeJS.ErrnoException | null,
      address: string | dns.LookupAddress[],
      family?: number
    ) => void
  ) => {
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'function' ? {} : options || {};
    if (!cb) return;

    if (opts.all) {
      cb(
        null,
        validatedAddresses.map((entry) => ({ address: entry.address, family: entry.family }))
      );
      return;
    }

    const requestedFamily = opts.family;
    const chosen =
      (requestedFamily === 4 || requestedFamily === 6
        ? validatedAddresses.find((entry) => entry.family === requestedFamily)
        : undefined) || validatedAddresses[0];

    if (!chosen) {
      cb(
        new Error('No validated public IP matches requested address family') as NodeJS.ErrnoException,
        ''
      );
      return;
    }

    cb(null, chosen.address, chosen.family);
  };
}

interface SingleHopResult {
  kind: 'redirect' | 'image';
  location?: string;
  mimeType?: string;
  buffer?: Buffer;
}

function executePinnedHttpHop(
  target: ValidatedRemoteTarget,
  validatedAddresses: DnsResolvedAddress[],
  remainingTimeoutMs: number,
  maxBytes: number,
  options: ResolveImageOptions
): Promise<SingleHopResult> {
  return new Promise((resolve, reject) => {
    if (remainingTimeoutMs <= 0) {
      reject(new Error('Image download timed out'));
      return;
    }

    const requestFn: HttpRequestFn = target.isHttps
      ? options.httpsRequest || https.request
      : options.httpRequest || http.request;

    let settled = false;
    let req: http.ClientRequest | null = null;
    let activeRes: http.IncomingMessage | null = null;

    const finishReject = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (activeRes && !activeRes.destroyed) {
        activeRes.destroy();
      }
      if (req && !req.destroyed) {
        req.destroy();
      }
      reject(err);
    };

    const finishResolve = (result: SingleHopResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      finishReject(new Error(`Image download timed out after ${remainingTimeoutMs}ms`));
    }, remainingTimeoutMs);

    const reqOptions: https.RequestOptions = {
      protocol: target.url.protocol,
      hostname: target.hostname,
      port: target.port,
      path: `${target.url.pathname}${target.url.search}` || '/',
      method: 'GET',
      agent: false, // Never reuse keep-alive pooled sockets across requests
      timeout: remainingTimeoutMs,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SMEBrandStudio/1.0)',
        Accept: 'image/jpeg, image/png, image/webp, image/gif;q=0.9',
      },
      lookup: createPinnedLookup(validatedAddresses) as any,
      ...(target.isHttps ? { servername: target.hostname } : {}),
    };

    try {
      req = requestFn(reqOptions, (res) => {
        activeRes = res;
        const statusCode = res.statusCode ?? 0;

        // Manual redirect handling — never follow redirects blindly
        if (
          statusCode === 301 ||
          statusCode === 302 ||
          statusCode === 303 ||
          statusCode === 307 ||
          statusCode === 308
        ) {
          const locationHeader = res.headers.location;
          const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;
          res.resume();
          if (!location || typeof location !== 'string') {
            finishReject(new Error(`HTTP ${statusCode} redirect missing Location header`));
            return;
          }
          finishResolve({ kind: 'redirect', location });
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          finishReject(new Error(`HTTP ${statusCode} when fetching remote image`));
          return;
        }

        const rawContentType = Array.isArray(res.headers['content-type'])
          ? res.headers['content-type'][0]
          : res.headers['content-type'];
        const declaredMime = normalizeImageMimeType(rawContentType);
        if (!declaredMime) {
          res.resume();
          finishReject(
            new Error(`Unsupported image Content-Type: ${rawContentType || 'missing'}`)
          );
          return;
        }

        const rawContentLength = Array.isArray(res.headers['content-length'])
          ? res.headers['content-length'][0]
          : res.headers['content-length'];
        if (rawContentLength) {
          const declaredLen = Number.parseInt(rawContentLength, 10);
          if (Number.isFinite(declaredLen) && declaredLen > maxBytes) {
            res.destroy();
            finishReject(
              new Error(`Remote image Content-Length (${declaredLen}) exceeds ${maxBytes} bytes`)
            );
            return;
          }
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on('data', (chunk: Buffer | string) => {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          totalBytes += buf.length;
          if (totalBytes > maxBytes) {
            finishReject(
              new Error(`Remote image stream exceeded max size of ${maxBytes} bytes`)
            );
            return;
          }
          chunks.push(buf);
        });

        res.on('end', () => {
          if (settled) return;
          if (totalBytes === 0) {
            finishReject(new Error('Remote image response body was empty'));
            return;
          }
          const fullBuffer = Buffer.concat(chunks, totalBytes);
          const detectedMime = detectRasterImageMime(fullBuffer);
          if (!detectedMime) {
            finishReject(
              new Error('Downloaded payload did not match supported raster image magic bytes')
            );
            return;
          }
          finishResolve({
            kind: 'image',
            mimeType: detectedMime || declaredMime,
            buffer: fullBuffer,
          });
        });

        res.on('error', (err) => {
          finishReject(err instanceof Error ? err : new Error(String(err)));
        });
      });

      req.on('socket', (socket) => {
        const verifyRemoteAddr = () => {
          const remoteAddr = socket.remoteAddress;
          if (remoteAddr && !isPublicIpAddress(remoteAddr)) {
            finishReject(
              new Error(`Blocked non-public socket remote address: ${remoteAddr}`)
            );
          }
        };
        if (!socket.connecting && socket.remoteAddress) {
          verifyRemoteAddr();
        }
        socket.on('connect', verifyRemoteAddr);
      });

      req.on('timeout', () => {
        finishReject(new Error('Remote image socket timed out'));
      });

      req.on('error', (err) => {
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });

      req.end();
    } catch (err) {
      finishReject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

export async function fetchSafePublicImage(
  initialUrl: string,
  options: ResolveImageOptions = {}
): Promise<{ mimeType: string; buffer: Buffer }> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxBytes = options.maxRemoteBytes ?? DEFAULT_MAX_REMOTE_IMAGE_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const deadline = Date.now() + timeoutMs;

  let currentUrl = initialUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const target = validateRemoteImageUrl(currentUrl);
    const validatedAddresses = await resolveAndValidateTargetIps(target, options.dnsLookup);
    const remainingMs = deadline - Date.now();
    const hopResult = await executePinnedHttpHop(
      target,
      validatedAddresses,
      remainingMs,
      maxBytes,
      options
    );

    if (hopResult.kind === 'image' && hopResult.buffer && hopResult.mimeType) {
      return {
        mimeType: hopResult.mimeType,
        buffer: hopResult.buffer,
      };
    }

    if (hopResult.kind === 'redirect' && hopResult.location) {
      if (hop >= maxRedirects) {
        throw new Error(`Exceeded maximum redirect limit (${maxRedirects})`);
      }
      currentUrl = new URL(hopResult.location, target.url).toString();
      continue;
    }

    throw new Error('Unexpected response while resolving remote image');
  }

  throw new Error('Failed to resolve remote image within redirect limit');
}

/**
 * Resolves an image input (local static asset, safe public HTTP/HTTPS URL, data: URI, or raw base64)
 * into a valid Gemini inlineData part. Never throws or sends invalid strings to Gemini.
 */
export async function resolveImagePart(
  imageInput: string | null | undefined,
  fallbackMime = 'image/jpeg',
  options: ResolveImageOptions = {}
): Promise<ImageInlineDataPart | null> {
  if (!imageInput || typeof imageInput !== 'string') {
    return null;
  }

  const trimmed = imageInput.trim();
  if (!trimmed) {
    return null;
  }

  const maxLocalOrDataBytes = options.maxDataUriBytes ?? DEFAULT_MAX_DATA_URI_IMAGE_BYTES;

  try {
    // 0. Local static asset inside /public or /dist (e.g., /samples/ankara-kimono.jpg)
    // Note: raw base64 JPEGs begin with "/9j/", so exclude that prefix and overly long base64 strings.
    if (trimmed.startsWith('/') && !trimmed.startsWith('/9j/') && trimmed.length <= 512) {
      if (trimmed.includes('\0') || trimmed.includes('..')) {
        console.warn('[ImageResolver] Rejected invalid local asset path');
        return null;
      }

      const relativePath = trimmed.replace(/^\/+/, '');
      const appRoot = resolveDefaultAppRoot();
      const assetRoots = options.assetRoots ?? [
        path.resolve(appRoot, 'public'),
        path.resolve(appRoot, 'dist'),
      ];

      for (const rootDir of assetRoots) {
        if (!fsSync.existsSync(rootDir)) continue;
        let realRoot: string;
        try {
          realRoot = fsSync.realpathSync(rootDir);
        } catch {
          continue;
        }
        const candidatePath = path.resolve(realRoot, relativePath);
        if (!candidatePath.startsWith(realRoot + path.sep) || !fsSync.existsSync(candidatePath)) {
          continue;
        }
        try {
          const realCandidate = fsSync.realpathSync(candidatePath);
          if (!realCandidate.startsWith(realRoot + path.sep)) {
            continue;
          }
          const stat = await fs.stat(realCandidate);
          if (!stat.isFile() || stat.size === 0 || stat.size > maxLocalOrDataBytes) {
            continue;
          }
          const buffer = await fs.readFile(realCandidate);
          const detectedMime = detectRasterImageMime(buffer);
          if (!detectedMime) {
            continue;
          }
          return {
            inlineData: {
              mimeType: detectedMime,
              data: buffer.toString('base64'),
            },
          };
        } catch {
          // Try next candidate asset root
        }
      }

      console.warn(`[ImageResolver] Local public asset not found or invalid: ${relativePath}`);
      return null;
    }

    // 1. Remote web URL — strictly validate protocol, hostname, DNS/IPs, redirects, size, timeout, and MIME
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !trimmed.toLowerCase().startsWith('data:')) {
      if (
        !trimmed.toLowerCase().startsWith('http://') &&
        !trimmed.toLowerCase().startsWith('https://')
      ) {
        console.warn('[ImageResolver] Blocked non-HTTP(S) URL scheme');
        return null;
      }

      try {
        const { mimeType, buffer } = await fetchSafePublicImage(trimmed, options);
        const base64Data = buffer.toString('base64');
        if (!base64Data) return null;
        return {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };
      } catch (fetchErr) {
        console.warn(
          '[ImageResolver] Rejected or failed remote image URL:',
          fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
        );
        return null;
      }
    }

    // 2. Data URL (e.g. data:image/png;base64,....)
    if (trimmed.toLowerCase().startsWith('data:')) {
      const match = trimmed.match(/^data:([^;,]+)(?:;[^,]+)*;base64,(.+)$/is);
      if (match) {
        const declaredMime = normalizeImageMimeType(match[1]);
        if (!declaredMime) {
          console.warn('[ImageResolver] Rejected unsupported data URI MIME type');
          return null;
        }
        const cleanBase64 = match[2].replace(/\s+/g, '');
        if (!cleanBase64 || !/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
          return null;
        }
        const estimatedBytes = Math.floor((cleanBase64.length * 3) / 4);
        if (estimatedBytes > maxLocalOrDataBytes) {
          console.warn('[ImageResolver] Rejected oversized data URI image');
          return null;
        }
        const buffer = Buffer.from(cleanBase64, 'base64');
        if (buffer.length === 0 || buffer.length > maxLocalOrDataBytes) {
          return null;
        }
        const detectedMime = detectRasterImageMime(buffer);
        if (!detectedMime) {
          console.warn('[ImageResolver] Rejected data URI with invalid image payload');
          return null;
        }
        return {
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64,
          },
        };
      }
      return null;
    }

    // 3. Raw base64 string
    const clean = trimmed.replace(/\s+/g, '');
    if (clean.length >= 12 && /^[A-Za-z0-9+/=]+$/.test(clean)) {
      const estimatedBytes = Math.floor((clean.length * 3) / 4);
      if (estimatedBytes > maxLocalOrDataBytes) {
        return null;
      }
      const buffer = Buffer.from(clean, 'base64');
      if (buffer.length === 0 || buffer.length > maxLocalOrDataBytes) {
        return null;
      }
      const detectedMime = detectRasterImageMime(buffer);
      if (!detectedMime) {
        return null;
      }
      return {
        inlineData: {
          mimeType: detectedMime,
          data: clean,
        },
      };
    }

    console.warn(
      '[ImageResolver] Input was not recognized as a valid base64 image or accessible URL'
    );
    return null;
  } catch (err) {
    console.warn('[ImageResolver] Unexpected error resolving image:', err);
    return null;
  }
}
