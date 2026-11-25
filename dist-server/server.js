// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path2 from "path";
import fsSync2 from "fs";
import crypto from "crypto";
import { fileURLToPath as fileURLToPath2 } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { getApps, getApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// server/imageResolver.ts
import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import net from "node:net";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var DEFAULT_FETCH_TIMEOUT_MS = 8e3;
var DEFAULT_MAX_REMOTE_IMAGE_BYTES = 10 * 1024 * 1024;
var DEFAULT_MAX_DATA_URI_IMAGE_BYTES = 15 * 1024 * 1024;
var DEFAULT_MAX_REDIRECTS = 3;
var MAX_REMOTE_URL_LENGTH = 2048;
var SUPPORTED_IMAGE_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif"
]);
var BLOCKED_EXACT_HOSTNAMES = /* @__PURE__ */ new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "kubernetes",
  "kubernetes.default",
  "kubernetes.default.svc"
]);
var BLOCKED_HOSTNAME_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".localdomain",
  ".cluster.local",
  ".svc"
];
function resolveDefaultAppRoot() {
  const thisFile = fileURLToPath(import.meta.url);
  const thisDir = path.dirname(thisFile);
  const dirName = path.basename(thisDir);
  if (dirName === "dist-server" || dirName === "server") {
    return path.resolve(thisDir, "..");
  }
  return thisDir;
}
function normalizeImageMimeType(rawMime) {
  if (!rawMime || typeof rawMime !== "string") return null;
  const mediaType = rawMime.split(";")[0].trim().toLowerCase();
  if (!SUPPORTED_IMAGE_MIME_TYPES.has(mediaType)) {
    return null;
  }
  return mediaType === "image/jpg" ? "image/jpeg" : mediaType;
}
function detectRasterImageMime(buffer) {
  if (!buffer || buffer.length < 3) return null;
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10) {
    return "image/png";
  }
  if (buffer.length >= 6) {
    const gifHeader = buffer.subarray(0, 6).toString("ascii");
    if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
      return "image/gif";
    }
  }
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii").toLowerCase();
    if (brand === "heic" || brand === "heix" || brand === "hevc" || brand === "hevx") {
      return "image/heic";
    }
    if (brand === "mif1" || brand === "msf1") {
      return "image/heif";
    }
  }
  return null;
}
function ipv4ToUint32(ip) {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  let value = 0;
  for (let i = 1; i <= 4; i++) {
    const part = match[i];
    if (part.length > 1 && part.startsWith("0")) {
      return null;
    }
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8 | octet) >>> 0;
  }
  return value;
}
function isIpv4InCidr(ipUint32, networkUint32, prefixLen) {
  const mask = prefixLen === 0 ? 0 : 4294967295 << 32 - prefixLen >>> 0;
  return (ipUint32 & mask) === (networkUint32 & mask);
}
function isPublicIpv4(ip) {
  if (!net.isIPv4(ip)) return false;
  const addr = ipv4ToUint32(ip);
  if (addr === null) return false;
  const blockedCidrs = [
    [0, 8],
    // 0.0.0.0/8 ("this network")
    [167772160, 8],
    // 10.0.0.0/8 (RFC 1918 private)
    [1681915904, 10],
    // 100.64.0.0/10 (RFC 6598 CGNAT & Alibaba metadata 100.100.100.200)
    [2130706432, 8],
    // 127.0.0.0/8 (Loopback)
    [2851995648, 16],
    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure IMDS 169.254.169.254)
    [2886729728, 12],
    // 172.16.0.0/12 (RFC 1918 private)
    [3221225472, 24],
    // 192.0.0.0/24 (IETF protocol assignments)
    [3221225984, 24],
    // 192.0.2.0/24 (TEST-NET-1)
    [3227017984, 24],
    // 192.88.99.0/24 (6to4 relay anycast)
    [3232235520, 16],
    // 192.168.0.0/16 (RFC 1918 private)
    [3323068416, 15],
    // 198.18.0.0/15 (Benchmarking)
    [3325256704, 24],
    // 198.51.100.0/24 (TEST-NET-2)
    [3405803776, 24],
    // 203.0.113.0/24 (TEST-NET-3)
    [3758096384, 4],
    // 224.0.0.0/4 (Multicast)
    [4026531840, 4]
    // 240.0.0.0/4 (Reserved & Broadcast 255.255.255.255)
  ];
  for (const [netAddr, prefix] of blockedCidrs) {
    if (isIpv4InCidr(addr, netAddr, prefix)) {
      return false;
    }
  }
  return true;
}
function parseIpv6Hextets(rawIp) {
  if (!rawIp || rawIp.includes("%")) return null;
  if (!net.isIPv6(rawIp)) return null;
  let ip = rawIp.toLowerCase();
  const lastColon = ip.lastIndexOf(":");
  if (lastColon !== -1 && ip.slice(lastColon + 1).includes(".")) {
    const ipv4Part = ip.slice(lastColon + 1);
    const v4 = ipv4ToUint32(ipv4Part);
    if (v4 === null) return null;
    const hi = (v4 >>> 16 & 65535).toString(16);
    const lo = (v4 & 65535).toString(16);
    ip = `${ip.slice(0, lastColon + 1)}${hi}:${lo}`;
  }
  const doubleColonParts = ip.split("::");
  if (doubleColonParts.length > 2) return null;
  const parseGroups = (segment) => {
    if (!segment) return [];
    const parts = segment.split(":");
    const out = [];
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
  return [...left, ...new Array(zeroFillCount).fill(0), ...right];
}
function isPublicIpv6(ip) {
  const hextets = parseIpv6Hextets(ip);
  if (!hextets) return false;
  const [h0, h1, h2, h3, h4, h5, h6, h7] = hextets;
  if (h0 === 0 && h1 === 0 && h2 === 0 && h3 === 0 && h4 === 0 && h5 === 65535) {
    const embeddedIpv4 = `${h6 >>> 8 & 255}.${h6 & 255}.${h7 >>> 8 & 255}.${h7 & 255}`;
    return isPublicIpv4(embeddedIpv4);
  }
  if ((h0 & 57344) !== 8192) {
    return false;
  }
  if (h0 === 8193 && h1 === 0) return false;
  if (h0 === 8193 && h1 === 2 && h2 === 0) return false;
  if (h0 === 8193 && (h1 & 65520) === 16) return false;
  if (h0 === 8193 && (h1 & 65520) === 32) return false;
  if (h0 === 8193 && h1 === 3512) return false;
  if (h0 === 8194) return false;
  if (h0 === 16382) return false;
  return true;
}
function isPublicIpAddress(ip) {
  if (!ip || typeof ip !== "string") return false;
  const cleaned = ip.trim().replace(/^\[|\]$/g, "");
  if (!cleaned || cleaned.includes("%")) return false;
  const kind = net.isIP(cleaned);
  if (kind === 4) return isPublicIpv4(cleaned);
  if (kind === 6) return isPublicIpv6(cleaned);
  return false;
}
function validateRemoteImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("URL is empty");
  }
  if (rawUrl.length > MAX_REMOTE_URL_LENGTH) {
    throw new Error("URL exceeds maximum allowed length");
  }
  if (/[\x00-\x1f\x7f\s]/.test(rawUrl)) {
    throw new Error("URL contains invalid whitespace or control characters");
  }
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL syntax");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Disallowed protocol: ${parsed.protocol}`);
  }
  if (parsed.username !== "" || parsed.password !== "") {
    throw new Error("Credentials in URL are not permitted");
  }
  const isHttps = parsed.protocol === "https:";
  if (parsed.port !== "") {
    const allowedPort = isHttps ? "443" : "80";
    if (parsed.port !== allowedPort) {
      throw new Error(`Disallowed port: ${parsed.port}`);
    }
  }
  const port2 = isHttps ? 443 : 80;
  const rawHost = parsed.hostname.toLowerCase();
  const unbracketedHost = rawHost.replace(/^\[|\]$/g, "").replace(/\.+$/, "");
  if (!unbracketedHost || unbracketedHost.includes("%")) {
    throw new Error("Invalid or empty hostname");
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
      port: port2,
      isIpLiteral: true
    };
  }
  return {
    url: parsed,
    hostname: unbracketedHost,
    isHttps,
    port: port2,
    isIpLiteral: false
  };
}
async function defaultDnsLookupAll(hostname, options) {
  const results = await dns.promises.lookup(hostname, options);
  return results.map((entry) => ({
    address: entry.address,
    family: entry.family === 6 ? 6 : 4
  }));
}
async function resolveAndValidateTargetIps(target, dnsLookup = defaultDnsLookupAll) {
  if (target.isIpLiteral) {
    const family = net.isIPv6(target.hostname) ? 6 : 4;
    if (!isPublicIpAddress(target.hostname)) {
      throw new Error(`Blocked non-public IP literal: ${target.hostname}`);
    }
    return [{ address: target.hostname, family }];
  }
  const records = await dnsLookup(target.hostname, { all: true, verbatim: true });
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`DNS lookup returned no addresses for ${target.hostname}`);
  }
  const validated = [];
  for (const record of records) {
    const address = typeof record?.address === "string" ? record.address.trim() : "";
    if (!isPublicIpAddress(address)) {
      throw new Error(
        `Blocked hostname ${target.hostname} resolving to non-public IP ${address || "unknown"}`
      );
    }
    const family = net.isIPv6(address) ? 6 : 4;
    validated.push({ address, family });
  }
  return validated;
}
function createPinnedLookup(validatedAddresses) {
  return (_hostname, options, callback) => {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "function" ? {} : options || {};
    if (!cb) return;
    if (opts.all) {
      cb(
        null,
        validatedAddresses.map((entry) => ({ address: entry.address, family: entry.family }))
      );
      return;
    }
    const requestedFamily = opts.family;
    const chosen = (requestedFamily === 4 || requestedFamily === 6 ? validatedAddresses.find((entry) => entry.family === requestedFamily) : void 0) || validatedAddresses[0];
    if (!chosen) {
      cb(
        new Error("No validated public IP matches requested address family"),
        ""
      );
      return;
    }
    cb(null, chosen.address, chosen.family);
  };
}
function executePinnedHttpHop(target, validatedAddresses, remainingTimeoutMs, maxBytes, options) {
  return new Promise((resolve, reject) => {
    if (remainingTimeoutMs <= 0) {
      reject(new Error("Image download timed out"));
      return;
    }
    const requestFn = target.isHttps ? options.httpsRequest || https.request : options.httpRequest || http.request;
    let settled = false;
    let req = null;
    let activeRes = null;
    const finishReject = (err) => {
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
    const finishResolve = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };
    const timer = setTimeout(() => {
      finishReject(new Error(`Image download timed out after ${remainingTimeoutMs}ms`));
    }, remainingTimeoutMs);
    const reqOptions = {
      protocol: target.url.protocol,
      hostname: target.hostname,
      port: target.port,
      path: `${target.url.pathname}${target.url.search}` || "/",
      method: "GET",
      agent: false,
      // Never reuse keep-alive pooled sockets across requests
      timeout: remainingTimeoutMs,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SMEBrandStudio/1.0)",
        Accept: "image/jpeg, image/png, image/webp, image/gif;q=0.9"
      },
      lookup: createPinnedLookup(validatedAddresses),
      ...target.isHttps ? { servername: target.hostname } : {}
    };
    try {
      req = requestFn(reqOptions, (res) => {
        activeRes = res;
        const statusCode = res.statusCode ?? 0;
        if (statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
          const locationHeader = res.headers.location;
          const location = Array.isArray(locationHeader) ? locationHeader[0] : locationHeader;
          res.resume();
          if (!location || typeof location !== "string") {
            finishReject(new Error(`HTTP ${statusCode} redirect missing Location header`));
            return;
          }
          finishResolve({ kind: "redirect", location });
          return;
        }
        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          finishReject(new Error(`HTTP ${statusCode} when fetching remote image`));
          return;
        }
        const rawContentType = Array.isArray(res.headers["content-type"]) ? res.headers["content-type"][0] : res.headers["content-type"];
        const declaredMime = normalizeImageMimeType(rawContentType);
        if (!declaredMime) {
          res.resume();
          finishReject(
            new Error(`Unsupported image Content-Type: ${rawContentType || "missing"}`)
          );
          return;
        }
        const rawContentLength = Array.isArray(res.headers["content-length"]) ? res.headers["content-length"][0] : res.headers["content-length"];
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
        const chunks = [];
        let totalBytes = 0;
        res.on("data", (chunk) => {
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
        res.on("end", () => {
          if (settled) return;
          if (totalBytes === 0) {
            finishReject(new Error("Remote image response body was empty"));
            return;
          }
          const fullBuffer = Buffer.concat(chunks, totalBytes);
          const detectedMime = detectRasterImageMime(fullBuffer);
          if (!detectedMime) {
            finishReject(
              new Error("Downloaded payload did not match supported raster image magic bytes")
            );
            return;
          }
          finishResolve({
            kind: "image",
            mimeType: detectedMime || declaredMime,
            buffer: fullBuffer
          });
        });
        res.on("error", (err) => {
          finishReject(err instanceof Error ? err : new Error(String(err)));
        });
      });
      req.on("socket", (socket) => {
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
        socket.on("connect", verifyRemoteAddr);
      });
      req.on("timeout", () => {
        finishReject(new Error("Remote image socket timed out"));
      });
      req.on("error", (err) => {
        finishReject(err instanceof Error ? err : new Error(String(err)));
      });
      req.end();
    } catch (err) {
      finishReject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
async function fetchSafePublicImage(initialUrl, options = {}) {
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
    if (hopResult.kind === "image" && hopResult.buffer && hopResult.mimeType) {
      return {
        mimeType: hopResult.mimeType,
        buffer: hopResult.buffer
      };
    }
    if (hopResult.kind === "redirect" && hopResult.location) {
      if (hop >= maxRedirects) {
        throw new Error(`Exceeded maximum redirect limit (${maxRedirects})`);
      }
      currentUrl = new URL(hopResult.location, target.url).toString();
      continue;
    }
    throw new Error("Unexpected response while resolving remote image");
  }
  throw new Error("Failed to resolve remote image within redirect limit");
}
async function resolveImagePart(imageInput, fallbackMime = "image/jpeg", options = {}) {
  if (!imageInput || typeof imageInput !== "string") {
    return null;
  }
  const trimmed = imageInput.trim();
  if (!trimmed) {
    return null;
  }
  const maxLocalOrDataBytes = options.maxDataUriBytes ?? DEFAULT_MAX_DATA_URI_IMAGE_BYTES;
  try {
    if (trimmed.startsWith("/") && !trimmed.startsWith("/9j/") && trimmed.length <= 512) {
      if (trimmed.includes("\0") || trimmed.includes("..")) {
        console.warn("[ImageResolver] Rejected invalid local asset path");
        return null;
      }
      const relativePath = trimmed.replace(/^\/+/, "");
      const appRoot = resolveDefaultAppRoot();
      const assetRoots = options.assetRoots ?? [
        path.resolve(appRoot, "public"),
        path.resolve(appRoot, "dist")
      ];
      for (const rootDir of assetRoots) {
        if (!fsSync.existsSync(rootDir)) continue;
        let realRoot;
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
              data: buffer.toString("base64")
            }
          };
        } catch {
        }
      }
      console.warn(`[ImageResolver] Local public asset not found or invalid: ${relativePath}`);
      return null;
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !trimmed.toLowerCase().startsWith("data:")) {
      if (!trimmed.toLowerCase().startsWith("http://") && !trimmed.toLowerCase().startsWith("https://")) {
        console.warn("[ImageResolver] Blocked non-HTTP(S) URL scheme");
        return null;
      }
      try {
        const { mimeType, buffer } = await fetchSafePublicImage(trimmed, options);
        const base64Data = buffer.toString("base64");
        if (!base64Data) return null;
        return {
          inlineData: {
            mimeType,
            data: base64Data
          }
        };
      } catch (fetchErr) {
        console.warn(
          "[ImageResolver] Rejected or failed remote image URL:",
          fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
        );
        return null;
      }
    }
    if (trimmed.toLowerCase().startsWith("data:")) {
      const match = trimmed.match(/^data:([^;,]+)(?:;[^,]+)*;base64,(.+)$/is);
      if (match) {
        const declaredMime = normalizeImageMimeType(match[1]);
        if (!declaredMime) {
          console.warn("[ImageResolver] Rejected unsupported data URI MIME type");
          return null;
        }
        const cleanBase64 = match[2].replace(/\s+/g, "");
        if (!cleanBase64 || !/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
          return null;
        }
        const estimatedBytes = Math.floor(cleanBase64.length * 3 / 4);
        if (estimatedBytes > maxLocalOrDataBytes) {
          console.warn("[ImageResolver] Rejected oversized data URI image");
          return null;
        }
        const buffer = Buffer.from(cleanBase64, "base64");
        if (buffer.length === 0 || buffer.length > maxLocalOrDataBytes) {
          return null;
        }
        const detectedMime = detectRasterImageMime(buffer);
        if (!detectedMime) {
          console.warn("[ImageResolver] Rejected data URI with invalid image payload");
          return null;
        }
        return {
          inlineData: {
            mimeType: detectedMime,
            data: cleanBase64
          }
        };
      }
      return null;
    }
    const clean = trimmed.replace(/\s+/g, "");
    if (clean.length >= 12 && /^[A-Za-z0-9+/=]+$/.test(clean)) {
      const estimatedBytes = Math.floor(clean.length * 3 / 4);
      if (estimatedBytes > maxLocalOrDataBytes) {
        return null;
      }
      const buffer = Buffer.from(clean, "base64");
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
          data: clean
        }
      };
    }
    console.warn(
      "[ImageResolver] Input was not recognized as a valid base64 image or accessible URL"
    );
    return null;
  } catch (err) {
    console.warn("[ImageResolver] Unexpected error resolving image:", err);
    return null;
  }
}

