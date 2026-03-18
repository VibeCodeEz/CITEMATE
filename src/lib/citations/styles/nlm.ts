import type { CitationFormatter } from "@/lib/citations/types";
import { formatNumericStyleCitation } from "@/lib/citations/utils";

export const formatNlmCitation: CitationFormatter = (source) =>
  formatNumericStyleCitation({
    source,
    prefix: "1.",
    titleQuotes: false,
    yearBeforePublisher: true,
  });
