import { ImageResponse } from "next/og";
import { config } from "@/lib/config";
import { markDataUri, token } from "@/lib/tokens";

/** Default social share image in the site's colours. Uses the --og-* tokens from styles/tokens.css. */
export const alt = config.business.tradingName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const mark = markDataUri();
  const bg = token("og-background", "#111111");
  const fg = token("og-foreground", "#ffffff");
  const text = config.seo.defaultOgText ?? config.pages[0].description;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: bg, color: fg }}>
        {mark ? (
          <img src={mark} height={96} alt="" style={{ objectFit: "contain", alignSelf: "flex-start" }} />
        ) : (
          <div style={{ fontSize: 40, fontWeight: 700 }}>{config.business.tradingName}</div>
        )}
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{text}</div>
      </div>
    ),
    size,
  );
}
