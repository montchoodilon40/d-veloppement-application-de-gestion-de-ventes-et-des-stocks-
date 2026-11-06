<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockMovementResource;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StockMovementController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = StockMovement::query()->with(['product.category', 'sale']);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->whereHas('product', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        if ($type = $request->string('type')->trim()->toString()) {
            if (in_array($type, ['in', 'out', 'adjustment'], true)) {
                $query->where('type', $type);
            }
        }

        if ($productId = $request->integer('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        return StockMovementResource::collection(
            $query->latest('id')->paginate($perPage)->withQueryString()
        );
    }
}
