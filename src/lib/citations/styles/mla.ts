import type { CitationFormatter } from "@/lib/citations/types";
import {
  formatReadableAuthors,
  getDisplayYear,
  getPublisher,
  getResolvableLink,
  getTitle,
  joinCitationParts,
} from "@/lib/citations/utils";

export const formatMlaCitation: CitationFormatter = (source) => {
  const authors = formatReadableAuthors(source.authors);
  const year = getDisplayYear(source);
  const title = getTitle(source);
  const publisher = getPublisher(source);
  const link = getResolvableLink(source);

  return joinCitationParts([
    `${authors}.`,
    `"${title}."`,
    publisher ? `${publisher},` : undefined,
    year !== "n.d." ? `${year}.` : undefined,
    link,
  ]);
};
