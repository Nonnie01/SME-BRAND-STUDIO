import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import {
  resolveImagePart,
  isPublicIpAddress,
  validateRemoteImageUrl,
  type DnsResolvedAddress,
  type HttpRequestFn,
  type ResolveImageOptions,
} from '../server/imageResolver';

// Minimal valid raster image byte fixtures
const VALID_JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9,
]);
const VALID_PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);
const VALID_WEBP_BYTES = Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.from([0x18, 0x00, 0x00, 0x00]),
  Buffer.from('WEBP', 'ascii'),
  Buffer.from('VP8 ', 'ascii'),
  Buffer.from([0x00, 0x00, 0x00, 0x00]),
]);

interface MockResponseSpec {
  statusCode: number;
  headers?: Record<string, string | undefined>;
  chunks?: Buffer[];
  delayMs?: number;
  hang?: boolean;
}

function createMockTransport(
  handler: (
    reqOptions: Record<string, any>,
    resolvedLookupIp: string | null
  ) => MockResponseSpec
): { request: HttpRequestFn; calls: Array<{ hostname: string; path: string; pinnedIp: string | null }> } {
  const calls: Array<{ hostname: string; path: string; pinnedIp: string | null }> = [];

  const request: HttpRequestFn = (reqOptions, cb) => {
    const req = new EventEmitter() as any;
    req.destroyed = false;
    req.destroy = (err?: Error) => {
      req.destroyed = true;
      if (err) {
        queueMicrotask(() => req.emit('error', err));
      }
      return req;
    };
    req.setTimeout = () => req;
    req.end = () => {
      const execute = (pinnedIp: string | null) => {
        if (req.destroyed) return;
        calls.push({
          hostname: String(reqOptions.hostname || ''),
          path: String(reqOptions.path || ''),
          pinnedIp,
        });

        const spec = handler(reqOptions, pinnedIp);
        if (spec.hang) {
          return;
        }

        const res = new EventEmitter() as any;
        res.statusCode = spec.statusCode;
        res.headers = spec.headers || {};
        res.destroyed = false;
        res.resume = () => {};
        res.destroy = () => {
          res.destroyed = true;
        };

        const emitResponse = () => {
          if (req.destroyed) return;
          cb(res);
          const chunks = spec.chunks || [];
          for (const chunk of chunks) {
            if (res.destroyed || req.destroyed) return;
            res.emit('data', chunk);
          }
          if (!res.destroyed && !req.destroyed) {
            res.emit('end');
          }
        };

        if (spec.delayMs && spec.delayMs > 0) {
          setTimeout(emitResponse, spec.delayMs);
        } else {
          queueMicrotask(emitResponse);
        }
      };

      if (typeof reqOptions.lookup === 'function') {
        reqOptions.lookup(
          String(reqOptions.hostname || ''),
          { all: true },
          (err: Error | null, addresses: any) => {
            if (err) {
              req.destroy(err);
              return;
            }
            const firstIp = Array.isArray(addresses)
              ? addresses[0]?.address || null
              : typeof addresses === 'string'
              ? addresses
              : null;
            execute(firstIp);
          }
        );
      } else {
        execute(null);
      }
    };

    return req as http.ClientRequest;
  };

  return { request, calls };
}

