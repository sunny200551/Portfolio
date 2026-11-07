import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Eye, Calendar, ExternalLink, Film, Radio, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useContentData } from '../hooks/useContentData';
import { SOCIAL_LINKS } from '../data/socials';
import { steveVoice } from '../robot/steveVoice';


// Configurable monitor frame style as specified
const FRAME_STYLE: 'portfolio' | 'plain' = 'portfolio';

export const ContentSection: React.FC = () => {
  const { stats, items } = useContentData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'youtube' | 'reels' | 'shorts'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('newest');
  const [playheadProgress, setPlayheadProgress] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filter === 'youtube') {
      result = result.filter((i) => i.platform === 'youtube' && i.kind === 'video');
    } else if (filter === 'reels') {
      result = result.filter((i) => i.kind === 'reel');
    } else if (filter === 'shorts') {
      result = result.filter((i) => i.kind === 'short');
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return result;
  }, [items, filter, sortBy]);

  // Chronological clips for the video-editor timeline (oldest to newest)
  const timelineClips = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  }, [items]);

  // Active clip under playhead or selected
  const activeItem = useMemo(() => {
    if (selectedId) {
      const found = items.find((i) => i.id === selectedId);
      if (found) return found;
    }
    if (timelineClips.length > 0) {
      const index = Math.min(
        timelineClips.length - 1,
        Math.floor(playheadProgress * timelineClips.length)
      );
      return timelineClips[index];
    }
    return items[0] || null;
  }, [selectedId, playheadProgress, timelineClips, items]);

  // Scrubbing logic
  const handleScrub = (clientX: number) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPlayheadProgress(progress);
    setSelectedId(null);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    handleScrub(e.clientX);
    steveVoice.speak('content_scrub');
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isScrubbing) {
        handleScrub(e.clientX);
      }
    };
    const handlePointerUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbing]);

  // Keyboard navigation for playhead
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      setPlayheadProgress((prev) => Math.min(1, prev + 0.05));
    } else if (e.key === 'ArrowLeft') {
      setPlayheadProgress((prev) => Math.max(0, prev - 0.05));
    }
  };

  const formatViews = (count?: number) => {
    if (count === undefined || count === null) return '—';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };



  return (
    <section
      id="content"
      ref={sectionRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full bg-[#0A1128] text-white relative z-10 border-b-2 border-[#0A0A0A] overflow-hidden focus:outline-none"
    >
      <div className="py-16 md:py-24 lane-padded w-full max-w-[2200px] mx-auto">
        
        {/* Section Tag */}
        <div
          data-robot-anchor="content:heading"
          data-robot-offset-x="-50"
          data-robot-offset-y="-20"
          className="flex items-center gap-3 mb-8"
        >
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#FF5C00] text-black border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
            10 // CONTENT
          </span>
          <div className="h-0.5 flex-grow bg-white/20" />
          <span className="font-mono text-xs font-bold text-[#FF5C00] flex items-center gap-2">
            <Radio size={14} className="text-[#FF5C00] animate-pulse" />
            THE EDIT BAY
          </span>
        </div>

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FF0000] text-white font-mono text-[10px] font-black uppercase tracking-wider border border-white">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                REC
              </span>
              <span className="font-mono text-xs text-[#FF5C00] font-bold">
                TIMECODE 00:00:20:25 // SINCE 2025
              </span>
            </div>
            <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-white leading-none">
              CONTENT CREATOR & EDITOR
            </h2>
            <p className="font-mono text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed mt-3">
              Creating and editing videos and reels across YouTube and Instagram since 2025.
            </p>
          </div>

          {/* Social Channel Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Sunny Pasumarthi on YouTube"
              className="px-5 py-3 bg-[#FF0000] text-white font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Film size={15} />
              <span>YOUTUBE CHANNEL ↗</span>
            </a>
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Sunny Pasumarthi on Instagram"
              className="px-5 py-3 bg-[#E1306C] text-white font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Sparkles size={15} />
              <span>INSTAGRAM PROFILE ↗</span>
            </a>
          </div>
        </div>

        {/* Real Live Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6 bg-[#001D4A] border-3 border-[#0A0A0A] shadow-[6px_6px_0px_#FF5C00] mb-12">
          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#FF5C00]">
              {stats.videoCount ?? items.filter((i) => i.platform === 'youtube').length}
            </span>
            <span className="font-mono text-[11px] font-bold text-white/80 uppercase mt-1">
              YouTube Videos Published
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {stats.totalViews ? formatViews(stats.totalViews) : `${items.reduce((acc, i) => acc + (i.views || 0), 0)}+`}
            </span>
            <span className="font-mono text-[11px] font-bold text-white/80 uppercase mt-1">
              Total Views
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#FF5C00]">
              {stats.reelCount ?? 0}
            </span>
            <span className="font-mono text-[11px] font-bold text-white/80 uppercase mt-1">
              Instagram Reels
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              2025
            </span>
            <span className="font-mono text-[11px] font-bold text-white/80 uppercase mt-1">
              Creator Since
            </span>
          </div>
        </div>

        {/* PROGRAM MONITOR + VIDEO EDITOR TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          
          {/* Program Monitor (16:9 / 9:16) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#FF5C00] mb-2 uppercase">
              <span>● PROGRAM MONITOR [PREVIEW]</span>
              <span>1080p 60FPS</span>
            </div>

            {/* Monitor Chrome */}
            <div className="bg-[#050B17] border-3 border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A] overflow-hidden">
              {FRAME_STYLE === 'portfolio' && (
                <div className="h-9 bg-[#1E293B] border-b-2 border-[#0A0A0A] flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#0A0A0A]" />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#0A0A0A]" />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#0A0A0A]" />
                  </div>
                  <div className="font-mono text-[11px] text-white/70 truncate max-w-[280px]">
                    {activeItem?.url || 'https://youtube.com/@sunny-pasumarthi-21'}
                  </div>
                  <div className="w-8" />
                </div>
              )}

              {/* Monitor Screen Stage */}
              <div className="relative aspect-video bg-[#000000] flex items-center justify-center overflow-hidden group">
                {activeItem ? (
                  <>
                    <img
                      src={activeItem.thumbnail.src}
                      alt={activeItem.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                    {/* Bottom Info Bar inside Monitor */}
                    <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end gap-2 z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#FF5C00] text-black font-mono text-[10px] font-black uppercase">
                          {activeItem.kind.toUpperCase()}
                        </span>
                        {activeItem.views && (
                          <span className="px-2 py-0.5 bg-black/70 text-white font-mono text-[10px] font-bold flex items-center gap-1 border border-white/20">
                            <Eye size={12} />
                            {activeItem.views} views
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-black/70 text-white font-mono text-[10px] font-bold flex items-center gap-1 border border-white/20">
                          <Calendar size={12} />
                          {activeItem.publishedAt.slice(0, 10)}
                        </span>
                      </div>

                      <h3 className="font-display font-black text-lg sm:text-2xl text-white uppercase leading-tight line-clamp-2">
                        {activeItem.title}
                      </h3>

                      <a
                        href={activeItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start mt-2 px-6 py-2.5 bg-[#FF5C00] text-black font-mono text-xs font-black uppercase border-2 border-white shadow-[3px_3px_0px_white] hover:bg-white active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Play size={14} fill="currentColor" />
                        <span>WATCH ON {activeItem.platform.toUpperCase()} ↗</span>
                      </a>
                    </div>
                  </>
                ) : (
                  /* Loading test pattern */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-full h-12 flex mb-4 border border-white/20">
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-yellow-400" />
                      <div className="flex-1 bg-cyan-400" />
                      <div className="flex-1 bg-green-500" />
                      <div className="flex-1 bg-magenta-500" />
                      <div className="flex-1 bg-red-600" />
                      <div className="flex-1 bg-blue-700" />
                    </div>
                    <span className="font-mono text-xs font-bold text-white/70">
                      TEST PATTERN // LOADING EDIT BAY FEED...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Panel */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#FF5C00] uppercase">
              <span>● VIDEO TIMELINE</span>
              <span>SCRUB OR CLICK CLIP</span>
            </div>

            {/* Video-Editor Ruler & Playhead Track */}
            <div className="bg-[#050B17] border-3 border-[#0A0A0A] p-4 shadow-[6px_6px_0px_#0A0A0A] flex flex-col gap-3">
              
              {/* Ruler */}
              <div
                ref={timelineTrackRef}
                onPointerDown={handlePointerDown}
                className="h-7 bg-[#1E293B] border-2 border-[#0A0A0A] relative cursor-ew-resize select-none overflow-hidden flex items-center"
              >
                {/* Tick marks */}
                <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-40">
                  {['00:00', '00:15', '00:30', '00:45', '01:00'].map((tc) => (
                    <span key={tc} className="font-mono text-[9px] text-white">
                      {tc}
                    </span>
                  ))}
                </div>

                {/* Orange Playhead Needle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#FF5C00] shadow-[0_0_8px_#FF5C00] pointer-events-none z-30 transition-all duration-75"
                  style={{ left: `${playheadProgress * 100}%` }}
                >
                  <div className="w-3.5 h-3.5 bg-[#FF5C00] border border-white -ml-1.5 -mt-1 transform rotate-45" />
                </div>
              </div>

              {/* Track V1: YouTube Videos */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-black text-white/70 tracking-wider">
                  V1 // YOUTUBE VIDEOS
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {timelineClips
                    .filter((i) => i.kind === 'video')
                    .map((clip) => {
                      const isSelected = activeItem?.id === clip.id;
                      return (
                        <button
                          key={clip.id}
                          onClick={() => {
                            setSelectedId(clip.id);
                            steveVoice.speak('content_clip_click');
                          }}
                          className={`flex-shrink-0 w-44 p-2.5 text-left border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF5C00] text-black border-white shadow-[3px_3px_0px_white]'
                              : 'bg-[#1E293B] text-white border-[#0A0A0A] hover:bg-[#2A3B52]'
                          }`}
                        >
                          <span className="font-mono text-[10px] font-black block truncate">
                            {clip.title}
                          </span>
                          <span className="font-mono text-[9px] text-white/70 block mt-1">
                            {clip.publishedAt.slice(0, 10)} {clip.views ? `• ${clip.views}v` : ''}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Track V2: Reels & Shorts */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-black text-[#FF5C00] tracking-wider">
                  V2 // REELS & SHORTS
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {timelineClips
                    .filter((i) => i.kind === 'short' || i.kind === 'reel')
                    .map((clip) => {
                      const isSelected = activeItem?.id === clip.id;
                      return (
                        <button
                          key={clip.id}
                          onClick={() => {
                            setSelectedId(clip.id);
                            steveVoice.speak('content_clip_click');
                          }}
                          className={`flex-shrink-0 w-36 p-2 text-left border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF5C00] text-black border-white shadow-[3px_3px_0px_white]'
                              : 'bg-[#2D1B4E] text-white border-[#0A0A0A] hover:bg-[#3D256B]'
                          }`}
                        >
                          <span className="font-mono text-[10px] font-black block truncate">
                            {clip.title}
                          </span>
                          <span className="font-mono text-[9px] text-white/70 block mt-1">
                            {clip.publishedAt.slice(0, 10)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Track A1: Audio Waveform Aesthetic */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] font-black text-white/60 tracking-wider">
                  A1 // STEREO AUDIO MASTER
                </span>
                <div className="h-6 bg-[#001D4A] border border-[#0A0A0A] flex items-center gap-[2px] px-2 overflow-hidden" aria-hidden="true">
                  {[6, 14, 8, 20, 16, 10, 22, 18, 12, 24, 15, 8, 19, 12, 21, 9, 16, 11, 23, 14, 8, 18, 10, 22, 14, 7, 20, 16, 12, 19, 8, 15, 23, 11, 17, 9, 21].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#27C93F] opacity-75"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ARCHIVE MEDIA GRID & REEL CAROUSEL */}
        <div className="pt-8 border-t-2 border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
                MEDIA ARCHIVE & REELS
              </h3>
              <span className="font-mono text-xs text-white/70">
                Explore published videos and creator edits
              </span>
            </div>

            {/* Filter Tabs & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'youtube', 'shorts', 'reels'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1 font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] transition-all cursor-pointer ${
                    filter === t
                      ? 'bg-[#FF5C00] text-black shadow-[2px_2px_0px_white]'
                      : 'bg-[#1E293B] text-white hover:bg-[#2A3B52]'
                  }`}
                >
                  {t}
                </button>
              ))}
              
              <button
                onClick={() => setSortBy((prev) => (prev === 'newest' ? 'views' : 'newest'))}
                className="px-3 py-1 bg-white text-black font-mono text-xs font-bold uppercase border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#FF5C00] flex items-center gap-1.5 ml-2 cursor-pointer"
              >
                <SlidersHorizontal size={12} />
                <span>SORT: {sortBy.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Grid of Video Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#050B17] border-3 border-[#0A0A0A] shadow-[5px_5px_0px_#0A0A0A] hover:shadow-[7px_7px_0px_#FF5C00] hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Frame Chrome Header */}
                <div className="h-7 bg-[#1E293B] border-b-2 border-[#0A0A0A] flex items-center justify-between px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                    <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                    <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  </div>
                  <span className="font-mono text-[9px] text-[#FF5C00] font-bold uppercase">
                    {item.kind}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={item.thumbnail.src}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.views && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white font-mono text-[10px] font-bold border border-white/20 flex items-center gap-1">
                      <Eye size={11} />
                      {item.views}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                  <div>
                    <h4 className="font-display font-black text-sm text-white uppercase leading-snug line-clamp-2 group-hover:text-[#FF5C00] transition-colors">
                      {item.title}
                    </h4>
                    <span className="font-mono text-[10px] text-white/60 block mt-1">
                      {item.publishedAt.slice(0, 10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs font-bold text-[#FF5C00]">
                    <span>WATCH ON {item.platform.toUpperCase()}</span>
                    <ExternalLink size={13} />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Empty Instagram state if reels filtered but none yet */}
          {filter === 'reels' && filteredItems.length === 0 && (
            <div className="p-12 bg-[#050B17] border-3 border-[#0A0A0A] shadow-[6px_6px_0px_#FF5C00] text-center max-w-xl mx-auto my-8">
              <Sparkles size={32} className="text-[#FF5C00] mx-auto mb-3" />
              <h4 className="font-display font-black text-xl text-white uppercase">
                REELS LOADING SOON
              </h4>
              <p className="font-mono text-xs text-white/70 mt-2 max-w-md mx-auto">
                Instagram Reels synchronization is in progress. Connect or browse my official Instagram profile in the meantime.
              </p>
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 bg-[#E1306C] text-white font-mono text-xs font-bold uppercase border-2 border-white shadow-[3px_3px_0px_white] hover:bg-white hover:text-black transition-all"
              >
                <span>OPEN @{SOCIAL_LINKS.instagram.handle} ↗</span>
              </a>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ContentSection;
