<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GeeImport extends Model
{
    use HasFactory;

    protected $fillable = [
        'analysis_run_id',
        'import_type',
        'file_name',
        'file_path',
        'source_url',
        'gee_task_id',
        'status',
        'total_features',
        'error_message',
        'metadata',
        'import_summary',
        'imported_by',
        'imported_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'import_summary' => 'array',
            'imported_at' => 'datetime',
        ];
    }

    public function analysisRun(): BelongsTo
    {
        return $this->belongsTo(AnalysisRun::class);
    }

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function hotspots(): HasMany
    {
        return $this->hasMany(Hotspot::class);
    }
}
