"use client";

import { useEffect } from "react";
import { loadGoogleAdsTag } from "../../lib/googleAdsTracking";

export default function GoogleAdsTracking() {
  useEffect(() => {
    loadGoogleAdsTag();
  }, []);

  return null;
}
