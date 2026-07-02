<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use App\Support\ApiResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiResponse::error(
                message: 'Unauthenticated.',
                status: HttpResponse::HTTP_UNAUTHORIZED,
            );
        });

        $exceptions->render(function (AuthorizationException|UnauthorizedException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiResponse::error(
                message: 'Forbidden.',
                status: HttpResponse::HTTP_FORBIDDEN,
            );
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiResponse::error(
                message: 'Validasi gagal.',
                errors: $exception->errors(),
                status: HttpResponse::HTTP_UNPROCESSABLE_ENTITY,
            );
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return ApiResponse::error(
                message: app()->hasDebugModeEnabled()
                    ? $exception->getMessage()
                    : 'Terjadi kesalahan pada server.',
                status: HttpResponse::HTTP_INTERNAL_SERVER_ERROR,
            );
        });
    })->create();
