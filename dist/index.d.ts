/**
 * peasy-video-js — Type definitions for video processing.
 *
 * @packageDocumentation
 */
/** Supported video container formats. */
type VideoFormat = "mp4" | "webm" | "mkv" | "avi" | "mov" | "gif";
/** Video file metadata. */
interface VideoInfo {
    duration: number;
    width: number;
    height: number;
    fps: number;
    codec: string;
    format: string;
    bitrate: number;
    size: number;
    hasAudio: boolean;
}
/** Options for video trimming. */
interface TrimOptions {
    start?: number;
    end?: number;
    duration?: number;
}
/** Options for video resizing. */
interface ResizeOptions {
    width?: number;
    height?: number;
    fit?: "contain" | "cover" | "fill";
}
/** Options for video rotation. */
interface RotateOptions {
    degrees: 90 | 180 | 270;
}
/** Options for thumbnail extraction. */
interface ThumbnailOptions {
    time?: number;
    width?: number;
    height?: number;
}
/** Options for GIF conversion. */
interface GifOptions {
    fps?: number;
    width?: number;
    start?: number;
    duration?: number;
}
/** Options for speed adjustment. */
interface SpeedOptions {
    factor: number;
}
/** Thumbnail result. */
interface ThumbnailResult {
    path: string;
    time: number;
    width: number;
    height: number;
}

/**
 * peasy-video-js — Video processing engine powered by FFmpeg.
 *
 * 13 functions: info, trim, resize, rotate, concatenate, extractAudio,
 * stripAudio, thumbnail, thumbnails, videoToGif, gifToVideo, reverseVideo, speed.
 * All output functions return the path to the generated file.
 *
 * @packageDocumentation
 */

/**
 * Get metadata for a video file using ffprobe.
 *
 * @param input - Path to the video file
 * @returns Video metadata including duration, dimensions, fps, codec, and more
 *
 * @example
 * ```typescript
 * const metadata = await info("sample.mp4");
 * console.log(metadata.duration); // 120.5
 * console.log(metadata.width);    // 1920
 * console.log(metadata.height);   // 1080
 * ```
 */
declare function info(input: string): Promise<VideoInfo>;
/**
 * Trim a video to a specific time range.
 *
 * @param input - Path to the input video
 * @param options - Trim options: start, end, and/or duration in seconds
 * @returns Path to the trimmed output file
 *
 * @example
 * ```typescript
 * // Trim from 10s to 30s
 * const trimmed = await trim("input.mp4", { start: 10, end: 30 });
 *
 * // Trim first 5 seconds
 * const first5 = await trim("input.mp4", { duration: 5 });
 * ```
 */
declare function trim(input: string, options: TrimOptions): Promise<string>;
/**
 * Resize a video to the specified dimensions.
 *
 * @param input - Path to the input video
 * @param options - Resize options: width, height, and fit mode
 * @returns Path to the resized output file
 *
 * @example
 * ```typescript
 * // Resize to 1280x720
 * const resized = await resize("input.mp4", { width: 1280, height: 720 });
 *
 * // Scale width to 640, maintain aspect ratio
 * const scaled = await resize("input.mp4", { width: 640 });
 * ```
 */
declare function resize(input: string, options: ResizeOptions): Promise<string>;
/**
 * Rotate a video by 90, 180, or 270 degrees.
 *
 * @param input - Path to the input video
 * @param options - Rotation options: degrees (90, 180, or 270)
 * @returns Path to the rotated output file
 *
 * @example
 * ```typescript
 * const rotated = await rotate("input.mp4", { degrees: 90 });
 * ```
 */
declare function rotate(input: string, options: RotateOptions): Promise<string>;
/**
 * Concatenate multiple video files into one.
 *
 * @param inputs - Array of paths to video files (in order)
 * @returns Path to the concatenated output file
 *
 * @example
 * ```typescript
 * const joined = await concatenate(["part1.mp4", "part2.mp4", "part3.mp4"]);
 * ```
 */