// src/data/nigerianRegions.ts
var NIGERIAN_GEOPOLITICAL_ZONES = [
  {
    id: "north-central",
    name: "North Central",
    shortName: "NC",
    description: "Middle Belt agro-commercial & administrative hub",
    states: [
      { name: "Benue" },
      { name: "Kogi" },
      { name: "Kwara" },
      { name: "Nasarawa" },
      { name: "Niger" },
      { name: "Plateau" },
      { name: "Federal Capital Territory (Abuja)", isTerritory: true }
    ]
  },
  {
    id: "north-east",
    name: "North East",
    shortName: "NE",
    description: "Agricultural produce, livestock & border trade",
    states: [
      { name: "Adamawa" },
      { name: "Bauchi" },
      { name: "Borno" },
      { name: "Gombe" },
      { name: "Taraba" },
      { name: "Yobe" }
    ]
  },
  {
    id: "north-west",
    name: "North West",
    shortName: "NW",
    description: "Major historic textile, grain & retail commerce centers",
    states: [
      { name: "Jigawa" },
      { name: "Kaduna" },
      { name: "Kano" },
      { name: "Katsina" },
      { name: "Kebbi" },
      { name: "Sokoto" },
      { name: "Zamfara" }
    ]
  },
  {
    id: "south-east",
    name: "South East",
    shortName: "SE",
    description: "Manufacturing, footwear, tailoring & industrial retail trade",
    states: [
      { name: "Abia" },
      { name: "Anambra" },
      { name: "Ebonyi" },
      { name: "Enugu" },
      { name: "Imo" }
    ]
  },
  {
    id: "south-south",
    name: "South South",
    shortName: "SS",
    description: "Coastal oil economy, hospitality & Niger Delta commerce",
    states: [
      { name: "Akwa Ibom" },
      { name: "Bayelsa" },
      { name: "Cross River" },
      { name: "Delta" },
      { name: "Edo" },
      { name: "Rivers" }
    ]
  },
  {
    id: "south-west",
    name: "South West",
    shortName: "SW",
    description: "Tech, creative industries, fashion capitals & FMCG ports",
    states: [
      { name: "Ekiti" },
      { name: "Lagos" },
      { name: "Ogun" },
      { name: "Ondo" },
      { name: "Osun" },
      { name: "Oyo" }
    ]
  }
];
var ALL_NIGERIAN_STATES_AND_TERRITORIES = NIGERIAN_GEOPOLITICAL_ZONES.flatMap((zone) => zone.states);
var ALL_REGION_NAMES = ALL_NIGERIAN_STATES_AND_TERRITORIES.map((s) => s.name);
var STATE_TO_ZONE_MAP = {};
NIGERIAN_GEOPOLITICAL_ZONES.forEach((zone) => {
  zone.states.forEach((s) => {
    STATE_TO_ZONE_MAP[s.name] = zone.name;
  });
});
function normalizeSelectedRegions(regions) {
  if (!Array.isArray(regions)) return [];
  const validSet = new Set(ALL_REGION_NAMES);
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of regions) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    if (validSet.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}
function formatRegionSummary(selected) {
  if (!selected || selected.length === 0) {
    return "No region selected (Default: Nationwide Delivery)";
  }
  if (selected.length === ALL_REGION_NAMES.length) {
    return "Nationwide Coverage (All 36 States + FCT)";
  }
  const fullySelectedZones = [];
  NIGERIAN_GEOPOLITICAL_ZONES.forEach((zone) => {
    const allZoneStates = zone.states.map((s) => s.name);
    const hasAll = allZoneStates.every((st) => selected.includes(st));
    if (hasAll) {
      fullySelectedZones.push(zone.name);
    }
  });
  if (fullySelectedZones.length === NIGERIAN_GEOPOLITICAL_ZONES.length) {
    return "Nationwide Coverage (All 36 States + FCT)";
  }
  if (selected.length <= 3) {
    return selected.join(", ");
  }
  const firstTwo = selected.slice(0, 2).join(", ");
  return `${firstTwo} & ${selected.length - 2} other ${selected.length - 2 === 1 ? "region" : "regions"}`;
}

