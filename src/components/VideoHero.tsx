import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 121;
const frameSrc = (i: number) => `/vault-frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;

interface VideoHeroProps {
  onOpenModal: (title: string, content: React.ReactNode) => void;
  StatementAnalysisForm: React.ComponentType;
}

const VideoHero: React.FC<VideoHeroProps> = ({ onOpenModal, StatementAnalysisForm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const frames: HTMLImageElement[] = [];
    let loadedCount = 0;
    let lastPaintedFrame = -1;
    const currentFrame = { value: 0 };
    let scrollTriggerInstance: ScrollTrigger | null = null;

    function sizeCanvas() {
      if (frames[0]?.naturalWidth) {
        canvas!.width = frames[0].naturalWidth;
        canvas!.height = frames[0].naturalHeight;
      }
    }

    function paintFrame(index: number) {
      const idx = Math.min(Math.max(Math.round(index), 0), FRAME_COUNT - 1);
      if (idx === lastPaintedFrame) return;
      lastPaintedFrame = idx;
      const img = frames[idx];
      if (img?.complete) {
        ctx!.drawImage(img, 0, 0, canvas!.width, canvas!.height);
      }
    }

    function initCanvasScroll() {
      sizeCanvas();
      paintFrame(0);

      // Hide the loader
      const loader = document.querySelector('.video-hero-loader') as HTMLElement;
      if (loader) loader.style.display = 'none';

      // Kill any existing ScrollTriggers on this wrapper
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === document.querySelector('.video-hero-wrapper')) {
          st.kill();
        }
      });

      // Set initial states explicitly
      gsap.set('.vault-text-before', { opacity: 1, visibility: 'visible', y: 0 });
      gsap.set('.vault-text-after', { opacity: 0, visibility: 'hidden', y: 40 });
      gsap.set('.vault-scrim', { opacity: 0, visibility: 'hidden' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.video-hero-wrapper',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            // Debug: uncomment to see progress
            // console.log('ScrollTrigger progress:', self.progress.toFixed(3));
          }
        },
      });

      scrollTriggerInstance = tl.scrollTrigger!;

      // ▸ Frame scrub across entire timeline (0→100%)
      tl.to(currentFrame, {
        value: FRAME_COUNT - 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => paintFrame(currentFrame.value),
      }, 0);

      // ▸ Subtle parallax zoom
      tl.to(canvas, {
        scale: 1.05,
        duration: 1,
        ease: 'none',
      }, 0);

      // ▸ BEFORE text: visible 0→15%, then fade out from 15→30%
      // The 'before' text starts fully visible (set above).
      // At 15% scroll progress, it starts fading out over 15% of the timeline.
      tl.to('.vault-text-before', {
        opacity: 0,
        visibility: 'hidden',
        y: -60,
        duration: 0.15,      // 15% of timeline
        ease: 'power2.in',
      }, 0.15);               // starts at 15%

      // ▸ Dark scrim: fade in from 55→75%
      tl.to('.vault-scrim', {
        opacity: 1,
        visibility: 'visible',
        duration: 0.20,
        ease: 'power2.out',
      }, 0.55);

      // ▸ AFTER text: fade in from 60→82%
      tl.to('.vault-text-after', {
        opacity: 1,
        visibility: 'visible',
        y: 0,
        duration: 0.22,
        ease: 'power2.out',
      }, 0.60);
    }

    // Preload all frames
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      img.onload = () => {
        loadedCount++;
        const fill = document.querySelector('.video-hero-loader-fill') as HTMLElement;
        const text = document.querySelector('.video-hero-loader-text') as HTMLElement;
        if (fill) fill.style.width = `${Math.round(loadedCount / FRAME_COUNT * 100)}%`;
        if (text) text.textContent = `Loading... ${Math.round(loadedCount / FRAME_COUNT * 100)}%`;
        if (loadedCount === FRAME_COUNT) initCanvasScroll();
      };
      frames.push(img);
    }

    // Paint first frame as soon as it loads
    frames[0].onload = function () {
      sizeCanvas();
      paintFrame(0);
      loadedCount++;
      const fill = document.querySelector('.video-hero-loader-fill') as HTMLElement;
      if (fill) fill.style.width = `${Math.round(loadedCount / FRAME_COUNT * 100)}%`;
      if (loadedCount === FRAME_COUNT) initCanvasScroll();
    };

    const handleResize = () => {
      sizeCanvas();
      lastPaintedFrame = -1;
      paintFrame(Math.round(currentFrame.value));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
    };
  }, []);

  const handleCTAClick = () => {
    onOpenModal("Get Your Free Savings Analysis", <StatementAnalysisForm />);
  };

  return (
    <section className="video-hero-wrapper">
      <div className="video-hero-container">

        {/* Loading */}
        <div className="video-hero-loader">
          <div className="video-hero-loader-bar">
            <div className="video-hero-loader-fill" style={{ width: '0%' }} />
          </div>
          <span className="video-hero-loader-text">Loading... 0%</span>
        </div>

        <canvas ref={canvasRef} id="vault-canvas" />

        {/* Dark scrim that fades in with the after text for readability */}
        <div className="vault-scrim" />

        <div className="video-hero-gradient-bottom" />

        {/* Before text — starts visible */}
        <div className="vault-overlay-text vault-text-before">
          <h1>
            Your Vault Is Empty.
            <br />
            <span className="vault-accent">Your Processor Did That.</span>
          </h1>
          <p>Hidden fees. Inflated rates. Revenue you'll never see again.</p>
        </div>

        {/* After text — starts hidden */}
        <div className="vault-overlay-text vault-text-after">
          <h2>
            Now Imagine Keeping
            <br />
            <span className="vault-accent">Every Dollar.</span>
          </h2>
          <p>We eliminate your processing fees. You keep 100% of your revenue.</p>
          <button onClick={handleCTAClick} className="vault-cta">
            Get Your Free Savings Analysis
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;
