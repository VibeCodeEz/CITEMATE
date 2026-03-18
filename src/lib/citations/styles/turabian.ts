import type { CitationFormatter } from "@/lib/citations/types";
import { formatChicagoCitation } from "@/lib/citations/styles/chicago";

// First-pass implementation aligned with Chicago-style bibliography output
// for the source types currently supported in CiteMate.
export const formatTurabianCitation: CitationFormatter = (source) =>
  formatChicagoCitation(source);
