<?php

namespace App\Http\Requests\Api\V1\FieldValidations\Concerns;

use Illuminate\Validation\Validator;

trait ValidatesFieldValidationPoint
{
    protected function validateValidationPoint(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('validation_point')) {
                return;
            }

            $point = $this->input('validation_point');

            if (! is_array($point)) {
                $validator->errors()->add('validation_point', 'Validation point harus berupa object GeoJSON Point.');

                return;
            }

            if (($point['type'] ?? null) !== 'Point') {
                $validator->errors()->add('validation_point.type', 'Validation point harus bertipe Point.');
            }

            $coordinates = $point['coordinates'] ?? null;

            if (! is_array($coordinates) || count($coordinates) < 2) {
                $validator->errors()->add('validation_point.coordinates', 'Koordinat validation point tidak valid.');

                return;
            }

            if (! is_numeric($coordinates[0]) || ! is_numeric($coordinates[1])) {
                $validator->errors()->add('validation_point.coordinates', 'Koordinat validation point harus numerik.');
            }
        });
    }
}
