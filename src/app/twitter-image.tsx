// Re-export the same default OG image for Twitter's summary_large_image card.
// Twitter accepts 1200x628 (we use 1200x630 — close enough, Twitter scales).
export { default, size, contentType, alt } from "./opengraph-image";
