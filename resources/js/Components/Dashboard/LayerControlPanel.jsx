export default function LayerControlPanel({
    layerVisibility,
    toggleLayer,
    layers,
}) {
    return (
        <div className="panel-card">
            <p className="panel-kicker">Layer Control</p>
            <div className="toggle-list">
                {Object.entries({
                    aoi: 'AOI layer',
                    polygons: 'Hotspot polygon',
                    centroids: 'Hotspot centroid',
                    selected: 'Selected highlight',
                    staticPlaceholder: 'Static map placeholder',
                }).map(([key, label]) => (
                    <label key={key} className="toggle-row">
                        <input
                            type="checkbox"
                            checked={layerVisibility[key]}
                            onChange={() => toggleLayer(key)}
                        />
                        <span>{label}</span>
                    </label>
                ))}
            </div>

            <div className="panel-divider" />

            <p className="panel-kicker">Metadata Layer</p>
            <ul className="layer-list">
                {layers.length === 0 ? (
                    <li>Belum ada metadata layer untuk analysis run ini.</li>
                ) : (
                    layers.map((layer) => (
                        <li key={layer.id}>
                            <strong>{layer.layer_name}</strong>
                            <span>{layer.layer_type} - {layer.storage_type}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
