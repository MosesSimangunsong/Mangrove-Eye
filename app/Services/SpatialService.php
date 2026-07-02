<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class SpatialService
{
    public function isPgsql(): bool
    {
        return Schema::getConnection()->getDriverName() === 'pgsql';
    }

    public function applyGeoJsonSelect(Builder $query, array $columns): Builder
    {
        if (! $this->isPgsql()) {
            return $query;
        }

        foreach ($columns as $column) {
            $query->selectRaw("ST_AsGeoJSON({$column}) as {$column}_geojson");
        }

        return $query;
    }

    public function persistGeometry(Model $model, string $column, ?array $geometry): void
    {
        if ($geometry === null) {
            return;
        }

        if (! $this->isPgsql()) {
            $model->forceFill([$column => $geometry])->save();

            return;
        }

        $table = $model->getTable();
        $idColumn = $model->getKeyName();
        $geometryJson = json_encode($geometry, JSON_THROW_ON_ERROR);

        if (! is_string($geometryJson)) {
            throw new InvalidArgumentException('Invalid geometry payload.');
        }

        DB::table($table)
            ->where($idColumn, $model->getKey())
            ->update([
                $column => DB::raw("ST_SetSRID(ST_GeomFromGeoJSON('{$geometryJson}'), 4326)"),
            ]);

        $model->refresh();
    }

    public function geometryFromModel(Model $model, string $column): ?array
    {
        if ($this->isPgsql()) {
            $geoJson = $model->getAttribute("{$column}_geojson");

            return $geoJson ? json_decode($geoJson, true) : null;
        }

        $geometry = $model->getAttribute($column);

        return is_array($geometry) ? $geometry : null;
    }
}
