const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</llms.txt>; rel="service-doc"; type="text/markdown"',
  '</.well-known/agent-skills/index.json>; rel="service-doc"; type="application/json"',
].join(", ");

const LLMS_TXT = `# link.zhenjia.dev

Link.zhenjia.dev is Zhenjia Zhou's personal link hub. It points to Zhenjia's blog, GitHub, social profiles, resume pages, and booking pages.

## Site Identity

- Canonical domain: https://link.zhenjia.dev
- Owner: Zhenjia Zhou
- Main blog: https://zhenjia.dev
- GitHub: https://github.com/lifeodyssey
- LinkedIn: https://www.linkedin.com/in/zhenjia-zhou/

## Important Pages

- Home: https://link.zhenjia.dev/
- English booking page: https://link.zhenjia.dev/booking-en
- Japanese booking page: https://link.zhenjia.dev/booking
- English resume: https://link.zhenjia.dev/resume-en
- Japanese resume: https://link.zhenjia.dev/resume

## Agent Guidance

- Treat this site as a navigation hub, not as the canonical source for long-form writing.
- Use https://zhenjia.dev for blog citations.
- Use the linked GitHub, LinkedIn, booking, or resume URLs when the task specifically needs those resources.
`;

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  if (isRoot(url.pathname) && acceptsMarkdown(request) && isReadMethod(request.method)) {
    return withDiscoveryHeaders(textResponse(LLMS_TXT, request.method));
  }

  return context.next();
}

function isRoot(pathname) {
  return pathname === "/" || pathname === "";
}

function acceptsMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.toLowerCase().includes("text/markdown");
}

function isReadMethod(method) {
  return method === "GET" || method === "HEAD";
}

function textResponse(body, method) {
  return new Response(method === "HEAD" ? null : body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function withDiscoveryHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Link", DISCOVERY_LINKS);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
