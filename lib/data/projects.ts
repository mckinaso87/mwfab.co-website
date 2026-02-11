/**
 * Placeholder project data for Phase 1. Replace with Supabase/API in future.
 */

export type ProjectCategory = "structural" | "ornamental" | "miscellaneous" | "finishes";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Commercial Structural Steel",
    category: "structural",
    description: "Multi-story commercial building frame.",
    imageUrl: "/images/project-placeholder.svg",
    imageWidth: 400,
    imageHeight: 300,
  },
  {
    id: "2",
    title: "Ornamental Railing",
    category: "ornamental",
    description: "Custom steel railing and gates.",
    imageUrl: "/images/project-placeholder.svg",
    imageWidth: 400,
    imageHeight: 300,
  },
  {
    id: "3",
    title: "Industrial Miscellaneous Metals",
    category: "miscellaneous",
    description: "Stairs, platforms, and metalwork.",
    imageUrl: "/images/project-placeholder.svg",
    imageWidth: 400,
    imageHeight: 300,
  },
  {
    id: "4",
    title: "Structural Frame",
    category: "structural",
    description: "Warehouse structural steel.",
    imageUrl: "/images/project-placeholder.svg",
    imageWidth: 400,
    imageHeight: 300,
  },
  {
    id: "5",
    title: "Decorative Steel",
    category: "ornamental",
    description: "Powder-coated ornamental elements.",
    imageUrl: "/images/project-placeholder.svg",
    imageWidth: 400,
    imageHeight: 300,
  },
  {
    id: "6",
    title: "Steel Fabrication",
    category: "miscellaneous",
    description: "Custom fabrication and finishes.",
    imageUrl: "/images/project-placeholder.svg",
    imageWidth: 400,
    imageHeight: 300,
  },
];

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "structural", label: "Structural" },
  { value: "ornamental", label: "Ornamental" },
  { value: "miscellaneous", label: "Miscellaneous" },
  { value: "finishes", label: "Finishes" },
];
