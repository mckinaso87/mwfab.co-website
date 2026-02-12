/**
 * Project gallery data. Images live in public/images/projects/<category>/image1.jpeg, image2.jpeg, etc.
 * Replace with Supabase/API in future.
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

const placeholderImage = "/images/project-placeholder.svg";

function project(
  id: string,
  category: ProjectCategory,
  imageUrl: string,
  title: string,
  description: string
): Project {
  return {
    id,
    title,
    category,
    description,
    imageUrl,
    imageWidth: 400,
    imageHeight: 300,
  };
}

export const PROJECTS: Project[] = [
  // Structural (7 images)
  project("s1", "structural", "/images/projects/structural/image1.jpeg", "Structural Steel 1", "Commercial structural steel."),
  project("s2", "structural", "/images/projects/structural/image2.jpeg", "Structural Steel 2", "Structural steel fabrication."),
  project("s3", "structural", "/images/projects/structural/image3.jpeg", "Structural Steel 3", "Building frame and beams."),
  project("s4", "structural", "/images/projects/structural/image4.jpeg", "Structural Steel 4", "Load-bearing steel."),
  project("s5", "structural", "/images/projects/structural/image5.jpeg", "Structural Steel 5", "Structural steel construction."),
  project("s6", "structural", "/images/projects/structural/image6.jpeg", "Structural Steel 6", "Steel frame installation."),
  project("s7", "structural", "/images/projects/structural/image7.jpeg", "Structural Steel 7", "Commercial structural work."),
  // Ornamental (7 images)
  project("o1", "ornamental", "/images/projects/ornamental/image1.jpeg", "Ornamental Steel 1", "Custom railing and gates."),
  project("o2", "ornamental", "/images/projects/ornamental/image2.jpeg", "Ornamental Steel 2", "Architectural metalwork."),
  project("o3", "ornamental", "/images/projects/ornamental/image3.jpeg", "Ornamental Steel 3", "Decorative steel elements."),
  project("o4", "ornamental", "/images/projects/ornamental/image4.jpeg", "Ornamental Steel 4", "Custom ornamental fabrication."),
  project("o5", "ornamental", "/images/projects/ornamental/image5.jpeg", "Ornamental Steel 5", "Railings and ornamental work."),
  project("o6", "ornamental", "/images/projects/ornamental/image6.jpeg", "Ornamental Steel 6", "Ornamental steel project."),
  project("o7", "ornamental", "/images/projects/ornamental/image7.jpeg", "Ornamental Steel 7", "Custom ornamental steel."),
  // Miscellaneous (no images in folder yet)
  project("m1", "miscellaneous", placeholderImage, "Industrial Miscellaneous Metals", "Stairs, platforms, and metalwork."),
  project("m2", "miscellaneous", placeholderImage, "Steel Fabrication", "Custom fabrication and finishes."),
  // Finishes (4 images)
  project("f1", "finishes", "/images/projects/finishes/image1.jpeg", "Finishes 1", "Powder coat and protective finishes."),
  project("f2", "finishes", "/images/projects/finishes/image2.jpeg", "Finishes 2", "Galvanizing and coatings."),
  project("f3", "finishes", "/images/projects/finishes/image3.jpeg", "Finishes 3", "Steel finish application."),
  project("f4", "finishes", "/images/projects/finishes/image4.jpeg", "Finishes 4", "Protective finishes."),
];

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "structural", label: "Structural" },
  { value: "ornamental", label: "Ornamental" },
  { value: "miscellaneous", label: "Miscellaneous" },
  { value: "finishes", label: "Finishes" },
];