// server/regionUtils.ts
var VALID_REGION_SET = new Set(ALL_REGION_NAMES);
var DEFAULT_NATIONWIDE_LABEL = "Nationwide (Nigeria)";
function resolveTargetRegions(selectedRegions, targetLocation) {
  const rawList = Array.isArray(selectedRegions) ? selectedRegions.filter((item) => typeof item === "string") : [];
  const normalized = normalizeSelectedRegions(rawList);
  if (normalized.length > 0) {
    return {
      regions: normalized,
      regionsText: normalized.join(", "),
      summaryText: formatRegionSummary(normalized)
    };
  }
  const cleanLocation = typeof targetLocation === "string" ? targetLocation.trim() : "";
  if (cleanLocation && !cleanLocation.toLowerCase().startsWith("no region selected")) {
    if (VALID_REGION_SET.has(cleanLocation)) {
      return {
        regions: [cleanLocation],
        regionsText: cleanLocation,
        summaryText: cleanLocation
      };
    }
    return {
      regions: [],
      regionsText: cleanLocation,
      summaryText: cleanLocation
    };
  }
  return {
    regions: [],
    regionsText: DEFAULT_NATIONWIDE_LABEL,
    summaryText: DEFAULT_NATIONWIDE_LABEL
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath2(import.meta.url);
var __dirname = path2.dirname(__filename);
var APP_ROOT = path2.basename(__dirname) === "dist-server" ? path2.resolve(__dirname, "..") : __dirname;
function resolveFrontendDistDir() {
  const candidates = [
    path2.resolve(APP_ROOT, "dist"),
    path2.resolve(__dirname, "dist"),
    path2.resolve(process.cwd(), "dist")
  ];
  for (const candidate of candidates) {
    if (fsSync2.existsSync(path2.join(candidate, "index.html"))) {
      return candidate;
    }
  }
  return path2.resolve(APP_ROOT, "dist");
}
function resolveServerPort() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--port=")) {
      const parsed = Number.parseInt(arg.slice("--port=".length), 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    } else if (arg === "--port" && i + 1 < args.length) {
      const parsed = Number.parseInt(args[i + 1], 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  const isProd = process.env.NODE_ENV === "production";
  const envPort = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : NaN;
  if (Number.isFinite(envPort) && envPort > 0) {
    if (!isProd && envPort === 8080) {
      return 3e3;
    }
    return envPort;
  }
  return 3e3;
}
var app = express();
app.set("trust proxy", 1);
var port = resolveServerPort();
app.use(express.json({ limit: "35mb" }));
function parseBooleanEnv(name, defaultValue) {
  const raw = process.env[name];
  if (raw === void 0 || raw === null || raw === "") return defaultValue;
  return raw.trim().toLowerCase() === "true";
}
function parseNonNegativeIntEnv(name, defaultValue) {
  const raw = process.env[name];
  if (raw === void 0 || raw === null || raw === "") return defaultValue;
  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return defaultValue;
  return parsed;
}
function resolveFirebaseProjectId() {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID.trim()) {
    return process.env.FIREBASE_PROJECT_ID.trim();
  }
  try {
    const configPath = path2.resolve(APP_ROOT, "firebase-applet-config.json");
    if (fsSync2.existsSync(configPath)) {
      const parsed = JSON.parse(fsSync2.readFileSync(configPath, "utf8"));
      if (parsed && typeof parsed.projectId === "string" && parsed.projectId.trim()) {
        return parsed.projectId.trim();
      }
    }
  } catch (err) {
    console.warn(
      "[FirebaseAdmin] Could not read firebase-applet-config.json:",
      err instanceof Error ? err.message : String(err)
    );
  }
  return "";
}
var FIREBASE_PROJECT_ID = resolveFirebaseProjectId();
var firebaseAuthVerifierReady = false;
try {
  if (!FIREBASE_PROJECT_ID) {
    throw new Error("Firebase projectId is not configured.");
  }
  const adminApp = getApps().length > 0 ? getApp() : initializeApp({ projectId: FIREBASE_PROJECT_ID });
  getAuth(adminApp);
  firebaseAuthVerifierReady = true;
  console.log(
    `[FirebaseAdmin] ID-token verifier initialized for Firebase project "${FIREBASE_PROJECT_ID}".`
  );
} catch (err) {
  firebaseAuthVerifierReady = false;
  console.error(
    "[FirebaseAdmin] Failed to initialize ID-token verifier:",
    err instanceof Error ? err.message : String(err)
  );
}
app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    ok: true,
    firebaseAuthVerifierReady,
    projectId: FIREBASE_PROJECT_ID || null,
    requireEmailVerifiedForAi: parseBooleanEnv("REQUIRE_EMAIL_VERIFIED_FOR_AI", false)
  });
});
async function requireFirebaseAuth(req, res, next) {
  if (!firebaseAuthVerifierReady) {
    return res.status(503).json({
      success: false,
      error: "Authentication verification service is temporarily unavailable. Please retry shortly.",
      code: "AUTH_SERVICE_UNAVAILABLE",
      retryable: true
    });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({
      success: false,
      error: "Please log in to your SME Brand Studio account to use AI branding tools.",
      code: "AUTH_REQUIRED",
      retryable: false
    });
  }
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const idToken = match?.[1]?.trim();
  if (!idToken) {
    return res.status(401).json({
      success: false,
      error: "Authentication token is missing. Please log in again.",
      code: "AUTH_REQUIRED",
      retryable: false
    });
  }
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (!decoded || !decoded.uid) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication token. Please log in again.",
        code: "INVALID_TOKEN",
        retryable: false
      });
    }
    const requireEmailVerified = parseBooleanEnv("REQUIRE_EMAIL_VERIFIED_FOR_AI", false);
    if (requireEmailVerified && decoded.email_verified !== true) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email address before running AI brand generation.",
        code: "EMAIL_VERIFICATION_REQUIRED",
        retryable: false
      });
    }
    req.authUser = {
      uid: decoded.uid,
      emailVerified: decoded.email_verified === true,
      email: typeof decoded.email === "string" ? decoded.email : void 0,
      isAdmin: decoded.admin === true
    };
    return next();
  } catch (err) {
    const errCode = typeof err?.code === "string" ? err.code : "";
    if (errCode === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        error: "Your login session expired. Please retry or log in again.",
        code: "TOKEN_EXPIRED",
        retryable: false
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication session. Please log in again.",
      code: "INVALID_TOKEN",
      retryable: false
    });
  }
}
var ipMinuteBuckets = /* @__PURE__ */ new Map();
var userMinuteBuckets = /* @__PURE__ */ new Map();
var userDailyBuckets = /* @__PURE__ */ new Map();
var userConcurrencyCounters = /* @__PURE__ */ new Map();
function getUtcDayString(nowMs = Date.now()) {
  return new Date(nowMs).toISOString().slice(0, 10);
}
function secondsUntilUtcMidnight(nowMs = Date.now()) {
  const now = new Date(nowMs);
  const nextMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(1, Math.ceil((nextMidnight - nowMs) / 1e3));
}
function pruneStaleBuckets(nowMs, today) {
  if (ipMinuteBuckets.size > 5e3) {
    for (const [k, v] of ipMinuteBuckets) {
      if (nowMs - v.windowStartMs >= 6e4) ipMinuteBuckets.delete(k);
    }
  }
  if (userMinuteBuckets.size > 5e3) {
    for (const [k, v] of userMinuteBuckets) {
      if (nowMs - v.windowStartMs >= 6e4) userMinuteBuckets.delete(k);
    }
  }
  if (userDailyBuckets.size > 5e3) {
    for (const [k, v] of userDailyBuckets) {
      if (v.utcDay !== today) userDailyBuckets.delete(k);
    }
  }
}
function getTierConfig(tier, emailVerified) {
  if (tier === "image") {
    return {
      perMinute: parseNonNegativeIntEnv("AI_IMAGE_PER_MIN", 2),
      dailyQuota: emailVerified ? parseNonNegativeIntEnv("AI_IMAGE_DAILY_QUOTA", 3) : parseNonNegativeIntEnv("AI_UNVERIFIED_IMAGE_DAILY_QUOTA", 0),
      maxConcurrent: parseNonNegativeIntEnv("AI_IMAGE_MAX_CONCURRENT", 1),
      label: "AI image generation"
    };
  }
  return {
    perMinute: parseNonNegativeIntEnv("AI_TEXT_PER_MIN", 4),
    dailyQuota: emailVerified ? parseNonNegativeIntEnv("AI_TEXT_DAILY_QUOTA", 10) : parseNonNegativeIntEnv("AI_UNVERIFIED_TEXT_DAILY_QUOTA", 2),
    maxConcurrent: parseNonNegativeIntEnv("AI_TEXT_MAX_CONCURRENT", 2),
    label: "AI brand & strategy generation"
  };
}
function createAiQuotaMiddleware(tier) {
  return (req, res, next) => {
    const authUser = req.authUser;
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: "Authentication is required for AI endpoints.",
        code: "AUTH_REQUIRED",
        retryable: false
      });
    }
    const nowMs = Date.now();
    const today = getUtcDayString(nowMs);
    pruneStaleBuckets(nowMs, today);
    const cfg = getTierConfig(tier, authUser.emailVerified);
    const uid = authUser.uid;
    const tierUserKey = `${tier}:${uid}`;
    const clientIp = (req.ip || req.socket?.remoteAddress || "unknown").toString().split(",")[0].trim() || "unknown";
    if (!authUser.emailVerified && cfg.dailyQuota === 0) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email address to unlock AI product photo enhancement and illustrative service visuals.",
        code: "EMAIL_VERIFICATION_REQUIRED",
        retryable: false
      });
    }
    const ipLimitPerMin = parseNonNegativeIntEnv("AI_IP_PER_MIN", 20);
    if (ipLimitPerMin > 0) {
      const ipEntry = ipMinuteBuckets.get(clientIp);
      if (!ipEntry || nowMs - ipEntry.windowStartMs >= 6e4) {
        ipMinuteBuckets.set(clientIp, { windowStartMs: nowMs, count: 1 });
      } else if (ipEntry.count >= ipLimitPerMin) {
        const retryAfter = Math.max(1, Math.ceil((ipEntry.windowStartMs + 6e4 - nowMs) / 1e3));
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          error: "Too many requests from your network right now. Please wait a minute and retry.",
          code: "RATE_LIMITED",
          retryable: true
        });
      } else {
        ipEntry.count += 1;
      }
    }
    const currentConcurrent = userConcurrencyCounters.get(tierUserKey) || 0;
    if (cfg.maxConcurrent > 0 && currentConcurrent >= cfg.maxConcurrent) {
      res.setHeader("Retry-After", "5");
      return res.status(429).json({
        success: false,
        error: `Another ${cfg.label} request is already in progress for your account. Please wait for it to finish.`,
        code: "CONCURRENCY_LIMIT_EXCEEDED",
        retryable: true
      });
    }
    if (cfg.perMinute > 0) {
      const minEntry = userMinuteBuckets.get(tierUserKey);
      if (!minEntry || nowMs - minEntry.windowStartMs >= 6e4) {
        userMinuteBuckets.set(tierUserKey, { windowStartMs: nowMs, count: 1 });
      } else if (minEntry.count >= cfg.perMinute) {
        const retryAfter = Math.max(1, Math.ceil((minEntry.windowStartMs + 6e4 - nowMs) / 1e3));
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          error: `Rate limit reached (${cfg.perMinute}/min) for ${cfg.label}. Please wait ${retryAfter}s and retry.`,
          code: "RATE_LIMITED",
          retryable: true
        });
      } else {
        minEntry.count += 1;
      }
    }
    if (cfg.dailyQuota > 0) {
      const dailyEntry = userDailyBuckets.get(tierUserKey);
      if (!dailyEntry || dailyEntry.utcDay !== today) {
        userDailyBuckets.set(tierUserKey, { utcDay: today, count: 1 });
      } else if (dailyEntry.count >= cfg.dailyQuota) {
        const retryAfter = secondsUntilUtcMidnight(nowMs);
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          error: !authUser.emailVerified ? `Unverified beta account limit reached (${cfg.dailyQuota}/${cfg.label} per day). Verify your email to unlock higher beta limits.` : `Daily beta usage limit reached (${cfg.dailyQuota} ${cfg.label} requests/day). Please try again tomorrow.`,
          code: "DAILY_QUOTA_EXCEEDED",
          retryable: false
        });
      } else {
        dailyEntry.count += 1;
      }
    }
    userConcurrencyCounters.set(tierUserKey, currentConcurrent + 1);
    let released = false;
    const releaseSlot = () => {
      if (released) return;
      released = true;
      const latest = userConcurrencyCounters.get(tierUserKey) || 0;
      if (latest <= 1) {
        userConcurrencyCounters.delete(tierUserKey);
      } else {
        userConcurrencyCounters.set(tierUserKey, latest - 1);
      }
    };
    res.on("finish", releaseSlot);
    res.on("close", releaseSlot);
    return next();
  };
}
var requireAiTextAccess = [requireFirebaseAuth, createAiQuotaMiddleware("text")];
var requireAiImageAccess = [requireFirebaseAuth, createAiQuotaMiddleware("image")];
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var AppApiError = class extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR", retryable = false) {
    super(message);
    this.name = "AppApiError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
};
function classifyGeminiError(err) {
  if (err instanceof AppApiError) {
    return {
      status: err.status,
      code: err.code,
      retryable: err.retryable,
      userMessage: err.message,
      rawMessage: err.message
    };
  }
  const rawMessage = typeof err === "string" ? err : err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err || ""));
  const upper = rawMessage.toUpperCase();
  const numericStatus = Number(err?.status || err?.statusCode || err?.code || 0);
  if (numericStatus === 401 || numericStatus === 403 || upper.includes("API_KEY_INVALID") || upper.includes("API KEY NOT VALID") || upper.includes("PERMISSION_DENIED") || upper.includes("UNAUTHENTICATED")) {
    return {
      status: numericStatus === 401 ? 401 : 403,
      code: "AUTH_ERROR",
      retryable: false,
      userMessage: "AI service authentication or permission check failed. Please verify the configured GEMINI_API_KEY in Settings > Secrets.",
      rawMessage
    };
  }
  if (numericStatus === 400 || upper.includes("INVALID_ARGUMENT") || upper.includes("BAD_REQUEST")) {
    return {
      status: 400,
      code: "INVALID_REQUEST",
      retryable: false,
      userMessage: "The request or uploaded image could not be processed as formatted. Please check your inputs or try another PNG/JPEG image.",
      rawMessage
    };
  }
  if (numericStatus === 404 || upper.includes("NOT_FOUND")) {
    return {
      status: 404,
      code: "MODEL_NOT_FOUND",
      retryable: false,
      userMessage: "The requested AI model endpoint was not found.",
      rawMessage
    };
  }
  if (numericStatus === 503 || upper.includes("503") || upper.includes("UNAVAILABLE") || upper.includes("HIGH DEMAND") || upper.includes("OVERLOADED")) {
    return {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      retryable: true,
      userMessage: "The AI service is currently experiencing high demand (503). Your existing work is preserved \u2014 please wait a few seconds and retry.",
      rawMessage
    };
  }
  if (numericStatus === 429 || upper.includes("429") || upper.includes("RESOURCE_EXHAUSTED") || upper.includes("RATE LIMIT")) {
    return {
      status: 429,
      code: "RATE_LIMITED",
      retryable: true,
      userMessage: "AI request rate limit reached temporarily (429). Please wait a few seconds and retry.",
      rawMessage
    };
  }
  if (numericStatus === 500 || numericStatus === 502 || numericStatus === 504 || upper.includes("ETIMEDOUT") || upper.includes("ECONNRESET") || upper.includes("FETCH FAILED") || upper.includes("DEADLINE_EXCEEDED") || upper.includes("INTERNAL")) {
    return {
      status: numericStatus >= 500 ? numericStatus : 503,
      code: "TRANSIENT_ERROR",
      retryable: true,
      userMessage: "A temporary connection issue interrupted the AI request. Your inputs and existing assets are safe \u2014 please retry.",
      rawMessage
    };
  }
  return {
    status: 500,
    code: "INTERNAL_ERROR",
    retryable: true,
    userMessage: "Could not complete the AI request cleanly. Please try again shortly.",
    rawMessage
  };
}
function safeParseGeminiJson(rawText, contextLabel) {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    throw new AppApiError(
      `The AI service returned an empty response while generating ${contextLabel}. Please retry.`,
      502,
      "EMPTY_AI_RESPONSE",
      true
    );
  }
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  if (cleaned.startsWith("<")) {
    throw new AppApiError(
      `Received unexpected HTML instead of structured data for ${contextLabel}. Please retry.`,
      502,
      "UNEXPECTED_HTML_RESPONSE",
      true
    );
  }
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.error(`[Gemini JSON Parse Error] (${contextLabel}):`, cleaned.slice(0, 200));
    throw new AppApiError(
      `The AI returned malformed JSON while generating ${contextLabel}. Your existing assets were preserved \u2014 please retry.`,
      502,
      "MALFORMED_AI_JSON",
      true
    );
  }
}
function sendApiError(res, error, fallbackMessage) {
  const classified = classifyGeminiError(error);
  return res.status(classified.status).json({
    success: false,
    error: classified.userMessage || fallbackMessage,
    code: classified.code,
    retryable: classified.retryable
  });
}
async function generateContentWithFallback(params) {
  const {
    contents,
    config,
    primaryModel = "gemini-4-hydrogen",
    fallbackModel = "gemini-3.1-flash-lite"
  } = params;
  const attemptPlan = [
    { model: primaryModel, delayMs: 0 },
    { model: primaryModel, delayMs: 1100 + Math.floor(Math.random() * 300) },
    { model: fallbackModel, delayMs: 2400 + Math.floor(Math.random() * 400) }
  ];
  let lastError;
  for (let i = 0; i < attemptPlan.length; i++) {
    const { model, delayMs } = attemptPlan[i];
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config
      });
    } catch (err) {
      lastError = err;
      const classified = classifyGeminiError(err);
      if (!classified.retryable) {
        throw new AppApiError(
          classified.userMessage,
          classified.status,
          classified.code,
          false
        );
      }
      if (i < attemptPlan.length - 1) {
        console.warn(
          `[Gemini] Attempt ${i + 1} (${model}) hit transient ${classified.status} (${classified.code}). Backing off before retry...`
        );
      }
    }
  }
  const finalClassified = classifyGeminiError(lastError);
  throw new AppApiError(
    finalClassified.userMessage,
    finalClassified.status,
    finalClassified.code,
    finalClassified.retryable
  );
}
app.post("/api/recognize-product", ...requireAiTextAccess, async (req, res) => {
  try {
    const { imageBase64, imageMimeType = "image/jpeg", userHint = "" } = req.body;
    if (!imageBase64 && !userHint) {
      return res.status(400).json({
        success: false,
        error: "Please upload a product photograph or enter a description for analysis.",
        code: "MISSING_INPUT",
        retryable: false
      });
    }
    const imagePart = await resolveImagePart(imageBase64, imageMimeType || "image/jpeg");
    if (imageBase64 && !imagePart && !userHint) {
      return res.status(400).json({
        success: false,
        error: "The uploaded photograph could not be read cleanly. Please upload a valid PNG, JPEG, or WebP image.",
        code: "INVALID_IMAGE",
        retryable: false
      });
    }
    const systemPrompt = `You are an expert AI Product Recognition Specialist & Commercial Taxonomy Analyst specializing in Nigerian and African SME commerce.

Your mission is to inspect the uploaded product photograph and accurately classify the item before any brand generation happens.

STRUCTURED CLASSIFICATION CATEGORIES (You MUST select the primary category strictly from this list of 11):
1. "Food and beverages"
2. "Fashion and clothing"
3. "Beauty and skincare"
4. "Haircare and cosmetics"
5. "Footwear and accessories"
6. "Electronics and gadgets"
7. "Home and household products"
8. "Agriculture and agricultural products"
9. "Health and wellness"
10. "Arts, crafts and handmade products"
11. "Other products"

CRITICAL ACCURACY RULES:
1. ACTUAL IMAGE ANALYSIS: Thoroughly inspect the physical object in the photograph (silhouette, packaging, texture, container, finish, closure, context). Do not just rely on vague assumptions.
2. NO INVENTED CLAIMS: Do not assume or invent unverified product ingredients, medicinal benefits, brand ownership, or chemical formulations from appearance alone.
3. FACTUAL DISTINCTION:
   - "confirmedCharacteristics": What is definitely, visibly observable (e.g. amber glass dropper bottle with black rubber bulb, sewn patterned wax print textile with lapel collar, woven dried fiber tote with brown leather handles).
   - "visualEstimates": What is an estimate or visual approximation (e.g. estimated 50ml volume, estimated cotton twill weave, estimated unisex adult fit).
4. AMBIGUITY / MULTIPLE PRODUCTS:
   - If the image contains multiple distinct products (e.g., shoes AND a handbag AND sunglasses, or multiple unrelated jars), flag "clarificationRequired.isAmbiguousOrMultiple": true, list the detected items, and provide a polite prompt asking the user which item is the primary product.
   - If the image is blurry, partially cropped, or ambiguous, adjust confidence accordingly.
5. CONFIDENCE LEVEL:
   - "level": 'High' (85%-100%), 'Medium' (60%-84%), or 'Low' (<60%).
   - "percentage": Integer 40-99.
   - "explanation": Concrete reason for the confidence level.
   - If confidence is Medium or Low, provide 2-3 "alternativeCategories" from the 11 structured categories so the user can easily confirm.

Output strictly valid JSON matching the requested schema.`;
    const userPrompt = `Analyze this product photograph for a Nigerian SME business.
${userHint ? `User context/hint: "${userHint}".` : ""}

Identify:
1. "productIdentified": Specific, clean, marketable product name based on what is visible (e.g., "Whipped Body Butter in Amber Glass Jar", "Men's Bespoke Ankara Kimono Set", "Artisanal Spiced Hibiscus Juice Bottle", "Handwoven Aso-Oke Laptop Tote").
2. "productCategory": Exactly one of the 11 structured categories.
3. "productSubcategory": Specific granular subcategory (e.g., "Moisturizers & Body Creams", "Traditional Ready-to-Wear", "Cold-Pressed Herbal Drinks", "Artisan Leather Goods").
4. "industry": Broader industrial sector (e.g., "Cosmetics & Personal Care", "Apparel & Fashion", "Fast-Moving Consumer Goods (FMCG)", "Creative Craft & Leatherworks").
5. "visualDescription": 2-3 objective, detailed sentences describing visible shape, colors, materials, packaging, closures, and textures.
6. "likelyTargetAudience": Concise, realistic description of the primary Nigerian customer segment likely to buy this product.
7. "identificationConfidence": { "level": 'High'|'Medium'|'Low', "percentage": number, "explanation": string }.
8. "confirmedCharacteristics": Array of 3-5 confirmed visible attributes.
9. "visualEstimates": Array of 2-3 visual approximations.
10. "clarificationRequired": { "isAmbiguousOrMultiple": boolean, "detectedItems": string[], "clarificationMessage": string }.
11. "alternativeCategories": Array of 0-3 other possible structured categories.`;
    const parts = [];
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: userPrompt });
    const response = await generateContentWithFallback({
      contents: {
        parts
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productIdentified: { type: Type.STRING },
            productCategory: {
              type: Type.STRING,
              enum: [
                "Food and beverages",
                "Fashion and clothing",
                "Beauty and skincare",
                "Haircare and cosmetics",
                "Footwear and accessories",
                "Electronics and gadgets",
                "Home and household products",
                "Agriculture and agricultural products",
                "Health and wellness",
                "Arts, crafts and handmade products",
                "Other products"
              ]
            },
            productSubcategory: { type: Type.STRING },
            industry: { type: Type.STRING },
            visualDescription: { type: Type.STRING },
            likelyTargetAudience: { type: Type.STRING },
            identificationConfidence: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                percentage: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["level", "percentage", "explanation"]
            },
            confirmedCharacteristics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            visualEstimates: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            clarificationRequired: {
              type: Type.OBJECT,
              properties: {
                isAmbiguousOrMultiple: { type: Type.BOOLEAN },
                detectedItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                clarificationMessage: { type: Type.STRING }
              },
              required: ["isAmbiguousOrMultiple"]
            },
            alternativeCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "productIdentified",
            "productCategory",
            "productSubcategory",
            "industry",
            "visualDescription",
            "likelyTargetAudience",
            "identificationConfidence",
            "confirmedCharacteristics",
            "visualEstimates"
          ]
        }
      }
    });
    const parsed = safeParseGeminiJson(response.text, "product recognition");
    if (!parsed.productIdentified || !parsed.productCategory) {
      throw new AppApiError(
        "Product recognition returned incomplete details. Please retry or fill in the product fields manually.",
        502,
        "INCOMPLETE_AI_RESPONSE",
        true
      );
    }
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Error in product recognition engine:", error);
    return sendApiError(
      res,
      error,
      "Failed to recognize product in photograph. You can retry the scan or enter details manually."
    );
  }
});
app.post("/api/generate-brand", ...requireAiTextAccess, async (req, res) => {
  try {
    const {
      businessType = "product",
      brandName = "",
      customBrandName = "",
      // Product fields
      productName = "",
      productDescription = "",
      productPrice = "",
      productCategory = "",
      // Service fields
      serviceDescription = "",
      specificServices = "",
      serviceName = "",
      serviceCategory = "",
      serviceDeliveryMethod = "hybrid",
      servicePriceOrPackages = "",
      deliveryMethod = "hybrid",
      rateCardOrPricing = "",
      // Hybrid fields
      industryCategory = "",
      // Common fields
      targetCustomers = "",
      businessLocation = "",
      category = "fashion",
      targetAudience = "Nigerian young professionals and stylish shoppers",
      targetLocation = "Nationwide (Nigeria)",
      selectedRegions = [],
      priceRange = "\u20A612,500",
      brandTone = "premium & vibrant",
      imageBase64 = null,
      imageMimeType = "image/jpeg"
    } = req.body;
    const isService = businessType === "service";
    const isHybrid = businessType === "hybrid";
    if (isHybrid) {
      if (!brandName && !customBrandName && !productName && !serviceName && !productDescription && !serviceDescription) {
        return res.status(400).json({ error: "Please provide at least a business name, product, or service details for your hybrid business." });
      }
    } else if (isService) {
      if (!brandName && !customBrandName && !serviceDescription && !specificServices) {
        return res.status(400).json({ error: "Please provide at least a service business name, description, or specific services." });
      }
    } else {
      if (!productDescription && !productName && !imageBase64 && !brandName && !customBrandName) {
        return res.status(400).json({ error: "Please provide at least a brand name, product photo, or description." });
      }
    }
    const effectiveBrandName = (customBrandName || brandName || "").trim();
    const hasUserBrandName = effectiveBrandName.length > 0;
    const cleanBrandName = effectiveBrandName;
    const { regionsText } = resolveTargetRegions(selectedRegions, targetLocation);
    const effectivePrice = isHybrid ? `Products: ${productPrice || priceRange || "\u20A615,000"} | Services: ${servicePriceOrPackages || rateCardOrPricing || "\u20A640,000 / session"}` : isService ? rateCardOrPricing || priceRange || "\u20A635,000 / session" : priceRange || "\u20A612,500";
    const systemPrompt = isHybrid ? `You are a distinguished Senior Nigerian Brand Strategist and Creative Director specializing in HYBRID SME business models that combine physical products and professional services (e.g., beauty salons with take-home haircare lines, bespoke fashion couture houses with ready-to-wear apparel, fitness coaches selling meal prep & supplements, solar engineers selling inverter batteries and installation).

CRITICAL DIRECTIVES FOR HYBRID BUSINESSES:
1. UNIFIED BRAND IDENTITY & COHESION:
   Build ONE cohesive, authoritative brand identity that seamlessly houses BOTH the physical products and the professional services under a single roof. Do NOT treat them as two disconnected companies.
2. SYNERGISTIC USP & VALUE PROPOSITION:
   Articulate the undeniable synergy between the product and service:
   - The expert service validates and proves the efficacy of the physical product in real life.
   - The take-home product extends and maintains the premium results of the professional service between visits.
3. ANTI-SLOP & NON-GENERIC MANDATE:
   Never generate generic clich\xE9s (e.g. "Best quality & service in Nigeria", "One stop shop"). Tailor every recommendation to Nigerian consumer trust dynamics, cash-flow realities, and retail/service habits specifically for the selected target market regions: ${regionsText}.
4. GROUNDED TRUTH & FACTUAL INTEGRITY:
   Distinguish between observed product traits and user-provided inputs. NEVER invent unverified ingredients, clinical certifications (NAFDAC, FDA), or medical guarantees.
5. BRAND NAMES:
   - If the user provided a brand name, use it as the official selected brand name (isRecommended: true) and never override it.
   - If no brand name is provided, generate exactly 5 distinctive, memorable, marketable hybrid brand names that work effortlessly for both products and services.
6. EXPANDED BRAND COLOUR PALETTE (6\u20138 COORDINATED COLOURS):
   Recommend a flexible, harmonious palette of 6 to 8 coordinated colours with clearly defined roles:
   "Primary brand colour", "Secondary brand colour", "Accent colour", "Supporting colour", "Background colour", "Text colour", "Complementary colour", "Highlight colour".
   Provide valid HEX codes and insightful psychological/marketing reasons.
7. HYBRID MARKETING KIT:
   - Formulate distinct product captions (English & Pidgin) and service booking captions (English & Pidgin).
   - Formulate 3 Combined Campaigns (Bundled Offers combining product + service, e.g. "Salon Treatment + Home Care Kit").
   - Define 3 high-converting Cross-Selling Opportunities (Trigger, Recommendation, Benefit).
   - Formulate high-converting WhatsApp Omnichannel Scripts (Product inquiry -> Service upsell, Service client -> Product add-on, VIP Combo Broadcast).
   - Provide Instagram/Facebook Ad Copy, Promotional Offers, and Customer Retention Tactics.
8. SERVICE STRATEGY & CLIENT ONBOARDING:
   - Detail the client onboarding journey, booking deposit terms, 3 service packages/tiers, and WhatsApp booking scripts.

Output strictly valid JSON matching the requested structure.` : isService ? `You are a distinguished Senior Nigerian Brand Strategist and Creative Director specializing in Nigerian service SMEs (salons, makeup artists, event planners, consultants, logistics companies, caterers, academies, technical services).

CRITICAL INSTRUCTIONS & DIRECTIVES FOR SERVICE BUSINESSES:
1. FOCUS ON EXPERTISE, TRUST & CONVERSION: Service businesses sell intangibles. Your strategy must overcome common Nigerian client anxieties: unpunctual arrivals, hidden travel surcharges, vendor ghosting after deposits, and substandard execution. Focus on customer experience, punctuality, and client acquisition.
2. NO PHYSICAL PACKAGING CLAIMS: Do NOT generate product packaging recommendations for service-only businesses. In qualityAudit.packagingAndDisplayAdvice, provide "Service Delivery Standards & Client Onboarding Guidelines" (e.g. professional WhatsApp booking confirmation scripts, branded PDF proposals/invoices, 24h reminder messages, and prompt post-service review collection).
3. ANTI-SLOP & NON-GENERIC MANDATE: Never generate generic clich\xE9s (e.g. "Best service in Lagos", "Fast delivery", "Affordable rates"). Every positioning point must be tactical and tailored to the specific services offered.
4. GROUNDED TRUTH & FACTUAL INTEGRITY: Never invent fake degrees, certifications, clinical licenses, or false claims. All claims must be grounded in actual service capabilities.
5. BRAND NAMES:
   - If user provided a brand name, use it as the official selected brand name (isRecommended: true) and never replace it.
   - If no brand name is provided, generate exactly 5 distinctive, memorable, culturally resonant service brand names with clear rationale.
6. EXPANDED BRAND COLOUR PALETTE (6\u20138 COORDINATED COLOURS):
   Recommend a flexible, harmonious palette of 6 to 8 coordinated colours with clearly defined roles:
   "Primary brand colour", "Secondary brand colour", "Accent colour", "Supporting colour", "Background colour", "Text colour", "Complementary colour", "Highlight colour".
   Provide valid HEX codes and insightful psychological/marketing reasons.
7. SERVICE STRATEGY & CLIENT ONBOARDING:
   - Define a 3-touchpoint client journey (Inquiry -> 50% Commitment Deposit -> Execution & Review).
   - Provide concrete booking deposit and trust policies.
   - Design 3 targeted service packages/tiers (Starter, Signature VIP, Ongoing Retainer).
   - Formulate high-converting WhatsApp booking inquiry scripts.
8. REGIONAL NIGERIAN RELEVANCE: Tailor recommendations to the selected regions (${regionsText}) and base location (${businessLocation || regionsText}).

Output strictly valid JSON matching the requested structure.` : `You are a distinguished Senior Nigerian Brand Strategist and Creative Director with over 15 years of experience building, positioning, and scaling profitable Nigerian SME brands across Lagos (Island & Mainland), Abuja FCT, Port Harcourt, Aba, Kano, Ibadan, and the Nigerian global diaspora.

CRITICAL INSTRUCTIONS & DIRECTIVES:
1. BEHAVIOR & TONE: You possess deep tactical knowledge of Nigerian consumer psychology, social commerce realities (WhatsApp Business catalogs, Instagram vendors, TikTok organic reach), currency constraints (Naira purchasing power), delivery hurdles (dispatch riders, interstate waybills), and cultural dynamics (Yoruba, Igbo, Hausa, Edo, and urban Nigerian pop culture).
2. ANTI-SLOP & NON-GENERIC MANDATE: Never generate generic, lazy, or cookie-cutter brand identities (avoid overused clich\xE9s like "Naija Style", "Lagos Drip", "Afro Beauty", "Best Taste", "Naija Glow"). Every recommendation must be strictly bespoke to the uploaded product.
3. GROUNDED TRUTH & FACTUAL INTEGRITY:
   - Carefully distinguish between what is directly observed in the product photo (materials, container, color, finish, styling) and user-supplied text.
   - NEVER invent unverified ingredients, clinical certifications (e.g. NAFDAC, FDA, USDA Organic), medical benefits, or false claims. All claims must be grounded in actual evidence.
4. BRAND NAMES:
   - If the user provided a brand name, use it as the official recommended brand name (isRecommended: true) and never replace it.
   - If no brand name is provided, generate exactly 5 distinctive, memorable, and marketable brand names. Include cultural meaning, commercial reasoning, and explicitly designate the SINGLE STRONGEST option with an in-depth strategic justification.
5. EXPANDED BRAND COLOUR PALETTE (6\u20138 COORDINATED COLOURS):
   Recommend a flexible, harmonious palette of 6 to 8 coordinated brand colours with clearly defined roles, including:
   - "Primary brand colour": Core brand signature; hero packaging and primary identity.
   - "Secondary brand colour": Supports primary colour in social flyers, tags, and secondary assets.
   - "Accent colour": High-contrast action trigger for Call-to-Action buttons and flash sales.
   - "Supporting colour": Subtle borders, packaging trims, and category banners.
   - "Background colour": High-clarity digital canvas (light/warm neutral) for lookbooks.
   - "Text colour": High-contrast typography for bright tropical mobile screens (dark neutral).
   - "Complementary colour": Harmonious pairing for seasonal drops and celebratory collections.
   - "Highlight colour": Urgent accents for discount tags, free delivery badges, and alert bubbles.
   For every colour provide: name, valid 6-character uppercase HEX code (e.g. #0D5C3A), exact role, psychologicalReason, and marketingReason.
   Maintain strict visual harmony and ensure sufficient text/background contrast (WCAG standards). Do not generate random colours.
6. REGIONAL & LOCATION-SPECIFIC MARKETING STRATEGY:
   - Deliver concrete, tactical marketing and channel recommendations tailored specifically to the user's selected Nigerian market regions (${regionsText}).
   - Address local trading hubs (e.g. Balogun/Lekki in Lagos, Wuse/Maitama in Abuja, Ariaria in Aba, Onitsha Main Market, Sabon Gari in Kano, Oil Mill in Port Harcourt), transit logistics (interstate waybills, dispatch riders, GIGM/Peace Mass), and regional consumer psychology.
7. BRAND POSITIONING: Clearly define Target Audience, Customer Needs & Purchasing Motivations, Brand Personality (traits with rationales), Unique Selling Proposition (USP), Market Differentiation, Brand Promise, and Brand Voice (tone, vocabulary, communication Dos & Don'ts).
8. QUALITY CONTROL AUDIT: Conduct a senior strategist quality evaluation checking cohesion, consistency, red flags / pitfalls to avoid in Nigeria, and packaging/pricing advice.

Output strictly valid JSON matching the requested structure.`;
    const userPrompt = isHybrid ? `Execute a unified brand identity, cross-selling strategy, and complete marketing engine for this Nigerian HYBRID (Products + Services) business:

[BUSINESS & BRAND NAME DIRECTIVE]
${hasUserBrandName ? `OFFICIAL BUSINESS/BRAND NAME SPECIFIED BY USER: "${cleanBrandName}".
MANDATORY REQUIREMENT:
- You MUST use "${cleanBrandName}" as the official selected brand name in every generated output (brandIdentity.selectedName: "${cleanBrandName}").
- In the brandNames array, the first item MUST have name: "${cleanBrandName}", isRecommended: true, and recommendationRationale explaining why this chosen name is strong for the hybrid market.
- In all marketing captions (English & Pidgin), ad hooks, bundle campaigns, and WhatsApp scripts, use "${cleanBrandName}".
- DO NOT replace, rename, or override this user-chosen business name.` : `The user left the brand name empty. Generate 5 distinctive, memorable, culturally resonant hybrid brand names that seamlessly unite products and services, and recommend the strongest option.`}

[HYBRID BUSINESS SPECIFICATIONS]
Business Model: Hybrid Business (Physical Products + Professional Services)
Industry Category: ${industryCategory || category}
Business Description: ${serviceDescription || productDescription || "Unified Nigerian hybrid commerce enterprise"}
Target Customer Specification: ${targetCustomers || targetAudience}
Base Location: ${businessLocation || regionsText}
Market Regions Covered: ${regionsText}
Brand Tone: ${brandTone}

[PHYSICAL PRODUCT DIVISION]
Product Name: ${productName || "Signature Brand Product Line"}
Product Category: ${productCategory || category}
Product Description: ${productDescription || "High-quality tangible goods designed for client home use or lifestyle enhancement"}
Product Pricing: ${productPrice || priceRange || "\u20A615,000"}
${imageBase64 ? "Product photograph is attached. Analyze visible materials, finish, packaging, and commercial shelf appeal." : "No photograph attached; analyze based on product description."}

[PROFESSIONAL SERVICE DIVISION]
Service Name: ${serviceName || specificServices || "Signature Professional Service Offering"}
Service Category: ${serviceCategory || category}
Service Description: ${serviceDescription || "Specialized in-person or virtual consultation, treatment, installation, or bespoke craft"}
Service Delivery Method: ${serviceDeliveryMethod || deliveryMethod} (Physical on-site, Virtual, or Hybrid)
Service Rate Card / Packages: ${servicePriceOrPackages || rateCardOrPricing || "\u20A640,000 / session"}

[REQUIRED OUTPUT SPECIFICATIONS]
1. "visualAnalysis": 2-3 precise sentences evaluating the professional presentation, product craftsmanship, and service credibility of this hybrid business.
2. "brandNames": Array of 5 distinctive hybrid brand names (exactly 1 recommended).
3. "brandIdentity":
   - "selectedName": The recommended brand name.
   - "selectedTagline": Cohesive hybrid tagline celebrating both the craft and the product.
   - "strongestNameRationale": Strategic reasoning uniting product reliability and service mastery.
   - "colorPalette": 6 to 8 coordinated colours with defined roles.
   - "positioning": Target audience, customer needs, brand personality, unified USP (synergy of physical goods + expert service), market differentiation vs pure-retailers or service-only freelancers, brand promise, and brand voice.
   - "marketStrategy": Price tier economics, trust building tactics, channel strategy, and locationSpecificTactics for ${regionsText}.
   - "qualityAudit": Factual checks, cohesionScore, consistencyReview, pitfallsToAvoid, and packaging/delivery advice.
   - "typographyRecommendation" & "idealCustomerPersona".
4. "serviceStrategy": Client journey, deposit terms, 3 service packages (Starter, VIP, Retainer/Combo), and WhatsApp booking flow.
5. "hybridMarketingKit":
   - "unifiedTagline": Clear 1-line summary uniting product and service.
   - "unifiedElevatorPitch": 30-second pitch explaining the synergy.
   - "productCaptions": 2 professional English and 2 authentic Nigerian Pidgin captions highlighting the tangible product.
   - "serviceCaptions": 2 professional English and 2 authentic Nigerian Pidgin captions focused on booking the expert service.
   - "combinedCampaigns": 3 high-converting bundled campaigns combining product + service with specific discount or bonus value.
   - "crossSellingOpportunities": 3 concrete cross-selling triggers, recommendations, and customer benefits.
   - "whatsAppOmnichannelFlow":
     - "productInquiryToServiceUpsell": Script to offer service booking when a customer asks about a product.
     - "serviceClientToProductAddon": Script to recommend take-home products right after service completion.
     - "vipComboBroadcast": Broadcast message announcing a product + service bundle.
   - "adCopyInstagramFacebook": 3 high-converting ad variations (e.g. Before/After + Maintenance, Complete Solution, Special Bundle).
   - "promotionalOffers": 4 compelling hybrid promotional hooks.
   - "customerRetentionTactics": 4 tactical retention and loyalty programs.
6. "marketingCaptions": General brand captions (3 English, 3 Pidgin).
7. "advertisingConcepts": Instagram carousel (4 slides), TikTok/Reel script (15s), WhatsApp status sequence (3 parts), and 4 promo offer ideas.` : isService ? `Execute a comprehensive brand identity, client acquisition and marketing strategy for this Nigerian SERVICE-BASED business:

[BUSINESS & BRAND NAME DIRECTIVE]
${hasUserBrandName ? `OFFICIAL BUSINESS/BRAND NAME SPECIFIED BY USER: "${cleanBrandName}".
MANDATORY REQUIREMENT:
- You MUST use "${cleanBrandName}" as the official selected brand name in every generated output (brandIdentity.selectedName: "${cleanBrandName}").
- In the brandNames array, the first item MUST have name: "${cleanBrandName}", isRecommended: true, and recommendationRationale explaining why this chosen name is strong for the market.
- In all marketing captions (English & Pidgin), ad hooks, social carousel slides, and TikTok scripts, use "${cleanBrandName}".
- DO NOT replace, rename, or override this user-chosen business name.` : `The user left the brand name empty. Generate 5 distinctive, memorable, culturally resonant service brand names and recommend the strongest option.`}

[SERVICE BUSINESS SPECIFICATIONS]
Business Type: Service-based business
Service Category: ${category}
Specific Services Offered: ${specificServices || "Bespoke service execution"}
Service Description: ${serviceDescription || "Professional Nigerian service business"}
Base Location: ${businessLocation || regionsText}
Service Delivery Method: ${deliveryMethod} (e.g. Physical on-site, Virtual online, or Hybrid)
Target Customer Specification: ${targetCustomers || targetAudience}
Market Regions Covered: ${regionsText}
Pricing / Rate Card: ${effectivePrice}
Desired Brand Tone: ${brandTone}

[REQUIRED OUTPUT SPECIFICATIONS]
1. "visualAnalysis": 2-3 precise sentences evaluating the professional presentation, credibility touchpoints, and client appeal of this service.
2. "brandNames": Array of 5 distinctive service brand names. Exactly 1 must have isRecommended: true.
3. "brandIdentity":
   - "selectedName": The recommended service brand name.
   - "selectedTagline": The recommended service tagline.
   - "strongestNameRationale": Strategic reasoning why this name inspires trust in the Nigerian market.
   - "colorPalette": 6 to 8 coordinated colours with defined roles ("Primary brand colour", "Secondary brand colour", "Accent colour", "Supporting colour", "Background colour", "Text colour", "Complementary colour", "Highlight colour").
   - "positioning": Target audience, customer needs/anxieties, 3-4 brand personality traits, concrete USP, market differentiation vs unverified freelancers, brand promise, and brand voice.
   - "marketStrategy": Price tier economics, trust building tactics (e.g. booking contracts, on-time guarantees), channel strategy, and locationSpecificTactics for ${regionsText}.
   - "qualityAudit": Factual checks, cohesionScore, consistencyReview, 3 pitfalls to avoid (e.g. DM for price, vague deposit policies), and packagingAndDisplayAdvice focused on "Service Delivery Standards & Client Onboarding".
   - "typographyRecommendation" & "idealCustomerPersona".
4. "serviceStrategy":
   - "clientOnboardingAndExperience": Structured client journey.
   - "trustAndDepositPolicy": Transparent booking deposit and cancellation terms.
   - "retentionAndReferralTactics": 3 concrete retention/referral systems.
   - "servicePackages": 3 packages (Starter, VIP, Retainer) with deliverables and pricing advice.
   - "whatsAppBookingFlow": Inquiry greeting, qualifying questions, deposit confirmation notice, and review request.
5. "marketingCaptions": 3 professional English and 3 authentic Nigerian Pidgin captions focused on client booking, overcoming vendor anxiety, and portfolio credibility.
6. "advertisingConcepts": Instagram carousel (4 slides), TikTok/Reel script (15s), WhatsApp status sequence (3 parts), and 4 promo offer ideas.` : `Execute a comprehensive brand identity and marketing strategy for this Nigerian SME product:

[BUSINESS & BRAND NAME DIRECTIVE]
${hasUserBrandName ? `OFFICIAL BUSINESS/BRAND NAME SPECIFIED BY USER: "${cleanBrandName}".
MANDATORY REQUIREMENT:
- You MUST use "${cleanBrandName}" as the official selected brand name in every generated output (brandIdentity.selectedName: "${cleanBrandName}").
- In the brandNames array, the first item MUST have name: "${cleanBrandName}", isRecommended: true, and recommendationRationale explaining why this chosen name is strong for the market.
- In all marketing captions (English & Pidgin), ad hooks, social carousel slides, and TikTok scripts, use "${cleanBrandName}".
- DO NOT replace, rename, or override this user-chosen business name.` : `The user left the brand name empty. Generate 5 distinctive, memorable, culturally resonant brand names and recommend the strongest option.`}

[PRODUCT INFORMATION]
Business Type: Product-based business
Category: ${category}
Provided Name: ${productName || cleanBrandName || "Not specified (develop from photograph & product traits)"}
Description: ${productDescription || "Handcrafted Nigerian commercial item"}
Target Audience Preference: ${targetAudience}
Target Location / Market: ${regionsText}
Selected Nigerian States & Territories: ${regionsText}
Estimated Price Point: ${priceRange}
Desired Brand Tone: ${brandTone}

${imageBase64 ? "Product photograph is attached. Conduct a precise visual audit of visible textures, materials, packaging quality, colors, and craftsmanship." : "No photograph attached; analyze based on the provided Nigerian product specifications."}

[REQUIRED OUTPUT SPECIFICATIONS]
1. "visualAnalysis": 2-3 precise sentences detailing observed physical attributes and commercial appeal.
2. "brandNames": Array of 5 distinctive, non-generic brand names. Exactly 1 must have isRecommended: true with a detailed recommendationRationale explaining why it is the strongest commercially.
3. "brandIdentity":
   - "selectedName": The recommended brand name.
   - "selectedTagline": The recommended tagline.
   - "strongestNameRationale": In-depth strategic reasoning why this name is the optimal choice for the Nigerian market.
   - "colorPalette": Array of 6 to 8 complementary, coordinated brand colours with defined roles:
     "Primary brand colour", "Secondary brand colour", "Accent colour", "Supporting colour", "Background colour", "Text colour", "Complementary colour", "Highlight colour".
     Each swatch MUST have name, valid uppercase HEX code, role, psychologicalReason, and marketingReason.
   - "positioning":
     - "targetAudience": Precise segmentation (demographics, location, lifestyle tier).
     - "customerNeedsAndMotivations": Real purchasing drivers for Nigerian buyers in this price segment.
     - "brandPersonality": Array of 3-4 objects ({ trait: string, rationale: string }).
     - "uniqueSellingProposition": Concrete USP grounded in reality.
     - "marketDifferentiation": Sharp contrast against open-market unbranded goods (Balogun/Trade Fair) or cheap foreign imports.
     - "brandPromise": The binding brand commitment.
     - "brandVoice": { tone: string, vocabulary: string[], communicationDos: string[], communicationDonts: string[] }.
   - "marketStrategy":
     - "priceTierAnalysis": Analysis of the product's price category in current Nigerian economic reality.
     - "trustBuildingTactics": 3 concrete tactics to overcome Nigerian consumer skepticism ("what I ordered vs what I got").
     - "channelStrategy": Strategic guidance for WhatsApp Business, Instagram Reels, and physical logistics.
     - "locationSpecificTactics": Array of 3-4 objects ({ region: string, tactics: string }) detailing bespoke commercial tactics, waybill logistics, and local consumer nuances for the selected Nigerian states (${regionsText}).
   - "qualityAudit":
     - "photoObservations": What is visibly verified in the photograph.
     - "userSuppliedData": What was provided by the user.
     - "groundedClaimsPolicy": Audit statement confirming no hallucinated ingredients or unverified certifications.
     - "cohesionScore": Integer 90-99.
     - "consistencyReview": Detailed evaluation of whether name, colours, and positioning harmonize.
     - "pitfallsToAvoid": 3 specific marketing/operational mistakes this SME must avoid in Nigeria.
     - "packagingAndDisplayAdvice": Actionable packaging, unboxing, and display guidelines.
   - "typographyRecommendation": { headerFont: string, bodyFont: string, styleNote: string }.
   - "idealCustomerPersona": { name: string, ageRange: string, location: string, painPoint: string, whyTheyBuy: string }.
4. "marketingCaptions":
   - "english": 3 professional English captions (Storytelling & Craft, Urgency/Flash Drop, Problem-Solving/Benefit).
   - "pidgin": 3 authentic, natural Nigerian Pidgin captions (Street Hype, Market Trust, Direct WhatsApp Order).
5. "advertisingConcepts":
   - "instagramCarousel": 4-slide storyboard.
   - "tiktokReelConcept": 15s script with Afrobeats audio suggestion and on-screen text.
   - "whatsappStatusSequence": 3-part sequence.
   - "promoOfferIdeas": 4 tailored Nigerian promo hooks.`;
    const imagePart = await resolveImagePart(imageBase64, imageMimeType || "image/jpeg");
    const contents = [];
    if (imagePart) {
      contents.push(imagePart);
    }
    contents.push({ text: userPrompt });
    const response = await generateContentWithFallback({
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualAnalysis: { type: Type.STRING },
            brandNames: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  targetVibe: { type: Type.STRING },
                  isRecommended: { type: Type.BOOLEAN },
                  recommendationRationale: { type: Type.STRING }
                },
                required: ["name", "tagline", "meaning", "targetVibe", "isRecommended", "recommendationRationale"]
              }
            },
            brandIdentity: {
              type: Type.OBJECT,
              properties: {
                selectedName: { type: Type.STRING },
                selectedTagline: { type: Type.STRING },
                strongestNameRationale: { type: Type.STRING },
                colorPalette: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                      role: { type: Type.STRING },
                      psychologicalReason: { type: Type.STRING },
                      marketingReason: { type: Type.STRING }
                    },
                    required: ["name", "hex", "role", "psychologicalReason", "marketingReason"]
                  }
                },
                positioning: {
                  type: Type.OBJECT,
                  properties: {
                    targetAudience: { type: Type.STRING },
                    customerNeedsAndMotivations: { type: Type.STRING },
                    brandPersonality: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          trait: { type: Type.STRING },
                          rationale: { type: Type.STRING }
                        },
                        required: ["trait", "rationale"]
                      }
                    },
                    uniqueSellingProposition: { type: Type.STRING },
                    marketDifferentiation: { type: Type.STRING },
                    brandPromise: { type: Type.STRING },
                    brandVoice: {
                      type: Type.OBJECT,
                      properties: {
                        tone: { type: Type.STRING },
                        vocabulary: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        communicationDos: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        communicationDonts: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      },
                      required: ["tone", "vocabulary", "communicationDos", "communicationDonts"]
                    }
                  },
                  required: [
                    "targetAudience",
                    "customerNeedsAndMotivations",
                    "brandPersonality",
                    "uniqueSellingProposition",
                    "marketDifferentiation",
                    "brandPromise",
                    "brandVoice"
                  ]
                },
                marketStrategy: {
                  type: Type.OBJECT,
                  properties: {
                    priceTierAnalysis: { type: Type.STRING },
                    trustBuildingTactics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    channelStrategy: { type: Type.STRING },
                    locationSpecificTactics: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          region: { type: Type.STRING },
                          tactics: { type: Type.STRING }
                        },
                        required: ["region", "tactics"]
                      }
                    }
                  },
                  required: ["priceTierAnalysis", "trustBuildingTactics", "channelStrategy"]
                },
                qualityAudit: {
                  type: Type.OBJECT,
                  properties: {
                    photoObservations: { type: Type.STRING },
                    userSuppliedData: { type: Type.STRING },
                    groundedClaimsPolicy: { type: Type.STRING },
                    cohesionScore: { type: Type.INTEGER },
                    consistencyReview: { type: Type.STRING },
                    pitfallsToAvoid: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    packagingAndDisplayAdvice: { type: Type.STRING }
                  },
                  required: [
                    "photoObservations",
                    "userSuppliedData",
                    "groundedClaimsPolicy",
                    "cohesionScore",
                    "consistencyReview",
                    "pitfallsToAvoid",
                    "packagingAndDisplayAdvice"
                  ]
                },
                typographyRecommendation: {
                  type: Type.OBJECT,
                  properties: {
                    headerFont: { type: Type.STRING },
                    bodyFont: { type: Type.STRING },
                    styleNote: { type: Type.STRING }
                  },
                  required: ["headerFont", "bodyFont", "styleNote"]
                },
                idealCustomerPersona: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    ageRange: { type: Type.STRING },
                    location: { type: Type.STRING },
                    painPoint: { type: Type.STRING },
                    whyTheyBuy: { type: Type.STRING }
                  },
                  required: ["name", "ageRange", "location", "painPoint", "whyTheyBuy"]
                }
              },
              required: [
                "selectedName",
                "selectedTagline",
                "strongestNameRationale",
                "colorPalette",
                "positioning",
                "marketStrategy",
                "qualityAudit",
                "typographyRecommendation",
                "idealCustomerPersona"
              ]
            },
            marketingCaptions: {
              type: Type.OBJECT,
              properties: {
                english: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      hook: { type: Type.STRING },
                      body: { type: Type.STRING },
                      callToAction: { type: Type.STRING },
                      hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["title", "hook", "body", "callToAction", "hashtags"]
                  }
                },
                pidgin: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      hook: { type: Type.STRING },
                      body: { type: Type.STRING },
                      callToAction: { type: Type.STRING },
                      hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["title", "hook", "body", "callToAction", "hashtags"]
                  }
                }
              },
              required: ["english", "pidgin"]
            },
            advertisingConcepts: {
              type: Type.OBJECT,
              properties: {
                instagramCarousel: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    slide1Hook: { type: Type.STRING },
                    slide2Value: { type: Type.STRING },
                    slide3SocialProof: { type: Type.STRING },
                    slide4CTA: { type: Type.STRING }
                  },
                  required: ["title", "slide1Hook", "slide2Value", "slide3SocialProof", "slide4CTA"]
                },
                tiktokReelConcept: {
                  type: Type.OBJECT,
                  properties: {
                    hookVisual: { type: Type.STRING },
                    audioSuggestion: { type: Type.STRING },
                    script15s: { type: Type.STRING },
                    onScreenText: { type: Type.STRING }
                  },
                  required: ["hookVisual", "audioSuggestion", "script15s", "onScreenText"]
                },
                whatsappStatusSequence: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      part: { type: Type.STRING },
                      text: { type: Type.STRING },
                      visualTip: { type: Type.STRING }
                    },
                    required: ["part", "text", "visualTip"]
                  }
                },
                promoOfferIdeas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["instagramCarousel", "tiktokReelConcept", "whatsappStatusSequence", "promoOfferIdeas"]
            },
            serviceStrategy: {
              type: Type.OBJECT,
              properties: {
                clientOnboardingAndExperience: { type: Type.STRING },
                trustAndDepositPolicy: { type: Type.STRING },
                retentionAndReferralTactics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                servicePackages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tierName: { type: Type.STRING },
                      targetClient: { type: Type.STRING },
                      recommendedPricing: { type: Type.STRING },
                      deliverables: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      turnaroundOrDuration: { type: Type.STRING }
                    },
                    required: ["tierName", "targetClient", "recommendedPricing", "deliverables", "turnaroundOrDuration"]
                  }
                },
                whatsAppBookingFlow: {
                  type: Type.OBJECT,
                  properties: {
                    greetingAndQualification: { type: Type.STRING },
                    rateCardMessage: { type: Type.STRING },
                    depositConfirmationNotice: { type: Type.STRING },
                    postServiceReviewRequest: { type: Type.STRING }
                  },
                  required: ["greetingAndQualification", "rateCardMessage", "depositConfirmationNotice", "postServiceReviewRequest"]
                }
              }
            },
            hybridMarketingKit: {
              type: Type.OBJECT,
              properties: {
                unifiedTagline: { type: Type.STRING },
                unifiedElevatorPitch: { type: Type.STRING },
                productCaptions: {
                  type: Type.OBJECT,
                  properties: {
                    english: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          hook: { type: Type.STRING },
                          body: { type: Type.STRING },
                          callToAction: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["title", "hook", "body", "callToAction", "hashtags"]
                      }
                    },
                    pidgin: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          hook: { type: Type.STRING },
                          body: { type: Type.STRING },
                          callToAction: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["title", "hook", "body", "callToAction", "hashtags"]
                      }
                    }
                  },
                  required: ["english", "pidgin"]
                },
                serviceCaptions: {
                  type: Type.OBJECT,
                  properties: {
                    english: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          hook: { type: Type.STRING },
                          body: { type: Type.STRING },
                          callToAction: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["title", "hook", "body", "callToAction", "hashtags"]
                      }
                    },
                    pidgin: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          hook: { type: Type.STRING },
                          body: { type: Type.STRING },
                          callToAction: { type: Type.STRING },
                          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["title", "hook", "body", "callToAction", "hashtags"]
                      }
                    }
                  },
                  required: ["english", "pidgin"]
                },
                combinedCampaigns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      theme: { type: Type.STRING },
                      hook: { type: Type.STRING },
                      bundleOffer: { type: Type.STRING },
                      callToAction: { type: Type.STRING }
                    },
                    required: ["title", "theme", "hook", "bundleOffer", "callToAction"]
                  }
                },
                crossSellingOpportunities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      trigger: { type: Type.STRING },
                      recommendation: { type: Type.STRING },
                      benefit: { type: Type.STRING }
                    },
                    required: ["trigger", "recommendation", "benefit"]
                  }
                },
                whatsAppOmnichannelFlow: {
                  type: Type.OBJECT,
                  properties: {
                    productInquiryToServiceUpsell: { type: Type.STRING },
                    serviceClientToProductAddon: { type: Type.STRING },
                    vipComboBroadcast: { type: Type.STRING }
                  },
                  required: ["productInquiryToServiceUpsell", "serviceClientToProductAddon", "vipComboBroadcast"]
                },
                adCopyInstagramFacebook: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      primaryText: { type: Type.STRING },
                      creativeAngle: { type: Type.STRING },
                      callToAction: { type: Type.STRING }
                    },
                    required: ["headline", "primaryText", "creativeAngle", "callToAction"]
                  }
                },
                promotionalOffers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                customerRetentionTactics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                "unifiedTagline",
                "unifiedElevatorPitch",
                "productCaptions",
                "serviceCaptions",
                "combinedCampaigns",
                "crossSellingOpportunities",
                "whatsAppOmnichannelFlow",
                "adCopyInstagramFacebook",
                "promotionalOffers",
                "customerRetentionTactics"
              ]
            }
          },
          required: ["visualAnalysis", "brandNames", "brandIdentity", "marketingCaptions", "advertisingConcepts"]
        }
      }
    });
    const parsed = safeParseGeminiJson(response.text, "brand studio assets");
    if (!parsed.brandIdentity || !Array.isArray(parsed.brandNames) || !parsed.marketingCaptions) {
      throw new AppApiError(
        "The AI returned an incomplete brand kit response. Your inputs and previous assets were preserved \u2014 please retry.",
        502,
        "INCOMPLETE_AI_RESPONSE",
        true
      );
    }
    parsed.businessType = businessType;
    if (hasUserBrandName && cleanBrandName) {
      if (parsed.brandIdentity) {
        parsed.brandIdentity.selectedName = cleanBrandName;
      }
      if (Array.isArray(parsed.brandNames)) {
        if (parsed.brandNames.length > 0) {
          parsed.brandNames[0].name = cleanBrandName;
          parsed.brandNames[0].isRecommended = true;
          parsed.brandNames[0].recommendationRationale = `OFFICIAL MERCHANT BRAND NAME: "${cleanBrandName}" was selected by the merchant and is maintained as the primary brand name.`;
        } else {
          parsed.brandNames = [
            {
              name: cleanBrandName,
              tagline: parsed.brandIdentity?.selectedTagline || "Authentic Nigerian Craftsmanship",
              meaning: `The official brand identity chosen by the merchant.`,
              targetVibe: "Official Chosen Brand",
              isRecommended: true,
              recommendationRationale: `OFFICIAL MERCHANT BRAND NAME: "${cleanBrandName}" was selected by the merchant.`
            }
          ];
        }
      }
    }
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Error generating brand assets:", error);
    return sendApiError(res, error, "Failed to generate brand kit. Please try again.");
  }
});
app.post("/api/regenerate-palette", ...requireAiTextAccess, async (req, res) => {
  try {
    const {
      brandName = "SME Brand",
      productName = "",
      category = "fashion",
      brandTone = "Afro-Luxury & Regal",
      targetLocation = "Nationwide (Nigeria)",
      selectedRegions = [],
      preferredDirection = ""
    } = req.body;
    const { regionsText } = resolveTargetRegions(selectedRegions, targetLocation);
    const prompt = `You are a Senior Nigerian Brand Strategist and Creative Director.
Generate a fresh, stunning, and culturally harmonious 6 to 8 coordinated brand colour palette for:
Brand Name: "${brandName}"
Product: "${productName || brandName}"
Category: "${category}"
Brand Tone: "${brandTone}"
Target Market Regions in Nigeria: "${regionsText}"
${preferredDirection ? `User Preferred Visual Direction: "${preferredDirection}"` : ""}

REQUIRED ROLES TO COVER (6 to 8 swatches):
1. "Primary brand colour": Main brand hero (packaging signature)
2. "Secondary brand colour": Supporting signature (flyers, tags)
3. "Accent colour": High-contrast action trigger (CTA buttons, flash offers)
4. "Supporting colour": Packaging trims, borders, secondary categories
5. "Background colour": High-clarity digital canvas (light/warm neutral)
6. "Text colour": High-contrast typography for bright mobile screens (dark neutral)
7. "Complementary colour": Harmonious pairing for festive and seasonal drops
8. "Highlight colour": Urgent accents for discount tags, free delivery badges

RULES:
- Provide valid 6-character uppercase HEX codes (e.g. #0D5C3A).
- Ensure strict visual harmony and sufficient contrast (WCAG standards for mobile screens).
- Provide insightful psychological and marketing rationales tailored to the Nigerian market.
- Do not output random colours.

Output strictly valid JSON with key "palette".`;
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            palette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  role: { type: Type.STRING },
                  psychologicalReason: { type: Type.STRING },
                  marketingReason: { type: Type.STRING }
                },
                required: ["name", "hex", "role", "psychologicalReason", "marketingReason"]
              }
            }
          },
          required: ["palette"]
        }
      }
    });
    const parsed = safeParseGeminiJson(response.text, "brand colour palette");
    if (Array.isArray(parsed.palette) && parsed.palette.length >= 6) {
      return res.json({ success: true, palette: parsed.palette });
    }
    throw new AppApiError(
      "Generated colour palette was incomplete (fewer than 6 colours returned). Your existing palette was kept \u2014 please retry.",
      502,
      "INCOMPLETE_AI_RESPONSE",
      true
    );
  } catch (err) {
    console.error("Error regenerating palette:", err);
    return sendApiError(res, err, "Failed to regenerate brand colour palette. Your existing colours were preserved.");
  }
});
app.post("/api/improve-brand", ...requireAiTextAccess, async (req, res) => {
  try {
    const {
      businessType = "product",
      existingBrandName = "",
      currentColours = "",
      existingTagline = "",
      businessDescription = "",
      targetCustomers = "",
      improvementGoals = [],
      customImprovementNote = "",
      productOfferings = "",
      serviceOfferings = "",
      targetLocation = "Nationwide (Nigeria)",
      selectedRegions = [],
      logoBase64 = null,
      logoMimeType = "image/png",
      rebrandRequested = false
    } = req.body;
    if (!existingBrandName && !businessDescription && !logoBase64) {
      return res.status(400).json({ error: "Please provide at least your business name or description." });
    }
    const isHybrid = businessType === "hybrid";
    const { regionsText } = resolveTargetRegions(selectedRegions, targetLocation);
    const systemPrompt = `You are a distinguished Senior Nigerian Brand Strategist and Creative Director specializing in repositioning, refining, and scaling established Nigerian SMEs and MSMEs across Lagos, Abuja, Port Harcourt, Aba, Kano, Ibadan, and the Nigerian diaspora.

CRITICAL DIRECTIVES FOR EXISTING BRANDS:
1. PRESERVE ESTABLISHED BRAND EQUITY:
   - Unless explicitly instructed otherwise by the user (rebrandRequested: ${rebrandRequested}), your primary mandate is to HONOR AND PRESERVE the established brand name "${existingBrandName}", recognize customer familiarity, and keep their core color foundation intact.
   - Do NOT replace or rename their business. Your role is to polish, elevate, professionalize, and strategically empower their existing brand identity.
2. DELIVER HIGH-IMPACT, PRACTICAL RECOMMENDATIONS ACROSS ALL 6 REQUIRED DOMAINS:
   - Brand Positioning: Assess current market stance vs refined positioning, refined target customer segmentation tailored specifically to ${regionsText}, customer needs, distinct USP, and market differentiation against competitors/open-market stalls. ${isHybrid ? "For this hybrid business, articulate how physical merchandise and service offerings reinforce each other under one cohesive brand identity." : ""}
   - Brand Consistency: Identify specific consistency gaps holding them back, define 4 non-negotiable operational & visual brand rules (packaging, WhatsApp customer care, invoices, photography), and voice consistency rules.
   - Improved Visual Identity: Actionable logo critique & refinement suggestions (modernization without losing recognition), a refined 4-colour complementary palette building on their current colours with exact HEX codes and psychological & marketing reasons, typography upgrades, and packaging/dispatch unboxing upgrades suited for Nigerian logistics in ${regionsText}.
   - Brand Messaging & Tagline: 3 upgraded tagline options (including 1 refined version of their existing tagline, 1 modern punchy option, and 1 prestige cultural option); recommended top pick with commercial rationale; 30-second elevator pitch; and 3 core messaging pillars.
   - Marketing Strategy: Nigerian market pricing tier & value perception advice, 3 concrete trust-building tactics to eliminate online buyer skepticism ("what I ordered vs what I got"), and an omnichannel conversion strategy for WhatsApp Business, Instagram Reels, and physical touchpoints across ${regionsText}.
   - Social Media Content: Revamped bilingual captions (2 professional English, 2 authentic Nigerian Pidgin with high energy), 4 weekly content calendar pillars, and a 3-step WhatsApp status launch sequence.
3. REALISTIC NIGERIAN CONTEXT: All insights must reflect realistic Nigerian commerce tailored to ${regionsText} (Naira inflation, WhatsApp status catalogs, dispatch motorbikes, interstate waybills, bank transfer confirmations, street market price comparisons). Output strictly valid JSON.`;
    const userPrompt = `Audit and elevate this existing Nigerian small business:

[EXISTING BUSINESS PROFILE]
Brand Name: ${existingBrandName || "Established Nigerian SME"}
Business Model: ${isHybrid ? "Hybrid Business (Products + Services)" : businessType === "service" ? "Service-Based Business" : "Product-Based Business"}
Existing Tagline: ${existingTagline || "None specified"}
Current Brand Colours: ${currentColours || "Not specified (recommend optimal complementary palette)"}
Business Description: ${businessDescription || "Operating Nigerian commercial venture"}
${isHybrid ? `Physical Product Offerings: ${productOfferings || "Take-home retail products and merchandise"}
Professional Service Offerings: ${serviceOfferings || "Bespoke client consultations, sessions, or treatments"}` : ""}
Target Customers: ${targetCustomers || "Nigerian consumer market"}
Target Market Locations (Nigerian States & Territories): ${regionsText}
Areas User Wants to Improve: ${Array.isArray(improvementGoals) ? improvementGoals.join(", ") : improvementGoals}
Specific Client Notes: ${customImprovementNote || "Standard strategic elevation"}
Rebrand Requested: ${rebrandRequested ? "YES (complete repositioning)" : "NO (preserve established brand name and equity, refine and elevate)"}

${logoBase64 ? "Existing brand logo / storefront photograph is attached. Analyze visual hierarchy, color reproduction, typography, and legibility for Nigerian mobile screens." : "No logo attached; analyze based on business description and established profile."}

Generate comprehensive strategic audit and recommendations across:
1. "brandAudit": summary, preservedElements (array of strings), criticalGapsIdentified (array of strings).
2. "recommendations":
   - "brandPositioning": currentAssessment, refinedPositioning, refinedTargetAudience, customerNeedsAndMotivations, refinedUSP, marketDifferentiation.
   - "brandConsistency": consistencyGaps (array), brandRules (array of 4 rules), toneConsistencyRules.
   - "improvedVisualIdentity": logoCritiqueAndRefinement, refinedColorPalette (exactly 4 colors with name, hex, role, psychologicalReason, marketingReason), typographyUpgrade (headerFont, bodyFont, styleNote), packagingUpgradeAdvice.
   - "brandMessagingAndTagline": taglineOptions (3 items with tagline, angle), recommendedTagline, taglineRationale, coreElevatorPitch, keyMessagingPillars (3 items).
   - "marketingStrategy": priceTierAndPerceptionStrategy, trustBuildingTactics (3 items), omnichannelPlan.
   - "socialMediaContent": revampedEnglishCaptions (2 items with title, hook, body, callToAction, hashtags), revampedPidginCaptions (2 items with title, hook, body, callToAction, hashtags), weeklyContentPillars (4 items), whatsAppStatusCampaign (3 items with part, text, visualTip).`;
    const logoPart = await resolveImagePart(logoBase64, logoMimeType || "image/png");
    const contents = [];
    if (logoPart) {
      contents.push(logoPart);
    }
    contents.push({ text: userPrompt });
    const response = await generateContentWithFallback({
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandAudit: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                preservedElements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                criticalGapsIdentified: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["summary", "preservedElements", "criticalGapsIdentified"]
            },
            recommendations: {
              type: Type.OBJECT,
              properties: {
                brandPositioning: {
                  type: Type.OBJECT,
                  properties: {
                    currentAssessment: { type: Type.STRING },
                    refinedPositioning: { type: Type.STRING },
                    refinedTargetAudience: { type: Type.STRING },
                    customerNeedsAndMotivations: { type: Type.STRING },
                    refinedUSP: { type: Type.STRING },
                    marketDifferentiation: { type: Type.STRING }
                  },
                  required: [
                    "currentAssessment",
                    "refinedPositioning",
                    "refinedTargetAudience",
                    "customerNeedsAndMotivations",
                    "refinedUSP",
                    "marketDifferentiation"
                  ]
                },
                brandConsistency: {
                  type: Type.OBJECT,
                  properties: {
                    consistencyGaps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    brandRules: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    toneConsistencyRules: { type: Type.STRING }
                  },
                  required: ["consistencyGaps", "brandRules", "toneConsistencyRules"]
                },
                improvedVisualIdentity: {
                  type: Type.OBJECT,
                  properties: {
                    logoCritiqueAndRefinement: { type: Type.STRING },
                    refinedColorPalette: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          hex: { type: Type.STRING },
                          role: { type: Type.STRING },
                          psychologicalReason: { type: Type.STRING },
                          marketingReason: { type: Type.STRING }
                        },
                        required: ["name", "hex", "role", "psychologicalReason", "marketingReason"]
                      }
                    },
                    typographyUpgrade: {
                      type: Type.OBJECT,
                      properties: {
                        headerFont: { type: Type.STRING },
                        bodyFont: { type: Type.STRING },
                        styleNote: { type: Type.STRING }
                      },
                      required: ["headerFont", "bodyFont", "styleNote"]
                    },
                    packagingUpgradeAdvice: { type: Type.STRING }
                  },
                  required: [
                    "logoCritiqueAndRefinement",
                    "refinedColorPalette",
                    "typographyUpgrade",
                    "packagingUpgradeAdvice"
                  ]
                },
                brandMessagingAndTagline: {
                  type: Type.OBJECT,
                  properties: {
                    taglineOptions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          tagline: { type: Type.STRING },
                          angle: { type: Type.STRING }
                        },
                        required: ["tagline", "angle"]
                      }
                    },
                    recommendedTagline: { type: Type.STRING },
                    taglineRationale: { type: Type.STRING },
                    coreElevatorPitch: { type: Type.STRING },
                    keyMessagingPillars: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: [
                    "taglineOptions",
                    "recommendedTagline",
                    "taglineRationale",
                    "coreElevatorPitch",
                    "keyMessagingPillars"
                  ]
                },
                marketingStrategy: {
                  type: Type.OBJECT,
                  properties: {
                    priceTierAndPerceptionStrategy: { type: Type.STRING },
                    trustBuildingTactics: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    omnichannelPlan: { type: Type.STRING }
                  },
                  required: ["priceTierAndPerceptionStrategy", "trustBuildingTactics", "omnichannelPlan"]
                },
                socialMediaContent: {
                  type: Type.OBJECT,
                  properties: {
                    revampedEnglishCaptions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          hook: { type: Type.STRING },
                          body: { type: Type.STRING },
                          callToAction: { type: Type.STRING },
                          hashtags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          }
                        },
                        required: ["title", "hook", "body", "callToAction", "hashtags"]
                      }
                    },
                    revampedPidginCaptions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          hook: { type: Type.STRING },
                          body: { type: Type.STRING },
                          callToAction: { type: Type.STRING },
                          hashtags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          }
                        },
                        required: ["title", "hook", "body", "callToAction", "hashtags"]
                      }
                    },
                    weeklyContentPillars: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    whatsAppStatusCampaign: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          part: { type: Type.STRING },
                          text: { type: Type.STRING },
                          visualTip: { type: Type.STRING }
                        },
                        required: ["part", "text", "visualTip"]
                      }
                    }
                  },
                  required: [
                    "revampedEnglishCaptions",
                    "revampedPidginCaptions",
                    "weeklyContentPillars",
                    "whatsAppStatusCampaign"
                  ]
                }
              },
              required: [
                "brandPositioning",
                "brandConsistency",
                "improvedVisualIdentity",
                "brandMessagingAndTagline",
                "marketingStrategy",
                "socialMediaContent"
              ]
            }
          },
          required: ["brandAudit", "recommendations"]
        }
      }
    });
    const parsed = safeParseGeminiJson(response.text, "brand audit and recommendations");
    if (!parsed.brandAudit || !parsed.recommendations) {
      throw new AppApiError(
        "The brand audit response was incomplete. Please retry to receive all 6 strategic recommendations.",
        502,
        "INCOMPLETE_AI_RESPONSE",
        true
      );
    }
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Error improving existing brand:", error);
    return sendApiError(res, error, "Failed to analyze existing brand. Please try again.");
  }
});
app.post("/api/regenerate-captions", ...requireAiTextAccess, async (req, res) => {
  try {
    const { brandName, productName, theme = "General Sale", tone = "Engaging & Authentic" } = req.body;
    if (!brandName && !productName) {
      return res.status(400).json({
        success: false,
        error: "Brand name or product name is required to generate captions.",
        code: "INVALID_REQUEST",
        retryable: false
      });
    }
    const prompt = `You are a Senior Nigerian Brand Strategist. Generate 2 new social captions for Nigerian brand "${brandName}" selling "${productName}".
Theme/Angle: ${theme}
Tone: ${tone}

Output JSON with:
"english": { "title": string, "hook": string, "body": string, "callToAction": string, "hashtags": string[] }
"pidgin": { "title": string, "hook": string, "body": string, "callToAction": string, "hashtags": string[] }
Ensure the pidgin is 100% natural, culturally authentic and street-smart Nigerian Pidgin. Ground in product reality without hallucinating false medical or regulatory claims.`;
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const data = safeParseGeminiJson(
      response.text,
      "marketing captions"
    );
    if (!data.english && !data.pidgin) {
      throw new AppApiError(
        "The AI returned incomplete caption data. Your existing captions were preserved \u2014 please retry.",
        502,
        "INCOMPLETE_AI_RESPONSE",
        true
      );
    }
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error regenerating captions:", err);
    return sendApiError(res, err, "Failed to regenerate captions. Your existing captions were preserved.");
  }
});
app.post("/api/suggest-brand-names", ...requireAiTextAccess, async (req, res) => {
  try {
    const { category = "Fashion and clothing", productName = "", productDescription = "", brandTone = "Afro-Luxury & Regal" } = req.body;
    const prompt = `You are a distinguished Senior Nigerian Brand Strategist.
Suggest 5 distinctive, memorable, marketable Nigerian business/brand names for this product:
Product: ${productName || "Commercial SME Item"}
Category: ${category}
Description: ${productDescription || "Handcrafted Nigerian craft or goods"}
Desired Tone: ${brandTone}

Return strictly valid JSON with an array named "suggestions".
Each element must have:
- "name": string (short, punchy brand name e.g. "Nonnies Zobo Infusion", "Adire Luxe Atelier", "Kemi Golden Shea Glow")
- "tagline": string (brief, memorable slogan)
- "vibe": string (2-3 words describing the brand personality)`;
    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const data = safeParseGeminiJson(
      response.text,
      "brand name suggestions"
    );
    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) {
      throw new AppApiError(
        "No brand name suggestions were returned. Please try again.",
        502,
        "INCOMPLETE_AI_RESPONSE",
        true
      );
    }
    return res.json({ success: true, suggestions: data.suggestions });
  } catch (err) {
    console.error("Error suggesting brand names:", err);
    return sendApiError(res, err, "Failed to suggest brand names. Please try again.");
  }
});
app.post("/api/verify-product-image", ...requireAiTextAccess, async (req, res) => {
  try {
    const {
      imageBase64,
      imageMimeType = "image/jpeg",
      productName = "",
      productDescription = "",
      category = ""
    } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Please upload a product photograph before verifying or generating a promotional flyer.",
        code: "MISSING_IMAGE",
        retryable: false
      });
    }
    const imagePart = await resolveImagePart(imageBase64, imageMimeType);
    if (!imagePart) {
      return res.status(400).json({
        success: false,
        error: "The selected photograph could not be read cleanly. Please upload a valid PNG, JPEG, or WebP image.",
        code: "INVALID_IMAGE",
        retryable: false
      });
    }
    const promptText = `You are a strict Visual Quality Control Auditor for an e-commerce promotional flyer studio.
Analyze the ACTUAL photograph attached and compare what is visibly shown against the user's stated product details:

Stated Product Name: "${productName || "Not specified"}"
Stated Product Category: "${category || "Not specified"}"
Stated Product Description: "${productDescription || "Not specified"}"

VERIFICATION RULES:
1. Identify the primary visible object/garment/item in the photograph accurately (e.g., "Perfume bottle", "Two-piece Ankara kimono & trouser outfit", "Glass jar of yellow whipped butter", "Dropper bottle of oil", "Solar inverter unit", "Leather tote bag").
2. Compare the visible item against the stated product name & description:
   - Return matches = true ONLY if the visible item genuinely corresponds to the advertised product type (e.g., an Ankara dress/kimono set matches "Royal Ankara Print Kimono & Trouser Set"; a bottle of hibiscus drink matches "Artisanal Spiced Zobo"; a jar of yellow shea butter matches "Whipped Golden Shea Butter").
   - Return matches = false if they depict different product types (e.g., a perfume bottle when the product is clothing/Ankara, a salad bowl when the product is jarred sauce, shoes when the product is a bag, or an unrelated object).
   - If Stated Product Name and Description are both empty/not specified, return matches = true if a clear single commercial product is visible, otherwise false.
3. If matches = false, write a clear, polite "mismatchReason" naming both what is visible in the photo and what the user's product text states, and write an actionable "suggestedAction".

Output strictly valid JSON matching the schema.`;
    const response = await generateContentWithFallback({
      contents: {
        parts: [imagePart, { text: promptText }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: { type: Type.BOOLEAN },
            confidence: { type: Type.INTEGER },
            detectedProduct: { type: Type.STRING },
            detectedCategory: { type: Type.STRING },
            mismatchReason: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: [
            "matches",
            "confidence",
            "detectedProduct",
            "detectedCategory",
            "mismatchReason",
            "suggestedAction"
          ]
        }
      }
    });
    const verification = safeParseGeminiJson(response.text, "product image verification");
    if (typeof verification.matches !== "boolean" || !verification.detectedProduct) {
      throw new AppApiError(
        "Product image verification returned incomplete details. Please retry.",
        502,
        "INCOMPLETE_AI_RESPONSE",
        true
      );
    }
    return res.json({ success: true, verification });
  } catch (err) {
    console.error("Error verifying product image:", err);
    return sendApiError(
      res,
      err,
      "Could not verify product image match right now. Please try again."
    );
  }
});
app.post("/api/enhance-product-photo", ...requireAiImageAccess, async (req, res) => {
  try {
    const {
      imageBase64,
      imageMimeType = "image/jpeg",
      productName = "the product",
      preset = "studio-clean"
    } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Please upload a verified product photo before running photo enhancement.",
        code: "MISSING_IMAGE",
        retryable: false
      });
    }
    const imagePart = await resolveImagePart(imageBase64, imageMimeType);
    if (!imagePart) {
      return res.status(400).json({
        success: false,
        error: "The uploaded photograph could not be processed. Please upload a valid PNG, JPEG, or WebP image.",
        code: "INVALID_IMAGE",
        retryable: false
      });
    }
    const inputHash = crypto.createHash("sha256").update(imagePart.inlineData.data).digest("hex");
    const presetDirectives = {
      "background-remove": "Completely remove the cluttered background and isolate ONLY the exact product on a pure seamless clean white (#FFFFFF) e-commerce studio backdrop with a soft, realistic natural contact shadow directly beneath the item.",
      "studio-clean": "Keep the exact product centered and place it against an elevated, minimalist warm stone & cream commercial photography studio backdrop with balanced softbox lighting and crisp focus.",
      "lighting-clarity": "Keep the composition natural while significantly upgrading commercial lighting, white balance, surface sharpness, contrast, and crisp clarity so the product looks professionally photographed.",
      "lifestyle-nigeria": "Stage the exact product cleanly on a tasteful warm Nigerian boutique tabletop (natural polished timber or warm travertine stone with soft natural daylight) without obscuring or altering the product."
    };
    const chosenDirective = presetDirectives[preset] || presetDirectives["studio-clean"];
    const editPrompt = `You are a commercial product photo retoucher.
Product context: "${productName}".

TASK: ${chosenDirective}

CRITICAL FIDELITY RULES:
1. Preserve the EXACT physical shape, design, proportions, colours, fabric patterns/prints, labels, and details of the product in the attached photograph.
2. Do NOT replace the product with a different item. Do NOT invent new brand logos, text overlays, fake badges, or extra products.
3. Return ONLY the enhanced photograph.`;
    let response;
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [imagePart, { text: editPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          }
        });
        break;
      } catch (err) {
        lastErr = err;
        const classified = classifyGeminiError(err);
        if (!classified.retryable) {
          if (classified.status === 403 || classified.status === 429) {
            throw new AppApiError(
              "AI product photo enhancement requires a billing-enabled Gemini API key or available image-model quota (Settings > Secrets). Your original verified photograph has been preserved and can be used directly in promotional flyers.",
              classified.status,
              classified.code,
              false
            );
          }
          throw new AppApiError(
            classified.userMessage,
            classified.status,
            classified.code,
            false
          );
        }
      }
    }
    if (!response) {
      const finalClassified = classifyGeminiError(lastErr);
      if (finalClassified.status === 403 || finalClassified.status === 429) {
        throw new AppApiError(
          "AI product photo enhancement requires a billing-enabled Gemini API key or available image-model quota (Settings > Secrets). Your original verified photograph has been preserved and can be used directly in promotional flyers.",
          finalClassified.status,
          finalClassified.code,
          false
        );
      }
      throw lastErr || new Error("Image enhancement did not complete.");
    }
    let outputBase64 = null;
    let outputMime = "image/png";
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        outputBase64 = part.inlineData.data.replace(/\s+/g, "");
        outputMime = part.inlineData.mimeType || "image/png";
        break;
      }
    }
    if (!outputBase64) {
      throw new AppApiError(
        "The image enhancement model did not return a rendered image. Your original verified photo was preserved.",
        502,
        "NO_IMAGE_RETURNED",
        false
      );
    }
    const outputHash = crypto.createHash("sha256").update(outputBase64).digest("hex");
    if (outputHash === inputHash) {
      throw new AppApiError(
        "No visual enhancement change was applied by the model, so your original photograph was kept unchanged.",
        502,
        "NO_IMAGE_CHANGE",
        false
      );
    }
    return res.json({
      success: true,
      dataUrl: `data:${outputMime};base64,${outputBase64}`,
      preset
    });
  } catch (err) {
    console.error("Error enhancing product photo:", err);
    return sendApiError(
      res,
      err,
      "Could not enhance the product photo right now. Your original verified photo has been preserved."
    );
  }
});
app.post("/api/generate-service-visual", ...requireAiImageAccess, async (req, res) => {
  try {
    const {
      brandName = "Nigerian Service Studio",
      serviceCategory = "Professional Services",
      serviceName = "",
      serviceDescription = "",
      deliveryMethod = "hybrid",
      primaryColor = "#0D5C3A",
      accentColor = "#D97706",
      aspectRatio = "1:1"
    } = req.body || {};
    if (!serviceName && !serviceDescription && !serviceCategory) {
      return res.status(400).json({
        success: false,
        error: "Please provide a service category or description before generating an illustrative service visual.",
        code: "INVALID_REQUEST",
        retryable: false
      });
    }
    const validAspect = aspectRatio === "9:16" || aspectRatio === "16:9" ? aspectRatio : "1:1";
    const visualPrompt = `Generate a clean, respectful, high-resolution commercial editorial photograph representing an authentic Nigerian ${serviceCategory} business (${brandName}).
Specific service depicted: ${serviceName || serviceCategory}.
Context: ${serviceDescription || serviceCategory}.
Delivery setting: ${deliveryMethod === "online" ? "modern clean Nigerian remote workstation / digital studio setup" : "neat, well-lit contemporary Nigerian service studio / workspace"}.
Color harmony accents: subtle touches echoing ${primaryColor} and ${accentColor}.

STRICT HONESTY & QUALITY RULES:
1. Show clean workspace environment, tools of the trade, or editorial service delivery in action.
2. Do NOT include any text overlays, words, fake awards, diplomas, client quotes, before/after medical claims, or watermarks inside the image.
3. Photorealistic editorial style, natural lighting, high clarity.`;
    let response;
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1200));
      }
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [{ text: visualPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: validAspect
            }
          }
        });
        break;
      } catch (err) {
        lastErr = err;
        const classified = classifyGeminiError(err);
        if (!classified.retryable) {
          if (classified.status === 403 || classified.status === 429) {
            throw new AppApiError(
              "AI illustrative visual generation requires a billing-enabled Gemini API key or available image-model quota (Settings > Secrets). You can upload an actual work or premises photo directly instead.",
              classified.status,
              classified.code,
              false
            );
          }
          throw new AppApiError(
            classified.userMessage,
            classified.status,
            classified.code,
            false
          );
        }
      }
    }
    if (!response) {
      const finalClassified = classifyGeminiError(lastErr);
      if (finalClassified.status === 403 || finalClassified.status === 429) {
        throw new AppApiError(
          "AI illustrative visual generation requires a billing-enabled Gemini API key or available image-model quota (Settings > Secrets). You can upload an actual work or premises photo directly instead.",
          finalClassified.status,
          finalClassified.code,
          false
        );
      }
      throw lastErr || new Error("Illustrative service visual generation failed.");
    }
    let outputBase64 = null;
    let outputMime = "image/png";
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        outputBase64 = part.inlineData.data.replace(/\s+/g, "");
        outputMime = part.inlineData.mimeType || "image/png";
        break;
      }
    }
    if (!outputBase64) {
      throw new AppApiError(
        "The image generator did not return a visual. Please retry or upload a real photo of your service.",
        502,
        "NO_IMAGE_RETURNED",
        false
      );
    }
    return res.json({
      success: true,
      dataUrl: `data:${outputMime};base64,${outputBase64}`,
      isIllustrative: true
    });
  } catch (err) {
    console.error("Error generating service visual:", err);
    return sendApiError(
      res,
      err,
      "Could not generate illustrative service visual right now. You can upload an actual photo of your work instead."
    );
  }
});
app.use("/api", (_req, res) => {
  return res.status(404).json({
    success: false,
    error: "API endpoint not found.",
    code: "NOT_FOUND",
    retryable: false
  });
});
app.use("/api", (err, _req, res, _next) => {
  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({
      success: false,
      error: "Uploaded image or request payload exceeds the 35MB limit. Please compress or resize the image.",
      code: "PAYLOAD_TOO_LARGE",
      retryable: false
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON request payload.",
      code: "BAD_JSON",
      retryable: false
    });
  }
  console.error("Unhandled /api error:", err);
  return sendApiError(res, err, "An unexpected server error occurred.");
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distDir = resolveFrontendDistDir();
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distDir, "index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`SME Brand Studio server listening on http://0.0.0.0:${port}`);
  });
}
startServer();
