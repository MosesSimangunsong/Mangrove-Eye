<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_code',
        'report_type',
        'hotspot_id',
        'analysis_run_id',
        'title',
        'summary',
        'file_path',
        'generated_by',
        'generated_at',
        'status',
        'sensitivity_level',
        'disclaimer_text',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function hotspot(): BelongsTo
    {
        return $this->belongsTo(Hotspot::class);
    }

    public function analysisRun(): BelongsTo
    {
        return $this->belongsTo(AnalysisRun::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
