"use client";

import { reportWorkauraContactClick } from "../../lib/googleAdsTracking";

export default function TrackedContactLink({
  href,
  className,
  contactMethod,
  placement,
  children,
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => reportWorkauraContactClick(contactMethod, placement)}
    >
      {children}
    </a>
  );
}
