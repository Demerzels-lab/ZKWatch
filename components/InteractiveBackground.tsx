'use client';

import React, { useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const BACKGROUND_COLOR = '#050505'; // Matches --color-background
const GLOW_COLORS = [
  'rgba(1, 244, 212, 0.4)',  // Primary (Green-Cyan)
  'rgba(0, 250, 244, 0.3)',  // Primary Light (Cyan)
  'rgba(0, 212, 180, 0.25)', // Primary Dark (Teal)
];

const ORB_COUNT = 6;
const CONNECTION_DISTANCE = 200; // Distance to connect mouse to orbs

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const orbsRef = useRef<Orb[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Initialize Orbs
    const initOrbs = () => {
      orbsRef.current = [];
      for (let i = 0; i < ORB_COUNT; i++) {
        orbsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5, // Slow horizontal movement
          vy: (Math.random() - 0.5) * 0.5, // Slow vertical movement
          radius: Math.random() * 300 + 200, // Very large radius for soft glow
          color: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
        });
      }
    };

    // Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Re-init if empty (first load)
      if (orbsRef.current.length === 0) {
        initOrbs();
      }
    };

    // Mouse Move Handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Animation Loop
    const animate = () => {
      // 1. Clear background
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, width, height);

      // 2. Update and Draw Orbs (The Glowing Layers)
      // Use 'screen' blending to make overlapping glows brighter
      ctx.globalCompositeOperation = 'screen'; 

      orbsRef.current.forEach((orb) => {
        // Move
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off walls (soft bounce)
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        // Draw Soft Glow
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw "Tracking Grid" (The Tech Layer)
      // Only drawn near the mouse to represent "active monitoring"
      ctx.globalCompositeOperation = 'source-over';
      const { x: mx, y: my } = mouseRef.current;

      // Draw subtle connections from mouse to center of nearby glow orbs
      // This represents the "AI Agent" analyzing the data
      ctx.lineWidth = 1;
      
      orbsRef.current.forEach((orb) => {
        const dx = orb.x - mx;
        const dy = orb.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 600) { // Large detection range
          // Opacity based on distance
          const opacity = 1 - (dist / 600);
          
          ctx.strokeStyle = `rgba(1, 244, 212, ${opacity * 0.2})`; // Brand Primary Color
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(orb.x, orb.y);
          ctx.stroke();
        }
      });

      // 4. Subtle Noise Overlay (Optional - adds texture to the dark deep)
      // (Skipped for performance, but can be added if you want a 'film grain' look)

      animationFrameId = requestAnimationFrame(animate);
    };

    // Setup
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    initOrbs();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none bg-[#050505]"
      aria-hidden="true"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-80" 
      />
      
      {/* Optional: CSS Gradient Overlay to ensure text readability at the top */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]/80 mix-blend-multiply" />
    </div>
  );
}