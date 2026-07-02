<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\AuditLogs\IndexAuditLogRequest;
use App\Http\Resources\Api\V1\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends ApiController
{
    public function index(IndexAuditLogRequest $request): JsonResponse
    {
        $query = AuditLog::query()
            ->with('user:id,name,email')
            ->latest('created_at')
            ->latest('id');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->string('entity_type'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date('date_from')->toDateString());
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date('date_to')->toDateString());
        }

        $paginator = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            data: AuditLogResource::collection($paginator->items())->resolve(),
            message: 'Audit log berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }
}
