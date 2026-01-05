import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ position, onPositionChange, onClose }: { position: [number, number], onPositionChange: (pos: [number, number]) => void, onClose: () => void }) {
  function LocationMarker() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
        onClose();
      },
    });
    return <Marker position={position}></Marker>;
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: '200px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
}