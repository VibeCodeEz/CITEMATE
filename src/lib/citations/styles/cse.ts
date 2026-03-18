import type { CitationFormatter } from "@/lib/citations/types";
import { formatNumericStyleCitation } from "@/lib/citations/utils";

export const formatCseCitation: CitationFormatter = (source) =>
  formatNumericStyleCitation({
    source,
    prefix: "1.",
    titleQuotes: false,
  });
