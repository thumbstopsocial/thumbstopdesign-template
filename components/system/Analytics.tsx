import { CONSENT_KEY } from "./consent-key";

/**
 * Google Consent Mode defaults (all denied) and Google Tag Manager.
 * Rendered in <head> by app/layout.tsx. The consent defaults run before GTM
 * loads. GA4 and any ad pixels are set up inside the GTM container, never here.
 */

const granted = `{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'}`;

function consentDefaults() {
  return [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}window.gtag=gtag;",
    "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});",
    "gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',false);",
    `try{if(localStorage.getItem('${CONSENT_KEY}')==='granted'){gtag('consent','update',${granted});}}catch(e){}`,
  ].join("");
}

function gtmLoader(id: string) {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
}

export function AnalyticsHead({ gtmId }: { gtmId?: string }) {
  return (
    <>
      <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: consentDefaults() }} />
      {gtmId ? <script id="gtm" dangerouslySetInnerHTML={{ __html: gtmLoader(gtmId) }} /> : null}
    </>
  );
}

export function AnalyticsNoScript({ gtmId }: { gtmId?: string }) {
  if (!gtmId) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
