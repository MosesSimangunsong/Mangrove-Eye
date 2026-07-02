import L from 'leaflet';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

const PRIORITY_COLORS = {
    high: '#c2410c',
    medium: '#d97706',
    low: '#0f766e',
};

function FitToPublicHotspots({ hotspotCollection, fitNonce }) {
    const map = useMap();

    useEffect(() => {
        if (!hotspotCollection?.features?.length) {
            return;
        }

        const bounds = L.geoJSON(hotspotCollection).getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [32, 32] });
        }
    }, [fitNonce, hotspotCollection, map]);

    return null;
}

export default function PublicHotspotMap({ hotspotCollection, fitNonce = 0 }) {
    const features = hotspotCollection?.features ?? [];

    return (
        <div className="webgis-map-shell">
            <MapContainer
                center={[-2.5489, 118.0149]}
                zoom={5}
                scrollWheelZoom
                className="h-full w-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitToPublicHotspots hotspotCollection={hotspotCollection} fitNonce={fitNonce} />

                {features.map((feature) => {
                    const coordinates = feature.geometry?.coordinates;

                    if (!Array.isArray(coordinates) || coordinates.length < 2) {
                        return null;
                    }

                    const properties = feature.properties ?? {};
                    const color = PRIORITY_COLORS[properties.priority] ?? PRIORITY_COLORS.medium;

                    return (
                        <CircleMarker
                            key={properties.hotspot_code ?? `${coordinates[0]}-${coordinates[1]}`}
                            center={[coordinates[1], coordinates[0]]}
                            radius={8}
                            pathOptions={{
                                color,
                                fillColor: color,
                                fillOpacity: 0.45,
                                weight: 2,
                            }}
                        >
                            <Popup>
                                <div className="popup-card">
                                    <p className="popup-kicker">Hotspot Publik</p>
                                    <h3>{properties.hotspot_code ?? 'Tanpa kode'}</h3>
                                    <div className="popup-grid">
                                        <div>
                                            <span>Prioritas</span>
                                            <strong>{properties.priority ?? '-'}</strong>
                                        </div>
                                        <div>
                                            <span>Status</span>
                                            <strong>{properties.validation_status ?? '-'}</strong>
                                        </div>
                                        <div>
                                            <span>Area</span>
                                            <strong>
                                                {properties.area_ha != null
                                                    ? `${Number(properties.area_ha).toFixed(2)} ha`
                                                    : '-'}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Detected</span>
                                            <strong>{properties.detected_at ?? '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
