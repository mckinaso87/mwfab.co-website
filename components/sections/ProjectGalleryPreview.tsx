import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 6;

export function ProjectGalleryPreview({ className }: { className?: string }) {
  const preview = PROJECTS.slice(0, PREVIEW_COUNT);

  return (
    <section className={cn("bg-charcoal py-16 md:py-20", className)} aria-labelledby="projects-heading">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="projects-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Project Gallery
        </h2>
        <p className="mt-2 text-foreground-muted">
          A selection of our structural steel and ornamental steel work across Florida.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((project) => (
            <Link
              key={project.id}
              href="/projects"
              className="group overflow-hidden rounded-lg border border-steel/30 transition-colors hover:border-steel-blue/50"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gunmetal">
                <Image
                  src={project.imageUrl}
                  alt=""
                  width={project.imageWidth}
                  height={project.imageHeight}
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{project.title}</h3>
                <p className="mt-1 text-sm text-foreground-muted">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-8">
          <Link
            href="/projects"
            className="font-medium text-steel-blue transition-colors hover:text-foreground"
          >
            View full gallery
          </Link>
        </p>
      </div>
    </section>
  );
}
