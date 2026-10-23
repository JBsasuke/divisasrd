import { readFile } from "node:fs/promises";
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

const original = (await readFile(textPath, "utf8")).trim();
const suffix = "\n\nhttps://divisasrd.com";
let body = original;
let text = body + suffix;
let parsed = parseTweet(text);

// X counts Unicode and URLs with its own weighted rules. Shorten safely until
// the text is valid and within 280 weighted characters.
while ((!parsed.valid || parsed.weightedLength > 280) && Array.from(body).length > 0) {
  const chars = Array.from(body);
  chars.pop();
  body = chars.join("").replace(/[\\s,;:]+$/, "").trimEnd();
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
console.log("Uploading image to X…");
const mediaId = await client.v1.uploadMedia(imagePath);
console.log("Publishing post to X…");
const post = await client.v2.tweet({ text, media: { media_ids: [mediaId] } });
console.log(`X post published: ${post.data.id}`);
