<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class ApiController extends Controller
{
    protected function success(
        mixed $data = null,
        string $message = 'OK.',
        int $status = 200,
        array $meta = []
    ): JsonResponse {
        return ApiResponse::success($data, $message, $status, $meta);
    }

    protected function error(
        string $message = 'Terjadi kesalahan.',
        array $errors = [],
        int $status = 400,
        mixed $data = null
    ): JsonResponse {
        return ApiResponse::error($message, $errors, $status, $data);
    }
}
