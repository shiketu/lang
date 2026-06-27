import type { MetadataRoute } from "next";

// Web App Manifest → served at /manifest.webmanifest; Next auto-injects the
// <link rel="manifest">. Makes the site installable as a standalone Android app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LangLearn",
    short_name: "LangLearn",
    description:
      "Language learning: structured vocabulary, shadowing & repeat practice, daily review.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
