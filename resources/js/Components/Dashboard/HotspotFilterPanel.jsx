import { getFeatureId } from './dashboardHelpers';

export default function HotspotFilterPanel({
    filters,
    handleFilterChange,
    resetFilters,
    hasNonDefaultFilters,
    filteredFeatures,
    selectedHotspotId,
    setSelectedHotspotId,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
    formatNumber,
    formatStatus,
}) {
    return (
        <>
            <div className="panel-card">
                <div className="panel-heading-row">
                    <div>
                        <p className="panel-kicker">Filter Hotspot</p>
                        <h3>Refine tampilan peta</h3>
                    </div>
                    <button
                        type="button"
                        className="panel-action-link"
                        onClick={resetFilters}
                        disabled={!hasNonDefaultFilters}
                    >
                        Reset
                    </button>
                </div>

                <div className="filter-grid">
                    <label className="field-block">
                        <span>Priority</span>
                        <select
                            value={filters.priority}
                            onChange={(event) => handleFilterChange('priority', event.target.value)}
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field-block">
                        <span>Status</span>
                        <select
                            value={filters.validationStatus}
                            onChange={(event) =>
                                handleFilterChange('validationStatus', event.target.value)
                            }
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field-block">
                        <span>Tanggal deteksi dari</span>
                        <input
                            type="date"
                            value={filters.detectedFrom}
                            onChange={(event) => handleFilterChange('detectedFrom', event.target.value)}
                        />
                    </label>

                    <label className="field-block">
                        <span>Tanggal deteksi sampai</span>
                        <input
                            type="date"
                            value={filters.detectedTo}
                            onChange={(event) => handleFilterChange('detectedTo', event.target.value)}
                        />
                    </label>

                    <label className="field-block">
                        <span>Luas minimum (ha)</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={filters.areaMin}
                            onChange={(event) => handleFilterChange('areaMin', event.target.value)}
                            placeholder="0.50"
                        />
                    </label>

                    <label className="field-block">
                        <span>Luas maksimum (ha)</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={filters.areaMax}
                            onChange={(event) => handleFilterChange('areaMax', event.target.value)}
                            placeholder="5.00"
                        />
                    </label>
                </div>
            </div>

            <div className="panel-card">
                <div className="panel-heading-row">
                    <div>
                        <p className="panel-kicker">Hotspot Terfilter</p>
                        <h3>{filteredFeatures.length} hotspot terlihat</h3>
                    </div>
                    <span className="panel-caption">Klik item untuk sinkron ke peta</span>
                </div>

                <ul className="hotspot-list">
                    {filteredFeatures.length === 0 ? (
                        <li className="hotspot-list-empty">
                            Tidak ada hotspot yang cocok dengan filter saat ini.
                        </li>
                    ) : (
                        filteredFeatures.map((feature) => {
                            const properties = feature.properties ?? {};
                            const isSelected =
                                String(getFeatureId(feature)) === String(selectedHotspotId);

                            return (
                                <li key={properties.id ?? properties.hotspot_code}>
                                    <button
                                        type="button"
                                        className={`hotspot-list-item ${isSelected ? 'is-selected' : ''}`}
                                        onClick={() => setSelectedHotspotId(getFeatureId(feature))}
                                    >
                                        <div>
                                            <strong>{properties.hotspot_code ?? 'Tanpa kode'}</strong>
                                            <span>
                                                {formatStatus(properties.validation_status)} - {properties.priority ?? '-'}
                                            </span>
                                        </div>
                                        <small>
                                            {properties.area_ha != null
                                                ? `${formatNumber(properties.area_ha, 2)} ha`
                                                : 'Tanpa luas'}
                                        </small>
                                    </button>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </>
    );
}