declare function concatenate(inputs: string[]): Promise<string>;
/**
 * Extract the audio track from a video file.
 *
 * @param input - Path to the input video
 * @param format - Audio output format (default: "mp3")
 * @returns Path to the extracted audio file
 *
 * @example
 * ```typescript
 * const audio = await extractAudio("video.mp4");          // MP3
 * const wav = await extractAudio("video.mp4", "wav");     // WAV
 * ```
 */
declare function extractAudio(input: string, format?: string): Promise<string>;
/**
 * Remove the audio track from a video, producing a silent video.
 *
 * @param input - Path to the input video
 * @returns Path to the silent output video
 *
 * @example
 * ```typescript
 * const silent = await stripAudio("video-with-music.mp4");
 * ```
 */
declare function stripAudio(input: string): Promise<string>;
/**
 * Extract a single thumbnail frame from a video.
 *
 * @param input - Path to the input video
 * @param options - Thumbnail options: time (seconds), width, height
 * @returns Path to the generated thumbnail image (PNG)
 *
 * @example
 * ```typescript
 * // Thumbnail at 5 seconds
 * const thumb = await thumbnail("video.mp4", { time: 5 });
 *
 * // Thumbnail at start with custom size
 * const small = await thumbnail("video.mp4", { width: 320, height: 180 });
 * ```
 */
declare function thumbnail(input: string, options?: ThumbnailOptions): Promise<string>;
/**
 * Extract multiple evenly-spaced thumbnails from a video.
 *
 * @param input - Path to the input video
 * @param count - Number of thumbnails to extract
 * @param options - Optional width and height for the thumbnails
 * @returns Array of paths to the generated thumbnail images (PNG)
 *
 * @example
 * ```typescript
 * // Extract 5 thumbnails spread across the video
 * const thumbs = await thumbnails("video.mp4", 5);
 * ```
 */
declare function thumbnails(input: string, count: number, options?: Pick<ThumbnailOptions, "width" | "height">): Promise<string[]>;
/**
 * Convert a video to an animated GIF.
 *
 * Uses a two-pass palette generation for high-quality GIF output.
 *
 * @param input - Path to the input video
 * @param options - GIF options: fps, width, start time, duration
 * @returns Path to the generated GIF file
 *
 * @example
 * ```typescript
 * // Convert full video to GIF at 10fps
 * const gif = await videoToGif("input.mp4", { fps: 10, width: 480 });
 *
 * // Convert a 3-second segment starting at 5s
 * const clip = await videoToGif("input.mp4", { start: 5, duration: 3 });
 * ```
 */
declare function videoToGif(input: string, options?: GifOptions): Promise<string>;
/**
 * Convert a GIF to a video (MP4).
 *
 * @param input - Path to the input GIF file
 * @returns Path to the generated MP4 video file
 *
 * @example
 * ```typescript
 * const video = await gifToVideo("animation.gif");
 * ```
 */
declare function gifToVideo(input: string): Promise<string>;
/**
 * Reverse a video so it plays backwards.
 *
 * @param input - Path to the input video
 * @returns Path to the reversed output video
 *
 * @example
 * ```typescript
 * const reversed = await reverseVideo("input.mp4");
 * ```
 */
declare function reverseVideo(input: string): Promise<string>;
/**
 * Change the playback speed of a video.
 *
 * @param input - Path to the input video
 * @param options - Speed options: factor (>1 = faster, <1 = slower)
 * @returns Path to the speed-adjusted output video
 *
 * @example
 * ```typescript
 * // 2x speed
 * const fast = await speed("input.mp4", { factor: 2 });
 *
 * // Half speed (slow motion)
 * const slow = await speed("input.mp4", { factor: 0.5 });
 * ```
 */
declare function speed(input: string, options: SpeedOptions): Promise<string>;

