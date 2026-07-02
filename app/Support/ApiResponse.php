<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'OK.',
        int $status = 200,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function error(
        string $message = 'Terjadi kesalahan.',
        array $errors = [],
        int $status = 400,
        mixed $data = null
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
            'errors' => (object) $errors,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }
}
