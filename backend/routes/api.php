<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockMovementController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    DB::connection()->getPdo();

    return response()->json([
        'status' => 'ok',
        'database' => DB::connection()->getDatabaseName(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/products/options', [ProductController::class, 'options']);
Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
Route::post('/products/{product}/stock-adjustments', [ProductController::class, 'adjustStock']);
Route::get('/products/{product}/movements', [ProductController::class, 'movements']);
Route::apiResource('products', ProductController::class);

Route::apiResource('categories', CategoryController::class);
Route::apiResource('clients', ClientController::class);

Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel']);
Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'show']);

Route::get('/stock-movements', [StockMovementController::class, 'index']);

Route::fallback(function () {
    return response()->json(['message' => 'Ressource introuvable.'], 404);
});
