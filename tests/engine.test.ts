import { describe, it, expect } from "vitest";
import {
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
} from "../src/engine.js";
import type {
  VideoFormat,
  VideoInfo,
  TrimOptions,
  ResizeOptions,
  RotateOptions,
  ThumbnailOptions,
  GifOptions,
  SpeedOptions,
  ThumbnailResult,
} from "../src/types.js";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Export verification — ensure all 13 functions are exported
// ---------------------------------------------------------------------------

describe("exports", () => {
  it("exports all 13 engine functions", () => {
    expect(typeof info).toBe("function");
    expect(typeof trim).toBe("function");
    expect(typeof resize).toBe("function");
    expect(typeof rotate).toBe("function");
    expect(typeof concatenate).toBe("function");
    expect(typeof extractAudio).toBe("function");
    expect(typeof stripAudio).toBe("function");
    expect(typeof thumbnail).toBe("function");
    expect(typeof thumbnails).toBe("function");
    expect(typeof videoToGif).toBe("function");
    expect(typeof gifToVideo).toBe("function");
    expect(typeof reverseVideo).toBe("function");
    expect(typeof speed).toBe("function");
  });

  it("exports type definitions (compile-time check)", () => {
    // These are compile-time checks — if types aren't exported, TypeScript
    // will fail to build. At runtime we just verify the imports don't throw.
    const _format: VideoFormat = "mp4";
    const _info: VideoInfo = {
      duration: 0,
      width: 0,
      height: 0,
      fps: 0,
      codec: "h264",
      format: "mp4",
      bitrate: 0,
      size: 0,
      hasAudio: false,
    };
    const _trimOpts: TrimOptions = { start: 0, end: 10 };
    const _resizeOpts: ResizeOptions = { width: 1280, height: 720 };
    const _rotateOpts: RotateOptions = { degrees: 90 };
    const _thumbOpts: ThumbnailOptions = { time: 5 };
    const _gifOpts: GifOptions = { fps: 10 };
    const _speedOpts: SpeedOptions = { factor: 2 };
    const _thumbResult: ThumbnailResult = {
      path: "/tmp/thumb.png",
      time: 5,
      width: 1920,
      height: 1080,
    };

    // Suppress unused variable warnings
    expect(_format).toBe("mp4");
    expect(_info.codec).toBe("h264");
    expect(_trimOpts.start).toBe(0);
    expect(_resizeOpts.width).toBe(1280);
    expect(_rotateOpts.degrees).toBe(90);
    expect(_thumbOpts.time).toBe(5);
    expect(_gifOpts.fps).toBe(10);
    expect(_speedOpts.factor).toBe(2);
    expect(_thumbResult.path).toBe("/tmp/thumb.png");
  });
});

// ---------------------------------------------------------------------------
// Error handling — tests that don't require FFmpeg
// ---------------------------------------------------------------------------

describe("info", () => {
  it("rejects on non-existent file", async () => {
    await expect(info("/tmp/does-not-exist-12345.mp4")).rejects.toThrow();
  });
});

describe("concatenate", () => {
  it("rejects with fewer than 2 inputs", async () => {
    await expect(concatenate(["single.mp4"])).rejects.toThrow(
      "At least 2 inputs are required",
    );
  });

  it("rejects with empty inputs", async () => {
    await expect(concatenate([])).rejects.toThrow(
      "At least 2 inputs are required",
    );
  });
});

describe("speed", () => {
  it("rejects with non-positive factor", async () => {
    await expect(speed("input.mp4", { factor: 0 })).rejects.toThrow(
      "Speed factor must be positive",
    );
  });

  it("rejects with negative factor", async () => {
    await expect(speed("input.mp4", { factor: -1 })).rejects.toThrow(
      "Speed factor must be positive",
    );
  });
});

// ---------------------------------------------------------------------------
// Helper verification
// ---------------------------------------------------------------------------

describe("tmpOutput helper (via function behavior)", () => {
  it("functions return promises", () => {
    // Verify that calling functions returns a promise (they won't resolve
    // without FFmpeg, but the promise should be created)
    const result = trim("nonexistent.mp4", { start: 0, duration: 5 });
    expect(result).toBeInstanceOf(Promise);
    // Catch the rejection to prevent unhandled promise rejection
    result.catch(() => {});
  });
});
