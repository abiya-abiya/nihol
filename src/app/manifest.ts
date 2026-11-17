import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ildiz — xatoning ildizini topadigan SI-tyutor",
    short_name: "Ildiz",
    description: "5–6-sinf kasrlar: bilimdagi boʻshliqning ildizini topadi va shaxsiy yoʻl tuzadi.",
    start_url: "/start",
    display: "standalone",
    background_color: "#fbfaf5",
    theme_color: "#1d2b64",
    lang: "uz",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
