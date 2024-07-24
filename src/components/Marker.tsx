import React from 'react';
import { Marker } from '@react-google-maps/api';

interface MarkerProps {
  id: string;
  position: { lat: number; lng: number };
  description?: string;
  updateMarker: (id: string, position: { lat: number; lng: number }) => void;
  deleteMarker: (id: string) => void;
  clusterer: any;
}

const MarkerComponent: React.FC<MarkerProps> = ({ id, position, description, updateMarker, deleteMarker, clusterer }) => {
  const onMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      updateMarker(id, newPosition);
    }
  };

  return (
    <Marker
      position={position}
      label={description}
      draggable={true}
      onDragEnd={onMarkerDragEnd}
      onClick={() => deleteMarker(id)}
      clusterer={clusterer}
    />
  );
};

export default MarkerComponent;
