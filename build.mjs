import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const client = resolve(dist, "client");
const server = resolve(dist, "server");

await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });
await mkdir(resolve(client, "assets"), { recursive: true });

await cp(resolve(root, "index.html"), resolve(client, "index.html"));
await cp(resolve(root, "styles.css"), resolve(client, "styles.css"));
await cp(resolve(root, "script.js"), resolve(client, "script.js"));
await cp(resolve(root, "assets", "xiangcanyan"), resolve(client, "assets", "xiangcanyan"), {
  recursive: true,
});
await cp(resolve(root, "assets", "fonts"), resolve(client, "assets", "fonts"), { recursive: true });

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      const assetUrl = new URL("/index.html", request.url);
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      const html = (await response.text()).replaceAll("{{SITE_ORIGIN}}", url.origin);
      const headers = new Headers(response.headers);
      headers.set("content-type", "text/html; charset=UTF-8");
      return new Response(html, { status: response.status, headers });
    }
    return env.ASSETS.fetch(new Request(url, request));
  }
};
`;

await writeFile(resolve(server, "index.js"), worker, "utf8");

console.log("Xiang Canyan homepage build completed.");
