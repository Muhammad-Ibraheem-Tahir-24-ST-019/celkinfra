import type { Metadata } from "next";
import Workspace from "./workspace";
import JsonLd from "./json-ld";
import { graph, collectionPageJsonLd, toolListJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  // Title and description come from the root layout's defaults.
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* The tool grid is filtered client-side, so the full catalogue is
          published as an ItemList for crawlers and answer engines. */}
      <JsonLd data={graph([collectionPageJsonLd(), toolListJsonLd()])} />
      <Workspace />
    </>
  );
}