test('isPublicIpAddress rejects all loopback, private, link-local, metadata, and non-public IPv4/IPv6 ranges', () => {
  const blockedIps = [
    '0.0.0.0',
    '0.1.2.3',
    '10.0.0.1',
    '10.255.255.254',
    '100.64.0.1',
    '100.100.100.200', // Alibaba metadata
    '127.0.0.1',
    '127.0.1.1',
    '127.255.255.254',
    '169.254.169.254', // AWS/GCP/Azure metadata
    '169.254.170.2', // AWS ECS metadata
    '169.254.0.1',
    '172.16.0.1',
    '172.31.255.254',
    '192.0.0.1',
    '192.0.2.1', // TEST-NET-1
    '192.88.99.1',
    '192.168.0.1',
    '192.168.1.254',
    '198.18.0.1',
    '198.51.100.1', // TEST-NET-2
    '203.0.113.1', // TEST-NET-3
    '224.0.0.1', // Multicast
    '240.0.0.1', // Reserved
    '255.255.255.255',
    '::',
    '::1',
    '::ffff:127.0.0.1',
    '::ffff:169.254.169.254',
    '::ffff:10.0.0.1',
    '::ffff:192.168.1.1',
    '::ffff:7f00:1',
    'fe80::1',
    'fe80::1%eth0',
    'fc00::1',
    'fd00:ec2::254', // AWS IPv6 metadata
    'ff02::1',
    '64:ff9b::127.0.0.1',
    '100::1',
    '2001:db8::1',
    '2001::1', // Teredo
    '2002:7f00:1::1', // 6to4 encapsulating 127.0.0.1
  ];

  for (const ip of blockedIps) {
    assert.equal(isPublicIpAddress(ip), false, `Expected ${ip} to be blocked`);
  }

  const publicIps = [
    '93.184.216.34',
    '151.101.1.69',
    '8.8.8.8',
    '1.1.1.1',
    '172.32.0.1',
    '192.169.1.1',
    '2606:4700:4700::1111',
    '2606:2800:220:1:248:1893:25c8:1946',
  ];

  for (const ip of publicIps) {
    assert.equal(isPublicIpAddress(ip), true, `Expected ${ip} to be allowed`);
  }
});

test('resolveImagePart blocks localhost, obfuscated IPv4, IPv6 internal URLs, metadata hosts, bad schemes, ports, and credentials without invoking transport', async () => {
  const { request, calls } = createMockTransport(() => ({
    statusCode: 200,
    headers: { 'content-type': 'image/jpeg' },
    chunks: [VALID_JPEG_BYTES],
  }));

  const blockedUrls = [
    'http://localhost/image.jpg',
    'https://localhost./image.jpg',
    'http://api.localhost/image.jpg',
    'http://127.0.0.1/image.jpg',
    'http://127.0.0.1:3000/api/health',
    'http://0.0.0.0/image.jpg',
    'http://2130706433/image.jpg',
    'http://0x7f000001/image.jpg',
    'http://0177.0.0.1/image.jpg',
    'http://127.1/image.jpg',
    'http://10.0.0.5/secret.png',
    'http://172.16.0.10/secret.png',
    'http://192.168.1.1/secret.png',
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    'http://metadata.google.internal/computeMetadata/v1/',
    'https://metadata.internal/token',
    'http://service.local/logo.png',
    'http://[::1]/image.jpg',
    'http://[::]/image.jpg',
    'http://[fd00:ec2::254]/latest/meta-data/',
    'http://[fe80::1]/image.jpg',
    'http://[::ffff:127.0.0.1]/image.jpg',
    'http://[::ffff:169.254.169.254]/latest/meta-data/',
    'http://[2002:7f00:0001::]/image.jpg',
    'https://trusted.com@127.0.0.1/image.jpg',
    'https://images.unsplash.com:8080/photo.jpg',
    'file:///etc/passwd',
    'ftp://images.unsplash.com/photo.jpg',
    'gopher://127.0.0.1:6379/_INFO',
  ];

  const opts: ResolveImageOptions = {
    dnsLookup: async () => {
      throw new Error('DNS should not be called for blocked literal/hostname URLs');
    },
    httpRequest: request,
    httpsRequest: request,
  };

  for (const url of blockedUrls) {
    const result = await resolveImagePart(url, 'image/jpeg', opts);
    assert.equal(result, null, `Expected SSRF URL to be rejected: ${url}`);
  }
  assert.equal(calls.length, 0, 'Transport must never be invoked for blocked URLs');
});

