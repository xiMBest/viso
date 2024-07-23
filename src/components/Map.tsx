import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './Map.css';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 49.842,
  lng: 24.031,
};

interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  description?: string;
}

const Map: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [newQuest, setNewQuest] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const q = query(collection(db, "quests"), orderBy("timestamp"));
        const querySnapshot = await getDocs(q);
        const markersData: MarkerData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          markersData.push({
            id: doc.id,
            position: data.location,
            description: data.description,
          });
        });
        setMarkers(markersData);
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };

    fetchMarkers();
  }, []);

  const onMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng && newQuest) {
      const newMarker = {
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        },
        description: newQuest,
      };

      try {
        const docRef = await addDoc(collection(db, "quests"), {
          location: newMarker.position,
          description: newMarker.description,
          timestamp: serverTimestamp(),
        });

        setMarkers((current) => [
          ...current,
          { id: docRef.id, position: newMarker.position, description: newMarker.description },
        ]);
        setNewQuest(null);
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    }
  }, [newQuest]);

  const onMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent, id: string) => {
    if (event.latLng) {
      const updatedPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      try {
        await updateDoc(doc(db, "quests", id), {
          location: updatedPosition,
        });

        setMarkers((current) =>
          current.map((marker) =>
            marker.id === id
              ? { ...marker, position: updatedPosition }
              : marker
          )
        );
      } catch (error) {
        console.error("Error updating marker:", error);
      }
    }
  }, []);

  const deleteMarker = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "quests", id));
      setMarkers((current) => current.filter((marker) => marker.id !== id));
    } catch (error) {
      console.error("Error deleting marker:", error);
    }
  }, []);

  const deleteAllMarkers = useCallback(async () => {
    try {
      const q = query(collection(db, "quests"));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setMarkers([]);
    } catch (error) {
      console.error("Error deleting all markers:", error);
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
      loadingElement={<div style={{ height: '100%' }}>Loading...</div>}
    >
      <div className="map-container">
        <div className="map-controls">
          <input
            type="text"
            placeholder="Enter quest description"
            value={newQuest || ''}
            onChange={(e) => setNewQuest(e.target.value)}
          />
          <button onClick={deleteAllMarkers}>Delete All Markers</button>
        </div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={onMapClick}
        >
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
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default Map;
