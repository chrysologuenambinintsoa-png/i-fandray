'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={sizeClasses[size]}>
      <motion.div
        className="w-full h-full border-4 border-green-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function DotsLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-green-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function PulseLoader() {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-4 h-4 bg-green-600 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function WaveLoader() {
  return (
    <div className="flex items-end justify-center space-x-1 h-12">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-2 bg-green-600 rounded-full"
          animate={{
            height: [10, 30, 10],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function BarLoader() {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-green-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

export function CircleLoader() {
  return (
    <div className="relative w-16 h-16">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-0 w-4 h-4 bg-green-600 rounded-full"
          animate={{
            x: [0, 32, 32, 0, 0],
            y: [0, 0, 32, 32, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex items-center space-x-3 mb-4">
        <SkeletonLoader className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <SkeletonLoader className="h-4 w-32 mb-2" />
          <SkeletonLoader className="h-3 w-24" />
        </div>
      </div>
      <SkeletonLoader className="h-4 w-full mb-2" />
      <SkeletonLoader className="h-4 w-3/4 mb-4" />
      <SkeletonLoader className="h-48 w-full rounded-lg" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonLoader className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <SkeletonLoader className="h-4 w-48 mb-2" />
            <SkeletonLoader className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TextShimmer({ text }: { text: string }) {
  return (
    <span className="relative overflow-hidden">
      <motion.span
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), transparent)',
          backgroundSize: '200% 100%',
        }}
        className="absolute inset-0"
      />
      {text}
    </span>
  );
}

export function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        onComplete,
      }}
      className="relative"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.2,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            delay: 0.4,
            duration: 0.5,
          }}
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

export function ErrorAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      className="relative"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.2,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 45 }}
          transition={{
            delay: 0.4,
            duration: 0.3,
          }}
          className="text-white"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}