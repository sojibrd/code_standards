import Markdown from "./Markdown";

type Props = {
  title: string;
  file: string;
  source: string;
  linkMap: Record<string, string>;
};

export default function DocPage({ title, file, source, linkMap }: Props) {
  return (
    <article>
      <p className="mb-6 font-mono text-xs text-slate-500 dark:text-slate-400">
        {file}
      </p>
      <h1 className="sr-only">{title}</h1>
      <Markdown source={source} file={file} linkMap={linkMap} />
    </article>
  );
}
