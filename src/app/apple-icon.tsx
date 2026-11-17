import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbfaf5" }}>
        <svg width="140" height="140" viewBox="0 0 40 40">
          <path d="M20 21V11" stroke="#1d2b64" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M20 14c-1-5-6-7-10-6 1 5 5 7 10 6Z" fill="#2f9e5b" />
          <path d="M20 12c1.5-4.5 6-6 9.5-5-.8 4.6-5 6.4-9.5 5Z" fill="#2f9e5b" />
          <path d="M7 21.5h26" stroke="#1d2b64" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M20 21.5c0 4-3 6-6 8.5M20 21.5c0 3.5 2.5 5 5.5 6.5M20 21.5v9.5" stroke="#4a5785" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="33" r="3" fill="#e5484d" />
        </svg>
      </div>
    ),
    size,
  );
}
