import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';

interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  description?: string;
}

const useMarkers = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'markers'), where('quest', '!=', ''));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const markersData: MarkerData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        position: doc.data().position,
        description: doc.data().description,
      }));
      setMarkers(markersData);
    });

    return () => unsubscribe();
  }, []);

  const addMarker = async (position: { lat: number; lng: number }, description: string) => {
    try {
      const docRef = await addDoc(collection(db, 'markers'), {
        position,
        description,
      });
      setMarkers((prevMarkers) => [...prevMarkers, { id: docRef.id, position, description }]);
    } catch (e) {
      console.error("Error adding marker: ", e);
    }
  };

  const updateMarker = async (id: string, position: { lat: number; lng: number }) => {
    try {
      const markerRef = doc(db, 'markers', id);
      await updateDoc(markerRef, {
        position,
      });
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker) =>
          marker.id === id ? { ...marker, position } : marker
        )
      );
    } catch (e) {
      console.error("Error updating marker: ", e);
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'markers', id));
      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));
    } catch (e) {
      console.error("Error deleting marker: ", e);
    }
  };

  const deleteAllMarkers = async () => {
    try {
      const q = query(collection(db, 'markers'), where('quest', '!=', ''));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setMarkers([]);
    } catch (e) {
      console.error("Error deleting all markers: ", e);
    }
  };

  return {
    markers,
    addMarker,
    updateMarker,
    deleteMarker,
    deleteAllMarkers,
  };
};

export default useMarkers;
