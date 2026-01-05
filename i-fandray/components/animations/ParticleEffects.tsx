'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (trigger) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
      const newParticles: Particle[] = [];

      for (let i = 0; i < 150; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setParticles(newParticles);

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        setParticles((prev) => {
          const updated = prev.map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
          }));

          updated.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          });

          const stillVisible = updated.filter((p) => p.y < canvas.height);
          return stillVisible.length > 0 ? stillVisible : [];
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [trigger]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

export function HeartBurst({ x, y, trigger }: { x: number; y: number; trigger: boolean }) {
  const [hearts, setHearts] = useState<Array<{ id: number; angle: number; distance: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newHearts = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i * 30) * (Math.PI / 180),
        distance: 0,
      }));
      setHearts(newHearts);

      const timer = setTimeout(() => setHearts([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const particleStyle = { left: x, top: y };

  return (
    // eslint-disable-next-line react/style-prop-object
    <div
      className="fixed pointer-events-none z-50"
      style={particleStyle}
    >
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            x: Math.cos(heart.angle) * 50,
            y: Math.sin(heart.angle) * 50,
            opacity: [1, 0],
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
          className="absolute"
        >
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function FloatingParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-green-500 opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function GlowEffect({ children, color = 'green' }: { children: React.ReactNode; color?: string }) {
  const colorClasses = {
    green: 'shadow-green-500/50',
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    red: 'shadow-red-500/50',
  };

  return (
    <motion.div
      className={`relative ${colorClasses[color as keyof typeof colorClasses] || colorClasses.green}`}
      animate={{
        boxShadow: [
          `0 0 20px ${color === 'green' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
          `0 0 40px ${color === 'green' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          `0 0 20px ${color === 'green' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function Ripple({ trigger }: { trigger: boolean }) {
  if (!trigger) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-green-500 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: 3,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            ease: 'easeOut',
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ))}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

export function Fireworks({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const newParticles = Array.from({ length: 100 }, (_, i) => {
        const angle = (i / 100) * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        return {
          id: i,
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });

      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            x: [0, particle.vx * 50],
            y: [0, particle.vy * 50],
            opacity: [1, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: 2,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}