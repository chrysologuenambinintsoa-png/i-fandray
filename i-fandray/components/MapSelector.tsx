import { useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div>Loading map...</div>,
}) as React.ComponentType<{ position: [number, number]; onPositionChange: (pos: [number, number]) => void; onClose: () => void }>;

export default function MapSelector({ position, onPositionChange, onClose }: { position: [number, number], onPositionChange: (pos: [number, number]) => void, onClose: () => void }) {
  return (
    <div className="mt-2">
      <MapComponent position={position} onPositionChange={onPositionChange} onClose={onClose} />
      <p className="text-sm text-gray-500 mt-1">Click on the map to select location</p>
    </div>
  );
}