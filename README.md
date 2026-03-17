# peasy-video

[![npm version](https://agentgif.com/badge/npm/peasy-video/version.svg)](https://www.npmjs.com/package/peasy-video)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Video processing library for Node.js -- trim, resize, rotate, extract audio, generate thumbnails, convert to GIF, concatenate clips, adjust speed, and reverse video. FFmpeg-powered, TypeScript-first with full type safety. Handles MP4, WebM, MKV, AVI, MOV, and any container format supported by FFmpeg.

Built from [PeasyVideo](https://peasyvideo.com), a free online video toolkit with 15 browser-based tools for trimming, resizing, format conversion, thumbnail extraction, and GIF creation.

> **Try the interactive tools at [peasyvideo.com](https://peasyvideo.com)** -- video trimming, resizing, audio extraction, GIF conversion, and thumbnail generation

<p align="center">
  <img src="demo.gif" alt="peasy-video demo — video info, thumbnail extraction, and format operations in Node.js" width="800">
</p>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Quick Start](#quick-start)
- [What You Can Do](#what-you-can-do)
  - [Video Info & Metadata](#video-info--metadata)
  - [Trimming & Concatenation](#trimming--concatenation)
  - [Resize & Transform](#resize--transform)
  - [Audio Extraction](#audio-extraction)
  - [Thumbnails](#thumbnails)
  - [GIF Conversion](#gif-conversion)
  - [Speed & Reverse](#speed--reverse)
- [TypeScript Types](#typescript-types)
- [API Reference](#api-reference)
- [REST API Client](#rest-api-client)
- [Learn More](#learn-more)
- [Also Available](#also-available)
- [Peasy Developer Tools](#peasy-developer-tools)
- [License](#license)

## Prerequisites

peasy-video uses FFmpeg under the hood. Install it before using this library:

| Platform | Command |
|----------|---------|
| **macOS** | `brew install ffmpeg` |
| **Ubuntu/Debian** | `sudo apt install ffmpeg` |
| **Fedora/RHEL** | `sudo dnf install ffmpeg-free` |
| **Windows** | `choco install ffmpeg` |

## Install

```bash
npm install peasy-video
```

## Quick Start

```typescript
import { info, trim, resize, thumbnail, videoToGif } from "peasy-video";

// Get video metadata
const meta = await info("movie.mp4");
console.log(meta.width, meta.height, meta.duration); // 1920 1080 7200

// Trim to a 30-second clip
const clip = await trim("movie.mp4", { start: 60, duration: 30 });

// Resize to 720p
const resized = await resize("movie.mp4", { width: 1280, height: 720 });

// Extract a thumbnail at 5 seconds
const thumb = await thumbnail("movie.mp4", { time: 5 });

// Convert a clip to GIF
const gif = await videoToGif("clip.mp4", { fps: 15, width: 480 });
```

## What You Can Do

### Video Info & Metadata

Extract comprehensive metadata from video files without decoding frames. FFprobe reads container headers and stream information to report resolution, frame rate, codec, bitrate, duration, and whether an audio track is present.

```typescript
import { info } from "peasy-video";

// Extract video metadata using FFprobe
const meta = await info("presentation.mp4");
console.log(meta.width);     // 1920
console.log(meta.height);    // 1080
console.log(meta.fps);       // 30
console.log(meta.duration);  // 3600.5 (seconds)
console.log(meta.codec);     // "h264"
console.log(meta.hasAudio);  // true
console.log(meta.bitrate);   // 5000000
```

Learn more: [Video Metadata & EXIF Data Explained](https://peasyvideo.com/guides/video-metadata-exif-data-explained/) · [What is Bitrate?](https://peasyvideo.com/glossary/bitrate-video/) · [What is a Keyframe?](https://peasyvideo.com/glossary/keyframe/)

### Trimming & Concatenation

Video trimming extracts a segment using keyframe-accurate seeking. Concatenation joins multiple clips sequentially using the FFmpeg concat demuxer, maintaining codec compatibility across segments.

```typescript
import { trim, concatenate } from "peasy-video";

// Extract a 30-second clip starting at 1 minute
const clip = await trim("lecture.mp4", { start: 60, duration: 30 });

// Trim from start to end time
const intro = await trim("movie.mp4", { start: 0, end: 15 });

// Join multiple clips into one video
const combined = await concatenate([
  "chapter1.mp4",
  "chapter2.mp4",
  "chapter3.mp4",
]);
```

Learn more: [How to Trim & Cut Video in Browser](https://peasyvideo.com/guides/how-to-trim-cut-video-browser/) · [What is Trimming?](https://peasyvideo.com/glossary/trimming/) · [What is GOP?](https://peasyvideo.com/glossary/gop/)

### Resize & Transform

Video resizing scales frames to target dimensions while maintaining aspect ratio. Rotation applies transpose filters for 90/180/270 degree rotations, handling both the video stream and any embedded rotation metadata.

| Resolution | Dimensions | Common Name |
|-----------|------------|-------------|
| 4K UHD | 3840 x 2160 | Ultra HD |
| 1080p | 1920 x 1080 | Full HD |
| 720p | 1280 x 720 | HD |
| 480p | 854 x 480 | SD |

```typescript
import { resize, rotate } from "peasy-video";

// Resize to 720p (maintains aspect ratio)
const hd = await resize("4k-video.mp4", { width: 1280, height: 720 });

// Resize by width only (auto-calculates height)
const small = await resize("video.mp4", { width: 640 });

// Rotate 90 degrees clockwise
const rotated = await rotate("portrait.mp4", { degrees: 90 });

// Rotate 180 degrees (flip upside down)
const flipped = await rotate("upside-down.mp4", { degrees: 180 });
```

Learn more: [Video Aspect Ratios & Resolution Guide](https://peasyvideo.com/guides/video-aspect-ratios-resolution-guide/) · [Social Media Video Specs](https://peasyvideo.com/guides/social-media-video-specs/) · [What is Letterboxing?](https://peasyvideo.com/glossary/letterboxing/)

### Audio Extraction

Extract the audio track from a video file as a standalone audio file, or strip the audio track entirely to produce a silent video. Audio extraction preserves the original codec when possible, avoiding re-encoding for faster processing.

```typescript
import { extractAudio, stripAudio } from "peasy-video";

// Extract audio as MP3
const audio = await extractAudio("interview.mp4", "mp3");

// Extract audio as WAV (lossless)
const wav = await extractAudio("concert.mp4", "wav");

// Remove audio track from video (silent output)
const silent = await stripAudio("presentation.mp4");
```

Learn more: [How to Extract Audio from Video](https://peasyvideo.com/guides/how-to-extract-audio-from-video/) · [What is Transcoding?](https://peasyvideo.com/glossary/transcoding/) · [What is a Container Format?](https://peasyvideo.com/glossary/container-format/)

### Thumbnails

Extract individual frames as images for preview thumbnails, video galleries, or content analysis. Single-frame extraction uses precise seeking, while multi-frame extraction distributes captures evenly across the video duration.

```typescript
import { thumbnail, thumbnails } from "peasy-video";

// Extract a frame at 5 seconds as PNG
const frame = await thumbnail("video.mp4", { time: 5 });

// Extract a frame with custom dimensions
const small = await thumbnail("video.mp4", {
  time: 10,
  width: 320,
  height: 180,
});

// Generate 10 evenly-spaced thumbnails
const frames = await thumbnails("video.mp4", 10, { width: 320 });
// Returns array of paths: ["/tmp/peasy-video-xxx-0.png", ...]
```

Learn more: [Video Thumbnails Best Practices](https://peasyvideo.com/guides/video-thumbnails-best-practices/) · [Video Thumbnail Extraction Techniques](https://peasyvideo.com/guides/video-thumbnail-extraction-techniques/) · [What is Frame Rate?](https://peasyvideo.com/glossary/frame-rate/)

### GIF Conversion

Convert video clips to animated GIFs with palette optimization for smaller file sizes and better color reproduction. Convert GIFs back to MP4 for efficient playback and embedding.

```typescript
import { videoToGif, gifToVideo } from "peasy-video";

// Convert video to GIF with custom settings
const gif = await videoToGif("clip.mp4", {
  fps: 15,       // frames per second
  width: 480,    // pixel width
  start: 2,      // start at 2 seconds
  duration: 5,   // 5-second GIF
});

// Convert GIF back to MP4 (much smaller file size)
const mp4 = await gifToVideo("animation.gif");
```

Learn more: [GIF Creation & Optimization Guide](https://peasyvideo.com/guides/gif-creation-optimization-guide/) · [How to Create Animated GIFs from Video](https://peasyvideo.com/guides/how-to-create-animated-gifs-from-video/) · [Creating Seamless Video Loops](https://peasyvideo.com/guides/creating-seamless-video-loops/)

### Speed & Reverse

Adjust playback speed using FFmpeg's `setpts` (video) and `atempo` (audio) filters. Speed factors below 1.0 create slow motion, above 1.0 create fast motion. Reverse plays the video backwards, re-encoding all frames.

```typescript
import { speed, reverseVideo } from "peasy-video";

// Double the playback speed
const fast = await speed("lecture.mp4", { factor: 2.0 });

// Slow motion at half speed
const slow = await speed("action.mp4", { factor: 0.5 });

// Reverse the entire video
const reversed = await reverseVideo("clip.mp4");
```

Learn more: [Video Codecs Explained](https://peasyvideo.com/guides/video-codecs-explained/) · [What is Motion Estimation?](https://peasyvideo.com/glossary/motion-estimation/) · [What is Optical Flow?](https://peasyvideo.com/glossary/optical-flow/)

## TypeScript Types

```typescript
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
} from "peasy-video";

// VideoFormat — "mp4" | "webm" | "mkv" | "avi" | "mov" | "gif"
const format: VideoFormat = "mp4";

// VideoInfo — metadata from info()
const meta: VideoInfo = {
  duration: 120.5,
  width: 1920,
  height: 1080,
  fps: 30,
  codec: "h264",
  format: "mov,mp4,m4a,3gp,3g2,mj2",
  bitrate: 5_000_000,
  size: 75_000_000,
  hasAudio: true,
};
```

## API Reference

| Function | Description |
|----------|-------------|
| `info(input)` | Get video metadata (resolution, fps, codec, duration, bitrate) |
| `trim(input, options)` | Extract a segment by start/end/duration |
| `resize(input, options)` | Scale video to target dimensions |
| `rotate(input, options)` | Rotate video 90/180/270 degrees |
| `concatenate(inputs)` | Join multiple video files sequentially |
| `extractAudio(input, format?)` | Extract audio track as standalone file |
| `stripAudio(input)` | Remove audio track from video |
| `thumbnail(input, options?)` | Extract a single frame as PNG |
| `thumbnails(input, count, options?)` | Extract multiple evenly-spaced frames |
| `videoToGif(input, options?)` | Convert video clip to animated GIF |
| `gifToVideo(input)` | Convert GIF to MP4 |
| `reverseVideo(input)` | Play video in reverse |
| `speed(input, options)` | Adjust playback speed (0.5x to 4.0x) |

## REST API Client

The API client connects to the [PeasyVideo developer API](https://peasyvideo.com/developers/) for tool discovery and content.

```typescript
import { PeasyVideoClient } from "peasy-video";

const client = new PeasyVideoClient();

// List available tools
const tools = await client.listTools();
console.log(tools.results);

// Search across all content
const results = await client.search("trim");
console.log(results);

// Browse the glossary
const glossary = await client.listGlossary({ search: "format" });
for (const term of glossary.results) {
  console.log(`${term.term}: ${term.definition}`);
}

// Discover guides
const guides = await client.listGuides({ category: "video" });
for (const guide of guides.results) {
  console.log(`${guide.title} (${guide.audience_level})`);
}
```

Full API documentation at [peasyvideo.com/developers/](https://peasyvideo.com/developers/).

## Learn More

- **Tools**: [Video Resolution Calculator](https://peasyvideo.com/video/video-resolution/) · [Video Bitrate Calculator](https://peasyvideo.com/video/video-bitrate/) · [Video Framerate Converter](https://peasyvideo.com/video/video-framerate/) · [Video Aspect Ratio Calculator](https://peasyvideo.com/video/video-aspect-ratio/) · [Video File Size Calculator](https://peasyvideo.com/video/video-filesize/) · [Video Codec Analyzer](https://peasyvideo.com/video/video-codec/) · [All Video Tools](https://peasyvideo.com/)
- **Guides**: [Video Codecs Explained](https://peasyvideo.com/guides/video-codecs-explained/) · [Video Compression for Web Delivery](https://peasyvideo.com/guides/video-compression-web-delivery/) · [GIF Creation & Optimization Guide](https://peasyvideo.com/guides/gif-creation-optimization-guide/) · [H.264 vs H.265 vs AV1 Comparison](https://peasyvideo.com/guides/h264-vs-h265-vs-av1-comparison/) · [Video Thumbnails Best Practices](https://peasyvideo.com/guides/video-thumbnails-best-practices/) · [Social Media Video Specs](https://peasyvideo.com/guides/social-media-video-specs/) · [Frame Rate Guide: 24, 30, 60 fps](https://peasyvideo.com/guides/frame-rate-guide-24-30-60-fps/) · [All Guides](https://peasyvideo.com/guides/)
- **Glossary**: [H.264](https://peasyvideo.com/glossary/h264/) · [H.265](https://peasyvideo.com/glossary/h265/) · [AV1](https://peasyvideo.com/glossary/av1/) · [Frame Rate](https://peasyvideo.com/glossary/frame-rate/) · [Container Format](https://peasyvideo.com/glossary/container-format/) · [Keyframe](https://peasyvideo.com/glossary/keyframe/) · [Transcoding](https://peasyvideo.com/glossary/transcoding/) · [Color Grading](https://peasyvideo.com/glossary/color-grading/) · [All Terms](https://peasyvideo.com/glossary/)
- **Formats**: [MP4](https://peasyvideo.com/formats/mp4/) · [WebM](https://peasyvideo.com/formats/webm/) · [MKV](https://peasyvideo.com/formats/mkv/) · [AVI](https://peasyvideo.com/formats/avi/) · [MOV](https://peasyvideo.com/formats/mov/) · [GIF](https://peasyvideo.com/formats/gif/) · [All Formats](https://peasyvideo.com/formats/)
- **API**: [REST API Docs](https://peasyvideo.com/developers/) · [OpenAPI Spec](https://peasyvideo.com/api/openapi.json)

## Also Available

| Language | Package | Install |
|----------|---------|---------|
| **Python** | [peasy-video](https://pypi.org/project/peasy-video/) | `pip install "peasy-video[all]"` |
| **Go** | [peasy-video-go](https://pkg.go.dev/github.com/peasytools/peasy-video-go) | `go get github.com/peasytools/peasy-video-go` |
| **Rust** | [peasy-video](https://crates.io/crates/peasy-video) | `cargo add peasy-video` |
| **Ruby** | [peasy-video](https://rubygems.org/gems/peasy-video) | `gem install peasy-video` |

## Peasy Developer Tools

Part of the [Peasy Tools](https://peasytools.com) open-source developer ecosystem.

| Package | PyPI | npm | Description |
|---------|------|-----|-------------|
| peasy-pdf | [PyPI](https://pypi.org/project/peasy-pdf/) | [npm](https://www.npmjs.com/package/peasy-pdf) | PDF merge, split, rotate, compress, 21 operations — [peasypdf.com](https://peasypdf.com) |
| peasy-image | [PyPI](https://pypi.org/project/peasy-image/) | [npm](https://www.npmjs.com/package/peasy-image) | Image resize, crop, convert, compress — [peasyimage.com](https://peasyimage.com) |
| peasy-audio | [PyPI](https://pypi.org/project/peasy-audio/) | [npm](https://www.npmjs.com/package/peasy-audio) | Audio trim, merge, convert, normalize — [peasyaudio.com](https://peasyaudio.com) |
| **peasy-video** | **[PyPI](https://pypi.org/project/peasy-video/)** | **[npm](https://www.npmjs.com/package/peasy-video)** | **Video trim, resize, thumbnails, GIF — [peasyvideo.com](https://peasyvideo.com)** |
| peasy-css | [PyPI](https://pypi.org/project/peasy-css/) | [npm](https://www.npmjs.com/package/peasy-css) | CSS minify, format, analyze — [peasycss.com](https://peasycss.com) |
| peasy-compress | [PyPI](https://pypi.org/project/peasy-compress/) | [npm](https://www.npmjs.com/package/peasy-compress) | ZIP, TAR, gzip compression — [peasytools.com](https://peasytools.com) |
| peasy-document | [PyPI](https://pypi.org/project/peasy-document/) | [npm](https://www.npmjs.com/package/peasy-document) | Markdown, HTML, CSV, JSON conversion — [peasyformats.com](https://peasyformats.com) |
| peasytext | [PyPI](https://pypi.org/project/peasytext/) | [npm](https://www.npmjs.com/package/peasytext) | Text case conversion, slugify, word count — [peasytext.com](https://peasytext.com) |

## License

MIT