test('resolveImagePart blocks live local loopback HTTP server without connecting', async () => {
  let receivedHits = 0;
  const server = http.createServer((_req, res) => {
    receivedHits += 1;
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(VALID_JPEG_BYTES);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as any;

  try {
    const res1 = await resolveImagePart(`http://127.0.0.1:${addr.port}/secret.jpg`);
    const res2 = await resolveImagePart(`http://127.0.0.1/secret.jpg`);
    assert.equal(res1, null);
    assert.equal(res2, null);
    assert.equal(receivedHits, 0);
  } finally {
    server.close();
  }
});

test('resolveImagePart blocks DNS resolving to private/loopback/mixed IPs and prevents DNS rebinding via pinned lookup', async () => {
  const { request, calls } = createMockTransport(() => ({
    statusCode: 200,
    headers: { 'content-type': 'image/jpeg' },
    chunks: [VALID_JPEG_BYTES],
  }));

  // 1. Single private A record
  assert.equal(
    await resolveImagePart('https://rebind.example.com/a.jpg', 'image/jpeg', {
      dnsLookup: async () => [{ address: '127.0.0.1', family: 4 }],
      httpsRequest: request,
    }),
    null
  );

  // 2. Private IPv6 AAAA record
  assert.equal(
    await resolveImagePart('https://rebind6.example.com/a.jpg', 'image/jpeg', {
      dnsLookup: async () => [{ address: 'fd00:ec2::254', family: 6 }],
      httpsRequest: request,
    }),
    null
  );

  // 3. Mixed public + internal IP (DNS poisoning / split response)
  assert.equal(
    await resolveImagePart('https://mixed.example.com/a.jpg', 'image/jpeg', {
      dnsLookup: async () => [
        { address: '93.184.216.34', family: 4 },
        { address: '169.254.169.254', family: 4 },
      ],
      httpsRequest: request,
    }),
    null
  );

  // 4. Empty DNS records
  assert.equal(
    await resolveImagePart('https://nodns.example.com/a.jpg', 'image/jpeg', {
      dnsLookup: async () => [],
      httpsRequest: request,
    }),
    null
  );

  assert.equal(calls.length, 0);

  // 5. DNS Rebinding defense: even if an attacker's DNS server flips to 127.0.0.1 on any 2nd lookup,
  // resolveImagePart calls dnsLookup ONLY ONCE per hop and pins that exact public IP on the request.
  let lookupCount = 0;
  const okResult = await resolveImagePart('https://cdn.example.com/product.jpg', 'image/jpeg', {
    dnsLookup: async (): Promise<DnsResolvedAddress[]> => {
      lookupCount += 1;
      if (lookupCount === 1) {
        return [{ address: '93.184.216.34', family: 4 }];
      }
      return [{ address: '127.0.0.1', family: 4 }];
    },
    httpsRequest: request,
  });

  assert.ok(okResult, 'First public lookup should succeed');
  assert.equal(lookupCount, 1, 'DNS lookup must run once and pin IP without re-querying');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].pinnedIp, '93.184.216.34');
});

test('resolveImagePart blocks unsafe redirects and enforces maxRedirects, while allowing safe public redirects', async () => {
  const dnsMap: Record<string, DnsResolvedAddress[]> = {
    'start.example.com': [{ address: '93.184.216.34', family: 4 }],
    'images.unsplash.com': [{ address: '151.101.1.69', family: 4 }],
    'evil-internal.example.com': [{ address: '10.10.0.5', family: 4 }],
  };

  // Redirect to cloud metadata IP -> blocked before hitting metadata
  {
    const { request, calls } = createMockTransport((reqOptions) => {
      if (reqOptions.hostname === 'start.example.com') {
        return {
          statusCode: 302,
          headers: { location: 'http://169.254.169.254/latest/meta-data/' },
        };
      }
      return {
        statusCode: 200,
        headers: { 'content-type': 'image/jpeg' },
        chunks: [VALID_JPEG_BYTES],
      };
    });

    const res = await resolveImagePart('https://start.example.com/pic.jpg', 'image/jpeg', {
      dnsLookup: async (host) => dnsMap[host] || [],
      httpRequest: request,
      httpsRequest: request,
    });
    assert.equal(res, null);
    assert.equal(calls.length, 1, 'Redirect target 169.254.169.254 must never be requested');
  }

  // Redirect to domain resolving to RFC1918 private IP -> blocked
  {
    const { request, calls } = createMockTransport((reqOptions) => {
      if (reqOptions.hostname === 'start.example.com') {
        return {
          statusCode: 301,
          headers: { location: 'https://evil-internal.example.com/secret.png' },
        };
      }
      return {
        statusCode: 200,
        headers: { 'content-type': 'image/png' },
        chunks: [VALID_PNG_BYTES],
      };
    });

    const res = await resolveImagePart('https://start.example.com/pic.jpg', 'image/jpeg', {
      dnsLookup: async (host) => dnsMap[host] || [],
      httpsRequest: request,
    });
    assert.equal(res, null);
    assert.equal(calls.length, 1);
  }

  // Excessive redirect loop (> 3 redirects) -> blocked
  {
    let hops = 0;
    const { request } = createMockTransport(() => {
      hops += 1;
      return {
        statusCode: 302,
        headers: { location: `https://start.example.com/hop-${hops}` },
      };
    });

    const res = await resolveImagePart('https://start.example.com/hop-0', 'image/jpeg', {
      dnsLookup: async (host) => dnsMap[host] || [],
      httpsRequest: request,
    });
    assert.equal(res, null);
    assert.equal(hops, 4); // initial + 3 redirects max, blocked on 4th redirect
  }

  // Safe redirect between two validated public HTTPS hosts -> permitted
  {
    const { request, calls } = createMockTransport((reqOptions) => {
      if (reqOptions.hostname === 'start.example.com') {
        return {
          statusCode: 302,
          headers: { location: 'https://images.unsplash.com/photo-123.png' },
        };
      }
      return {
        statusCode: 200,
        headers: { 'content-type': 'image/png; charset=utf-8' },
        chunks: [VALID_PNG_BYTES],
      };
    });

    const res = await resolveImagePart('https://start.example.com/pic', 'image/jpeg', {
      dnsLookup: async (host) => dnsMap[host] || [],
      httpsRequest: request,
    });
    assert.ok(res);
    assert.equal(res.inlineData.mimeType, 'image/png');
    assert.equal(res.inlineData.data, VALID_PNG_BYTES.toString('base64'));
    assert.equal(calls.length, 2);
    assert.equal(calls[1].pinnedIp, '151.101.1.69');
  }
});

