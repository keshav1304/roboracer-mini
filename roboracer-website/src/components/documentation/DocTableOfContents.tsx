import type { DocHeading } from "@/lib/docs";

interface DocTableOfContentsProps {
  headings: DocHeading[];
}

export default function DocTableOfContents({ headings }: DocTableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-12 p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10"
    >
      <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">On this page</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="text-brand-blue hover:text-brand-blue-hover text-sm leading-snug transition-colors"
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
