<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SatelliteLayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'analysis_run_id',
        'layer_name',
        'layer_type',
        'period_type',
        'storage_type',
        'file_path',
        'tile_url',
        'bbox',
        'visualization_params',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'bbox' => 'array',
            'visualization_params' => 'array',
            'is_public' => 'boolean',
        ];
    }

    public function analysisRun(): BelongsTo
    {
        return $this->belongsTo(AnalysisRun::class);
    }
}
