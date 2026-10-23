import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { TwitterApi } from "twitter-api-v2";
import twitterText from "twitter-text";
const { parseTweet } = twitterText;

const [imagePath, textPath] = process.argv.slice(2);
const env = process.env;
const required = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"];
for (const key of required) {
  if (!env[key]) throw new Error(`Missing GitHub Actions secret: ${key}`);
}
if (!imagePath || !textPath) {
  throw new Error("Usage: node instagram/x-publicar.mjs <image.jpg> <caption.txt>");
}

const imageUrl = `https://divisasrd.com/ig/${basename(imagePath)}`;
const original = (await readFile(textPath, "utf8")).trim();
const suffix = `\n\n${imageUrl}`;
let body = original;
let text = body + suffix;
let parsed = parseTweet(text);

// X counts Unicode and URLs with its own weighted rules. Shorten safely until
// the caption plus public image URL fits the 280-character limit.
while ((!parsed.valid || parsed.weightedLength > 280) && Array.from(body).length > 0) {
  const chars = Array.from(body);
  chars.pop();
  body = chars.join("").replace(/[\s,;:]+$/, "").trimEnd();
  text = body + "…" + suffix;
  parsed = parseTweet(text);
}
if (!parsed.valid || parsed.weightedLength > 280) {
  throw new Error("The generated caption could not be shortened to X's post limit.");
}

const client = new TwitterApi({
  appKey: env.X_API_KEY,
  appSecret: env.X_API_SECRET,
  accessToken: env.X_ACCESS_TOKEN,
  accessSecret: env.X_ACCESS_TOKEN_SECRET,
});

console.log(`Caption length for X: ${parsed.weightedLength}/280`);
let mediaId;
try {
  console.log("Trying to upload image to X…");
  mediaId = await client.v1.uploadMedia(imagePath);
  console.log("Image uploaded; publishing post with attached image…");
} catch (error) {
  console.warn(`Media upload error: ${error?.code ?? "unknown"} ${error?.message ?? ""}`);
  if (error?.code === 401 || /code 89|Invalid or expired token/i.test(error?.message ?? "")) {
    throw new Error("X OAuth 1.0 credentials were rejected (401/code 89). Check that GitHub secrets X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, and X_ACCESS_TOKEN_SECRET are the matching OAuth 1.0 values for this app. Do not use the OAuth 2.0 access token here.");
  }
  console.warn("X rejected media upload; will publish the text with the public image URL instead.");
}

let post;
if (mediaId) {
  post = await client.v2.tweet({ text, media: { media_ids: [mediaId] } });
} else {
  post = await client.v2.tweet({ text });
}
console.log(`X post published: ${post.data.id}`);
