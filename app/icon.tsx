import { ImageResponse } from "next/og";
import { config } from "@/lib/config";
import { markDataUri, token } from "@/lib/tokens";

/** Favicon from design/assets (favicon.svg, logo.svg or favicon.png), else the first letter of the trading name. */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const mark = markDataUri();
  const bg = token("og-background", "#111111");
  const fg = token("og-foreground", "#ffffff");
  return new ImageResponse(
    mark ? (
      <img src={mark} width={64} height={64} alt="" style={{ objectFit: "contain" }} />
    ) : (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: fg, fontSize: 40, fontWeight: 700 }}>
        {config.business.tradingName.charAt(0).toUpperCase()}
      </div>
    ),
    size,
  );
}
