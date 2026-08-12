export default function HotspotDetailDrawer({
    selectedFeatureProperties,
    selectedDetail,
    selectedRun,
    centroidCoordinates,
    detailLoading,
    detailError,
    selectedHotspotId,
    canExportReport,
    setReportModal,
    hotspotReports,
    reportMessage,
    reportError,
    reportLoading,
    validationMode,
    editableValidation,
    handleSubmitValidation,
    validationForm,
    handleValidationFormChange,
    VALIDATION_STATUS_OPTIONS,
    CONFIDENCE_OPTIONS,
    OBSERVED_CONDITION_OPTIONS,
    SENSITIVITY_OPTIONS,
    normalizeBoolean,
    locating,
    canValidateHotspot,
    handleUseBrowserLocation,
    submittingValidation,
    validationMessage,
    validationError,
    handlePhotoUpload,
    setPhotoFile,
    photoPreviewUrl,
    photoFile,
    photoForm,
    handlePhotoFormChange,
    canUploadPhoto,
    uploadingPhoto,
    photoMessage,
    photoError,
    allValidationPhotos,
    validationHistory,
    loading,
    allFeatures,
    formatStatus,
    formatLabel,
    formatNumber,
    formatDateTime,
}) {
    return (
        <aside className="right-drawer">
            <div className="drawer-card">
                <div className="panel-heading-row">
                    <div>
                        <p className="panel-kicker">Hotspot Detail</p>
                        <h2>{selectedFeatureProperties.hotspot_code ?? 'Belum dipilih'}</h2>
                    </div>
                    {selectedFeatureProperties.priority ? (
                        <span className={`priority-pill priority-pill-${selectedFeatureProperties.priority}`}>
                            {selectedFeatureProperties.priority}
                        </span>
                    ) : null}
                </div>

                <p className="drawer-muted">
                    Klik polygon atau centroid hotspot pada peta untuk melihat detail lebih lengkap dan memulai validasi.
                </p>

                {detailLoading ? <p className="drawer-inline-state">Memuat detail hotspot...</p> : null}
                {detailError ? <p className="error-banner">{detailError}</p> : null}

                <div className="drawer-grid">
                    <div>
                        <span>ID Hotspot</span>
                        <strong>{selectedDetail.id ?? selectedFeatureProperties.id ?? '-'}</strong>
                    </div>
                    <div>
                        <span>Status</span>
                        <strong>{formatStatus(selectedDetail.validation_status ?? selectedFeatureProperties.validation_status)}</strong>
                    </div>
                    <div>
                        <span>Luas</span>
                        <strong>
                            {selectedDetail.area_ha != null || selectedFeatureProperties.area_ha != null
                                ? `${formatNumber(selectedDetail.area_ha ?? selectedFeatureProperties.area_ha, 2)} ha`
                                : '-'}
                        </strong>
                    </div>
                    <div>
                        <span>Analysis Run</span>
                        <strong>{selectedDetail.analysis_run?.name ?? selectedRun?.name ?? '-'}</strong>
                    </div>
                    <div>
                        <span>Centroid Latitude</span>
                        <strong>{centroidCoordinates ? formatNumber(centroidCoordinates[1], 6) : '-'}</strong>
                    </div>
                    <div>
                        <span>Centroid Longitude</span>
                        <strong>{centroidCoordinates ? formatNumber(centroidCoordinates[0], 6) : '-'}</strong>
                    </div>
                    <div>
                        <span>Detected At</span>
                        <strong>{formatDateTime(selectedDetail.detected_at ?? selectedFeatureProperties.detected_at)}</strong>
                    </div>
                    <div>
                        <span>Created At</span>
                        <strong>{formatDateTime(selectedDetail.created_at)}</strong>
                    </div>
                    <div>
                        <span>MVI Before</span>
                        <strong>{formatNumber(selectedDetail.indices?.mvi_before, 3)}</strong>
                    </div>
                    <div>
                        <span>MVI After</span>
                        <strong>{formatNumber(selectedDetail.indices?.mvi_after, 3)}</strong>
                    </div>
                    <div>
                        <span>MVI Delta</span>
                        <strong>{formatNumber(selectedDetail.indices?.mvi_delta ?? selectedFeatureProperties.mvi_delta, 3)}</strong>
                    </div>
                    <div>
                        <span>CMRI Before</span>
                        <strong>{formatNumber(selectedDetail.indices?.cmri_before, 3)}</strong>
                    </div>
                    <div>
                        <span>CMRI After</span>
                        <strong>{formatNumber(selectedDetail.indices?.cmri_after, 3)}</strong>
                    </div>
                    <div>
                        <span>CMRI Delta</span>
                        <strong>{formatNumber(selectedDetail.indices?.cmri_delta ?? selectedFeatureProperties.cmri_delta, 3)}</strong>
                    </div>
                    <div>
                        <span>NDVI Delta</span>
                        <strong>{formatNumber(selectedDetail.indices?.ndvi_delta, 3)}</strong>
                    </div>
                    <div>
                        <span>NDWI Delta</span>
                        <strong>{formatNumber(selectedDetail.indices?.ndwi_delta, 3)}</strong>
                    </div>
                    <div>
                        <span>Hotspot Type</span>
                        <strong>{selectedDetail.properties?.hotspot_type ?? '-'}</strong>
                    </div>
                    <div>
                        <span>Detection Method</span>
                        <strong>{selectedDetail.properties?.detection_method ?? '-'}</strong>
                    </div>
                    <div>
                        <span>Source</span>
                        <strong>{selectedDetail.properties?.source ?? '-'}</strong>
                    </div>
                </div>

                {selectedHotspotId ? (
                    <div className="drawer-actions">
                        <a
                            href={route('hotspots.show', selectedHotspotId)}
                            className="secondary-button secondary-button-link"
                        >
                            Buka Halaman Detail
                        </a>
                    </div>
                ) : null}
            </div>

            <div className="drawer-card">
                <div className="panel-heading-row">
                    <div>
                        <p className="panel-kicker">Report Action</p>
                        <h3>Laporan PDF hotspot</h3>
                    </div>
                    <span className="panel-caption">
                        {canExportReport ? 'Internal only' : 'Perlu permission export_report'}
                    </span>
                </div>

                <p className="drawer-caption">
                    PDF ini bersifat indikasi awal untuk kebutuhan advokasi internal dan tetap membutuhkan verifikasi lanjutan.
                </p>

                <div className="drawer-actions">
                    <button
                        type="button"
                        className="secondary-button secondary-button-strong"
                        onClick={() => setReportModal({ open: true, type: 'hotspot' })}
                        disabled={!selectedHotspotId || !canExportReport}
                    >
                        Generate PDF Report
                    </button>
                    {hotspotReports[0]?.download_url ? (
                        <a
                            href={hotspotReports[0].download_url}
                            className="secondary-button secondary-button-link"
                        >
                            Download Latest Report
                        </a>
                    ) : null}
                </div>

                {!canExportReport ? (
                    <p className="drawer-caption">
                        Akun ini belum memiliki permission `export_report`.
                    </p>
                ) : null}
                {reportMessage ? <p className="success-banner">{reportMessage}</p> : null}
                {reportError ? <p className="error-banner">{reportError}</p> : null}

                {reportLoading ? (
                    <p className="drawer-inline-state">Memuat daftar report hotspot...</p>
                ) : hotspotReports.length ? (
                    <div className="report-list">
                        {hotspotReports.slice(0, 3).map((report) => (
                            <article key={report.id} className="report-list-item">
                                <div>
                                    <strong>{report.title}</strong>
                                    <span>
                                        {formatDateTime(report.generated_at)} - {report.report_code}
                                    </span>
                                </div>
                                <a href={report.download_url} className="report-download-link">
                                    Download PDF
                                </a>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="drawer-caption">Belum ada report hotspot yang dibuat.</p>
                )}
            </div>

            <div className="drawer-card">
                <div className="panel-heading-row">
                    <div>
                        <p className="panel-kicker">Field Validation</p>
                        <h3>{validationMode === 'update' ? 'Update validasi Anda' : 'Tambah validasi baru'}</h3>
                    </div>
                    <span className="panel-caption">
                        {editableValidation ? 'Draft Anda ditemukan' : 'Belum ada draft milik Anda'}
                    </span>
                </div>

                <form className="validation-form" onSubmit={handleSubmitValidation}>
                    <div className="filter-grid">
                        <label className="field-block">
                            <span>Status validasi</span>
                            <select
                                value={validationForm.validation_status}
                                onChange={(event) =>
                                    handleValidationFormChange('validation_status', event.target.value)
                                }
                            >
                                {VALIDATION_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field-block">
                            <span>Confidence</span>
                            <select
                                value={validationForm.confidence_level}
                                onChange={(event) =>
                                    handleValidationFormChange('confidence_level', event.target.value)
                                }
                            >
                                {CONFIDENCE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field-block">
                            <span>Observed condition</span>
                            <select
                                value={validationForm.observed_condition}
                                onChange={(event) =>
                                    handleValidationFormChange('observed_condition', event.target.value)
                                }
                            >
                                {OBSERVED_CONDITION_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field-block">
                            <span>Sensitivity</span>
                            <select
                                value={validationForm.sensitivity_level}
                                onChange={(event) =>
                                    handleValidationFormChange('sensitivity_level', event.target.value)
                                }
                            >
                                {SENSITIVITY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field-block">
                            <span>Visited at</span>
                            <input
                                type="datetime-local"
                                value={validationForm.visited_at}
                                onChange={(event) =>
                                    handleValidationFormChange('visited_at', event.target.value)
                                }
                            />
                        </label>

                        <label className="field-block field-checkbox">
                            <span>Geotag</span>
                            <input
                                type="checkbox"
                                checked={normalizeBoolean(validationForm.is_geotagged)}
                                onChange={(event) =>
                                    handleValidationFormChange('is_geotagged', event.target.checked)
                                }
                            />
                        </label>

                        <label className="field-block">
                            <span>Latitude validasi</span>
                            <input
                                type="number"
                                step="0.000001"
                                value={validationForm.photo_lat}
                                onChange={(event) =>
                                    handleValidationFormChange('photo_lat', event.target.value)
                                }
                                placeholder="4.012345"
                            />
                        </label>

                        <label className="field-block">
                            <span>Longitude validasi</span>
                            <input
                                type="number"
                                step="0.000001"
                                value={validationForm.photo_lng}
                                onChange={(event) =>
                                    handleValidationFormChange('photo_lng', event.target.value)
                                }
                                placeholder="98.456789"
                            />
                        </label>
                    </div>

                    <label className="field-block field-block-full">
                        <span>Catatan lapangan</span>
                        <textarea
                            rows="4"
                            value={validationForm.validation_note}
                            onChange={(event) =>
                                handleValidationFormChange('validation_note', event.target.value)
                            }
                            placeholder="Ringkasan temuan lapangan, kondisi lokasi, dan konteks tambahan."
                        />
                    </label>

                    <div className="drawer-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleUseBrowserLocation('validation')}
                            disabled={locating || !canValidateHotspot}
                        >
                            {locating ? 'Mengambil lokasi...' : 'Ambil Lokasi Browser'}
                        </button>
                        <button
                            type="submit"
                            className="secondary-button secondary-button-strong"
                            disabled={!selectedHotspotId || submittingValidation || !canValidateHotspot}
                        >
                            {submittingValidation
                                ? 'Menyimpan...'
                                : validationMode === 'update'
                                    ? 'Update Validasi'
                                    : 'Simpan Validasi'}
                        </button>
                    </div>

                    {!canValidateHotspot ? (
                        <p className="drawer-caption">
                            Akun ini belum memiliki permission `validate_hotspot`, jadi form hanya tampil sebagai referensi.
                        </p>
                    ) : null}
                    {validationMessage ? <p className="success-banner">{validationMessage}</p> : null}
                    {validationError ? <p className="error-banner">{validationError}</p> : null}
                </form>
            </div>

            <div className="drawer-card">
                <div className="panel-heading-row">
                    <div>
                        <p className="panel-kicker">Validation Photos</p>
                        <h3>Unggah bukti lapangan</h3>
                    </div>
                    <span className="panel-caption">
                        {canUploadPhoto ? 'Terkait validasi aktif' : 'Simpan validasi terlebih dahulu'}
                    </span>
                </div>

                <form className="validation-form" onSubmit={handlePhotoUpload}>
                    <label className="field-block field-block-full">
                        <span>Pilih foto</span>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                        />
                    </label>

                    {photoPreviewUrl ? (
                        <div className="photo-preview-card">
                            <img src={photoPreviewUrl} alt="Preview foto validasi" className="photo-preview-image" />
                            <small>{photoFile?.name}</small>
                        </div>
                    ) : null}

                    <div className="filter-grid">
                        <label className="field-block">
                            <span>Caption</span>
                            <input
                                type="text"
                                value={photoForm.caption}
                                onChange={(event) => handlePhotoFormChange('caption', event.target.value)}
                                placeholder="Contoh: bekas pembukaan lahan"
                            />
                        </label>

                        <label className="field-block">
                            <span>Taken at</span>
                            <input
                                type="datetime-local"
                                value={photoForm.taken_at}
                                onChange={(event) => handlePhotoFormChange('taken_at', event.target.value)}
                            />
                        </label>

                        <label className="field-block">
                            <span>Sensitivity</span>
                            <select
                                value={photoForm.sensitivity_level}
                                onChange={(event) =>
                                    handlePhotoFormChange('sensitivity_level', event.target.value)
                                }
                            >
                                {SENSITIVITY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field-block field-checkbox">
                            <span>Primary photo</span>
                            <input
                                type="checkbox"
                                checked={normalizeBoolean(photoForm.is_primary)}
                                onChange={(event) =>
                                    handlePhotoFormChange('is_primary', event.target.checked)
                                }
                            />
                        </label>

                        <label className="field-block">
                            <span>Photo latitude</span>
                            <input
                                type="number"
                                step="0.000001"
                                value={photoForm.photo_lat}
                                onChange={(event) => handlePhotoFormChange('photo_lat', event.target.value)}
                                placeholder="4.012345"
                            />
                        </label>

                        <label className="field-block">
                            <span>Photo longitude</span>
                            <input
                                type="number"
                                step="0.000001"
                                value={photoForm.photo_lng}
                                onChange={(event) => handlePhotoFormChange('photo_lng', event.target.value)}
                                placeholder="98.456789"
                            />
                        </label>
                    </div>

                    <div className="drawer-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleUseBrowserLocation('photo')}
                            disabled={locating || !canValidateHotspot}
                        >
                            {locating ? 'Mengambil lokasi...' : 'Gunakan Lokasi Browser'}
                        </button>
                        <button
                            type="submit"
                            className="secondary-button secondary-button-strong"
                            disabled={!canUploadPhoto || !photoFile || uploadingPhoto}
                        >
                            {uploadingPhoto ? 'Mengunggah...' : 'Upload Foto'}
                        </button>
                    </div>

                    {photoMessage ? <p className="success-banner">{photoMessage}</p> : null}
                    {photoError ? <p className="error-banner">{photoError}</p> : null}
                </form>

                {allValidationPhotos.length ? (
                    <div className="validation-photo-grid">
                        {allValidationPhotos.map((photo) => (
                            <article key={photo.id} className="validation-photo-item">
                                <img
                                    src={photo.file_url}
                                    alt={photo.caption || photo.original_filename}
                                    className="validation-photo-thumb"
                                />
                                <div className="validation-photo-meta">
                                    <strong>{photo.caption || photo.original_filename}</strong>
                                    <span>{formatDateTime(photo.taken_at || photo.created_at)}</span>
                                </div>
                                <small>
                                    {formatLabel(photo.validation_status)} - {photo.file_name} - {formatLabel(photo.sensitivity_level)}
                                </small>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="drawer-caption">Belum ada foto validasi yang tersimpan untuk hotspot ini.</p>
                )}
            </div>

            <div className="drawer-card">
                <p className="panel-kicker">Riwayat Validasi</p>
                {validationHistory.length === 0 ? (
                    <p className="drawer-muted">
                        Belum ada riwayat validasi yang tersedia untuk hotspot ini.
                    </p>
                ) : (
                    <ul className="validation-timeline">
                        {validationHistory.map((validation) => (
                            <li key={validation.id}>
                                <strong>{formatStatus(validation.validation_status)}</strong>
                                <span>
                                    {validation.validator?.name ?? 'Validator internal'} - {formatDateTime(validation.visited_at ?? validation.created_at)}
                                </span>
                                <p>{validation.validation_note ?? 'Belum ada catatan validasi.'}</p>
                                <small className="timeline-meta">
                                    {validation.observed_condition
                                        ? `${formatLabel(validation.observed_condition)} - `
                                        : ''}
                                    {validation.confidence_level
                                        ? `Confidence ${formatLabel(validation.confidence_level)}`
                                        : 'Tanpa confidence level'}
                                </small>
                                {validation.photos?.length ? (
                                    <div className="timeline-photo-chips">
                                        {validation.photos.map((photo) => (
                                            <a
                                                key={photo.id}
                                                href={photo.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="timeline-photo-link"
                                            >
                                                {photo.original_filename}
                                            </a>
                                        ))}
                                    </div>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="drawer-card">
                <p className="panel-kicker">Status Dashboard</p>
                <ul className="status-list">
                    <li>
                        <span>Bootstrap API</span>
                        <strong>{loading ? 'Loading' : 'Ready'}</strong>
                    </li>
                    <li>
                        <span>Run Aktif</span>
                        <strong>{selectedRun?.name ?? '-'}</strong>
                    </li>
                    <li>
                        <span>Hotspot GeoJSON</span>
                        <strong>{allFeatures.length} fitur</strong>
                    </li>
                    <li>
                        <span>Validasi pada hotspot</span>
                        <strong>{validationHistory.length}</strong>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
