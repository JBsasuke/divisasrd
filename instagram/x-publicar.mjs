import { readFile } from "node:fs/promises";
import { TwitterApi } from "twitter-api-v2";

const [imagePath, textPath] = process.argv.slice(2);
const env = process.env;
const required = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"];
for (const key of required) {
  if (!env[key]) throw new Error(`Missing GitHub Actions secret: ${key}`);
}
if (!imagePath || !textPath) {
  throw new Error("Usage: node instagram/x-publicar.mjs <image.jpg> <caption.txt>");
}

const original = (await readFile(textPath, "utf8")).trim();
const suffix = "\n\nhttps://divisasrd.com";
const maxCaptionCodePoints = 250;
let caption = Array.from(original).slice(0, maxCaptionCodePoints).join("").trimEnd();
if (caption.length < original.length) caption = caption.replace(/[\\s,;:]+$/, "") + "…";
caption += suffix;

const client = new TwitterApi({
  appKey: env.X_API_KEY,
  appSecret: env.X_API_SECRET,
  accessToken: env.X_ACCESS_TOKEN,
  accessSecret: env.X_ACCESS_TOKEN_SECRET,
});

console.log("Uploading image to X…");
const mediaId = await client.v1.uploadMedia(imagePath);
console.log("Publishing post to X…");
const post = await client.v2.tweet({ text: caption, media: { media_ids: [mediaId] } });
console.log(`X post published: ${post.data.id}`);
