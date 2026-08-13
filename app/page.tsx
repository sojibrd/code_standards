import { notFound } from "next/navigation";
import DocPage from "./components/DocPage";
import { getDoc, getLinkMap, readDoc } from "./lib/content";

export default function Home() {
  const doc = getDoc([]);
  if (!doc) notFound();

  return (
    <DocPage
      title={doc.title}
      file={doc.file}
      source={readDoc(doc)}
      linkMap={getLinkMap()}
    />
  );
}
