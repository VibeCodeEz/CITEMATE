import type { CitationFormatter } from "@/lib/citations/types";
import { formatHarvardCitation } from "@/lib/citations/styles/harvard";

// First-pass APSA implementation using author-date output for supported sources.
export const formatApsaCitation: CitationFormatter = (source) =>
  formatHarvardCitation(source);
