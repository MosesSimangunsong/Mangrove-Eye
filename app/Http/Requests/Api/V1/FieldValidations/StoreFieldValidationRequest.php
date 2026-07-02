<?php

namespace App\Http\Requests\Api\V1\FieldValidations;

use App\Http\Requests\Api\FormRequest;
use App\Http\Requests\Api\V1\FieldValidations\Concerns\ValidatesFieldValidationPoint;
use Illuminate\Validation\Validator;

class StoreFieldValidationRequest extends FormRequest
{
    use ValidatesFieldValidationPoint;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'validation_status' => ['required', 'string', 'in:under_review,validated,rejected,needs_recheck'],
            'validation_note' => ['nullable', 'string'],
            'observed_condition' => ['nullable', 'string', 'in:mangrove_cut,oil_palm_planted,open_land,water_tide,pond_or_aquaculture,cloud_shadow,unknown,other'],
            'confidence_level' => ['nullable', 'string', 'in:low,medium,high'],
            'validation_point' => ['nullable', 'array'],
            'visited_at' => ['nullable', 'date'],
            'is_geotagged' => ['nullable', 'boolean'],
            'sensitivity_level' => ['nullable', 'string', 'in:public,internal,restricted'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $this->validateValidationPoint($validator);
    }
}
