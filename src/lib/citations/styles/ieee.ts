import type { CitationFormatter } from "@/lib/citations/types";
import { formatNumericStyleCitation } from "@/lib/citations/utils";

export const formatIeeeCitation: CitationFormatter = (source) =>
  formatNumericStyleCitation({
    source,
    prefix: "[1]",
    titleQuotes: true,
    yearBeforePublisher: false,
  });