test('resolveImagePart enforces download size limits, timeout, Content-Type, and raster magic bytes', async () => {
  const publicDns = async (): Promise<DnsResolvedAddress[]> => [
    { address: '151.101.1.69', family: 4 },
  ];

  // 1. Oversized Content-Length header
  {
    const { request } = createMockTransport(() => ({
      statusCode: 200,
      headers: {
        'content-type': 'image/jpeg',
        'content-length': String(1024 * 1024 * 25),
      },
      chunks: [VALID_JPEG_BYTES],
    }));
    const res = await resolveImagePart('https://images.unsplash.com/big.jpg', 'image/jpeg', {
      dnsLookup: publicDns,
      httpsRequest: request,
      maxRemoteBytes: 1024,
    });
    assert.equal(res, null);
  }

  // 2. Oversized chunked stream without Content-Length
  {
    const hugeChunk = Buffer.concat([VALID_JPEG_BYTES, Buffer.alloc(2048, 0xaa)]);
    const { request } = createMockTransport(() => ({
      statusCode: 200,
      headers: { 'content-type': 'image/jpeg' },
      chunks: [hugeChunk],
    }));
    const res = await resolveImagePart('https://images.unsplash.com/stream.jpg', 'image/jpeg', {
      dnsLookup: publicDns,
      httpsRequest: request,
      maxRemoteBytes: 1024,
    });
    assert.equal(res, null);
  }

  // 3. Timeout enforcement
  {
    const { request } = createMockTransport(() => ({
      statusCode: 200,
      headers: { 'content-type': 'image/jpeg' },
      hang: true,
    }));
    const res = await resolveImagePart('https://images.unsplash.com/slow.jpg', 'image/jpeg', {
      dnsLookup: publicDns,
      httpsRequest: request,
      timeoutMs: 40,
    });
    assert.equal(res, null);
  }

  // 4. Unsupported Content-Type (text/html, application/json, image/svg+xml)
  for (const badMime of ['text/html', 'application/json', 'image/svg+xml', 'text/plain']) {
    const { request } = createMockTransport(() => ({
      statusCode: 200,
      headers: { 'content-type': badMime },
      chunks: [VALID_JPEG_BYTES],
    }));
    const res = await resolveImagePart('https://images.unsplash.com/badmime', 'image/jpeg', {
      dnsLookup: publicDns,
      httpsRequest: request,
    });
    assert.equal(res, null, `Expected ${badMime} to be rejected`);
  }

  // 5. Spoofed image Content-Type containing HTML/non-image body
  {
    const { request } = createMockTransport(() => ({
      statusCode: 200,
      headers: { 'content-type': 'image/png' },
      chunks: [Buffer.from('<html><body>Secret Metadata</body></html>', 'utf8')],
    }));
    const res = await resolveImagePart('https://images.unsplash.com/spoof.png', 'image/png', {
      dnsLookup: publicDns,
      httpsRequest: request,
    });
    assert.equal(res, null);
  }
});

