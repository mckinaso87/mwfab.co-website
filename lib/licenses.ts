import { PROPOSAL_LICENSES } from "@/components/admin/proposal/Letterhead";

export { PROPOSAL_LICENSES };

export type ProposalLicenseEntry = (typeof PROPOSAL_LICENSES)[number];

export interface CountyMeta {
  slug: string;
  displayName: string;
  majorCities: string[];
  neighboringCounties: string[];
  shortBlurb: string;
}

/** Kebab-case slug from PROPOSAL_LICENSES county name (e.g. "Port Saint Lucie" → "port-saint-lucie"). */
export function toCountySlug(county: string): string {
  return county.trim().toLowerCase().replace(/\s+/g, "-");
}

export const COUNTY_META: Record<string, CountyMeta> = {
  "miami-dade": {
    slug: "miami-dade",
    displayName: "Miami-Dade",
    majorCities: ["Miami", "Hialeah", "Coral Gables", "Miami Beach", "Homestead"],
    neighboringCounties: ["Broward"],
    shortBlurb:
      "Licensed structural and ornamental steel contractor serving Miami-Dade County and South Florida.",
  },
  broward: {
    slug: "broward",
    displayName: "Broward",
    majorCities: ["Fort Lauderdale", "Hollywood", "Pompano Beach", "Coral Springs", "Davie"],
    neighboringCounties: ["Miami-Dade", "Palm Beach"],
    shortBlurb:
      "Licensed steel fabrication and erection for commercial and industrial projects across Broward County.",
  },
  "palm-beach": {
    slug: "palm-beach",
    displayName: "Palm Beach",
    majorCities: ["West Palm Beach", "Boca Raton", "Delray Beach", "Boynton Beach", "Jupiter"],
    neighboringCounties: ["Broward", "Martin"],
    shortBlurb:
      "Structural and ornamental steel construction for Palm Beach County developments and renovations.",
  },
  martin: {
    slug: "martin",
    displayName: "Martin",
    majorCities: ["Stuart", "Jensen Beach", "Hobe Sound", "Palm City", "Indiantown"],
    neighboringCounties: ["Palm Beach", "Saint Lucie", "Indian River"],
    shortBlurb:
      "Steel contractor licensed in Martin County for Treasure Coast commercial and custom metalwork.",
  },
  "port-saint-lucie": {
    slug: "port-saint-lucie",
    displayName: "Port St. Lucie",
    majorCities: ["Port St. Lucie"],
    neighboringCounties: ["Saint Lucie", "Martin", "Indian River"],
    shortBlurb:
      "City of Port St. Lucie licensed contractor for structural steel, ornamental metal, and finishes.",
  },
  "saint-lucie": {
    slug: "saint-lucie",
    displayName: "St. Lucie",
    majorCities: ["Fort Pierce", "Port St. Lucie", "St. Lucie Village"],
    neighboringCounties: ["Martin", "Port St. Lucie", "Indian River"],
    shortBlurb:
      "Licensed steel contractor serving St. Lucie County along Florida's East Coast and Treasure Coast.",
  },
  "indian-river": {
    slug: "indian-river",
    displayName: "Indian River",
    majorCities: ["Vero Beach", "Sebastian", "Fellsmere", "Indian River Shores"],
    neighboringCounties: ["Martin", "Saint Lucie"],
    shortBlurb:
      "Structural and ornamental steel services for Indian River County commercial and institutional projects.",
  },
};

export function licensedCountySlugs(): string[] {
  return PROPOSAL_LICENSES.map((entry) => toCountySlug(entry.county));
}

export function getCountyBySlug(slug: string): CountyMeta | undefined {
  return COUNTY_META[slug];
}

export function getLicenseBySlug(slug: string): ProposalLicenseEntry | undefined {
  return PROPOSAL_LICENSES.find((entry) => toCountySlug(entry.county) === slug);
}

/** Single line for footer / FAQ (county: numbers joined). */
export function formatLicenseLine(entry: ProposalLicenseEntry): string {
  return `${entry.county}: ${entry.numbers.join(" · ")}`;
}

/** Neighbor display name → slug for internal links. */
export function neighborSlug(displayName: string): string {
  const normalized = displayName.replace(/\./g, "").trim();
  const byDisplay = Object.values(COUNTY_META).find(
    (m) =>
      m.displayName === normalized ||
      m.displayName.replace("St.", "Saint") === normalized ||
      normalized === "St. Lucie"
  );
  if (byDisplay) return byDisplay.slug;
  const fromProposal = PROPOSAL_LICENSES.find(
    (e) => e.county === normalized || e.county.replace("Saint", "St.") === normalized
  );
  return fromProposal ? toCountySlug(fromProposal.county) : toCountySlug(normalized);
}
