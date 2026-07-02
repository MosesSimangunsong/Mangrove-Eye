<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalysisRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'aoi_area_id' => $this->aoi_area_id,
            'aoi_area' => $this->whenLoaded('aoiArea', fn () => [
                'id' => $this->aoiArea?->id,
                'name' => $this->aoiArea?->name,
            ]),
            'dataset_name' => $this->dataset_name,
            'gee_collection_id' => $this->gee_collection_id,
            'before_start_date' => $this->before_start_date?->toDateString(),
            'before_end_date' => $this->before_end_date?->toDateString(),
            'after_start_date' => $this->after_start_date?->toDateString(),
            'after_end_date' => $this->after_end_date?->toDateString(),
            'before_period' => [
                'start' => $this->before_start_date?->toDateString(),
                'end' => $this->before_end_date?->toDateString(),
            ],
            'after_period' => [
                'start' => $this->after_start_date?->toDateString(),
                'end' => $this->after_end_date?->toDateString(),
            ],
            'cloud_threshold' => $this->cloud_threshold !== null ? (float) $this->cloud_threshold : null,
            'primary_indices' => $this->primary_indices ?? [],
            'supporting_indices' => $this->supporting_indices ?? [],
            'threshold_params' => $this->threshold_params ?? new \stdClass(),
            'processing_params' => $this->processing_params ?? new \stdClass(),
            'total_hotspots' => $this->total_hotspots,
            'total_area_ha' => $this->total_area_ha !== null ? (float) $this->total_area_ha : null,
            'status' => $this->status,
            'processed_at' => $this->processed_at?->toISOString(),
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
