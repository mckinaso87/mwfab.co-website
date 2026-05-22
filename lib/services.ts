import type { ProjectCategory } from "@/lib/data/projects";

export type ServiceSlug = "structural-steel" | "ornamental-steel" | "finishes";

export interface ServiceDefinition {
  slug: ServiceSlug;
  hubAnchorId: "structural" | "ornamental" | "finishes";
  title: string;
  hubBlurb: string;
  imageFolder: ProjectCategory;
  heroImage: string;
  metadataTitle: string;
  metadataDescription: string;
  sections: { heading: string; paragraphs: string[] }[];
}

const LICENSED_REGION =
  "Miami-Dade, Broward, Palm Beach, Martin, Port St. Lucie, St. Lucie, and Indian River counties on Florida's East Coast and in South Florida";

export const SERVICES: Record<ServiceSlug, ServiceDefinition> = {
  "structural-steel": {
    slug: "structural-steel",
    hubAnchorId: "structural",
    title: "Structural Steel",
    hubBlurb:
      "Building frames, beams, columns, and load-bearing systems for commercial and industrial work across East Coast Florida.",
    imageFolder: "structural",
    heroImage: "/images/projects/structural/image1.jpeg",
    metadataTitle:
      "Structural Steel Contractor Florida | McKinados Welding & Fabrication",
    metadataDescription:
      "Licensed structural steel fabrication and erection in South Florida and East Coast Florida. Commercial frames, beams, and code-compliant installation.",
    sections: [
      {
        heading: "What is structural steel construction?",
        paragraphs: [
          "Structural steel construction covers the load-bearing skeleton of a building: columns, beams, bracing, base plates, and connections that carry gravity and lateral loads. We fabricate members in our shop, coordinate deliveries, and erect steel on site so the frame aligns with approved shop drawings and the structural engineer's design.",
          "Our work includes new commercial and industrial buildings, expansions, mezzanines, equipment supports, and retrofits where steel replaces or reinforces existing structure. Every connection is laid out to meet the specified AISC standards and the engineer's seal.",
        ],
      },
      {
        heading: "Who is this service for?",
        paragraphs: [
          "General contractors, developers, and owners who need a licensed steel contractor to take structural scope from permit through erection. We partner with your architect and structural engineer on submittals, respond to RFIs during fabrication, and sequence erection around other trades.",
          "Typical clients include warehouses, retail pads, mixed-use shells, institutional additions, and industrial facilities in South Florida where schedule and code compliance are non-negotiable.",
        ],
      },
      {
        heading: "Florida codes and standards",
        paragraphs: [
          "Florida Building Code (FBC) and High-Velocity Hurricane Zone (HVHZ) provisions in Miami-Dade and Broward drive wind load, connection detailing, and inspection requirements. We build to the engineer's design for basic wind speed, exposure category, and risk category applicable to your site.",
          "Shop and field work reference AISC 360 for steel construction, AWS D1.1 for welding where specified, and project-specific specifications for galvanizing, fireproofing interfaces, and anchor rod layouts. Miami-Dade Product Control approvals apply when the jurisdiction requires NOA-listed assemblies.",
        ],
      },
      {
        heading: "Our process",
        paragraphs: [
          "After contract award we review structural drawings and produce or align with fabrication drawings, then order material and schedule shop production. Connections are assembled or bolted per the erection plan; we coordinate crane picks and safety plans with the GC.",
          "Field installation includes plumbing and leveling of columns, beam placement, temporary bracing, and final bolt-up or weld completion. We work with the inspector for required hold points and provide documentation needed for progression to subsequent trades.",
        ],
      },
      {
        heading: "Where we provide structural steel",
        paragraphs: [
          `We are licensed to perform structural steel work in ${LICENSED_REGION}. If your project sits in one of these counties, we can bid fabrication and erection as a single scope or coordinate with your existing trades.`,
          "Request a bid with your drawing set and schedule; we will confirm license jurisdiction and return a proposal aligned to your bid date.",
        ],
      },
    ],
  },
  "ornamental-steel": {
    slug: "ornamental-steel",
    hubAnchorId: "ornamental",
    title: "Ornamental Steel",
    hubBlurb:
      "Custom railings, gates, stairs, and architectural metalwork that meets Florida life-safety and accessibility requirements.",
    imageFolder: "ornamental",
    heroImage: "/images/projects/ornamental/image1.jpeg",
    metadataTitle:
      "Ornamental Steel Fabrication Florida | McKinados Welding & Fabrication",
    metadataDescription:
      "Custom ornamental steel railings, gates, stairs, and architectural metalwork. Licensed contractor serving South Florida and East Coast Florida.",
    sections: [
      {
        heading: "What is ornamental steel?",
        paragraphs: [
          "Ornamental steel is the visible metalwork on a project: guardrails, handrails, stair stringers and pans, gates, fencing, canopies, and decorative elements that must still meet structural and life-safety rules. We detail, fabricate, and install custom pieces from your drawings or our shop sketches approved by the design team.",
          "Unlike primary structural frames, ornamental work is often governed by railing heights, opening limitations, graspability, and finish requirements as much as by strength. We balance appearance with code-compliant geometry.",
        ],
      },
      {
        heading: "Who is this service for?",
        paragraphs: [
          "Architects, designers, hospitality and retail operators, residential builders on permitted multifamily work, and general contractors who need a single vendor for repeatable railing modules or one-off feature stairs.",
          "We support both build-to-print installations from sealed details and design-assist conversations where you have a concept and need a fabricator to propose tube sizes, connections, and anchorage.",
        ],
      },
      {
        heading: "Florida codes and standards",
        paragraphs: [
          "Guardrails and stairs must comply with FBC Chapter 10 and referenced standards for height, load, and infill. Florida Accessibility Code (based on ADA) applies to public accommodations and many commercial routes; graspable handrails, extensions, and stair geometry must be verified per jurisdiction.",
          "Coastal counties may require corrosion-resistant materials or enhanced coatings. We document anchorage to concrete or steel substrates for permit review and coordinate wind load on screen walls or feature elements when the engineer assigns load.",
        ],
      },
      {
        heading: "Our process",
        paragraphs: [
          "We start from approved shop drawings or field measure for existing conditions, then fabricate in the shop with jigs for repeating pickets or panels. Finishes are often specified separately; we coordinate timing so powder coat or galvanizing does not delay rough-in inspections.",
          "Installation includes layout, embed or post-installed anchorage, alignment, and punch-list touch-up. We return for adjustments after other trades when required so rails and gates operate correctly.",
        ],
      },
      {
        heading: "Where we provide ornamental steel",
        paragraphs: [
          `Licensed ornamental and structural steel work is available throughout ${LICENSED_REGION}. South Florida municipalities vary in submittal requirements; we include calculation sheets or delegated-design notes when your permit path requires them.`,
          "Share floor plans, railing elevations, or inspiration images when you request a bid so we can scope fabrication, finish, and installation accurately.",
        ],
      },
    ],
  },
  finishes: {
    slug: "finishes",
    hubAnchorId: "finishes",
    title: "Finishes",
    hubBlurb:
      "Powder coating, galvanizing, and protective coatings applied with controlled handling so structural and ornamental steel lasts in Florida's climate.",
    imageFolder: "finishes",
    heroImage: "/images/projects/finishes/image1.jpeg",
    metadataTitle:
      "Steel Finishes Powder Coat & Galvanizing | McKinados Welding & Fabrication",
    metadataDescription:
      "Powder coat, hot-dip galvanizing, and protective steel finishes for Florida projects. Coordinated with fabrication and field installation.",
    sections: [
      {
        heading: "What steel finishing includes",
        paragraphs: [
          "Steel finishes protect fabricated members from corrosion and define the final appearance. We coordinate powder coating for color and UV resistance, hot-dip galvanizing per ASTM A123 where specified, and primer systems when the project calls for field paint over shop primer.",
          "Finishes are planned with fabrication so venting, hanging points, and masking do not compromise coating coverage on critical connections.",
        ],
      },
      {
        heading: "Who is this service for?",
        paragraphs: [
          "Owners and contractors who want one team to fabricate and finish rather than ship bare steel to a separate coater. We are a fit when the specification names a color, gloss, galvanizing class, or exposure category tied to coastal South Florida.",
          "We also support touch-up and warranty repair on prior installations when scope is limited to coating restoration.",
        ],
      },
      {
        heading: "Florida environment and specifications",
        paragraphs: [
          "Salt air, humidity, and sun drive coating choices in East Coast and South Florida counties. Galvanizing is common for exterior structural exposed to weather; powder coat is typical for ornamental rails and feature metal where color match matters.",
          "Specifications often reference SSPC surface preparation, manufacturer data sheets for powder, and ASTM galvanizing thickness by material category. We follow the spec and document batch or color when submittals are required.",
        ],
      },
      {
        heading: "Our process",
        paragraphs: [
          "After fabrication we stage material for outbound finishing or apply in-house processes per scope. Items return for fit-up verification before shipment to site. Field touch-up uses compatible systems so warranty chains stay intact.",
          "We sequence finishing before erection when possible to avoid field damage; when site touch-up is required, we include compatible repair products in closeout.",
        ],
      },
      {
        heading: "Where we provide finishing services",
        paragraphs: [
          `Finish coordination is available on projects we fabricate or install in ${LICENSED_REGION}. Combining fabrication and finish under one contractor reduces handling damage and schedule gaps between shop and coater.`,
          "Include finish requirements in your bid request: color, gloss, galvanizing class, and exposure so we price the correct process the first time.",
        ],
      },
    ],
  },
};

export const SERVICE_SLUGS: ServiceSlug[] = [
  "structural-steel",
  "ornamental-steel",
  "finishes",
];

export function getService(slug: string): ServiceDefinition | undefined {
  if (slug in SERVICES) {
    return SERVICES[slug as ServiceSlug];
  }
  return undefined;
}

/** Image paths for gallery grids per service folder. */
export const SERVICE_GALLERY_COUNTS: Record<ProjectCategory, number> = {
  structural: 7,
  ornamental: 5,
  finishes: 6,
};

export function serviceGalleryImages(folder: ProjectCategory): string[] {
  const count = SERVICE_GALLERY_COUNTS[folder];
  return Array.from(
    { length: count },
    (_, i) => `/images/projects/${folder}/image${i + 1}.jpeg`
  );
}
