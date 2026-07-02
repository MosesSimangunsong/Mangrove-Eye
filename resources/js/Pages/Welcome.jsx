import PublicHotspotMap from '@/Components/WebGIS/PublicHotspotMap';
import {
    fetchPublicDashboardSummary,
    fetchPublicHotspots,
} from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua status' },
    { value: 'detected', label: 'Detected' },
    { value: 'under_review', label: 'Under review' },
    { value: 'validated', label: 'Validated' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'needs_recheck', label: 'Needs recheck' },
];

const PRIORITY_OPTIONS = [
    { value: 'all', label: 'Semua prioritas' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

function formatNumber(value, digits = 2) {
    if (value == null || value === '') {
        return '-';
    }

    return Number(value).toFixed(digits);
}

export default function Welcome({ auth, canLogin, canRegister }) {
    const [summary, setSummary] = useState(null);
    const [hotspots, setHotspots] = useState({ type: 'FeatureCollection', features: [] });
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
    });
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(true);
    const [error, setError] = useState('');
    const [fitNonce, setFitNonce] = useState(0);

    useEffect(() => {
        let active = true;

        async function loadSummary() {
            setLoading(true);
            setError('');

            try {
                const data = await fetchPublicDashboardSummary();

                if (active) {
                    setSummary(data);
                }
            } catch (loadError) {
                if (active) {
                    setError('Ringkasan publik belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadSummary();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadHotspots() {
            setMapLoading(true);
            setError('');

            try {
                const data = await fetchPublicHotspots(filters);

                if (active) {
                    setHotspots(data);
                    setFitNonce(Date.now());
                }
            } catch (loadError) {
                if (active) {
                    setHotspots({ type: 'FeatureCollection', features: [] });
                    setError('Hotspot publik belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setMapLoading(false);
                }
            }
        }

        loadHotspots();

        return () => {
            active = false;
        };
    }, [filters]);

    const visibleFeatures = hotspots.features ?? [];
    const visibleArea = useMemo(
        () =>
            visibleFeatures.reduce((total, feature) => {
                const area = Number(feature.properties?.area_ha ?? 0);

                return total + (Number.isNaN(area) ? 0 : area);
            }, 0),
        [visibleFeatures],
    );

    function setFilterValue(key, value) {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function resetFilters() {
        setFilters({
            status: 'all',
            priority: 'all',
        });
    }

    return (
        <>
            <Head title="Public Dashboard" />

            <div className="public-shell">
                <header className="public-topbar">
                    <Link href="/" className="brand-block">
                        <span className="brand-mark">ME</span>
                        <span>
                            <strong>MANGROVE-EYE</strong>
                            <small>Public dashboard</small>
                        </span>
                    </Link>

                    <nav className="public-nav">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="nav-chip is-active">
                                Dashboard Internal
                            </Link>
                        ) : (
                            <>
                                {canLogin ? (
                                    <Link href={route('login')} className="nav-chip">
                                        Log in
                                    </Link>
                                ) : null}
                                {canRegister ? (
                                    <Link href={route('register')} className="nav-chip">
                                        Register
                                    </Link>
                                ) : null}
                            </>
                        )}
                    </nav>
                </header>

                <section className="public-hero">
                    <div>
                        <p className="webgis-kicker">MANGROVE-EYE Public</p>
                        <h1>WebGIS Ringkas Indikasi Perubahan Mangrove</h1>
                        <p className="webgis-subtitle">
                            Tampilan publik hanya menampilkan hotspot yang telah digeneralisasi
                            untuk transparansi dasar tanpa membuka koordinat presisi atau data sensitif lapangan.
                        </p>
                    </div>
                    <div className="public-hero-note">
                        <strong>Status data</strong>
                        <p>{summary?.disclaimer ?? 'Data publik dimuat dengan prinsip kehati-hatian.'}</p>
                    </div>
                </section>

                <section className="metric-strip">
                    <div className="metric-tile metric-tile-teal">
                        <p>Total Hotspot Publik</p>
                        <strong>{loading ? '...' : summary?.total_hotspots ?? 0}</strong>
                        <small>Ringkasan seluruh hotspot yang tersedia untuk konsumsi publik.</small>
                    </div>
                    <div className="metric-tile metric-tile-ember">
                        <p>Area Estimasi</p>
                        <strong>
                            {loading
                                ? '...'
                                : `${formatNumber(summary?.total_estimated_area_ha, 2)} ha`}
                        </strong>
                        <small>Estimasi area berdasarkan dataset publik yang sudah disederhanakan.</small>
                    </div>
                    <div className="metric-tile">
                        <p>Validated</p>
                        <strong>{loading ? '...' : summary?.validated_hotspots ?? 0}</strong>
                        <small>Hotspot dengan hasil validasi lapangan yang sudah tercatat.</small>
                    </div>
                    <div className="metric-tile">
                        <p>Tampil di Peta</p>
                        <strong>{mapLoading ? '...' : visibleFeatures.length}</strong>
                        <small>
                            {mapLoading ? 'Memuat...' : `${formatNumber(visibleArea, 2)} ha setelah filter publik`}
                        </small>
                    </div>
                </section>

                <section className="public-layout">
                    <aside className="public-sidebar">
                        <div className="panel-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Filter Publik</p>
                                    <h3>Fokuskan tampilan hotspot</h3>
                                </div>
                                <button type="button" className="panel-action-link" onClick={resetFilters}>
                                    Reset
                                </button>
                            </div>

                            <div className="filter-grid">
                                <label className="field-block">
                                    <span>Status</span>
                                    <select
                                        value={filters.status}
                                        onChange={(event) => setFilterValue('status', event.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-block">
                                    <span>Prioritas</span>
                                    <select
                                        value={filters.priority}
                                        onChange={(event) => setFilterValue('priority', event.target.value)}
                                    >
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="panel-card">
                            <p className="panel-kicker">Catatan Publik</p>
                            <ul className="status-list">
                                <li>
                                    <span>Lokasi fokus</span>
                                    <strong>{summary?.location ?? 'Kwala Serapuh'}</strong>
                                </li>
                                <li>
                                    <span>Analisis terakhir</span>
                                    <strong>{summary?.last_analysis_date ?? '-'}</strong>
                                </li>
                                <li>
                                    <span>Perlu recheck</span>
                                    <strong>{summary?.needs_recheck_hotspots ?? 0}</strong>
                                </li>
                            </ul>
                            <p className="drawer-caption public-disclaimer">
                                Titik pada peta telah digeneralisasi. Dashboard publik tidak menampilkan
                                polygon detail, foto validasi, ataupun koordinat presisi.
                            </p>
                        </div>
                    </aside>

                    <div className="map-stage">
                        <div className="map-frame public-map-frame">
                            <PublicHotspotMap hotspotCollection={hotspots} fitNonce={fitNonce} />

                            <div className="map-toolbar">
                                <button
                                    type="button"
                                    className="map-toolbar-button"
                                    onClick={() => setFitNonce(Date.now())}
                                    disabled={visibleFeatures.length === 0}
                                >
                                    Fit to public hotspots
                                </button>
                            </div>

                            <div className="map-legend">
                                <strong>Legend Publik</strong>
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
                                <p className="legend-note">
                                    Hotspot publik adalah indikasi awal yang telah disederhanakan
                                    untuk keamanan data dan tidak menggantikan validasi lapangan.
                                </p>
                            </div>

                            {mapLoading ? (
                                <div className="map-overlay-state">Memuat hotspot publik...</div>
                            ) : null}

                            {!mapLoading && error ? (
                                <div className="map-overlay-state is-error">{error}</div>
                            ) : null}

                            {!mapLoading && !error && visibleFeatures.length === 0 ? (
                                <div className="map-overlay-state is-empty">
                                    Tidak ada hotspot publik yang cocok dengan filter saat ini.
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
