"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  source: string;
  /** Repo-relative path of the file being rendered, e.g. "ember/RULES.md". */
  file: string;
  /** Lower-cased repo-relative markdown path -> site route. */
  linkMap: Record<string, string>;
};

const EXTERNAL = /^(https?:|mailto:|tel:)/i;

/** Resolves a link relative to the current file, without touching `fs`. */
function resolve(from: string, href: string): string {
  const base = from.split("/").slice(0, -1);
  const segments = href.replace(/^\.\//, "").split("/");
  const out = [...base];

  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") out.pop();
    else out.push(segment);
  }

  return out.join("/").toLowerCase();
}

function toRoute(
  href: string | undefined,
  file: string,
  linkMap: Record<string, string>,
): string | null {
  if (!href || EXTERNAL.test(href) || href.startsWith("#")) return null;

  const [target, hash = ""] = href.split("#");
  if (!target) return null;

  const key = target.startsWith("/")
    ? target.slice(1).toLowerCase()
    : resolve(file, target);

  const route = linkMap[key] ?? linkMap[key.replace(/\/$/, "")];
  return route ? `${route}${hash ? `#${hash}` : ""}` : null;
}

export default function Markdown({ source, file, linkMap }: Props) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...rest }) {
            const route = toRoute(href, file, linkMap);
            if (route) {
              return (
                <Link href={route} {...rest}>
                  {children}
                </Link>
              );
            }
            if (href && EXTERNAL.test(href)) {
              return (
                <a href={href} target="_blank" rel="noreferrer" {...rest}>
                  {children}
                </a>
              );
            }
            return (
              <a href={href} {...rest}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
