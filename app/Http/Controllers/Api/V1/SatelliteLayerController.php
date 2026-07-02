<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\SatelliteLayers\StoreSatelliteLayerRequest;
use App\Http\Resources\Api\V1\SatelliteLayerResource;
use App\Models\AnalysisRun;
use App\Models\SatelliteLayer;
use Illuminate\Http\JsonResponse;

class SatelliteLayerController extends ApiController
{
    public function store(StoreSatelliteLayerRequest $request, AnalysisRun $analysisRun): JsonResponse
    {
        $layer = SatelliteLayer::create([
            ...$request->validated(),
            'analysis_run_id' => $analysisRun->id,
        ]);

        return $this->success(
            data: (new SatelliteLayerResource($layer))->resolve(),
            message: 'Layer berhasil disimpan.',
            status: 201,
        );
    }
}
