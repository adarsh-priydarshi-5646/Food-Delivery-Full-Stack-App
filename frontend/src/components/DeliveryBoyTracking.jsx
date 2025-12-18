import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
function DeliveryBoyTracking({ data }) {
  const deliveryBoyLat = data.deliveryBoyLocation.lat;
  const deliveryBoylon = data.deliveryBoyLocation.lon;
  const customerLat = data.customerLocation.lat;
  const customerlon = data.customerLocation.lon;

  const path = [
    [deliveryBoyLat, deliveryBoylon],
    [customerLat, customerlon],
  ];

  const center = [deliveryBoyLat, deliveryBoylon];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-md">
      <MapContainer className={"w-full h-full"} center={center} zoom={16}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[deliveryBoyLat, deliveryBoylon]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy</Popup>
        </Marker>
        <Marker position={[customerLat, customerlon]} icon={customerIcon}>
          <Popup>Customer Location</Popup>
        </Marker>

        <Polyline positions={path} color="blue" weight={4} />
      </MapContainer>
    </div>
  );
}

export default DeliveryBoyTracking;
