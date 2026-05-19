import type { APIRoute } from "astro";

export const prerender = false;

const FRANKFURTER = "https://api.frankfurter.dev/v1";

const ALLOWED_PATH_PREFIXES = ["/latest", "/currencies"];
const HISTORY_PATTERN = /^\/\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}(\?.*)?$/;

function isAllowed(path: string): boolean {
  if (HISTORY_PATTERN.test(path)) return true;
  return ALLOWED_PATH_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}?`) || path.startsWith(`${p}/`),
  );
}

export const GET: APIRoute = async ({ url }) => {
  const path = url.searchParams.get("path") ?? "";
  if (!path.startsWith("/") || !isAllowed(path)) {
    return new Response(JSON.stringify({ error: "Invalid path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(`${FRANKFURTER}${path}`, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream ${upstream.status}` }),
        {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = await upstream.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "CDN-Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Proxy error",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
