<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ValidationPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'field_validation_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'photo_point',
        'taken_at',
        'caption',
        'is_primary',
        'sensitivity_level',
    ];

    protected function casts(): array
    {
        $casts = [
            'taken_at' => 'datetime',
            'is_primary' => 'boolean',
        ];

        if (config('database.connections.'.config('database.default').'.driver') !== 'pgsql') {
            $casts['photo_point'] = 'array';
        }

        return $casts;
    }

    public function fieldValidation(): BelongsTo
    {
        return $this->belongsTo(FieldValidation::class);
    }
}
