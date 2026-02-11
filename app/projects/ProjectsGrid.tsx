"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type ProjectCategory,
} from "@/lib/data/projects";
import { cn } from "@/lib/utils";

export function ProjectsGrid() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");

  const filtered =
    filter === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === filter);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            filter === "all"
              ? "border-steel-blue bg-steel-blue/20 text-foreground"
              : "border-steel/50 text-foreground-muted hover:border-steel hover:text-foreground"
          )}
        >
          All
        </button>
        {PROJECT_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === value
                ? "border-steel-blue bg-steel-blue/20 text-foreground"
                : "border-steel/50 text-foreground-muted hover:border-steel hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
        {filtered.map((project) => (
          <article
            key={project.id}
            className="overflow-hidden rounded-lg border border-steel/30 bg-gunmetal/30 transition-colors hover:border-steel/50"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gunmetal">
              <Image
                src={project.imageUrl}
                alt=""
                width={project.imageWidth}
                height={project.imageHeight}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-foreground">{project.title}</h2>
              <p className="mt-1 text-sm text-foreground-muted capitalize">
                {project.category}
              </p>
              <p className="mt-2 text-sm text-foreground-muted">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
