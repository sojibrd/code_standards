import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".github",
  "out",
  "app",
  "public",
]);

export type Doc = {
  /** Repo-relative path, forward slashes, e.g. "ember/RULES.md" */
  file: string;
  /** Route segments, e.g. ["ember", "rules"]. Empty for the home doc. */
  slug: string[];
  /** Route path with leading and trailing slash, e.g. "/ember/rules/" */
  route: string;
  /** First `# heading` in the file, falling back to the file name. */
  title: string;
  /** Immediate parent folder, or null for root-level files. */
  section: string | null;
};

export type NavSection = {
  name: string;
  docs: Doc[];
};

function walk(dir: string, acc: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      acc.push(path.relative(ROOT, full).split(path.sep).join("/"));
    }
  }
}

function readTitle(file: string): string {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const line of source.split("\n")) {
    const match = /^#\s+(.+?)\s*$/.exec(line);
    if (match) return match[1];
  }
  return path.basename(file, ".md");
}

function slugFor(file: string): string[] {
  if (file.toLowerCase() === "readme.md") return [];
  return file
    .replace(/\.md$/i, "")
    .split("/")
    .map((part) => part.toLowerCase());
}

let cache: Doc[] | null = null;

export function getDocs(): Doc[] {
  if (cache) return cache;

  const files: string[] = [];
  walk(ROOT, files);

  const docs = files.map<Doc>((file) => {
    const slug = slugFor(file);
    const parts = file.split("/");
    const section = parts.length > 1 ? parts[parts.length - 2] : null;
    return {
      file,
      slug,
      route: slug.length ? `/${slug.join("/")}/` : "/",
      title: readTitle(file),
      section,
    };
  });

  docs.sort((a, b) => a.route.localeCompare(b.route));
  cache = docs;
  return docs;
}

export function getDoc(slug: string[] = []): Doc | undefined {
  const wanted = slug.join("/");
  return getDocs().find((doc) => doc.slug.join("/") === wanted);
}

export function readDoc(doc: Doc): string {
  return fs.readFileSync(path.join(ROOT, doc.file), "utf8");
}

export function getNav(): NavSection[] {
  const docs = getDocs();
  const rootDocs = docs.filter((doc) => doc.section === null);
  const sections = new Map<string, Doc[]>();

  for (const doc of docs) {
    if (!doc.section) continue;
    const bucket = sections.get(doc.section) ?? [];
    bucket.push(doc);
    sections.set(doc.section, bucket);
  }

  return [
    { name: "Overview", docs: rootDocs },
    ...[...sections.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, sectionDocs]) => ({ name, docs: sectionDocs })),
  ].filter((section) => section.docs.length > 0);
}

/**
 * Maps a lower-cased repo-relative markdown path to its site route, so the
 * client-side markdown renderer can turn in-repo cross links into real routes
 * instead of 404s.
 */
export function getLinkMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const doc of getDocs()) {
    map[doc.file.toLowerCase()] = doc.route;
    // Folder links such as `../ember/` should land on that folder's doc.
    if (doc.file.toLowerCase().endsWith("/rules.md")) {
      const dir = doc.file.split("/").slice(0, -1).join("/").toLowerCase();
      map[dir] = doc.route;
    }
  }
  return map;
}
