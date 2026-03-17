import type { CitationFormatter } from "@/lib/citations/types";
import {
  formatApaAuthors,
  getDisplayYear,
  getPublisher,
  getResolvableLink,
  getTitle,
  joinCitationParts,
} from "@/lib/citations/utils";

export const formatApaCitation: CitationFormatter = (source) => {
  const authors = formatApaAuthors(source.authors);
  const year = getDisplayYear(source);
  const title = getTitle(source);
  const publisher = getPublisher(source);
  const link = getResolvableLink(source);

  return joinCitationParts([
    `${authors} (${year}). ${title}.`,
    publisher ? `${publisher}.` : undefined,
    link,
  ]);
};