/** Options for paginated list requests. */
interface ListOptions {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}
/** Options for list_guides with audience_level. */
interface ListGuidesOptions extends ListOptions {
    audienceLevel?: string;
}
/** Options for list_conversions with source/target. */
interface ListConversionsOptions extends Omit<ListOptions, "category" | "search"> {
    source?: string;
    target?: string;
}
/** DRF paginated response. */
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
/** A Peasy tool. */
interface Tool {
    slug: string;
    name: string;
    description: string;
    category: string;
    url: string;
}
/** A tool category. */
interface Category {
    slug: string;
    name: string;
    description: string;
    tool_count: number;
}
/** A file format. */
interface Format {
    slug: string;
    name: string;
    extension: string;
    mime_type: string;
    category: string;
    description: string;
}
/** A format conversion. */
interface Conversion {
    source: string;
    target: string;
    description: string;
    tool_slug: string;
}
/** A glossary term. */
interface GlossaryTerm {
    slug: string;
    term: string;
    definition: string;
    category: string;
}
/** A how-to guide. */
interface Guide {
    slug: string;
    title: string;
    description: string;
    category: string;
    audience_level: string;
    word_count: number;
}
/** An industry use case. */
interface UseCase {
    slug: string;
    title: string;
    industry: string;
}
/** A Peasy site. */
interface Site {
    name: string;
    domain: string;
    url: string;
}
/** Cross-model search result. */
interface SearchResult {
    query: string;
    results: {
        tools: Tool[];
        formats: Format[];
        glossary: GlossaryTerm[];
    };
}

/** PeasyVideo API client. Zero dependencies — uses native fetch. */
declare class PeasyVideo {
    private baseUrl;
    constructor(baseUrl?: string);
    private get;
    /** List tools (paginated). Filter by category or search query. */
    listTools(opts?: ListOptions): Promise<PaginatedResponse<Tool>>;
    /** Get a single tool by slug. */
    getTool(slug: string): Promise<Tool>;
    /** List tool categories (paginated). */
    listCategories(opts?: Pick<ListOptions, "page" | "limit">): Promise<PaginatedResponse<Category>>;
    /** List file formats (paginated). */
    listFormats(opts?: ListOptions): Promise<PaginatedResponse<Format>>;
    /** Get a single format by slug. */
    getFormat(slug: string): Promise<Format>;
    /** List format conversions (paginated). */
    listConversions(opts?: ListConversionsOptions): Promise<PaginatedResponse<Conversion>>;
    /** List glossary terms (paginated). Search with opts.search. */
    listGlossary(opts?: ListOptions): Promise<PaginatedResponse<GlossaryTerm>>;
    /** Get a single glossary term by slug. */
    getGlossaryTerm(slug: string): Promise<GlossaryTerm>;
    /** List guides (paginated). Filter by category, audience level, or search. */
    listGuides(opts?: ListGuidesOptions): Promise<PaginatedResponse<Guide>>;
    /** Get a single guide by slug. */
    getGuide(slug: string): Promise<Guide>;
    /** List industry use cases (paginated). */
    listUseCases(opts?: ListOptions & {
        industry?: string;
    }): Promise<PaginatedResponse<UseCase>>;
    /** Search across tools, formats, and glossary. */
    search(query: string, limit?: number): Promise<SearchResult>;
    /** List all Peasy sites. */
    listSites(): Promise<PaginatedResponse<Site>>;
    /** Get the OpenAPI 3.0.3 specification. */
    openapiSpec(): Promise<Record<string, unknown>>;
}

export { type Category, type Conversion, type Format, type GifOptions, type GlossaryTerm, type Guide, type ListConversionsOptions, type ListGuidesOptions, type ListOptions, type PaginatedResponse, PeasyVideo, type ResizeOptions, type RotateOptions, type SearchResult, type Site, type SpeedOptions, type ThumbnailOptions, type ThumbnailResult, type Tool, type TrimOptions, type UseCase, type VideoFormat, type VideoInfo, concatenate, extractAudio, gifToVideo, info, resize, reverseVideo, rotate, speed, stripAudio, thumbnail, thumbnails, trim, videoToGif };
