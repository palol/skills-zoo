// src/site/_data/webmentions.mjs
// Build-time webmention fetch + cache. Data available in templates as
// `webmentions.mentions`. Requires WEBMENTION_IO_TOKEN in the environment;
// with no token it degrades to an empty list (build still succeeds).
//
// NEVER hardcode the token here - it would ship in your public repo. Read it
// from the environment only.
import EleventyFetch from "@11ty/eleventy-fetch";

export default async function () {
  const token = process.env.WEBMENTION_IO_TOKEN || "";

  if (!token) {
    console.log("No WEBMENTION_IO_TOKEN found - webmentions disabled");
    return { mentions: [] };
  }

  const url = `https://webmention.io/api/mentions.jf2?token=${token}&per-page=1000`;

  try {
    const webmentions = await EleventyFetch(url, {
      duration: "1h", // cache to avoid API rate limits
      type: "json",
    });
    console.log(`Fetched ${webmentions.children?.length || 0} webmentions`);
    return { mentions: webmentions.children || [] };
  } catch (e) {
    console.error("Error fetching webmentions:", e);
    return { mentions: [] };
  }
}
