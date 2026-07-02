<?php

use App\Http\Controllers\Api\V1\AnalysisRunController;
use App\Http\Controllers\Api\V1\AoiAreaController;
use App\Http\Controllers\Api\V1\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\HotspotController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::middleware('guest')->post('/login', [AuthenticatedSessionController::class, 'store'])
        ->name('auth.login');

    Route::middleware('auth')->group(function () {
        Route::get('/me', [AuthenticatedSessionController::class, 'me'])
            ->name('auth.me');

        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('auth.logout');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/summary', [DashboardController::class, 'summary'])
        ->middleware('permission:view_internal_dashboard');

    Route::get('/aoi-areas', [AoiAreaController::class, 'index'])
        ->middleware('permission:view_internal_dashboard');
    Route::get('/aoi-areas/{aoiArea}', [AoiAreaController::class, 'show'])
        ->middleware('permission:view_internal_dashboard');
    Route::post('/aoi-areas', [AoiAreaController::class, 'store'])
        ->middleware('permission:manage_aoi');
    Route::put('/aoi-areas/{aoiArea}', [AoiAreaController::class, 'update'])
        ->middleware('permission:manage_aoi');
    Route::delete('/aoi-areas/{aoiArea}', [AoiAreaController::class, 'destroy'])
        ->middleware('permission:manage_aoi');
    Route::post('/aoi-areas/import', [AoiAreaController::class, 'import'])
        ->middleware('permission:manage_aoi');

    Route::get('/analysis-runs', [AnalysisRunController::class, 'index'])
        ->middleware('permission:view_internal_dashboard');
    Route::get('/analysis-runs/{analysisRun}', [AnalysisRunController::class, 'show'])
        ->middleware('permission:view_internal_dashboard');
    Route::post('/analysis-runs', [AnalysisRunController::class, 'store'])
        ->middleware('permission:manage_analysis_runs');
    Route::put('/analysis-runs/{analysisRun}', [AnalysisRunController::class, 'update'])
        ->middleware('permission:manage_analysis_runs');
    Route::delete('/analysis-runs/{analysisRun}', [AnalysisRunController::class, 'destroy'])
        ->middleware('permission:manage_analysis_runs');

    Route::get('/hotspots', [HotspotController::class, 'index'])
        ->middleware('permission:view_hotspot');
    Route::get('/hotspots/{hotspot}', [HotspotController::class, 'show'])
        ->middleware('permission:view_hotspot');
    Route::patch('/hotspots/{hotspot}/status', [HotspotController::class, 'updateStatus'])
        ->middleware('role:admin|super_admin');
    Route::patch('/hotspots/{hotspot}/priority', [HotspotController::class, 'updatePriority'])
        ->middleware('role:admin|super_admin');
});
