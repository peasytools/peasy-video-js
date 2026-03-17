import type {
  Category,
  Conversion,
  Format,
  GlossaryTerm,
  Guide,
  ListConversionsOptions,
  ListGuidesOptions,
  ListOptions,
  PaginatedResponse,
  SearchResult,
  Site,
  Tool,
  UseCase,
} from "./api-types.js";

/** PeasyVideo API client. Zero dependencies — uses native fetch. */
export class PeasyVideo {
  private baseUrl: string;

  constructor(baseUrl = "https://peasyvideo.com") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async get<T>(path: string, params?: Record<string, string | number | undefined> | object): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`PeasyVideo API error: HTTP ${res.status} — ${body}`);
    }
    return res.json() as Promise<T>;
  }

  /** List tools (paginated). Filter by category or search query. */
  async listTools(opts?: ListOptions): Promise<PaginatedResponse<Tool>> {
    return this.get("/api/v1/tools/", opts);
  }

  /** Get a single tool by slug. */
  async getTool(slug: string): Promise<Tool> {
    return this.get(`/api/v1/tools/${encodeURIComponent(slug)}/`);
  }

  /** List tool categories (paginated). */
  async listCategories(opts?: Pick<ListOptions, "page" | "limit">): Promise<PaginatedResponse<Category>> {
    return this.get("/api/v1/categories/", opts);
  }

  /** List file formats (paginated). */
  async listFormats(opts?: ListOptions): Promise<PaginatedResponse<Format>> {
    return this.get("/api/v1/formats/", opts);
  }

  /** Get a single format by slug. */
  async getFormat(slug: string): Promise<Format> {
    return this.get(`/api/v1/formats/${encodeURIComponent(slug)}/`);
  }

  /** List format conversions (paginated). */
  async listConversions(opts?: ListConversionsOptions): Promise<PaginatedResponse<Conversion>> {
    return this.get("/api/v1/conversions/", opts);
  }

  /** List glossary terms (paginated). Search with opts.search. */
  async listGlossary(opts?: ListOptions): Promise<PaginatedResponse<GlossaryTerm>> {
    return this.get("/api/v1/glossary/", opts);
  }

  /** Get a single glossary term by slug. */
  async getGlossaryTerm(slug: string): Promise<GlossaryTerm> {
    return this.get(`/api/v1/glossary/${encodeURIComponent(slug)}/`);
  }

  /** List guides (paginated). Filter by category, audience level, or search. */
  async listGuides(opts?: ListGuidesOptions): Promise<PaginatedResponse<Guide>> {
    const params: Record<string, string | number | undefined> = { ...opts };
    if (opts?.audienceLevel) {
      params.audience_level = opts.audienceLevel;
      delete params.audienceLevel;
    }
    return this.get("/api/v1/guides/", params);
  }

  /** Get a single guide by slug. */
  async getGuide(slug: string): Promise<Guide> {
    return this.get(`/api/v1/guides/${encodeURIComponent(slug)}/`);
  }

  /** List industry use cases (paginated). */
  async listUseCases(opts?: ListOptions & { industry?: string }): Promise<PaginatedResponse<UseCase>> {
    return this.get("/api/v1/use-cases/", opts);
  }

  /** Search across tools, formats, and glossary. */
  async search(query: string, limit?: number): Promise<SearchResult> {
    return this.get("/api/v1/search/", { q: query, limit });
  }

  /** List all Peasy sites. */
  async listSites(): Promise<PaginatedResponse<Site>> {
    return this.get("/api/v1/sites/");
  }

  /** Get the OpenAPI 3.0.3 specification. */
  async openapiSpec(): Promise<Record<string, unknown>> {
    return this.get("/api/openapi.json");
  }
}
