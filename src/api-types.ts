/** Options for paginated list requests. */
export interface ListOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

/** Options for list_guides with audience_level. */
export interface ListGuidesOptions extends ListOptions {
  audienceLevel?: string;
}

/** Options for list_conversions with source/target. */
export interface ListConversionsOptions extends Omit<ListOptions, "category" | "search"> {
  source?: string;
  target?: string;
}

/** DRF paginated response. */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** A Peasy tool. */
export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
  url: string;
}

/** A tool category. */
export interface Category {
  slug: string;
  name: string;
  description: string;
  tool_count: number;
}

/** A file format. */
export interface Format {
  slug: string;
  name: string;
  extension: string;
  mime_type: string;
  category: string;
  description: string;
}

/** A format conversion. */
export interface Conversion {
  source: string;
  target: string;
  description: string;
  tool_slug: string;
}

/** A glossary term. */
export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  category: string;
}

/** A how-to guide. */
export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  audience_level: string;
  word_count: number;
}

/** An industry use case. */
export interface UseCase {
  slug: string;
  title: string;
  industry: string;
}

/** A Peasy site. */
export interface Site {
  name: string;
  domain: string;
  url: string;
}

/** Cross-model search result. */
export interface SearchResult {
  query: string;
  results: {
    tools: Tool[];
    formats: Format[];
    glossary: GlossaryTerm[];
  };
}
