"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { route: string; title: string };
type Section = { name: string; docs: Item[] };

export default function Sidebar({ sections }: { sections: Section[] }) {
  const pathname = usePathname();
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <nav className="text-sm">
      {sections.map((section) => (
        <div key={section.name} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {section.name}
          </p>
          <ul className="space-y-1">
            {section.docs.map((doc) => {
              const active = current === doc.route;
              return (
                <li key={doc.route}>
                  <Link
                    href={doc.route}
                    className={
                      active
                        ? "block rounded px-2 py-1 bg-slate-200 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                        : "block rounded px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                    }
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
