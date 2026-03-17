import type {
  SourceMetadata,
  SourceMetadataResult,
} from "@/lib/source-metadata/types";

type FetchLike = typeof fetch;

type CrossrefAuthor = {
  given?: string;
  family?: string;
  name?: string;
};

type CrossrefMessage = {
  DOI?: string;
  URL?: string;
  type?: string;
  title?: string[];
  author?: CrossrefAuthor[];
  publisher?: string;
  abstract?: string;
  "container-title"?: string[];
  "short-container-title"?: string[];
  issued?: { "date-parts"?: number[][] };
  created?: { "date-parts"?: number[][] };
  "published-print"?: { "date-parts"?: number[][] };
  "published-online"?: { "date-parts"?: number[][] };
};

const DOI_PATTERN = /10\.\d{4,9}\/[\-._;()/:A-Z0-9]+/i;
const REQUEST_HEADERS = {
  Accept: "application/json, text/html;q=0.9",
  "User-Agent": "CiteMate/0.1 (metadata lookup)",
};

function normalizeWhitespace(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || null;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    );
}

function stripMarkup(value: string | null | undefined) {
  if (!value) return null;

  return normalizeWhitespace(
    decodeHtmlEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
  );
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeWhitespace(value))
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function parseDateYear(value: string | null | undefined) {
  const match = value?.match(/\b(1\d{3}|2\d{3})\b/);
  return match ? Number(match[1]) : null;
}

function firstDatePart(message?: CrossrefMessage) {
  const candidates = [
    message?.issued?.["date-parts"]?.[0]?.[0],
    message?.["published-print"]?.["date-parts"]?.[0]?.[0],
    message?.["published-online"]?.["date-parts"]?.[0]?.[0],
    message?.created?.["date-parts"]?.[0]?.[0],
  ];

  return candidates.find((value): value is number => typeof value === "number") ?? null;
}

export function normalizeDoi(input?: string | null) {
  if (!input) return null;

  const trimmed = input.trim();

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("doi.org")) {
      const doi = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
      return normalizeDoi(doi);
    }
  } catch {
    // Fall through to text-based DOI extraction.
  }

  const withoutPrefix = trimmed.replace(/^doi:\s*/i, "");
  const match = withoutPrefix.match(DOI_PATTERN);

  if (!match) {
    return null;
  }

  return match[0].replace(/[.,;]+$/, "");
}

function normalizeUrl(input?: string | null) {
  if (!input) return null;

  try {
    return new URL(input.trim()).toString();
  } catch {
    return null;
  }
}

function mapCrossrefType(type?: string): SourceMetadata["sourceType"] {
  switch (type) {
    case "journal-article":
    case "article":
      return "journal_article";
    case "proceedings-article":
      return "conference_paper";
    case "report":
      return "report";
    case "dissertation":
      return "thesis";
    case "book":
    case "book-chapter":
      return "book";
    default:
      return "other";
  }
}

function mapCrossrefAuthor(author: CrossrefAuthor) {
  if (author.name) {
    return normalizeWhitespace(author.name);
  }

  return normalizeWhitespace([author.given, author.family].filter(Boolean).join(" "));
}

