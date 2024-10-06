import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FC } from 'react';

// Replace with your restaurant's coordinates
const restaurantCoords = {
    lat: 50.851561,  // Example latitude (London)
    lng: 4.369546,   // Example longitude (London)
};

// Fix default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Map: FC = () => {
    return (
        <MapContainer
            center={restaurantCoords}
            zoom={15}
            style={{ height: '400px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={restaurantCoords}>
                <Popup>
                    Restaurant Location
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;
