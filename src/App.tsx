/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Palette, 
  Download, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  Lock, 
  X,
  CheckCircle2
} from 'lucide-react';

// --- Neon Comet Canvas Logic ---
interface NeonCometOptions {
  size?: number;
  lineWidth?: number;
  tail?: number;
  speed?: number;
  color?: string;
}

const drawNeonComet = (ctx: CanvasRenderingContext2D, S: number, opts: NeonCometOptions, t: number) => {
  const lw = opts.lineWidth || 7;
  const tail = opts.tail || 2.4;
  const color = opts.color || '#e53935';

  const hexRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgb = hexRgb(color);
  const rgb2 = { r: Math.min(rgb.r + 24, 255), g: rgb.g, b: Math.max(rgb.b - 18, 0) };

  const comet = (angle: number, cRgb: { r: number; g: number; b: number }, lww: number) => {
    const cx = S / 2;
    const cy = S / 2;
    const R = S * 0.43;
    
    for (let i = 90; i >= 0; i--) {
      const f = i / 90;
      const a = angle - f * tail;
      const al = Math.pow(1 - f, 1.4) * 0.95;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a, a + 0.032);
      ctx.strokeStyle = `rgba(${cRgb.r},${cRgb.g},${cRgb.b},${al})`;
      ctx.lineWidth = lww * (1 - f * 0.55);
      ctx.lineCap = 'butt';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, R, angle - 0.012, angle + 0.012);
    ctx.strokeStyle = `rgba(${cRgb.r},${cRgb.g},${cRgb.b},1)`;
    ctx.lineWidth = lww * 1.2;
    ctx.lineCap = 'round';
    ctx.shadowColor = `rgb(${cRgb.r},${cRgb.g},${cRgb.b})`;
    ctx.shadowBlur = Math.round(S * 0.12);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  comet(t, rgb, lw);
  comet(t + Math.PI + 1, rgb2, lw * 0.82);
};

