import React from 'react';
import { MarkerClusterer } from '@react-google-maps/api';
import { Marker } from '@react-google-maps/api';

interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  description?: string;
}

interface MarkerClusterProps {
  markers: MarkerData[];
  updateMarker: (id: string, position: { lat: number; lng: number }) => void;
  deleteMarker: (id: string) => void;
}

const MarkerClusterComponent: React.FC<MarkerClusterProps> = ({ markers, updateMarker, deleteMarker }) => {
  const onMarkerDragEnd = (event: google.maps.MapMouseEvent, id: string) => {
    if (event.latLng) {
      const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      updateMarker(id, newPosition);
    }
  };

  return (
    <MarkerClusterer>
      {clusterer => (
        <>
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              label={(markers.findIndex((m) => m.id === marker.id) + 1).toString()}
              clusterer={clusterer}
              draggable={true}
              onDragEnd={(event) => onMarkerDragEnd(event, marker.id)}
              onClick={() => deleteMarker(marker.id)}
              title={marker.description || ''}
            />
          ))}
        </>
      )}
    </MarkerClusterer>
  );
};

export default MarkerClusterComponent;
