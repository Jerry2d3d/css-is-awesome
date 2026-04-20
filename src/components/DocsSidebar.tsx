import type { ReactNode } from "react";

export type DocsSidebarSection = {
  title: ReactNode;
  items: { label: ReactNode; href: string; active?: boolean }[];
};

export type DocsSidebarProps = {
  sections: DocsSidebarSection[];
  label?: string;
};

export default function DocsSidebar({ sections, label = "Docs navigation" }: DocsSidebarProps) {
  return (
    <aside className="docs-sidebar" aria-label={label}>
      {sections.map((section, i) => (
        <div key={i}>
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={item.active ? "is-active" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
