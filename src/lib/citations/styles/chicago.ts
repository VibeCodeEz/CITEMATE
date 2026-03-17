import type { CitationFormatter } from "@/lib/citations/types";
import {
  formatReadableAuthors,
  getDisplayYear,
  getPublisher,
  getResolvableLink,
  getTitle,
  joinCitationParts,
} from "@/lib/citations/utils";

export const formatChicagoCitation: CitationFormatter = (source) => {
  const authors = formatReadableAuthors(source.authors);
  const year = getDisplayYear(source);
  const title = getTitle(source);
  const publisher = getPublisher(source);
  const link = getResolvableLink(source);
  const yearSegment = year === "n.d." ? year : `${year}.`;

  return joinCitationParts([
    `${authors}.`,
    `"${title}."`,
    publisher ? `${publisher},` : undefined,
    yearSegment,
    link,
  ]);
};
