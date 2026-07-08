import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HeaderGuard – Security Header Scanner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: 72, fontWeight: 800, color: "#f87171" }}>
              Header
            </span>
            <span style={{ fontSize: 72, fontWeight: 800, color: "#ffffff" }}>
              Guard
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#9ca3af",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Scan your site for missing HTTP security headers — get an A–F grade
            in seconds
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "16px",
            }}
          >
            {["HSTS", "CSP", "X-Frame-Options", "Referrer-Policy"].map(
              (header) => (
                <div
                  key={header}
                  style={{
                    display: "flex",
                    background: "#1f2937",
                    color: "#f87171",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  {header}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    size
  );
}
