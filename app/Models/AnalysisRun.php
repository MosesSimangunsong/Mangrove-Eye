<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnalysisRun extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'aoi_area_id',
        'name',
        'description',
        'dataset_name',
        'gee_collection_id',
        'before_start_date',
        'before_end_date',
        'after_start_date',
        'after_end_date',
        'cloud_threshold',
        'primary_indices',
        'supporting_indices',
        'threshold_params',
        'processing_params',
        'total_hotspots',
        'total_area_ha',
        'status',
        'processed_at',
        'published_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'before_start_date' => 'date',
            'before_end_date' => 'date',
            'after_start_date' => 'date',
            'after_end_date' => 'date',
            'cloud_threshold' => 'decimal:2',
            'primary_indices' => 'array',
            'supporting_indices' => 'array',
            'threshold_params' => 'array',
            'processing_params' => 'array',
            'total_area_ha' => 'decimal:4',
            'processed_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function aoiArea(): BelongsTo
    {
        return $this->belongsTo(AoiArea::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function geeImports(): HasMany
    {
        return $this->hasMany(GeeImport::class);
    }

    public function satelliteLayers(): HasMany
    {
        return $this->hasMany(SatelliteLayer::class);
    }

    public function hotspots(): HasMany
    {
        return $this->hasMany(Hotspot::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
