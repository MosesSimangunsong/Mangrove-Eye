<?php

use App\Http\Controllers\Api\V1\AnalysisRunController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AoiAreaController;
use App\Http\Controllers\Api\V1\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\GeeImportController;
use App\Http\Controllers\Api\V1\FieldValidationController;
use App\Http\Controllers\Api\V1\HotspotController;
use App\Http\Controllers\Api\V1\PublicDashboardController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SatelliteLayerController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ValidationPhotoController;
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

Route::prefix('public')->group(function () {
    Route::get('/dashboard/summary', [PublicDashboardController::class, 'summary']);
    Route::get('/hotspots', [PublicDashboardController::class, 'hotspots']);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/summary', [DashboardController::class, 'summary'])
        ->middleware('permission:view_internal_dashboard');
    Route::get('/dashboard/layers', [DashboardController::class, 'layers'])
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
    Route::get('/analysis-runs/{analysisRun}/gee-imports', [GeeImportController::class, 'index'])
        ->middleware('permission:view_internal_dashboard');
    Route::post('/analysis-runs/{analysisRun}/gee-imports/hotspots', [GeeImportController::class, 'importHotspots'])
        ->middleware('permission:import_gee_result');
    Route::post('/analysis-runs/{analysisRun}/satellite-layers', [SatelliteLayerController::class, 'store'])
        ->middleware('permission:manage_analysis_runs');
    Route::post('/analysis-runs/{analysisRun}/reports', [ReportController::class, 'storeAnalysisRun'])
        ->middleware('permission:export_report');

    Route::get('/hotspots', [HotspotController::class, 'index'])
        ->middleware('permission:view_hotspot');
    Route::get('/hotspots/{hotspot}', [HotspotController::class, 'show'])
        ->middleware('permission:view_hotspot');
    Route::post('/hotspots/{hotspot}/reports', [ReportController::class, 'storeHotspot'])
        ->middleware('permission:export_report');
    Route::get('/hotspots/{hotspot}/field-validations', [FieldValidationController::class, 'index'])
        ->middleware('permission:view_validation');
    Route::post('/hotspots/{hotspot}/field-validations', [FieldValidationController::class, 'store'])
        ->middleware('permission:validate_hotspot');
    Route::get('/field-validations/{fieldValidation}/photos', [ValidationPhotoController::class, 'index'])
        ->middleware('permission:view_validation');
    Route::get('/validation-photos/{validationPhoto}', [ValidationPhotoController::class, 'show'])
        ->middleware('permission:view_validation')
        ->name('validation-photos.show');
    Route::post('/field-validations/{fieldValidation}/photos', [ValidationPhotoController::class, 'store'])
        ->middleware('permission:validate_hotspot');
    Route::patch('/hotspots/{hotspot}/status', [HotspotController::class, 'updateStatus'])
        ->middleware('role:admin|super_admin');
    Route::patch('/hotspots/{hotspot}/priority', [HotspotController::class, 'updatePriority'])
        ->middleware('role:admin|super_admin');
    Route::put('/field-validations/{fieldValidation}', [FieldValidationController::class, 'update'])
        ->middleware('permission:validate_hotspot');
    Route::delete('/validation-photos/{validationPhoto}', [ValidationPhotoController::class, 'destroy'])
        ->middleware('permission:validate_hotspot');
    Route::get('/reports', [ReportController::class, 'index'])
        ->middleware('permission:export_report');
    Route::get('/reports/{report}/download', [ReportController::class, 'download'])
        ->middleware('permission:export_report')
        ->name('reports.download');
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:manage_users');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:manage_users');
    Route::patch('/users/{user}/roles', [UserController::class, 'updateRoles'])
        ->middleware('permission:manage_users');
    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('permission:manage_users');
    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('permission:view_audit_logs');
});