const drawPulseRing = (ctx: CanvasRenderingContext2D, S: number, opts: NeonCometOptions, t: number) => {
  const cx = S / 2;
  const cy = S / 2;
  const color = opts.color || '#0066FF';
  const pulse = (Math.sin(t * 2) + 1) / 2;
  const R = S * (0.3 + pulse * 0.1);

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawShield = (ctx: CanvasRenderingContext2D, S: number, opts: NeonCometOptions, t: number) => {
  const color = opts.color || '#FF3B30';
  const cx = S / 2;
  const cy = S / 2;
  const w = S * 0.3;
  const h = S * 0.35;

  ctx.save();
  ctx.translate(cx, cy);
  
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.bezierCurveTo(w, -h, w, h/2, 0, h);
  ctx.bezierCurveTo(-w, h/2, -w, -h, 0, -h);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.stroke();
  
  const p = (Math.sin(t * 3) + 1) / 2;
  ctx.globalAlpha = p * 0.5;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
};

const drawAtom = (ctx: CanvasRenderingContext2D, S: number, opts: NeonCometOptions, t: number) => {
  const color = opts.color || '#0066FF';
  const cx = S / 2;
  const cy = S / 2;
  const rx = S * 0.35;
  const ry = S * 0.12;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    const ex = rx * Math.cos(t * 3);
    const ey = ry * Math.sin(t * 3);
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  
  ctx.restore();
  ctx.shadowBlur = 0;
};

const drawCyberPulse = (ctx: CanvasRenderingContext2D, S: number, opts: NeonCometOptions, t: number) => {
  const color = opts.color || '#FF3B30';
  const cx = S / 2;
  const cy = S / 2;

  for (let i = 0; i < 3; i++) {
    const pulse = (t * 2 + i * 0.8) % 2.4;
    const R = S * 0.1 + pulse * (S * 0.15);
    const opacity = Math.max(0, 1 - pulse / 2.4);
    
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color === '#FF3B30' ? '255,59,48' : '0,102,255'},${opacity})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10 * opacity;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const LoaderCanvas = ({ options, type = 'comet', className }: { options: NeonCometOptions; type?: string; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const S = options.size || 160;
    const spd = (options.speed || 2.8) / 100;
    let t = 0;
    let raf: number;

    const loop = () => {
      ctx.clearRect(0, 0, S, S);
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();

      switch (type) {
        case 'comet': drawNeonComet(ctx, S, options, t); break;
        case 'pulse': drawPulseRing(ctx, S, options, t); break;
        case 'shield': drawShield(ctx, S, options, t); break;
        case 'atom': drawAtom(ctx, S, options, t); break;
        case 'cyber': drawCyberPulse(ctx, S, options, t); break;
      }

      t += spd;
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [options, type]);

  return (
    <canvas 
      ref={canvasRef} 
      width={options.size} 
      height={options.size} 
      className={className}
    />
  );
};

const TypingText = ({ text, className }: { text: string; className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = text;
      
      if (!isDeleting) {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
        setSpeed(150);
        
        if (displayedText === fullText) {
          setSpeed(2000); // Wait at the end
          setIsDeleting(true);
        }
      } else {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
        setSpeed(75);
        
        if (displayedText === '') {
          setIsDeleting(false);
          setSpeed(500); // Wait before starting again
        }
      }
    };

    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[3px] h-[0.8em] bg-brand-blue ml-1 align-middle"
      />
    </span>
  );
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('comet');

  const openModal = (type: string) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen font-body selection:bg-brand-blue selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur-xl border-b border-[#E4E6E9] flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#111] rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 border-[2px] border-transparent border-t-brand-red border-r-brand-red rounded-full animate-spin-slow scale-75"></div>
          </div>
          <span className="font-display text-base font-extrabold tracking-tight">
            Loader<span className="text-brand-blue">Craft</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-[9px] font-bold tracking-widest uppercase bg-brand-blue text-white px-2 py-0.5 rounded-full">
            Beta
          </span>
          <a 
            href="#gallery" 
            className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-12 overflow-hidden bg-[#f7f8fa]">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #0066FF 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-brand-red/5 blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-brand-blue/5 blur-[80px] animate-pulse delay-1000"></div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-red/15 bg-brand-red/5 text-brand-red text-[9px] font-bold tracking-[0.2em] uppercase mt-12 mb-6">
            <span className="w-1 h-1 rounded-full bg-brand-red animate-pulse"></span>
            Free — No Login Required
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-5 text-[#111]">
            Craft Premium <br />
            <TypingText text="Website Loaders" className="text-brand-blue" /> <br />
            for Your Next Project
          </h1>

          <p className="text-sm md:text-base text-[#666] max-w-xl mx-auto leading-relaxed mb-10 font-medium">
            Elevate your user experience with high-performance, visually stunning loaders. 
            <span className="text-[#111]"> No coding required. Customize, preview, and deploy in seconds.</span>
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#aaa]">Scroll to Explore</span>
            <div className="relative w-px h-12 bg-[#eee] overflow-hidden">
              <motion.div 
                animate={{ y: [-48, 48] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-brand-blue to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 px-6 md:px-12 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-blue text-[9px] font-bold tracking-[0.3em] uppercase mb-3 block">
              🎨 Gallery
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
              Choose Your <span className="text-brand-red">Style</span>
            </h2>
            <p className="text-sm text-[#666] max-w-lg mx-auto">
              Fully customizable loaders. Adjust colors, size, and speed in real-time.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Neon Comet */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative bg-white border border-[#E4E6E9] rounded-2xl overflow-hidden transition-all hover:border-brand-blue hover:shadow-xl hover:shadow-brand-blue/5 cursor-pointer"
              onClick={() => openModal('comet')}
            >
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> Live
              </div>
              <div className="h-32 bg-[#111] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <LoaderCanvas options={{ size: 64, lineWidth: 3, speed: 3 }} type="comet" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold mb-1">Neon Comet</h3>
                <p className="text-[11px] text-[#666] mb-4 leading-relaxed line-clamp-2">
                  Premium neon glow effect with dual comet paths.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Logo', 'Neon'].map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F0F2F5] text-[#666] border border-[#E4E6E9]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs transition-all group-hover:bg-brand-blue/90">
                  Customize
                </button>
              </div>
            </motion.div>

            {/* Card 2 - Pulse Ring */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative bg-white border border-[#E4E6E9] rounded-2xl overflow-hidden transition-all hover:border-brand-blue hover:shadow-xl hover:shadow-brand-blue/5 cursor-pointer"
              onClick={() => openModal('pulse')}
            >
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> Live
              </div>
              <div className="h-32 bg-[#111] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <LoaderCanvas options={{ size: 64, lineWidth: 3, speed: 2, color: '#0066FF' }} type="pulse" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold mb-1">Pulse Ring</h3>
                <p className="text-[11px] text-[#666] mb-4 leading-relaxed line-clamp-2">
                  Rhythmic neon pulse effect for subtle loading.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Logo', 'Pulse'].map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F0F2F5] text-[#666] border border-[#E4E6E9]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs transition-all group-hover:bg-brand-blue/90">
                  Customize
                </button>
              </div>
            </motion.div>

            {/* Card 3 - Neon Shield */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative bg-white border border-[#E4E6E9] rounded-2xl overflow-hidden transition-all hover:border-brand-blue hover:shadow-xl hover:shadow-brand-blue/5 cursor-pointer"
              onClick={() => openModal('shield')}
            >
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> Live
              </div>
              <div className="h-32 bg-[#111] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <LoaderCanvas options={{ size: 64, lineWidth: 3, speed: 3, color: '#FF3B30' }} type="shield" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold mb-1">Neon Shield</h3>
                <p className="text-[11px] text-[#666] mb-4 leading-relaxed line-clamp-2">
                  Protective shield silhouette with neon glow.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Logo', 'Shield'].map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F0F2F5] text-[#666] border border-[#E4E6E9]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs transition-all group-hover:bg-brand-blue/90">
                  Customize
                </button>
              </div>
            </motion.div>

            {/* Card 4 - Atomic Orbit */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative bg-white border border-[#E4E6E9] rounded-2xl overflow-hidden transition-all hover:border-brand-blue hover:shadow-xl hover:shadow-brand-blue/5 cursor-pointer"
              onClick={() => openModal('atom')}
            >
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> Live
              </div>
              <div className="h-32 bg-[#111] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <LoaderCanvas options={{ size: 64, lineWidth: 2, speed: 3, color: '#0066FF' }} type="atom" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold mb-1">Atomic Orbit</h3>
                <p className="text-[11px] text-[#666] mb-4 leading-relaxed line-clamp-2">
                  Scientific atomic structure with neon paths.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Logo', 'Atom'].map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F0F2F5] text-[#666] border border-[#E4E6E9]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs transition-all group-hover:bg-brand-blue/90">
                  Customize
                </button>
              </div>
            </motion.div>

            {/* Card 5 - Cyber Pulse */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="group relative bg-white border border-[#E4E6E9] rounded-2xl overflow-hidden transition-all hover:border-brand-blue hover:shadow-xl hover:shadow-brand-blue/5 cursor-pointer"
              onClick={() => openModal('cyber')}
            >
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> Live
              </div>
              <div className="h-32 bg-[#111] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <LoaderCanvas options={{ size: 64, lineWidth: 2, speed: 2.5, color: '#FF3B30' }} type="cyber" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold mb-1">Cyber Pulse</h3>
                <p className="text-[11px] text-[#666] mb-4 leading-relaxed line-clamp-2">
                  Concentric neon rings with digital pulse.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Logo', 'Cyber'].map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#F0F2F5] text-[#666] border border-[#E4E6E9]">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs transition-all group-hover:bg-brand-blue/90">
                  Customize
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-12 px-6 md:px-12 bg-[#f7f8fa]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-brand-blue text-[9px] font-bold tracking-[0.3em] uppercase mb-3 block">
              📖 Process
            </span>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Simple 3-Step <span className="text-brand-red">Workflow</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: <Zap size={20} className="text-brand-red" />, title: 'Select', desc: 'Pick a design from our gallery.' },
              { step: '02', icon: <Palette size={20} className="text-brand-blue" />, title: 'Refine', desc: 'Adjust colors, size, and speed.' },
              { step: '03', icon: <Download size={20} className="text-green-500" />, title: 'Deploy', desc: 'Copy code or download files.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -3 }}
                className="bg-white p-8 rounded-2xl border border-[#E4E6E9] text-center"
              >
                <div className="w-10 h-10 bg-[#111] text-brand-red font-display text-base font-extrabold flex items-center justify-center rounded-xl mx-auto mb-5">
                  {item.step}
                </div>
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-display text-base font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-[#666] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-14 px-6 md:px-12 bg-white/90 backdrop-blur-xl border-t border-[#E4E6E9] flex items-center justify-between">
        <div className="font-display text-sm font-extrabold text-[#111]">
          Loader<span className="text-brand-red">Craft</span>
        </div>
        <div className="text-[#aaa] text-[10px] font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} — Premium UI Resources
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#000]/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-center shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              
              <h2 className="font-display text-2xl font-extrabold text-white mb-2 uppercase tracking-tight">
                {selectedType.replace('-', ' ')} Loader
              </h2>
              <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.2em] mb-10">
                Live Preview — High Performance Canvas
              </p>
              
              <div className="relative inline-flex items-center justify-center mb-10">
                <LoaderCanvas options={{ size: 220, lineWidth: 10, speed: 2.8 }} type={selectedType} className="rounded-full" />
                <div className="absolute w-36 h-36 bg-[#111] rounded-full flex items-center justify-center font-display font-extrabold text-2xl text-white tracking-tighter">
                  LOADING
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mb-10">
                {[0, 1, 2].map(i => (
                  <motion.span 
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-brand-red"
                  />
                ))}
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-5 rounded-2xl bg-brand-blue text-white font-bold text-sm uppercase tracking-widest hover:bg-brand-blue/90 transition-all"
              >
                Customize Design
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
