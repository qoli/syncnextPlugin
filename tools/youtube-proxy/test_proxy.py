"""Manifest, exact Range and WebVTT contracts; no media tools required."""
import io
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import struct
import tempfile
import threading
from types import SimpleNamespace
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from gateway import Handler, Session, playlist_episodes
from manifests import hls_vtt, master_playlist, media_playlist
from youtube import RangeReader, byte_range, load_subtitle, segment_base

VTT = b'WEBVTT\nKind: captions\nLanguage: zh-TW\n\n00:00:26.000 --> 00:00:28.630\n' + '字幕測試'.encode() + b'\n\n'

class ProxyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.body = bytes(range(256)) * 8
        cls.upstream_calls = []
        class Upstream(BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.1'
            def log_message(self, *_): pass
            def do_GET(self):
                cls.upstream_calls.append(self.client_address)
                a, z = byte_range(self.headers.get('Range'), len(cls.body))
                self.send_response(206)
                self.send_header('Content-Length', str(z-a+1))
                self.send_header('Content-Range', f'bytes {a}-{z}/{len(cls.body)}')
                self.end_headers()
                self.wfile.write(cls.body[a:z+1])
        cls.upstream = ThreadingHTTPServer(('127.0.0.1', 0), Upstream)
        cls.upthread = threading.Thread(target=cls.upstream.serve_forever, daemon=True)
        cls.upthread.start()
        base = {'initialization': [0, 31], 'index': [32, 63], 'timescale': 1000, 'references': 2,
                'segments': [{'offset':64, 'size':100, 'duration':15000, 'timestamp':0, 'sap':0x90000000},
                             {'offset':164, 'size':120, 'duration':15000, 'timestamp':15000, 'sap':0x90000000}]}
        common = {'filesize':len(cls.body), 'http_headers':{}, 'segmentBase':base,
                  'url':f'http://127.0.0.1:{cls.upstream.server_port}/track'}
        cls.source = {'id':'RJ4FLf15XeE', 'title':'sample', 'duration':30, 'profile':'premium',
                      'account':{'cookiesUsed':True, 'premiumDetected':True},
                      'subtitle':{'body':VTT, 'available':True, 'name':'繁體中文', 'language':'zh-TW', 'cueCount':1},
                      'video':{**common, 'format_id':'721','format_note':'1080p Premium','vcodec':'av01.0.08M.08', 'width':1920,'height':1080,'tbr':1062},
                      'audio':{**common, 'format_id':'140', 'acodec':'mp4a.40.2','language':'ja','tbr':128}}
        cls.temp = tempfile.TemporaryDirectory()
        cls.session = Session('abc',cls.source,Path(cls.temp.name))
        cls.events = []
        gateway = SimpleNamespace(lock=threading.Lock(),sessions={'abc':cls.session},record=cls.events.append,
                                  subtitles={('RJ4FLf15XeE','zh-TW'):cls.source['subtitle']})
        cls.server = ThreadingHTTPServer(('127.0.0.1',0),Handler)
        cls.server.gateway = gateway
        cls.thread = threading.Thread(target=cls.server.serve_forever,daemon=True)
        cls.thread.start()
        cls.origin = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        for server in (cls.server, cls.upstream): server.shutdown(); server.server_close()
        cls.thread.join(); cls.upthread.join(); cls.temp.cleanup()

    def test_master_declares_original_av1_aac_and_webvtt(self):
        text = master_playlist(self.source).decode()
        self.assertIn('CODECS="av01.0.08M.08,mp4a.40.2"',text)
        self.assertIn('TYPE=SUBTITLES',text)
        self.assertIn('SUBTITLES="subtitles"',text)
        self.assertNotIn('Cookie',text)

    def test_premium_player_delivers_original_dash_and_raw_vtt(self):
        payload = self.session.player_payload(self.origin)
        self.assertEqual(payload['url'], self.origin + '/sessions/abc/manifest.mpd')
        self.assertEqual(payload['headers'], {})
        self.assertEqual(payload['subtitle']['language'], 'zh-TW')
        self.assertEqual(payload['subtitle']['url'], self.origin + '/api/subtitles/RJ4FLf15XeE/zh-TW.vtt')

    def test_avc_player_keeps_hls_rendition_delivery(self):
        session = Session('avc', {**self.source, 'profile': 'avc'}, Path(self.temp.name))
        self.assertEqual(session.player_payload(self.origin), {'url': self.origin + '/sessions/avc/master.m3u8', 'headers': {}})

    def test_missing_vtt_is_not_invented_in_premium_payload(self):
        session = Session('missing', {**self.source, 'subtitle': {'available': False}}, Path(self.temp.name))
        self.assertNotIn('subtitle', session.player_payload(self.origin))

    def test_media_playlist_uses_original_ranges(self):
        text = media_playlist(self.source['video'],'video.mp4').decode()
        self.assertIn('BYTERANGE="32@0"',text)
        self.assertIn('#EXT-X-BYTERANGE:100@64\nvideo.mp4',text)
        self.assertIn('#EXT-X-BYTERANGE:120@164\nvideo.mp4',text)
        self.assertTrue(text.endswith('#EXT-X-ENDLIST\n'))

    def test_vtt_header_does_not_shift_cues(self):
        wrapped = hls_vtt(VTT)
        self.assertIn(b'X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:0',wrapped)
        self.assertEqual(wrapped.split(b'\n\n',1)[1],VTT.split(b'\n\n',1)[1])
        self.assertEqual(hls_vtt(wrapped),wrapped)

    def test_raw_vtt_is_byte_exact(self):
        with urlopen(self.origin+'/api/subtitles/RJ4FLf15XeE/zh-TW.vtt') as r:
            self.assertEqual(r.headers.get_content_type(),'text/vtt')
            self.assertEqual(r.read(),VTT)

    def test_range_is_original_upstream_bytes(self):
        with urlopen(Request(self.origin+'/sessions/abc/video.mp4',headers={'Range':'bytes=50-199'})) as r:
            self.assertEqual(r.status,206)
            self.assertEqual(r.headers['Content-Range'],f'bytes 50-199/{len(self.body)}')
            self.assertEqual(r.read(),self.body[50:200])

    def test_head_does_not_fetch_upstream(self):
        before = len(self.upstream_calls)
        with urlopen(Request(self.origin+'/sessions/abc/audio.mp4',method='HEAD')) as r:
            self.assertEqual(int(r.headers['Content-Length']),len(self.body))
            self.assertEqual(r.read(),b'')
        self.assertEqual(len(self.upstream_calls),before)

    def test_invalid_range(self):
        with self.assertRaises(HTTPError) as caught:
            urlopen(Request(self.origin+'/sessions/abc/video.mp4',headers={'Range':'bytes=0-1,4-5'}))
        self.assertEqual(caught.exception.code,416); caught.exception.close()

    def test_no_subtitle_rendition_when_unavailable(self):
        text = master_playlist({**self.source,'subtitle':{'available':False}})
        self.assertNotIn(b'SUBTITLES',text)

    def test_sidx_ranges_and_initialization(self):
        def box(kind,body): return struct.pack('>I4s',len(body)+8,kind)+body
        init = box(b'ftyp',b'iso6\0\0\0\0') + box(b'moov',b'12345678')
        # Build the version-0 full-box payload explicitly: flags, id, scale,
        # earliest, offset, reserved/count, then the two references.
        index = box(b'sidx',struct.pack('>IIIIIHH',0,1,1000,0,0,0,2)+struct.pack('>III',100,5000,0x90000000)+struct.pack('>III',120,5000,0x90000000))
        data = init+index+b'x'*220
        base = segment_base({'filesize':len(data)},read=lambda a,z:data[a:z+1])
        self.assertEqual(base['initialization'],[0,len(init)-1])
        self.assertEqual([s['offset'] for s in base['segments']],[len(init)+len(index),len(init)+len(index)+100])
        self.assertEqual(base['indexedDurationSeconds'],10)

    def test_external_vtt_validation_keeps_raw_body(self):
        p=Path(self.temp.name)/'caption.vtt';p.write_bytes(VTT)
        caption=load_subtitle(p,'zh-TW')
        self.assertEqual(caption['body'],VTT)
        self.assertEqual(caption['cueCount'],1)

    def test_playlist_order_and_stable_ids(self):
        x={'entries':[{'id':'abcdefghijk','title':'10'},{'id':'lmnopqrstuv','title':'2'}]}
        avc=playlist_episodes(x,'http://mac:18771','avc')
        premium=playlist_episodes(x,'http://mac:18771','premium')
        self.assertEqual([e['title'] for e in avc],['10','2'])
        self.assertEqual([e['resumeKey'] for e in avc],[e['resumeKey'] for e in premium])

if __name__=='__main__': unittest.main()
