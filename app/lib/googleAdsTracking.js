const GOOGLE_ADS_TAG_ID = "AW-18472577168";
const GOOGLE_ADS_CONVERSION = "AW-18472577168/kj43CI3-pIkdEJDRtOhE";

export function loadGoogleAdsTag() {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  if (document.getElementById("workaura-google-ads-tag")) return;

  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_TAG_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.id = "workaura-google-ads-tag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`;
  document.head.appendChild(script);
}

export function reportWorkauraLeadConversion() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_CONVERSION,
    value: 1,
    currency: "MAD",
  });
}

export function reportWorkauraContactClick(contactMethod, placement) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_CONVERSION,
    value: 1,
    currency: "MAD",
    contact_method: contactMethod,
    link_location: placement,
  });
}
