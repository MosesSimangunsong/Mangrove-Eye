<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GeeImportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'analysis_run_id' => $this->analysis_run_id,
            'analysis_run' => $this->whenLoaded('analysisRun', fn () => [
                'id' => $this->analysisRun?->id,
                'name' => $this->analysisRun?->name,
            ]),
            'import_type' => $this->import_type,
            'original_filename' => $this->file_name,
            'stored_path' => $this->file_path,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'source_url' => $this->source_url,
            'gee_task_id' => $this->gee_task_id,
            'status' => $this->status,
            'total_features' => $this->total_features,
            'error_message' => $this->error_message,
            'metadata' => $this->metadata ?? new \stdClass(),
            'import_summary' => $this->import_summary ?? new \stdClass(),
            'imported_at' => $this->imported_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
