#!/usr/bin/env node

const usage = `Usage:
  tools/resolve-one-play-url.mjs <ONE episodeDetailURL>

The argument is the URL emitted by the ONE plugin for an episode, for example
an absolute URL whose path ends in /one_play_json_new. On success, stdout
contains only the freshly resolved playback URL so it can be piped to another
local diagnostic command.
`;

function fail(message) {
  process.stderr.write(`resolve-one-play-url: ${message}\n`);
  process.exitCode = 1;
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  process.stdout.write(usage);
  process.exit(0);
}

if (args.length !== 1) {
  process.stderr.write(usage);
  fail("expected exactly one ONE episodeDetailURL");
} else {
  let endpoint;
  try {
    endpoint = new URL(args[0]);
  } catch {
    fail("episodeDetailURL is not an absolute URL");
  }

  if (endpoint && endpoint.protocol !== "http:" && endpoint.protocol !== "https:") {
    fail("episodeDetailURL must use HTTP or HTTPS");
    endpoint = undefined;
  }

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        redirect: "follow",
      });
      if (!response.ok) {
        throw new Error(`ONE returned HTTP ${response.status}`);
      }

      const payload = await response.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("ONE returned a non-object JSON body");
      }
      if (payload.code !== undefined && Number(payload.code) !== 200) {
        const detail = typeof payload.msg === "string" && payload.msg.trim()
          ? `: ${payload.msg.trim()}`
          : "";
        throw new Error(`ONE returned code ${String(payload.code)}${detail}`);
      }
      if (typeof payload.playurl !== "string" || !payload.playurl.trim()) {
        throw new Error("ONE response has no non-empty playurl");
      }

      const playbackURL = new URL(payload.playurl.trim());
      if (playbackURL.protocol !== "http:" && playbackURL.protocol !== "https:") {
        throw new Error("ONE playurl does not use HTTP or HTTPS");
      }
      process.stdout.write(`${playbackURL.href}\n`);
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }
  }
}
