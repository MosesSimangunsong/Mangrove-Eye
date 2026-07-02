<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FieldValidation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'hotspot_id',
        'validator_id',
        'validation_status',
        'validation_note',
        'observed_condition',
        'confidence_level',
        'validation_point',
        'visited_at',
        'is_geotagged',
        'sensitivity_level',
    ];

    protected function casts(): array
    {
        $casts = [
            'visited_at' => 'datetime',
            'is_geotagged' => 'boolean',
        ];

        if (config('database.connections.'.config('database.default').'.driver') !== 'pgsql') {
            $casts['validation_point'] = 'array';
        }

        return $casts;
    }

    public function hotspot(): BelongsTo
    {
        return $this->belongsTo(Hotspot::class);
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validator_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ValidationPhoto::class);
    }
}
