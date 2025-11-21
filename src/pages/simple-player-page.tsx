import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Artplayer from 'artplayer';
import Hls from 'hls.js';

function SimplePlayerPage() {
  const [searchParams] = useSearchParams();
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const url = searchParams.get('url');

  // 清理播放器实例
  const cleanupPlayer = () => {
    if (hlsRef.current) {
      hlsRef.current.stopLoad();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (playerRef.current) {
      const video = playerRef.current.video;
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
      playerRef.current?.destroy(); // ✅ 修复：可选链
      playerRef.current = null;
    }
  };

  useEffect(() => {
    if (url && artRef.current) {
      cleanupPlayer();

      const art = new Artplayer({
        container: artRef.current,
        url,
        setting: true,
        autoplay: true,
        pip: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        hotkey: true,
        playbackRate: true,
        lock: true,
        fastForward: true,
        theme: "#23ade5",
        customType: {
  m3u8(video, url, art) {
    if (Hls.isSupported()) {
      if ((art as any).hls) (art as any).hls.destroy();   // ✅ 修复
      const hls = new Hls();
      const proxyUrl = localStorage.getItem("m3u8ProxySelected");
      const finalUrl = proxyUrl ? `${proxyUrl}${url}` : url;
      hls.loadSource(finalUrl);
      hls.attachMedia(video);
      (art as any).hls = hls;                             // ✅ 断言
      art.on("destroy", () => hls.destroy());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const proxyUrl = localStorage.getItem("m3u8ProxySelected");
      video.src = proxyUrl ? `${proxyUrl}${url}` : url;
    } else {
      art.notice.show = "不支持的播放格式: m3u8";
    }
  },
}
      });

      playerRef.current = art;
      return () => cleanupPlayer();
    }
  }, [url]);

  useEffect(() => {
    return () => cleanupPlayer();
  }, []);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p>无效的视频地址</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b pt-16 pb-2 md:pb-8 pr-2 md:pr-8 pl-2 md:pl-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
          <div ref={artRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

export default SimplePlayerPage;
