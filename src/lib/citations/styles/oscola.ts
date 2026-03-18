import type { CitationFormatter } from "@/lib/citations/types";
import {
  formatReadableAuthors,
  getDisplayYear,
  getPublisher,
  getResolvableLink,
  getTitle,
  joinCitationParts,
} from "@/lib/citations/utils";

// First-pass OSCOLA formatter for non-legal source types supported by CiteMate.
export const formatOscolaCitation: CitationFormatter = (source) => {
  const authors = formatReadableAuthors(source.authors);
  const title = getTitle(source);
  const publisher = getPublisher(source);
  const year = getDisplayYear(source);
  const link = getResolvableLink(source);

  return joinCitationParts([
    `${authors},`,
    `'${title}'`,
    publisher ? `(${publisher} ${year})` : `(${year})`,
    link,
  ]);
};
