"""Retain YouTube SHOW cards that explicitly link to a playlist.

GundamInfo's Traditional Chinese series use SHOW cards with a VL playlist
browse endpoint. The pinned extractor otherwise drops these channel entries.
"""

from yt_dlp.extractor.youtube import YoutubeTabIE as BaseYoutubeTabIE


class YoutubeTabIE(BaseYoutubeTabIE, plugin_name="syncnext_shows"):
    def _extract_lockup_view_model(self, view_model):
        content_id = view_model.get("contentId")
        command = (view_model.get("rendererContext", {}).get("commandContext", {})
                   .get("onTap", {}).get("innertubeCommand", {}))
        browse_id = command.get("browseEndpoint", {}).get("browseId")
        if (view_model.get("contentType") == "LOCKUP_CONTENT_TYPE_SHOW"
                and content_id and browse_id == "VL" + content_id):
            view_model = {**view_model, "contentType": "LOCKUP_CONTENT_TYPE_PLAYLIST"}
        return super()._extract_lockup_view_model(view_model)
