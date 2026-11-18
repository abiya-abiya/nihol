import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbfaf5" }}>
        <svg width="140" height="140" viewBox="0 0 40 40" fill="none">
          <path d="M20 30V19" stroke="#1d2b64" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M20 23C19.6 15.4 14.2 10.6 6.6 11.2 6.9 18.8 12.4 23.4 20 23Z" fill="#2f9e5b" />
          <path d="M20 19.5C20.6 12.4 26 7.6 33.4 8.2 33 15.4 27.6 19.9 20 19.5Z" fill="#2f9e5b" opacity="0.82" />
          <path d="M18.6 21.6C15.6 18.2 12.6 15.4 9.2 13.4M21.4 18.2C24.4 15 27.6 12.4 31 10.4" stroke="#ffffff" strokeOpacity={0.55} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 35.2C9.6 31.4 14.4 29.4 20 29.4S30.4 31.4 33 35.2Z" fill="#1d2b64" />
        </svg>
      </div>
    ),
    size,
  );
}
