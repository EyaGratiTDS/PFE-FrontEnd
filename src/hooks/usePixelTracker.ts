import { useEffect, useRef } from 'react';
import { pixelService } from '../services/api';
import { PixelEventParams } from '../services/Pixel';

const usePixelTracker = (pixelId: string | null, active: boolean) => {
  const scrollDepth = useRef<number>(0);
  const mouseMoveTracker = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  const trackEvent = (params: PixelEventParams) => {
    if (!active || !pixelId) return;
    pixelService.trackEvent(pixelId, params);
  };

  const trackScroll = () => {
    const scrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = Math.floor((scrollPosition / documentHeight) * 100);
    
    if (scrollPercentage > scrollDepth.current) {
      scrollDepth.current = scrollPercentage;
      trackEvent({ 
        eventType: 'scroll', 
        metadata: { depth: scrollPercentage } 
      });
    }
  };

  const trackMouseMove = (e: MouseEvent) => {
    if (mouseMoveTracker.current) clearTimeout(mouseMoveTracker.current);
    
    mouseMoveTracker.current = setTimeout(() => {
      trackEvent({ 
        eventType: 'mouse_move',
        metadata: { 
          x: e.clientX, 
          y: e.clientY 
        }
      });
    }, 1000);
  };

  const startHeartbeat = () => {
    heartbeatTimer.current = setInterval(() => {
      trackEvent({ eventType: 'heartbeat' });
    }, 30000);
  };

  useEffect(() => {
    if (!active || !pixelId) return;

    trackEvent({ eventType: 'view' });
    startHeartbeat();

    window.addEventListener('scroll', trackScroll);
    document.addEventListener('mousemove', trackMouseMove);

    return () => {
      window.removeEventListener('scroll', trackScroll);
      document.removeEventListener('mousemove', trackMouseMove);
      
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
      }
    };
  }, [active, pixelId]);

  return { trackEvent };
};

export default usePixelTracker;