import { ImageResponse } from "next/og";

// Apple touch icon — 180x180. Used when iOS users save the site to home screen.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
          borderRadius: 38,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(8deg)",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <path
              d="M60 0 L70 50 L120 60 L70 70 L60 120 L50 70 L0 60 L50 50 Z"
              fill="#0f1b00"
            />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
