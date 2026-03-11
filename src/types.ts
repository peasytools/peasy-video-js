/**
 * peasy-video-js — Type definitions for video processing.
 *
 * @packageDocumentation
 */

/** Supported video container formats. */
export type VideoFormat = "mp4" | "webm" | "mkv" | "avi" | "mov" | "gif";

/** Video file metadata. */
export interface VideoInfo {
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
export interface TrimOptions {
  start?: number;
  end?: number;
  duration?: number;
}

/** Options for video resizing. */
export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "fill";
}

/** Options for video rotation. */
export interface RotateOptions {
  degrees: 90 | 180 | 270;
}

/** Options for thumbnail extraction. */
export interface ThumbnailOptions {
  time?: number;
  width?: number;
  height?: number;
}

/** Options for GIF conversion. */
export interface GifOptions {
  fps?: number;
  width?: number;
  start?: number;
  duration?: number;
}

/** Options for speed adjustment. */
export interface SpeedOptions {
  factor: number;
}

/** Thumbnail result. */
export interface ThumbnailResult {
  path: string;
  time: number;
  width: number;
  height: number;
}
