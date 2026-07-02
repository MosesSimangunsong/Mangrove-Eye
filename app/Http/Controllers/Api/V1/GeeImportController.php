<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\AnalysisRuns\ImportGeeHotspotsRequest;
use App\Http\Resources\Api\V1\GeeImportResource;
use App\Models\AnalysisRun;
use App\Models\GeeImport;
use App\Services\AuditLogService;
use App\Services\GeeHotspotImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeeImportController extends ApiController
{
    public function __construct(
        protected GeeHotspotImportService $geeHotspotImportService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(Request $request, AnalysisRun $analysisRun): JsonResponse
    {
        $query = GeeImport::query()
            ->where('analysis_run_id', $analysisRun->id)
            ->latest('id');

        if ($request->filled('import_type')) {
            $query->where('import_type', $request->string('import_type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $paginator = $query->paginate((int) $request->integer('per_page', 15));

        return $this->success(
            data: GeeImportResource::collection($paginator->items())->resolve(),
            message: 'Riwayat GEE import berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function importHotspots(ImportGeeHotspotsRequest $request, AnalysisRun $analysisRun): JsonResponse
    {
        $geeImport = $this->geeHotspotImportService->import(
            analysisRun: $analysisRun,
            file: $request->file('file'),
            metadata: $request->input('metadata'),
            importSummary: $request->input('import_summary'),
            userId: $request->user()?->id,
        );

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'import_gee_hotspots',
            entityType: 'gee_imports',
            entityId: $geeImport->id,
            description: "Import hotspot GEE untuk analysis run {$analysisRun->name} berhasil diproses.",
            newValues: $geeImport->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new GeeImportResource($geeImport))->resolve(),
            message: 'File hotspot GeoJSON GEE berhasil diimpor.',
            status: 201,
        );
    }
}
