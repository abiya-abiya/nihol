import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nihol — maktab uçun eng yaxşi SI‑yordamçi",
    short_name: "Nihol",
    description:
      "Öqituvçi, öquvçi va ota‑ona uçun eng yaxşi SI asosidagi taʼlim vositasi: dars materialidan bir zumda test tuzadi, har bir xatoning ildizini topadi va bilimni niholdek östiradi.",
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