test('resolveImagePart permits valid public IPv4/IPv6 images, customer data URIs, and local sample assets', async () => {
  // Public IPv6 WebP download
  {
    const { request, calls } = createMockTransport(() => ({
      statusCode: 200,
      headers: { 'content-type': 'image/webp' },
      chunks: [VALID_WEBP_BYTES],
    }));

    const res = await resolveImagePart('https://ipv6.cdn.example.com/product.webp', 'image/jpeg', {
      dnsLookup: async () => [{ address: '2606:4700:4700::1111', family: 6 }],
      httpsRequest: request,
    });
    assert.ok(res);
    assert.equal(res.inlineData.mimeType, 'image/webp');
    assert.equal(res.inlineData.data, VALID_WEBP_BYTES.toString('base64'));
    assert.equal(calls[0].pinnedIp, '2606:4700:4700::1111');
  }

  // Customer data URI upload (PNG & JPEG)
  {
    const pngDataUrl = `data:image/png;base64,${VALID_PNG_BYTES.toString('base64')}`;
    const res = await resolveImagePart(pngDataUrl);
    assert.ok(res);
    assert.equal(res.inlineData.mimeType, 'image/png');
    assert.equal(res.inlineData.data, VALID_PNG_BYTES.toString('base64'));

    // Reject SVG or HTML data URIs
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from('<svg></svg>').toString('base64')}`;
    assert.equal(await resolveImagePart(svgDataUrl), null);
  }

  // Raw base64 image (valid JPEG vs non-image text)
  {
    const rawJpegRes = await resolveImagePart(VALID_JPEG_BYTES.toString('base64'));
    assert.ok(rawJpegRes, 'Valid raw base64 JPEG should resolve');
    assert.equal(rawJpegRes.inlineData.mimeType, 'image/jpeg');

    const invalidRawRes = await resolveImagePart(Buffer.from('{"secret":"not-an-image"}').toString('base64'));
    assert.equal(invalidRawRes, null, 'Non-image raw base64 payload must be rejected');
  }

  // Local sample asset & path traversal defense
  {
    const sampleRes = await resolveImagePart('/samples/ankara-kimono.jpg');
    assert.ok(sampleRes, 'Sample product asset /samples/ankara-kimono.jpg must resolve');
    assert.equal(sampleRes.inlineData.mimeType, 'image/jpeg');
    assert.ok(sampleRes.inlineData.data.length > 1000);

    const traversalRes = await resolveImagePart('/samples/../../server.ts');
    assert.equal(traversalRes, null);
  }
});

test('resolveImagePart destroys socket if remoteAddress is non-public at connect time', async () => {
  const spoofedSocketRequest: HttpRequestFn = (_reqOptions, cb) => {
    const req = new EventEmitter() as any;
    const socket = new EventEmitter() as any;
    socket.connecting = true;
    socket.remoteAddress = '169.254.169.254';
    req.destroyed = false;
    req.destroy = (err?: Error) => {
      req.destroyed = true;
      if (err) queueMicrotask(() => req.emit('error', err));
      return req;
    };
    req.end = () => {
      queueMicrotask(() => {
        req.emit('socket', socket);
        socket.connecting = false;
        socket.emit('connect');
        if (!req.destroyed) {
          const res = new EventEmitter() as any;
          res.statusCode = 200;
          res.headers = { 'content-type': 'image/jpeg' };
          res.resume = () => {};
          res.destroy = () => {};
          cb(res);
          res.emit('data', VALID_JPEG_BYTES);
          res.emit('end');
        }
      });
    };
    return req as http.ClientRequest;
  };

  const res = await resolveImagePart('https://images.unsplash.com/photo.jpg', 'image/jpeg', {
    dnsLookup: async () => [{ address: '151.101.1.69', family: 4 }],
    httpsRequest: spoofedSocketRequest,
  });
  assert.equal(res, null);
});

test('validateRemoteImageUrl enforces length limit and clean URL normalization', () => {
  const longUrl = `https://images.unsplash.com/${'a'.repeat(2100)}.jpg`;
  assert.throws(() => validateRemoteImageUrl(longUrl));

  const valid = validateRemoteImageUrl('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800');
  assert.equal(valid.hostname, 'images.unsplash.com');
  assert.equal(valid.port, 443);
  assert.equal(valid.isHttps, true);
});
