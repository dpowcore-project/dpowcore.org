import pluginNavigation from "@11ty/eleventy-navigation";
import { readdirSync, readFileSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginNavigation);

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/static");

  // Subresource Integrity hash for files in src/static
  // Usage: {{ 'css/bootstrap.min.css' | sri }} -> "sha512-...."
  const sriCache = new Map();
  eleventyConfig.addFilter("sri", (relPath) => {
    if (sriCache.has(relPath)) return sriCache.get(relPath);
    const filePath = resolve(__dirname, "src/static", relPath);
    const data = readFileSync(filePath);
    const hash = createHash("sha512").update(data).digest("base64");
    const result = `sha512-${hash}`;
    sriCache.set(relPath, result);
    return result;
  });

  // Nunjucks as default template engine
  eleventyConfig.setTemplateFormats(["njk", "md", "html"]);

  // i18n filter — get translation by key, fallback to key itself
  eleventyConfig.addFilter("t", function (key, locale = "en") {
    const i18n = this.ctx?.i18n ?? {};
    const lang = i18n[locale] ?? i18n["en"] ?? {};
    return lang[key] ?? key;
  });

  // Short date filter
  eleventyConfig.addFilter("dateShort", (dateVal) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
  });

  // Absolute URL for og:image etc
  eleventyConfig.addFilter("absUrl", (path, base) => new URL(path, base).href);

  // Slug filter — lowercase alphanum + hyphens
  eleventyConfig.addFilter("slug", (str) =>
    String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  );

  // Parse date from filename: post_DD_MM_YYYY → Date object
  const parseDateFromSlug = (slug) => {
    const m = slug.match(/(\d{2})_(\d{2})_(\d{4})/);
    if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
    return null;
  };

  const enrichPosts = (posts) =>
    posts
      .map((p) => {
        const slug = p.fileSlug;
        const parsedDate = parseDateFromSlug(slug);
        if (parsedDate && !p.data.date) p.data.date = parsedDate;
        return p;
      })
      .sort((a, b) => (b.data.date ?? 0) - (a.data.date ?? 0));

  // Auto-discover non-en locales from i18n/ directory
  const i18nDir = resolve(__dirname, "src/_data/i18n");
  const nonEnLocales = readdirSync(i18nDir)
    .filter(f => f.endsWith(".json"))
    .map(f => basename(f, ".json"))
    .filter(l => l !== "en")
    .sort();

  // Collections: blog posts per locale
  eleventyConfig.addCollection("blogEn", (api) =>
    enrichPosts(api.getFilteredByGlob("src/en/blog/*.md"))
  );
  eleventyConfig.addCollection("blogRu", (api) =>
    enrichPosts(api.getFilteredByGlob("src/ru/blog/*.md"))
  );

  // Cross-product: every English post × every non-en locale
  // Generates /ru/blog/slug/, /zh/blog/slug/ etc. automatically
  eleventyConfig.addCollection("blogPostLocales", (api) => {
    const posts = enrichPosts(api.getFilteredByGlob("src/en/blog/*.md"));
    return posts.flatMap(post => {
      // Extract slug from permalink or fall back to fileSlug
      const slug = (post.data.permalink ?? "")
        .replace(/^\/en\/blog\//, "")
        .replace(/\/$/, "") || post.fileSlug;
      return nonEnLocales.map(locale => ({ locale, slug, post }));
    });
  });

  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
