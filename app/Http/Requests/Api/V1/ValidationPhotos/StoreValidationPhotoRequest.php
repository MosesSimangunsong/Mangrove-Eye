<?php

namespace App\Http\Requests\Api\V1\ValidationPhotos;

use App\Http\Requests\Api\FormRequest;
use Illuminate\Validation\Validator;

class StoreValidationPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'caption' => ['nullable', 'string'],
            'taken_at' => ['nullable', 'date'],
            'is_primary' => ['nullable', 'boolean'],
            'sensitivity_level' => ['nullable', 'string', 'in:public,internal,restricted'],
            'photo_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'photo_lng' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $hasLat = $this->filled('photo_lat');
            $hasLng = $this->filled('photo_lng');

            if ($hasLat xor $hasLng) {
                $validator->errors()->add(
                    'photo_point',
                    'photo_lat dan photo_lng harus diisi bersamaan jika ingin menyimpan geotag foto.'
                );
            }
        });
    }
}