async function fetchCrossrefMetadata(doi: string, fetchImpl: FetchLike) {
  const response = await fetchImpl(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
    {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("DOI lookup failed.");
  }

  const payload = (await response.json()) as { message?: CrossrefMessage };
  const message = payload.message;

  if (!message) {
    throw new Error("No DOI metadata returned.");
  }

  return {
    title: normalizeWhitespace(message.title?.[0]),
    authors: unique((message.author ?? []).map(mapCrossrefAuthor)),
    year: firstDatePart(message),
    journalOrPublisher: normalizeWhitespace(
      message["container-title"]?.[0] ??
        message["short-container-title"]?.[0] ??
        message.publisher,
    ),
    publisher: normalizeWhitespace(message.publisher),
    doi: normalizeDoi(message.DOI ?? doi),
    url: normalizeUrl(message.URL) ?? `https://doi.org/${doi}`,
    abstract: stripMarkup(message.abstract),
    sourceType: mapCrossrefType(message.type),
  } satisfies SourceMetadata;
}

function parseAttributes(tag: string) {
  const attributes = new Map<string, string>();

  for (const match of tag.matchAll(
    /([a-zA-Z_:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
  )) {
    const key = match[1]?.toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (key) {
      attributes.set(key, decodeHtmlEntities(value));
    }
  }

  return attributes;
}

function collectMetaMap(html: string) {
  const metaMap = new Map<string, string[]>();

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const attributes = parseAttributes(tag);
    const key =
      attributes.get("name")?.toLowerCase() ??
      attributes.get("property")?.toLowerCase() ??
      attributes.get("http-equiv")?.toLowerCase() ??
      attributes.get("itemprop")?.toLowerCase();
    const content = normalizeWhitespace(attributes.get("content"));

    if (!key || !content) {
      continue;
    }

    const bucket = metaMap.get(key) ?? [];
    bucket.push(content);
    metaMap.set(key, bucket);
  }

  return metaMap;
}

function getMeta(metaMap: Map<string, string[]>, keys: string[]) {
  for (const key of keys) {
    const value = metaMap.get(key)?.[0];

    if (value) {
      return value;
    }
  }

  return null;
}

function getMetaList(metaMap: Map<string, string[]>, keys: string[]) {
  const values: string[] = [];

  keys.forEach((key) => {
    values.push(...(metaMap.get(key) ?? []));
  });

  return unique(values);
}

export function extractMetadataFromHtml(html: string, sourceUrl: string) {
  const metaMap = collectMetaMap(html);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonicalMatch = html.match(
    /<link\b[^>]*rel=(?:"canonical"|'canonical')[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>/i,
  );

  const doi =
    normalizeDoi(
      getMeta(metaMap, [
        "citation_doi",
        "dc.identifier",
        "doi",
        "bepress_citation_doi",
      ]),
    ) ?? normalizeDoi(html);

  return {
    title:
      getMeta(metaMap, [
        "citation_title",
        "dc.title",
        "parsely-title",
        "og:title",
        "twitter:title",
      ]) ?? stripMarkup(titleMatch?.[1]),
    authors: getMetaList(metaMap, [
      "citation_author",
      "dc.creator",
      "author",
      "article:author",
      "parsely-author",
    ]),
    year: parseDateYear(
      getMeta(metaMap, [
        "citation_publication_date",
        "citation_date",
        "dc.date",
        "article:published_time",
        "parsely-pub-date",
        "pubdate",
      ]),
    ),
    journalOrPublisher: getMeta(metaMap, [
      "citation_journal_title",
      "citation_conference_title",
      "og:site_name",
      "application-name",
      "dc.publisher",
      "publisher",
    ]),
    publisher: getMeta(metaMap, [
      "citation_publisher",
      "dc.publisher",
      "publisher",
    ]),
    doi,
    url:
      normalizeUrl(canonicalMatch?.[1] ?? canonicalMatch?.[2]) ??
      normalizeUrl(getMeta(metaMap, ["og:url"])) ??
      normalizeUrl(sourceUrl),
    abstract: getMeta(metaMap, [
      "citation_abstract",
      "description",
      "og:description",
      "twitter:description",
      "dc.description",
    ]),
    sourceType: doi ? "journal_article" : "website",
  } satisfies SourceMetadata;
}

function mergeMetadata(primary: SourceMetadata, secondary: SourceMetadata) {
  return {
    title: primary.title ?? secondary.title,
    authors: primary.authors.length > 0 ? primary.authors : secondary.authors,
    year: primary.year ?? secondary.year,
    journalOrPublisher: primary.journalOrPublisher ?? secondary.journalOrPublisher,
    publisher: primary.publisher ?? secondary.publisher,
    doi: primary.doi ?? secondary.doi,
    url: primary.url ?? secondary.url,
    abstract: primary.abstract ?? secondary.abstract,
    sourceType: primary.sourceType ?? secondary.sourceType,
  } satisfies SourceMetadata;
}

async function fetchUrlMetadata(url: string, fetchImpl: FetchLike) {
  const response = await fetchImpl(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("URL lookup failed.");
  }

  const html = await response.text();

  return extractMetadataFromHtml(html.slice(0, 250_000), url);
}

function hasMeaningfulMetadata(metadata: SourceMetadata) {
  return Boolean(
    metadata.title ||
      metadata.authors.length > 0 ||
      metadata.year ||
      metadata.journalOrPublisher ||
      metadata.publisher ||
      metadata.abstract,
  );
}

export async function fetchSourceMetadata(
  input: { doi?: string | null; url?: string | null },
  fetchImpl: FetchLike = fetch,
): Promise<SourceMetadataResult> {
  const normalizedInputDoi = normalizeDoi(input.doi);
  const normalizedInputUrl = normalizeUrl(input.url);
  const doiFromUrl = normalizeDoi(normalizedInputUrl);
  const preferredDoi = normalizedInputDoi ?? doiFromUrl;

  if (preferredDoi) {
    try {
      const crossrefMetadata = await fetchCrossrefMetadata(preferredDoi, fetchImpl);

      if (hasMeaningfulMetadata(crossrefMetadata)) {
        return {
          success: true,
          metadata: crossrefMetadata,
          lookupType: "doi",
          resolvedFrom: preferredDoi,
        };
      }
    } catch {
      if (!normalizedInputUrl) {
        return {
          success: false,
          message: "We couldn't fetch metadata for that DOI.",
        };
      }
    }
  }

  if (!normalizedInputUrl) {
    return {
      success: false,
      message: "Enter a DOI or URL to fetch metadata.",
    };
  }

  try {
    const urlMetadata = await fetchUrlMetadata(normalizedInputUrl, fetchImpl);

    if (urlMetadata.doi) {
      try {
        const crossrefMetadata = await fetchCrossrefMetadata(urlMetadata.doi, fetchImpl);

        return {
          success: true,
          metadata: mergeMetadata(crossrefMetadata, urlMetadata),
          lookupType: "url",
          resolvedFrom: normalizedInputUrl,
        };
      } catch {
        // Keep parsed HTML metadata if DOI enrichment fails.
      }
    }

    if (!hasMeaningfulMetadata(urlMetadata)) {
      return {
        success: false,
        message: "We couldn't find usable metadata at that URL.",
      };
    }

    return {
      success: true,
      metadata: urlMetadata,
      lookupType: "url",
      resolvedFrom: normalizedInputUrl,
    };
  } catch {
    return {
      success: false,
      message: "We couldn't fetch metadata from that URL.",
    };
  }
}
