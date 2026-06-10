import Image from "next/image";
import type { ProjectCategory } from "@/lib/data/projects";
import { serviceGalleryImages } from "@/lib/services";

interface ServiceGalleryProps {
  folder: ProjectCategory;
  title: string;
}

export function ServiceGallery({ folder, title }: ServiceGalleryProps) {
  const images = serviceGalleryImages(folder);

  return (
    <section className="border-t border-steel/30 py-12 md:py-16" aria-labelledby="service-gallery-heading">
      <div className="container mx-auto px-4 md:px-6">
        <h2 id="service-gallery-heading" className="text-2xl font-bold text-foreground md:text-3xl">
          Project gallery
        </h2>
        <p className="mt-2 text-foreground-muted">
          Recent {title.toLowerCase()} work across East Coast and South Florida.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, index) => (
            <li key={src}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-steel/30">
                <Image
                  src={src}
                  alt={`${title} project ${index + 1}, McKinados Welding & Fabrication`}
                  width={400}
                  height={300}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
