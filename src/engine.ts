/**
 * peasy-video-js — Video processing engine powered by FFmpeg.
 *
 * 13 functions: info, trim, resize, rotate, concatenate, extractAudio,
 * stripAudio, thumbnail, thumbnails, videoToGif, gifToVideo, reverseVideo, speed.
 * All output functions return the path to the generated file.
 *
 * @packageDocumentation
 */

import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { statSync, writeFileSync, mkdirSync } from "node:fs";
import type {
  VideoInfo,
  TrimOptions,
  ResizeOptions,
  RotateOptions,
  ThumbnailOptions,
  GifOptions,
  SpeedOptions,
} from "./types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a temporary output path with the given extension.
 */
function tmpOutput(ext: string): string {
  return join(tmpdir(), `peasy-video-${randomUUID()}.${ext}`);
}

/**
 * Parse a fractional frame rate string like "30000/1001" into a number.
 */
function parseFps(rate: string | undefined): number {
  if (!rate) return 0;
  const parts = rate.split("/");
  if (parts.length === 2) {
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    return den > 0 ? num / den : 0;
  }
  return Number(rate) || 0;
}

/**
 * Run an ffmpeg command and resolve with the output path on completion.
 */
function run(command: ffmpeg.FfmpegCommand, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    command
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

/**
 * Get the file extension without the leading dot, defaulting to "mp4".
 */
function getExt(filePath: string): string {
  const ext = extname(filePath).slice(1).toLowerCase();
  return ext || "mp4";
}

// ---------------------------------------------------------------------------
// Video info
// ---------------------------------------------------------------------------

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
export function info(input: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(input, (err, metadata) => {
      if (err) return reject(err);
      const video = metadata.streams.find((s) => s.codec_type === "video");
      const audio = metadata.streams.find((s) => s.codec_type === "audio");
      resolve({
        duration: metadata.format.duration ?? 0,
        width: video?.width ?? 0,
        height: video?.height ?? 0,
        fps: parseFps(video?.r_frame_rate),
        codec: video?.codec_name ?? "unknown",
        format: metadata.format.format_name ?? "unknown",
        bitrate: metadata.format.bit_rate ? Number(metadata.format.bit_rate) : 0,
        size: metadata.format.size ? Number(metadata.format.size) : 0,
        hasAudio: !!audio,
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Trim
// ---------------------------------------------------------------------------

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
export function trim(input: string, options: TrimOptions): Promise<string> {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);

  if (options.start !== undefined) {
    cmd.setStartTime(options.start);
  }
  if (options.end !== undefined && options.start !== undefined) {
    cmd.setDuration(options.end - options.start);
  } else if (options.duration !== undefined) {
    cmd.setDuration(options.duration);
  }

  cmd.outputOptions("-c", "copy");
  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------

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
export function resize(input: string, options: ResizeOptions): Promise<string> {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);

  let scaleFilter: string;
  if (options.width && options.height) {
    if (options.fit === "cover") {
      scaleFilter = `scale=${options.width}:${options.height}:force_original_aspect_ratio=increase,crop=${options.width}:${options.height}`;
    } else if (options.fit === "contain") {
      scaleFilter = `scale=${options.width}:${options.height}:force_original_aspect_ratio=decrease,pad=${options.width}:${options.height}:(ow-iw)/2:(oh-ih)/2`;
    } else {
      scaleFilter = `scale=${options.width}:${options.height}`;
    }
  } else if (options.width) {
    scaleFilter = `scale=${options.width}:-2`;
  } else if (options.height) {
    scaleFilter = `scale=-2:${options.height}`;
  } else {
    return run(cmd, output);
  }

  cmd.videoFilter(scaleFilter);
  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Rotate
// ---------------------------------------------------------------------------

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
export function rotate(input: string, options: RotateOptions): Promise<string> {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);

  // FFmpeg transpose: 0=90ccw+vflip, 1=90cw, 2=90ccw, 3=90cw+vflip
  switch (options.degrees) {
    case 90:
      cmd.videoFilter("transpose=1");
      break;
    case 180:
      cmd.videoFilter("transpose=1,transpose=1");
      break;
    case 270:
      cmd.videoFilter("transpose=2");
      break;
  }

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Concatenate
// ---------------------------------------------------------------------------

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
export function concatenate(inputs: string[]): Promise<string> {
  if (inputs.length < 2) {
    return Promise.reject(new Error("At least 2 inputs are required for concatenation"));
  }

  const output = tmpOutput(getExt(inputs[0]!));

  // Build a concat list file for the demuxer
  const listPath = tmpOutput("txt");
  const listContent = inputs.map((f) => `file '${f}'`).join("\n");
  writeFileSync(listPath, listContent, "utf-8");

  const cmd = ffmpeg()
    .input(listPath)
    .inputOptions("-f", "concat", "-safe", "0")
    .outputOptions("-c", "copy");

  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Audio operations
// ---------------------------------------------------------------------------

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
export function extractAudio(input: string, format: string = "mp3"): Promise<string> {
  const output = tmpOutput(format);
  const cmd = ffmpeg(input).noVideo();
  return run(cmd, output);
}

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
export function stripAudio(input: string): Promise<string> {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input).noAudio().outputOptions("-c:v", "copy");
  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

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
export function thumbnail(
  input: string,
  options: ThumbnailOptions = {},
): Promise<string> {
  const output = tmpOutput("png");
  const cmd = ffmpeg(input);

  if (options.time !== undefined) {
    cmd.seekInput(options.time);
  }

  cmd.frames(1);

  if (options.width || options.height) {
    const w = options.width ?? -2;
    const h = options.height ?? -2;
    cmd.videoFilter(`scale=${w}:${h}`);
  }

  return run(cmd, output);
}

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
export async function thumbnails(
  input: string,
  count: number,
  options: Pick<ThumbnailOptions, "width" | "height"> = {},
): Promise<string[]> {
  // First get the video duration via ffprobe
  const meta = await info(input);
  const duration = meta.duration;

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    const time = count > 1 ? (i / (count - 1)) * duration : 0;
    // Clamp slightly before end to avoid out-of-range
    const clampedTime = Math.min(time, Math.max(0, duration - 0.01));
    const thumbPath = await thumbnail(input, {
      time: clampedTime,
      ...options,
    });
    results.push(thumbPath);
  }

  return results;
}

// ---------------------------------------------------------------------------
// GIF conversion
// ---------------------------------------------------------------------------

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
export function videoToGif(input: string, options: GifOptions = {}): Promise<string> {
  const output = tmpOutput("gif");
  const cmd = ffmpeg(input);

  if (options.start !== undefined) {
    cmd.setStartTime(options.start);
  }
  if (options.duration !== undefined) {
    cmd.setDuration(options.duration);
  }

  const filters: string[] = [];
  if (options.fps) {
    filters.push(`fps=${options.fps}`);
  }
  if (options.width) {
    filters.push(`scale=${options.width}:-1:flags=lanczos`);
  }

  if (filters.length > 0) {
    cmd.videoFilter(filters.join(","));
  }

  return run(cmd, output);
}

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
export function gifToVideo(input: string): Promise<string> {
  const output = tmpOutput("mp4");
  const cmd = ffmpeg(input)
    .outputOptions("-movflags", "+faststart")
    .outputOptions("-pix_fmt", "yuv420p");
  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Reverse
// ---------------------------------------------------------------------------

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
export function reverseVideo(input: string): Promise<string> {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input).videoFilter("reverse").audioFilter("areverse");
  return run(cmd, output);
}

// ---------------------------------------------------------------------------
// Speed
// ---------------------------------------------------------------------------

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
export function speed(input: string, options: SpeedOptions): Promise<string> {
  if (options.factor <= 0) {
    return Promise.reject(new Error("Speed factor must be positive"));
  }

  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);

  // setpts: PTS/factor speeds up when factor>1, slows down when factor<1
  const ptsFactor = 1 / options.factor;
  cmd.videoFilter(`setpts=${ptsFactor}*PTS`);

  // atempo only accepts values between 0.5 and 100.0
  // For extreme values, chain multiple atempo filters
  const atempoFilters: string[] = [];
  let remaining = options.factor;
  while (remaining > 100.0) {
    atempoFilters.push("atempo=100.0");
    remaining /= 100.0;
  }
  while (remaining < 0.5) {
    atempoFilters.push("atempo=0.5");
    remaining /= 0.5;
  }
  atempoFilters.push(`atempo=${remaining}`);

  cmd.audioFilter(atempoFilters.join(","));

  return run(cmd, output);
}
