import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

type MapEffectProps = {
  activeStore: string;
  storeLocations: {
    id: string;
    name: string;
    phoneNumber: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }[];
};

const MapEffect = ({ activeStore, storeLocations }: MapEffectProps) => {
  const map = useMap();

  useEffect(() => {
    if (!activeStore || !map) {
      return;
    }

    const { location } = storeLocations.find(({ id }) => id === activeStore);

    map.setView([location.latitude, location.longitude], 14);
  }, [activeStore, storeLocations, map]);

  return null;
};
export default MapEffect;
