declare module "rise-reveal/export/reveal.js";

declare module "*.svg" {
  const content: string;
  export default content;
}