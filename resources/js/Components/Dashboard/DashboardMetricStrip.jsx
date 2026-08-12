function MetricTile({ label, value, tone = 'default', caption = '' }) {
    return (
        <div className={`metric-tile metric-tile-${tone}`}>
            <p>{label}</p>
            <strong>{value}</strong>
            {caption ? <small>{caption}</small> : null}
        </div>
    );
}

export default function DashboardMetricStrip({
    filteredCount,
    allCount,
    visibleAreaTotal,
    validatedCount,
    highPriorityCount,
    formatNumber,
}) {
    return (
        <section className="metric-strip">
            <MetricTile
                label="Hotspot Tampil"
                value={filteredCount}
                tone="ember"
                caption={`Dari ${allCount} hotspot pada run aktif`}
            />
            <MetricTile
                label="Area Tampil"
                value={`${formatNumber(visibleAreaTotal, 2)} ha`}
                tone="teal"
                caption="Akumulasi area hotspot yang lolos filter"
            />
            <MetricTile
                label="Validated"
                value={validatedCount}
                caption="Jumlah hotspot berstatus validated"
            />
            <MetricTile
                label="High Priority"
                value={highPriorityCount}
                caption="Fokus recheck paling mendesak"
            />
        </section>
    );
}
