import { FC, useMemo, useState } from "react";

import { LatLng, LatLngBounds, Map as LeafletMap, Icon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";

export const MapPage: FC = () => {
  const position = useMemo(() => new LatLng(37.79258, -122.403847), []);
  const navigate = useNavigate();

  const [bounds, setBounds] = useState<LatLngBounds>();
  const [entries, setEntries] = useState<
    { session_id: string; lat: number; long: number }[]
  >([]);

  const icon = useMemo(() => {
    return new Icon({
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
      iconRetinaUrl: "/marker-icon-2x.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  }, []);

  return (
    <MapContainer center={position} zoom={20}>
      <MapHandler
        onMove={(b) => {
          setBounds(b);
          const url = `/api/entries?northeast=${bounds?.getNorthEast().lat},${
            bounds?.getNorthEast().lng
          }&southwest=${bounds?.getSouthWest().lat},${
            bounds?.getSouthWest().lng
          }`;
          fetch(url)
            .then((response) => response.json())
            .then((entries) => setEntries(entries));
        }}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="/api/tiles/{s}/{z}/{x}/{y}"
      />
      {entries.map((entry) => (
        <Marker
          key={entry.session_id}
          position={[entry.lat, entry.long]}
          eventHandlers={{
            click: () => {
              console.log("marker clicked");
              navigate(`/viewer/${entry.session_id}`);
            },
          }}
          icon={icon}
        />
      ))}
    </MapContainer>
  );
};

const MapHandler: FC<{ onMove: (b: LatLngBounds) => void }> = ({ onMove }) => {
  const map = useMapEvents({
    moveend: (ev) => {
      console.log("map moved:", ev);
      const map = ev.target as LeafletMap;
      const bounds = map.getBounds();
      onMove(bounds);
    },
    click: () => {
      map.locate();
    },
    locationfound: (location) => {
      console.log("location found:", location);
    },
  });
  return null;
};
