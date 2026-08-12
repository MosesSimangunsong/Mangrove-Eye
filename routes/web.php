<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/hotspots', function () {
        return Inertia::render('Hotspots/Index');
    })->middleware('permission:view_hotspot')->name('hotspots.index');

    Route::get('/hotspots/{hotspot}', function (string $hotspot) {
        return Inertia::render('Hotspots/Show', [
            'hotspotId' => (int) $hotspot,
        ]);
    })->middleware('permission:view_hotspot')->name('hotspots.show');

    Route::get('/aoi-areas', function () {
        return Inertia::render('AoiAreas/Index');
    })->middleware('permission:manage_aoi')->name('aoi-areas.index');

    Route::get('/aoi-areas/{aoiArea}', function (string $aoiArea) {
        return Inertia::render('AoiAreas/Show', [
            'aoiAreaId' => (int) $aoiArea,
        ]);
    })->middleware('permission:manage_aoi')->name('aoi-areas.show');

    Route::get('/analysis-runs', function () {
        return Inertia::render('AnalysisRuns/Index');
    })->middleware('permission:manage_analysis_runs')->name('analysis-runs.index');

    Route::get('/analysis-runs/{analysisRun}', function (string $analysisRun) {
        return Inertia::render('AnalysisRuns/Show', [
            'analysisRunId' => (int) $analysisRun,
        ]);
    })->middleware('permission:manage_analysis_runs')->name('analysis-runs.show');

    Route::get('/gee-imports', function (\Illuminate\Http\Request $request) {
        return Inertia::render('GeeImports/Index', [
            'initialAnalysisRunId' => $request->integer('analysis_run_id') ?: null,
        ]);
    })->middleware('permission:import_gee_result')->name('gee-imports.index');

    Route::get('/field-validations', function () {
        return Inertia::render('FieldValidations/Index');
    })->middleware('permission:view_validation')->name('field-validations.index');

    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->middleware('permission:export_report')->name('reports.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('web')
    ->prefix('api/v1')
    ->name('api.v1.')
    ->group(base_path('routes/api.php'));

require __DIR__.'/auth.php';
