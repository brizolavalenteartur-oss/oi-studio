import { createFileRoute } from "@tanstack/react-router";
import { fetchCatalog } from "@/data/products";
import { absoluteUrl } from "@/lib/site";

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c,
  );

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const catalog = await fetchCatalog();
        const urls = [
          `<url><loc>${escapeXml(absoluteUrl("/"))}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          ...catalog.map(
            (product) =>
              `<url><loc>${escapeXml(absoluteUrl(`/produto/${product.id}`))}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
