import { ImageResponse } from "next/og";

export const alt = "Elvis Flores — Building digital experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 78% 40%, rgba(244,182,204,0.45), #080808 55%)",
          color: "#F8F8F8",
        }}
      >
        <div style={{ fontSize: 28, color: "#F4B6CC", letterSpacing: 6 }}>SOFTWARE DEVELOPER & CREATIVE TECHNOLOGIST</div>
        <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: -5, marginTop: 20 }}>ELVIS FLORES</div>
        <div style={{ fontSize: 44, color: "#F8D7E5", marginTop: 10 }}>Building digital experiences.</div>
      </div>
    ),
    size,
  );
}
