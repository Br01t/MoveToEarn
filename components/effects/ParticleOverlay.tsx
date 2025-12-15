import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  shape: 'square' | 'hex';
}

interface ParticleOverlayProps {
  events: { x: number, y: number, color: string }[];
}

const ParticleOverlay: React.FC<ParticleOverlayProps> = ({ events }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Add new particles when events change
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      const count = 30; // Particles per explosion
      
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.current.push({
          x: lastEvent.x,
          y: lastEvent.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: lastEvent.color,
          size: Math.random() * 4 + 2,
          shape: Math.random() > 0.5 ? 'square' : 'hex'
        });
      }
    }
  }, [events]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle resizing
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Target: Wallet in top right (approximate)
    const targetX = window.innerWidth - 100;
    const targetY = 40;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= 0.01;

        // Attraction to Wallet after initial burst
        if (p.life < 0.8) {
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            p.vx += dx * 0.05;
            p.vy += dy * 0.05;
        }

        // Render
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        
        if (p.shape === 'square') {
            ctx.fillRect(p.x, p.y, p.size, p.size);
        } else {
            // Simple Hexagon approximation
            ctx.beginPath();
            ctx.moveTo(p.x + p.size, p.y);
            ctx.lineTo(p.x + p.size/2, p.y + p.size);
            ctx.lineTo(p.x - p.size/2, p.y + p.size);
            ctx.lineTo(p.x - p.size, p.y);
            ctx.lineTo(p.x - p.size/2, p.y - p.size);
            ctx.lineTo(p.x + p.size/2, p.y - p.size);
            ctx.closePath();
            ctx.fill();
        }

        // Kill logic
        if (p.life <= 0 || (Math.abs(p.x - targetX) < 20 && Math.abs(p.y - targetY) < 20)) {
          particles.current.splice(i, 1);
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};

export default ParticleOverlay;