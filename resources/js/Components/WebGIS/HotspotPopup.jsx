function formatStatus(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

function formatNumber(value, digits = 2) {
    if (value == null) {
        return '-';
    }

    return Number(value).toFixed(digits);
}

export default function HotspotPopup({ feature }) {
    const properties = feature?.properties ?? {};

    return (
        <div className="popup-card">
            <div>
                <p className="popup-kicker">Hotspot</p>
                <h3>{properties.hotspot_code ?? 'Tanpa kode'}</h3>
            </div>

            <div className="popup-grid">
                <div>
                    <span>Prioritas</span>
                    <strong>{properties.priority ?? '-'}</strong>
                </div>
                <div>
                    <span>Status</span>
                    <strong>{formatStatus(properties.validation_status)}</strong>
                </div>
                <div>
                    <span>Area</span>
                    <strong>
                        {properties.area_ha != null
                            ? `${formatNumber(properties.area_ha, 2)} ha`
                            : '-'}
                    </strong>
                </div>
                <div>
                    <span>Detected</span>
                    <strong>{properties.detected_at ?? '-'}</strong>
                </div>
                <div>
                    <span>Delta MVI</span>
                    <strong>{formatNumber(properties.mvi_delta, 3)}</strong>
                </div>
                <div>
                    <span>Delta CMRI</span>
                    <strong>{formatNumber(properties.cmri_delta, 3)}</strong>
                </div>
            </div>
        </div>
    );
}
