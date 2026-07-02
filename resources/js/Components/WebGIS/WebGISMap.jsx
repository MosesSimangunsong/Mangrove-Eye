import L from 'leaflet';
import { useEffect } from 'react';
import {
    GeoJSON,
    LayerGroup,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import HotspotPopup from './HotspotPopup';

const aoiStyle = {
    color: '#0f766e',
    weight: 2,
    opacity: 0.85,
    fillColor: '#2dd4bf',
    fillOpacity: 0.08,
    dashArray: '6 6',
};

const selectedHotspotStyle = {
    color: '#6b210a',
    weight: 3,
    opacity: 1,
    fillColor: '#fb923c',
    fillOpacity: 0.58,
};

const PRIORITY_COLORS = {
    high: {
        color: '#9a3412',
        fillColor: '#ea580c',
    },
    medium: {
        color: '#b45309',
        fillColor: '#f59e0b',
    },
    low: {
        color: '#0f766e',
        fillColor: '#14b8a6',
    },
};

function getFeatureId(feature) {
    return feature?.properties?.id ?? null;
}

function getHotspotStyle(feature, selectedFeature, layerVisibility) {
    const isSelected =
        layerVisibility.selected
        && String(getFeatureId(feature)) === String(getFeatureId(selectedFeature));

    if (isSelected) {
        return selectedHotspotStyle;
    }

    const priority = feature?.properties?.priority ?? 'medium';
    const palette = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.medium;

    return {
        color: palette.color,
        weight: 2,
        opacity: 0.9,
        fillColor: palette.fillColor,
        fillOpacity: 0.28,
    };
}

function createCentroidIcon(priority, isSelected) {
    return L.divIcon({
        className: 'hotspot-pin',
        html: `<span class="${isSelected ? 'is-selected' : ''}" data-priority="${priority ?? 'medium'}"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

function FitToData({ aoiGeometry, hotspotCollection, viewportMode }) {
    const map = useMap();

    useEffect(() => {
        const aoiBounds = aoiGeometry ? L.geoJSON(aoiGeometry).getBounds() : null;
        const hotspotBounds = hotspotCollection?.features?.length
            ? L.geoJSON(hotspotCollection).getBounds()
            : null;

        if (viewportMode?.mode === 'aoi') {
            if (aoiBounds?.isValid()) {
                map.fitBounds(aoiBounds, { padding: [32, 32] });
            }

            return;
        }

        if (viewportMode?.mode === 'hotspots') {
            if (hotspotBounds?.isValid()) {
                map.fitBounds(hotspotBounds, { padding: [32, 32] });
            }

            return;
        }

        const bounds = [];

        if (aoiBounds?.isValid()) {
            bounds.push(aoiBounds);
        }

        if (hotspotBounds?.isValid()) {
            bounds.push(hotspotBounds);
        }

        if (bounds.length === 0) {
            return;
        }

        const nextBounds = bounds[0];

        for (let index = 1; index < bounds.length; index += 1) {
            nextBounds.extend(bounds[index]);
        }

        map.fitBounds(nextBounds, { padding: [32, 32] });
    }, [aoiGeometry, hotspotCollection, map, viewportMode]);

    return null;
}

export default function WebGISMap({
    aoiGeometry,
    hotspotCollection,
    selectedFeature,
    onSelectFeature,
    layerVisibility,
    viewportMode,
}) {
    const hotspotFeatures = hotspotCollection?.features ?? [];

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

                <FitToData
                    aoiGeometry={aoiGeometry}
                    hotspotCollection={hotspotCollection}
                    viewportMode={viewportMode}
                />

                {layerVisibility.aoi && aoiGeometry ? (
                    <GeoJSON data={aoiGeometry} style={aoiStyle} />
                ) : null}

                {layerVisibility.polygons && hotspotFeatures.length > 0 ? (
                    <GeoJSON
                        data={hotspotCollection}
                        style={(feature) => getHotspotStyle(feature, selectedFeature, layerVisibility)}
                        onEachFeature={(feature, layer) => {
                            layer.on({
                                click: () => onSelectFeature?.(feature),
                            });

                            layer.bindPopup(
                                L.popup({ maxWidth: 320 }).setContent(
                                    `<div id="hotspot-popup-${feature.properties?.id ?? feature.properties?.hotspot_code ?? 'item'}"></div>`,
                                ),
                            );

                            layer.on('popupopen', () => {
                                const host = document.getElementById(
                                    `hotspot-popup-${feature.properties?.id ?? feature.properties?.hotspot_code ?? 'item'}`,
                                );

                                if (!host) {
                                    return;
                                }

                                import('react-dom/client').then(({ createRoot }) => {
                                    host.innerHTML = '';
                                    createRoot(host).render(<HotspotPopup feature={feature} />);
                                });
                            });
                        }}
                    />
                ) : null}

                {layerVisibility.selected && selectedFeature?.geometry ? (
                    <LayerGroup>
                        <GeoJSON data={selectedFeature} style={selectedHotspotStyle} />
                    </LayerGroup>
                ) : null}

                {layerVisibility.centroids && hotspotFeatures.length > 0 ? (
                    <LayerGroup>
                        {hotspotFeatures.map((feature) => {
                            const centroid = feature.properties?.centroid?.coordinates;

                            if (!centroid) {
                                return null;
                            }

                            const isSelected =
                                String(getFeatureId(feature)) === String(getFeatureId(selectedFeature));

                            return (
                                <Marker
                                    key={`centroid-${feature.properties?.id ?? feature.properties?.hotspot_code}`}
                                    position={[centroid[1], centroid[0]]}
                                    icon={createCentroidIcon(feature.properties?.priority, isSelected)}
                                    eventHandlers={{
                                        click: () => onSelectFeature?.(feature),
                                    }}
                                >
                                    <Popup>
                                        <HotspotPopup feature={feature} />
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </LayerGroup>
                ) : null}
            </MapContainer>
        </div>
    );
}
