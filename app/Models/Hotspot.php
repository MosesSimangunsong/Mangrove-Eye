<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hotspot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'hotspot_code',
        'analysis_run_id',
        'aoi_area_id',
        'gee_import_id',
        'detected_at',
        'centroid',
        'geom',
        'area_ha',
        'mvi_before',
        'mvi_after',
        'mvi_delta',
        'cmri_before',
        'cmri_after',
        'cmri_delta',
        'ndvi_before',
        'ndvi_after',
        'ndvi_delta',
        'ndwi_before',
        'ndwi_after',
        'ndwi_delta',
        'priority',
        'validation_status',
        'confidence_score',
        'false_positive_reason',
        'sensitivity_level',
        'properties',
    ];

    protected function casts(): array
    {
        $casts = [
            'detected_at' => 'datetime',
            'area_ha' => 'decimal:4',
            'mvi_before' => 'decimal:6',
            'mvi_after' => 'decimal:6',
            'mvi_delta' => 'decimal:6',
            'cmri_before' => 'decimal:6',
            'cmri_after' => 'decimal:6',
            'cmri_delta' => 'decimal:6',
            'ndvi_before' => 'decimal:6',
            'ndvi_after' => 'decimal:6',
            'ndvi_delta' => 'decimal:6',
            'ndwi_before' => 'decimal:6',
            'ndwi_after' => 'decimal:6',
            'ndwi_delta' => 'decimal:6',
            'confidence_score' => 'decimal:2',
            'properties' => 'array',
        ];

        if (config('database.connections.'.config('database.default').'.driver') !== 'pgsql') {
            $casts['centroid'] = 'array';
            $casts['geom'] = 'array';
        }

        return $casts;
    }

    public function analysisRun(): BelongsTo
    {
        return $this->belongsTo(AnalysisRun::class);
    }

    public function aoiArea(): BelongsTo
    {
        return $this->belongsTo(AoiArea::class);
    }

    public function geeImport(): BelongsTo
    {
        return $this->belongsTo(GeeImport::class);
    }

    public function validations(): HasMany
    {
        return $this->hasMany(FieldValidation::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
