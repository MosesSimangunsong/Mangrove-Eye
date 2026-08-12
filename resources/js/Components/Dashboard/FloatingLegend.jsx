export default function FloatingLegend({ statusOptions }) {
    return (
        <div className="map-legend final">
            <strong>Legend</strong>
            <div className="legend-section">
                <span className="legend-label">Layer utama</span>
                <div className="legend-row">
                    <span className="legend-swatch layer-aoi" />
                    <span>AOI</span>
                </div>
                <div className="legend-row">
                    <span className="legend-swatch layer-selected" />
                    <span>Hotspot dipilih</span>
                </div>
            </div>
            <div className="legend-section">
                <span className="legend-label">Priority</span>
                <div className="legend-row">
                    <span className="legend-swatch priority-high-swatch" />
                    <span>High</span>
                </div>
                <div className="legend-row">
                    <span className="legend-swatch priority-medium-swatch" />
                    <span>Medium</span>
                </div>
                <div className="legend-row">
                    <span className="legend-swatch priority-low-swatch" />
                    <span>Low</span>
                </div>
            </div>
            <div className="legend-section">
                <span className="legend-label">Status</span>
                {statusOptions.filter(({ value }) => value !== 'all').map((option) => (
                    <div key={option.value} className="legend-row">
                        <span className={`legend-chip status-${option.value.replaceAll('_', '-')}`}>
                            {option.label}
                        </span>
                    </div>
                ))}
            </div>
            <p className="legend-note">
                Hotspot adalah indikasi awal perubahan tutupan mangrove,
                bukan vonis hukum atau kesimpulan akhir lapangan.
            </p>
        </div>
    );
}
