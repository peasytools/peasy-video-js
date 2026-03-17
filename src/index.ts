/**
 * peasy-video-js — Video processing library for Node.js.
 *
 * 13 functions: info, trim, resize, rotate, concatenate, extractAudio,
 * stripAudio, thumbnail, thumbnails, videoToGif, gifToVideo, reverseVideo, speed.
 * FFmpeg-powered, TypeScript-first.
 *
 * @packageDocumentation
 */

export type {
  VideoFormat,
  VideoInfo,
  TrimOptions,
  ResizeOptions,
  RotateOptions,
  ThumbnailOptions,
  GifOptions,
  SpeedOptions,
  ThumbnailResult,
} from "./types.js";

export {
  info,
  trim,
  resize,
  rotate,
  concatenate,
  extractAudio,
  stripAudio,
  thumbnail,
  thumbnails,
  videoToGif,
  gifToVideo,
  reverseVideo,
  speed,
} from "./engine.js";

// API Client
export { PeasyVideo } from "./client.js";
export type {
  ListOptions,
  ListGuidesOptions,
  ListConversionsOptions,
  PaginatedResponse,
  Tool,
  Category,
  Format,
  Conversion,
  GlossaryTerm,
  Guide,
  UseCase,
  Site,
  SearchResult,
} from "./api-types.js";
