import type { CitationFormatter } from "@/lib/citations/types";
import {
  formatSurnameInitialsAuthors,
  getDisplayYear,
  getPublisher,
  getResolvableLink,
  getTitle,
  joinCitationParts,
} from "@/lib/citations/utils";

export const formatAsaCitation: CitationFormatter = (source) => {
  const authors = formatSurnameInitialsAuthors(source.authors, {
    finalSeparator: ", and ",
  });
  const year = getDisplayYear(source);
  const title = getTitle(source);
  const publisher = getPublisher(source);
  const link = getResolvableLink(source);

  return joinCitationParts([
    `${authors}.`,
    `${year}.`,
    `"${title}."`,
    publisher ? `${publisher}.` : undefined,
    link,
  ]);
};
