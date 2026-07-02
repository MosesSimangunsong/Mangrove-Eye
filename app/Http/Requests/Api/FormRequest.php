<?php

namespace App\Http\Requests\Api;

use App\Support\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest as BaseFormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class FormRequest extends BaseFormRequest
{
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'Validasi gagal.',
                errors: $validator->errors()->toArray(),
                status: 422,
            )
        );
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
                status: 403,
            )
        );
    }
}
