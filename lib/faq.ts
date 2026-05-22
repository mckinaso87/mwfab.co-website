import { PROPOSAL_LICENSES, formatLicenseLine } from "@/lib/licenses";

export interface FaqItem {
  question: string;
  answer: string;
}

const licenseAnswer = PROPOSAL_LICENSES.map((entry) => formatLicenseLine(entry)).join("; ");

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Which Florida counties are you licensed in?",
    answer: `We hold active contractor licenses in seven jurisdictions: ${licenseAnswer}. Work outside these counties requires a separate license or subcontract arrangement.`,
  },
  {
    question: "How long have you been in business?",
    answer:
      "McKinados Welding & Fabrication has more than 17 years of experience in structural and ornamental steel fabrication and installation. Our team has completed commercial, industrial, and custom metalwork across East Coast Florida and South Florida during that period.",
  },
  {
    question: "What is the difference between structural and ornamental steel?",
    answer:
      "Structural steel carries building loads—columns, beams, bracing, and connections designed by a structural engineer. Ornamental steel is the visible metalwork such as railings, stairs, gates, and architectural features that must still meet strength and life-safety rules. We are licensed for both and often provide both scopes on one project.",
  },
  {
    question: "How do Florida wind loads and building codes affect my project?",
    answer:
      "Florida Building Code sets wind speed, exposure, and risk category for your site. Coastal and HVHZ areas (including Miami-Dade and Broward) require stricter connection detailing and product approvals. We fabricate and erect to the engineer's sealed design and coordinate inspections required by the local building department.",
  },
  {
    question: "Should I specify powder coat or galvanizing?",
    answer:
      "Hot-dip galvanizing per ASTM A123 is common for exterior structural steel exposed to weather and salt air. Powder coat adds color and UV resistance and is typical for ornamental rails and feature metal. The right choice depends on exposure, maintenance, and the project specification—we price both paths when you include finish requirements in your bid request.",
  },
  {
    question: "What is a typical project timeline?",
    answer:
      "Timeline depends on drawing approval, material lead times, shop backlog, and permit inspections. Small ornamental packages may ship in a few weeks after approval; larger structural packages often need several weeks for fabrication plus an erection window coordinated with the general contractor. We provide a schedule with our proposal.",
  },
  {
    question: "How do I request a bid?",
    answer:
      "Use the contact form at mwfab.co/contact with your project address, scope description, and drawing set if available. We confirm license jurisdiction for your county and respond with questions or a formal proposal. Email contact@mwfab.co works for plan files and addenda.",
  },
  {
    question: "Do you work on residential or commercial projects?",
    answer:
      "Most of our work is commercial, industrial, and institutional. We take residential scope when it is permitted multifamily or substantial custom metalwork tied to a licensed contractor's permit. Single-family handyman-scale jobs are usually not a fit for our shop and field crews.",
  },
  {
    question: "Do you pull permits?",
    answer:
      "Permit responsibility is defined in the contract. We can furnish shop drawings, calculations support from our detailer, and coordination with your architect or engineer of record. Many clients hold the building permit as GC while we cover steel submittals and inspections for our trade.",
  },
  {
    question: "Do you offer design-build or build-to-print?",
    answer:
      "We primarily build to sealed structural or architectural drawings. For ornamental work we can assist with shop drawing development and design-assist detailing when the design team allows. We do not replace a licensed architect or structural engineer on permit drawings.",
  },
  {
    question: "What services do you provide?",
    answer:
      "We provide structural steel fabrication and erection, ornamental steel fabrication and installation, and coordination of protective finishes including powder coat and galvanizing. Each service has a dedicated page under mwfab.co/services with process and code information.",
  },
  {
    question: "Where on the Florida coast do you focus?",
    answer:
      "We are licensed and focus on South Florida and the Treasure Coast: Miami-Dade through Indian River counties on the East Coast. Marketing copy may reference East Coast Florida broadly; our active licenses are in the seven counties listed on this site's service-areas pages.",
  },
  {
    question: "Are you insured?",
    answer:
      "We carry insurance appropriate for steel contracting work. Certificates are issued to general contractors and owners when required during contract negotiation.",
  },
  {
    question: "Can you work with my general contractor?",
    answer:
      "Yes. We regularly subcontract to GCs for steel-only scope, attend coordination meetings, and align erection dates with concrete and MEP trades. Provide the bid date, contract form, and bonding requirements when you invite us.",
  },
];
