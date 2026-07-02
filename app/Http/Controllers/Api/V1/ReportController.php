<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\Reports\IndexReportRequest;
use App\Http\Requests\Api\V1\Reports\StoreAnalysisRunReportRequest;
use App\Http\Requests\Api\V1\Reports\StoreHotspotReportRequest;
use App\Http\Resources\Api\V1\ReportResource;
use App\Models\AnalysisRun;
use App\Models\Hotspot;
use App\Models\Report;
use App\Services\AuditLogService;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends ApiController
{
    public function __construct(
        protected ReportService $reportService,
        protected AuditLogService $auditLogService,
    ) {
    }

    public function index(IndexReportRequest $request): JsonResponse
    {
        $query = Report::query()
            ->with(['hotspot:id,hotspot_code', 'analysisRun:id,name', 'generator:id,name'])
            ->latest('id');

        if ($request->filled('report_type')) {
            $query->where('report_type', $request->string('report_type'));
        }

        if ($request->filled('hotspot_id')) {
            $query->where('hotspot_id', $request->integer('hotspot_id'));
        }

        if ($request->filled('analysis_run_id')) {
            $query->where('analysis_run_id', $request->integer('analysis_run_id'));
        }

        $paginator = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            data: ReportResource::collection($paginator->items())->resolve(),
            message: 'Data laporan berhasil diambil.',
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function storeHotspot(StoreHotspotReportRequest $request, Hotspot $hotspot): JsonResponse
    {
        $report = $this->reportService->createHotspotReport($hotspot, $request->validated(), $request->user()?->id);
        $report->load(['hotspot:id,hotspot_code', 'analysisRun:id,name', 'generator:id,name']);

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'generate_report',
            entityType: 'reports',
            entityId: $report->id,
            description: "Report hotspot {$report->report_code} berhasil dibuat.",
            newValues: $report->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new ReportResource($report))->resolve(),
            message: 'Laporan PDF berhasil dibuat.',
            status: 201,
        );
    }

    public function storeAnalysisRun(StoreAnalysisRunReportRequest $request, AnalysisRun $analysisRun): JsonResponse
    {
        $report = $this->reportService->createAnalysisRunReport($analysisRun, $request->validated(), $request->user()?->id);
        $report->load(['analysisRun:id,name', 'generator:id,name']);

        $this->auditLogService->log(
            userId: $request->user()?->id,
            action: 'generate_report',
            entityType: 'reports',
            entityId: $report->id,
            description: "Report analysis run {$report->report_code} berhasil dibuat.",
            newValues: $report->toArray(),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
        );

        return $this->success(
            data: (new ReportResource($report))->resolve(),
            message: 'Laporan analysis run berhasil dibuat.',
            status: 201,
        );
    }

    public function download(Report $report): StreamedResponse
    {
        $disk = config('filesystems.default');
        $filename = basename($report->file_path);

        $this->auditLogService->log(
            userId: request()->user()?->id,
            action: 'download_report',
            entityType: 'reports',
            entityId: $report->id,
            description: "Report {$report->report_code} diunduh.",
            ipAddress: request()->ip(),
            userAgent: request()->userAgent(),
        );

        return Storage::disk($disk)->download($report->file_path, $filename);
    }
}
