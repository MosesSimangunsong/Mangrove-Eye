<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\AnalysisRuns\IndexAnalysisRunRequest;
use App\Http\Requests\Api\V1\AnalysisRuns\StoreAnalysisRunRequest;
use App\Http\Requests\Api\V1\AnalysisRuns\UpdateAnalysisRunRequest;
use App\Http\Resources\Api\V1\AnalysisRunResource;
use App\Models\AnalysisRun;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;

class AnalysisRunController extends ApiController
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(IndexAnalysisRunRequest $request): JsonResponse
    {
        $query = AnalysisRun::query()
            ->with('aoiArea:id,name')
            ->latest('id');

        if ($request->filled('aoi_area_id')) {
            $query->where('aoi_area_id', $request->integer('aoi_area_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('year')) {
            $query->whereYear('after_end_date', $request->integer('year'));
        }

        $paginator = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            data: AnalysisRunResource::collection($paginator->items())->resolve(),
            message: 'Analysis run berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function show(AnalysisRun $analysisRun): JsonResponse
    {
        $analysisRun->load('aoiArea:id,name');

        return $this->success(
            data: (new AnalysisRunResource($analysisRun))->resolve(),
            message: 'Detail analysis run berhasil diambil.',
        );
    }

    public function store(StoreAnalysisRunRequest $request): JsonResponse
    {
        $analysisRun = AnalysisRun::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'status' => $request->input('status', 'draft'),
            'dataset_name' => $request->input('dataset_name', 'Sentinel-2 Level-2A'),
        ]);

        $analysisRun->load('aoiArea:id,name');

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'create_analysis_run',
            entityType: 'analysis_runs',
            entityId: $analysisRun->id,
            description: "Analysis run {$analysisRun->name} dibuat.",
            newValues: $analysisRun->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new AnalysisRunResource($analysisRun))->resolve(),
            message: 'Analysis run berhasil dibuat.',
            status: 201,
        );
    }

    public function update(UpdateAnalysisRunRequest $request, AnalysisRun $analysisRun): JsonResponse
    {
        $oldValues = $analysisRun->toArray();
        $analysisRun->fill($request->validated())->save();
        $analysisRun->load('aoiArea:id,name');

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'update_analysis_run',
            entityType: 'analysis_runs',
            entityId: $analysisRun->id,
            description: "Analysis run {$analysisRun->name} diperbarui.",
            oldValues: $oldValues,
            newValues: $analysisRun->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new AnalysisRunResource($analysisRun))->resolve(),
            message: 'Analysis run berhasil diperbarui.',
        );
    }

    public function destroy(AnalysisRun $analysisRun): JsonResponse
    {
        $analysisRun->delete();

        return $this->success(
            data: null,
            message: 'Analysis run berhasil dihapus.',
        );
    }
}
