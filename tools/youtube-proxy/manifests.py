"""Manifest-only packaging of original YouTube fMP4 and WebVTT resources."""

import math
from xml.sax.saxutils import escape


def media_playlist(track, resource):
    base = track["segmentBase"]
    scale = base["timescale"]
    segments = base["segments"]
    target = math.ceil(max(s["duration"] / scale for s in segments))
    first, last = base["initialization"]
    lines = ["#EXTM3U", "#EXT-X-VERSION:7", f"#EXT-X-TARGETDURATION:{target}",
             "#EXT-X-MEDIA-SEQUENCE:0", "#EXT-X-PLAYLIST-TYPE:VOD",
             f'#EXT-X-MAP:URI="{resource}",BYTERANGE="{last - first + 1}@{first}"']
    for segment in segments:
        lines += [f'#EXTINF:{segment["duration"] / scale:.9f},',
                  f'#EXT-X-BYTERANGE:{segment["size"]}@{segment["offset"]}', resource]
    return ("\n".join(lines) + "\n#EXT-X-ENDLIST\n").encode()


def master_playlist(source):
    video, audio = source["video"], source["audio"]
    subtitle = source["subtitle"]
    peak = sum(max(s["size"] * 8 * t["segmentBase"]["timescale"] / s["duration"]
                   for s in t["segmentBase"]["segments"]) for t in (video, audio))
    language = audio.get("language") or "und"
    lines = ["#EXTM3U", "#EXT-X-VERSION:7",
             f'#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="{language}",LANGUAGE="{language}",DEFAULT=YES,AUTOSELECT=YES,URI="audio.m3u8"']
    if subtitle.get("available"):
        lines += [f'#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subtitles",NAME="{subtitle["name"]}",LANGUAGE="{subtitle["language"]}",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,URI="subtitles.m3u8"']
    attributes = (f'BANDWIDTH={math.ceil(peak)},CODECS="{video["vcodec"]},{audio["acodec"]}",'
                  f'RESOLUTION={video["width"]}x{video["height"]},AUDIO="audio"')
    if subtitle.get("available"):
        attributes += ',SUBTITLES="subtitles"'
    lines += ["#EXT-X-STREAM-INF:" + attributes, "video.m3u8"]
    return ("\n".join(lines) + "\n").encode()


def subtitle_playlist(duration):
    return ("#EXTM3U\n#EXT-X-VERSION:7\n"
            f"#EXT-X-TARGETDURATION:{math.ceil(duration)}\n"
            "#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n"
            f"#EXTINF:{duration:.9f},\nsubtitles.vtt\n#EXT-X-ENDLIST\n").encode()


def hls_vtt(body):
    """Add only HLS's timestamp-map header; preserve every cue and timestamp."""
    text = body.decode("utf-8-sig").replace("\r\n", "\n")
    header, separator, cues = text.partition("\n\n")
    if "X-TIMESTAMP-MAP=" not in header:
        header += "\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:0"
    return (header + separator + cues).encode()


def make_mpd(source):
    """Describe original A/V ranges for Aether's DASH opener, without remuxing."""
    sets = []
    for kind in ("video", "audio"):
        track = source[kind]
        base = track["segmentBase"]
        codec = track["vcodec"] if kind == "video" else track["acodec"]
        attrs = f' width="{track["width"]}" height="{track["height"]}"' if kind == "video" else ""
        language = f' lang="{escape(track.get("language") or "und")}"' if kind == "audio" else ""
        sets.append(f'<AdaptationSet contentType="{kind}" mimeType="{kind}/mp4"{language}>'
                    f'<Representation id="{kind}-{escape(track["format_id"])}" codecs="{escape(codec)}" '
                    f'bandwidth="{round(track["tbr"] * 1000)}"{attrs}><BaseURL>{kind}.mp4</BaseURL>'
                    f'<SegmentBase indexRange="{base["index"][0]}-{base["index"][1]}"><Initialization '
                    f'range="{base["initialization"][0]}-{base["initialization"][1]}"/></SegmentBase>'
                    '</Representation></AdaptationSet>')
    return (f'<?xml version="1.0" encoding="UTF-8"?><MPD xmlns="urn:mpeg:dash:schema:mpd:2011" '
            f'type="static" profiles="urn:mpeg:dash:profile:isoff-on-demand:2011" '
            f'mediaPresentationDuration="PT{source["duration"]:.6f}S" minBufferTime="PT1.5S">'
            f'<Period>{"".join(sets)}</Period></MPD>').encode()
