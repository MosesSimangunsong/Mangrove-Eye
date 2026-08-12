<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SatelliteLayerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'analysis_run_id' => $this->analysis_run_id,
            'layer_name' => $this->layer_name,
            'layer_type' => $this->layer_type,
            'period_type' => $this->period_type,
            'storage_type' => $this->storage_type,
            'tile_url' => $this->tile_url,
            'bbox' => $this->bbox ?? new \stdClass(),
            'visualization_params' => $this->visualization_params ?? new \stdClass(),
            'is_public' => $this->is_public,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
