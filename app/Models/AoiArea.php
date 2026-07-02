<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AoiArea extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'aoi_type',
        'description',
        'village',
        'district',
        'regency',
        'province',
        'estimated_area_ha',
        'legal_status',
        'legal_reference',
        'source_type',
        'source_name',
        'source_file_path',
        'verification_status',
        'sensitivity_level',
        'geom',
        'created_by',
    ];

    protected function casts(): array
    {
        $casts = [
            'estimated_area_ha' => 'decimal:4',
        ];

        if (config('database.connections.'.config('database.default').'.driver') !== 'pgsql') {
            $casts['geom'] = 'array';
        }

        return $casts;
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function analysisRuns(): HasMany
    {
        return $this->hasMany(AnalysisRun::class);
    }

    public function hotspots(): HasMany
    {
        return $this->hasMany(Hotspot::class);
    }
}
