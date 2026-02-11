import type { Metadata } from "next";
import { ProjectsGrid } from "./ProjectsGrid";

export const metadata: Metadata = {
  title: "Projects | Steel Fabrication Gallery | McKinados Welding & Fabrication",
  description:
    "Gallery of structural steel and ornamental steel projects. East Coast Florida. Commercial, industrial, and custom fabrication.",
  openGraph: {
    title: "Projects | McKinados Welding & Fabrication",
    description: "Gallery of structural and ornamental steel projects. East Coast Florida.",
    url: "https://mwfab.co/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | McKinados Welding & Fabrication",
    description: "Gallery of structural and ornamental steel projects.",
  },
};

export default function ProjectsPage() {
  return (
    <div className="bg-charcoal">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Projects
        </h1>
        <p className="mt-4 text-lg text-foreground-muted">
          A selection of our structural steel and ornamental steel work across East Coast Florida.
        </p>
        <ProjectsGrid />
      </div>
    </div>
  );
}
