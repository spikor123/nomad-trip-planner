import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
// This is a common issue where the icon paths are broken by the build tool
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to auto-fit markers
const RecenterAutomatically = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

const TripMap = ({ originCoords, destinationCoords, originName, destinationName }) => {
  const points = [];
  if (originCoords) points.push(originCoords);
  if (destinationCoords) points.push(destinationCoords);

  if (points.length === 0) return null;

  return (
    <div className="map-container">
      <MapContainer 
        center={originCoords || destinationCoords} 
        zoom={6} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {originCoords && (
          <Marker position={originCoords}>
            <Popup>
              <strong>Origin:</strong> {originName}
            </Popup>
          </Marker>
        )}

        {destinationCoords && (
          <Marker position={destinationCoords}>
            <Popup>
              <strong>Destination:</strong> {destinationName}
            </Popup>
          </Marker>
        )}

        {originCoords && destinationCoords && (
          <Polyline 
            positions={[originCoords, destinationCoords]} 
            color="#ff5200" 
            weight={3} 
            dashArray="10, 10" 
          />
        )}

        <RecenterAutomatically points={points} />
      </MapContainer>
    </div>
  );
};

export default TripMap;
