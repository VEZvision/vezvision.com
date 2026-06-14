import { assertEquals } from 'jsr:@std/assert@1';
import { getClientIp } from './clientIp.ts';

Deno.test('prefers cf-connecting-ip over spoofed x-forwarded-for', () => {
  const request = new Request('https://example.com', {
    headers: {
      'cf-connecting-ip': '203.0.113.10',
      'x-forwarded-for': '198.51.100.99, 203.0.113.10',
    },
  });

  assertEquals(getClientIp(request), '203.0.113.10');
});

Deno.test('ignores spoofable x-real-ip and x-forwarded-for', () => {
  const request = new Request('https://example.com', {
    headers: {
      'x-real-ip': '198.51.100.99',
      'x-forwarded-for': '198.51.100.99, 203.0.113.44',
    },
  });

  assertEquals(getClientIp(request), 'unknown');
});

Deno.test('uses true-client-ip when cloudflare header is absent', () => {
  const request = new Request('https://example.com', {
    headers: {
      'true-client-ip': '203.0.113.55',
    },
  });

  assertEquals(getClientIp(request), '203.0.113.55');
});

Deno.test('returns unknown when no trusted ip is present', () => {
  const request = new Request('https://example.com', {
    headers: {
      'x-forwarded-for': 'not-an-ip',
    },
  });

  assertEquals(getClientIp(request), 'unknown');
});
