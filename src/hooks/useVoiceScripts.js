import { useEffect, useState } from 'react';

export const useVoiceScripts = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Check if already loaded
        if (window.VoiceRecorder && window.VoicePlayer && window.WebRTCVoice) {
          console.log('✅ Voice scripts already loaded');
          setLoaded(true);
          return;
        }

        console.log('📦 Loading voice scripts...');

        // Load scripts sequentially
        await loadScript('/js/voice-recorder.js');
        await loadScript('/js/voice-player.js');
        await loadScript('/js/webrtc-voice.js');

        console.log('✅ All voice scripts loaded');
        setLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load voice scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return loaded;
};

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    // Check if already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      // Wait for existing script to load
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Load in order
    script.dataset.loaded = 'false';
    
    script.onload = () => {
      script.dataset.loaded = 'true';
      console.log('✅ Loaded:', src);
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load:', src);
      reject(new Error(`Failed to load ${src}`));
    };
    
    document.head.appendChild(script);
  });
};
