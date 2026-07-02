<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'report_code' => $this->report_code,
            'report_type' => $this->report_type,
            'hotspot_id' => $this->hotspot_id,
            'analysis_run_id' => $this->analysis_run_id,
            'title' => $this->title,
            'summary' => $this->summary,
            'file_path' => $this->file_path,
            'download_url' => route('api.v1.reports.download', $this->resource),
            'status' => $this->status,
            'sensitivity_level' => $this->sensitivity_level,
            'disclaimer_text' => $this->disclaimer_text,
            'metadata' => $this->metadata ?? new \stdClass(),
            'hotspot' => $this->whenLoaded('hotspot', fn () => [
                'id' => $this->hotspot?->id,
                'hotspot_code' => $this->hotspot?->hotspot_code,
            ]),
            'analysis_run' => $this->whenLoaded('analysisRun', fn () => [
                'id' => $this->analysisRun?->id,
                'name' => $this->analysisRun?->name,
            ]),
            'generated_by' => $this->whenLoaded('generator', fn () => [
                'id' => $this->generator?->id,
                'name' => $this->generator?->name,
            ]),
            'generated_at' => $this->generated_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
