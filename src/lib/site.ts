/** Site-wide brand/config values, overridable via environment variables. */
export const site = {
  name: "GridShift Solutions",
  tagline: "Engineered for Energy Independence",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@gridshiftsolutions.com",
  supportHours: process.env.NEXT_PUBLIC_SUPPORT_HOURS || "Mon–Fri, 8:00–18:00",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://gridshiftsolutions.vercel.app").replace(
    /\/$/,
    ""
  ),
};
