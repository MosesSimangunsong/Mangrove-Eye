<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    public function storePrivate(
        UploadedFile $file,
        string $directory,
        ?string $disk = null,
        ?string $filename = null
    ): array {
        $disk ??= config('filesystems.default', 'local');
        $filename ??= $this->buildFilename($file);

        $path = $file->storeAs(
            trim($directory, '/'),
            $filename,
            ['disk' => $disk],
        );

        return [
            'disk' => $disk,
            'path' => $path,
            'file_name' => $filename,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ];
    }

    public function delete(string $path, ?string $disk = null): bool
    {
        $disk ??= config('filesystems.default', 'local');

        if (! Storage::disk($disk)->exists($path)) {
            return false;
        }

        return Storage::disk($disk)->delete($path);
    }

    protected function buildFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $baseName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));

        return trim($baseName !== '' ? $baseName : Str::random(12), '-')
            .'-'.now()->format('YmdHis')
            .($extension ? '.'.$extension : '');
    }
}
