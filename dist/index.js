// src/engine.ts
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
function tmpOutput(ext) {
  return join(tmpdir(), `peasy-video-${randomUUID()}.${ext}`);
}
function parseFps(rate) {
  if (!rate) return 0;
  const parts = rate.split("/");
  if (parts.length === 2) {
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    return den > 0 ? num / den : 0;
  }
  return Number(rate) || 0;
}
function run(command, outputPath) {
  return new Promise((resolve, reject) => {
    command.output(outputPath).on("end", () => resolve(outputPath)).on("error", (err) => reject(err)).run();
  });
}
function getExt(filePath) {
  const ext = extname(filePath).slice(1).toLowerCase();
  return ext || "mp4";
}
function info(input) {
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
        hasAudio: !!audio
      });
    });
  });
}
function trim(input, options) {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);
  if (options.start !== void 0) {
    cmd.setStartTime(options.start);
  }
  if (options.end !== void 0 && options.start !== void 0) {
    cmd.setDuration(options.end - options.start);
  } else if (options.duration !== void 0) {
    cmd.setDuration(options.duration);
  }
  cmd.outputOptions("-c", "copy");
  return run(cmd, output);
}
function resize(input, options) {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);
  let scaleFilter;
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
function rotate(input, options) {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);
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
function concatenate(inputs) {
  if (inputs.length < 2) {
    return Promise.reject(new Error("At least 2 inputs are required for concatenation"));
  }
  const output = tmpOutput(getExt(inputs[0]));
  const listPath = tmpOutput("txt");
  const listContent = inputs.map((f) => `file '${f}'`).join("\n");
  writeFileSync(listPath, listContent, "utf-8");
  const cmd = ffmpeg().input(listPath).inputOptions("-f", "concat", "-safe", "0").outputOptions("-c", "copy");
  return run(cmd, output);
}
function extractAudio(input, format = "mp3") {
  const output = tmpOutput(format);
  const cmd = ffmpeg(input).noVideo();
  return run(cmd, output);
}
function stripAudio(input) {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input).noAudio().outputOptions("-c:v", "copy");
  return run(cmd, output);
}
function thumbnail(input, options = {}) {
  const output = tmpOutput("png");
  const cmd = ffmpeg(input);
  if (options.time !== void 0) {
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
async function thumbnails(input, count, options = {}) {
  const meta = await info(input);
  const duration = meta.duration;
  const results = [];
  for (let i = 0; i < count; i++) {
    const time = count > 1 ? i / (count - 1) * duration : 0;
    const clampedTime = Math.min(time, Math.max(0, duration - 0.01));
    const thumbPath = await thumbnail(input, {
      time: clampedTime,
      ...options
    });
    results.push(thumbPath);
  }
  return results;
}
function videoToGif(input, options = {}) {
  const output = tmpOutput("gif");
  const cmd = ffmpeg(input);
  if (options.start !== void 0) {
    cmd.setStartTime(options.start);
  }
  if (options.duration !== void 0) {
    cmd.setDuration(options.duration);
  }
  const filters = [];
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
function gifToVideo(input) {
  const output = tmpOutput("mp4");
  const cmd = ffmpeg(input).outputOptions("-movflags", "+faststart").outputOptions("-pix_fmt", "yuv420p");
  return run(cmd, output);
}
function reverseVideo(input) {
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input).videoFilter("reverse").audioFilter("areverse");
  return run(cmd, output);
}
function speed(input, options) {
  if (options.factor <= 0) {
    return Promise.reject(new Error("Speed factor must be positive"));
  }
  const output = tmpOutput(getExt(input));
  const cmd = ffmpeg(input);
  const ptsFactor = 1 / options.factor;
  cmd.videoFilter(`setpts=${ptsFactor}*PTS`);
  const atempoFilters = [];
  let remaining = options.factor;
  while (remaining > 100) {
    atempoFilters.push("atempo=100.0");
    remaining /= 100;
  }
  while (remaining < 0.5) {
    atempoFilters.push("atempo=0.5");
    remaining /= 0.5;
  }
  atempoFilters.push(`atempo=${remaining}`);
  cmd.audioFilter(atempoFilters.join(","));
  return run(cmd, output);
}

// src/client.ts
var PeasyVideo = class {
  baseUrl;
  constructor(baseUrl = "https://peasyvideo.com") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }
  async get(path, params) {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== void 0 && v !== null) url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`PeasyVideo API error: HTTP ${res.status} \u2014 ${body}`);
    }
    return res.json();
  }
  /** List tools (paginated). Filter by category or search query. */
  async listTools(opts) {
    return this.get("/api/v1/tools/", opts);
  }
  /** Get a single tool by slug. */
  async getTool(slug) {
    return this.get(`/api/v1/tools/${encodeURIComponent(slug)}/`);
  }
  /** List tool categories (paginated). */
  async listCategories(opts) {
    return this.get("/api/v1/categories/", opts);
  }
  /** List file formats (paginated). */
  async listFormats(opts) {
    return this.get("/api/v1/formats/", opts);
  }
  /** Get a single format by slug. */
  async getFormat(slug) {
    return this.get(`/api/v1/formats/${encodeURIComponent(slug)}/`);
  }
  /** List format conversions (paginated). */
  async listConversions(opts) {
    return this.get("/api/v1/conversions/", opts);
  }
  /** List glossary terms (paginated). Search with opts.search. */
  async listGlossary(opts) {
    return this.get("/api/v1/glossary/", opts);
  }
  /** Get a single glossary term by slug. */
  async getGlossaryTerm(slug) {
    return this.get(`/api/v1/glossary/${encodeURIComponent(slug)}/`);
  }
  /** List guides (paginated). Filter by category, audience level, or search. */
  async listGuides(opts) {
    const params = { ...opts };
    if (opts?.audienceLevel) {
      params.audience_level = opts.audienceLevel;
      delete params.audienceLevel;
    }
    return this.get("/api/v1/guides/", params);
  }
  /** Get a single guide by slug. */
  async getGuide(slug) {
    return this.get(`/api/v1/guides/${encodeURIComponent(slug)}/`);
  }
  /** List industry use cases (paginated). */
  async listUseCases(opts) {
    return this.get("/api/v1/use-cases/", opts);
  }
  /** Search across tools, formats, and glossary. */
  async search(query, limit) {
    return this.get("/api/v1/search/", { q: query, limit });
  }
  /** List all Peasy sites. */
  async listSites() {
    return this.get("/api/v1/sites/");
  }
  /** Get the OpenAPI 3.0.3 specification. */
  async openapiSpec() {
    return this.get("/api/openapi.json");
  }
};
export {
  PeasyVideo,
  concatenate,
  extractAudio,
  gifToVideo,
  info,
  resize,
  reverseVideo,
  rotate,
  speed,
  stripAudio,
  thumbnail,
  thumbnails,
  trim,
  videoToGif
};
