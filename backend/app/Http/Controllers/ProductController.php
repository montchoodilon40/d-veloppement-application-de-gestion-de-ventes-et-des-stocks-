<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockAdjustmentRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function __construct(private readonly StockService $stockService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()->with('category')->withCount('saleItems');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->search($search);
        }

        if ($categoryId = $request->integer('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $status = $request->string('status')->toString();

        if ($status === 'alert') {
            $query->whereColumn('stock', '<=', 'stock_alert');
        } elseif ($status === 'low') {
            $query->where('stock', '>', 0)->whereColumn('stock', '<=', 'stock_alert');
        } elseif ($status === 'out') {
            $query->where('stock', '<=', 0);
        } elseif ($status === 'in') {
            $query->where('stock', '>', 'stock_alert');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $sortable = ['name', 'reference', 'stock', 'sale_price', 'created_at'];
        $sort = in_array($request->input('sort'), $sortable, true) ? $request->input('sort') : 'created_at';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        return ProductResource::collection($query->paginate($perPage)->withQueryString());
    }

    public function options(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->with('category')
            ->where('is_active', true)
            ->orderBy('name');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->search($search);
        }

        $limit = min(max($request->integer('limit', 20), 1), 100);

        return ProductResource::collection($query->limit($limit)->get());
    }

    public function lowStock(Request $request): AnonymousResourceCollection
    {
        $limit = min(max($request->integer('limit', 10), 1), 100);

        $products = Product::query()
            ->with('category')
            ->whereColumn('stock', '<=', 'stock_alert')
            ->orderByRaw('stock = 0 DESC')
            ->orderBy('stock')
            ->limit($limit)
            ->get();

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['reference'] = $data['reference'] ?? $this->generateReference();
        $data['stock'] = $data['stock'] ?? 0;
        $data['stock_alert'] = $data['stock_alert'] ?? 5;
        $data['unit'] = $data['unit'] ?? 'unité';
        $data['is_active'] = $data['is_active'] ?? true;

        $product = Product::create($data);
        $this->stockService->recordInitialStock($product);

        return (new ProductResource($product->load('category')->loadCount('saleItems')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category')->loadCount('saleItems'));
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();
        $data['reference'] = ! empty($data['reference']) ? $data['reference'] : $product->reference;

        $product->update($data);

        return new ProductResource($product->fresh()->load('category')->loadCount('saleItems'));
    }

    public function destroy(Product $product): Response|JsonResponse
    {
        if ($product->saleItems()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce produit car il est utilisé dans des ventes. Vous pouvez le désactiver.',
            ], 422);
        }

        $product->delete();

        return response()->noContent();
    }

    public function adjustStock(StockAdjustmentRequest $request, Product $product): JsonResponse
    {
        $movement = $this->stockService->adjust($product, $request->validated());

        return response()->json([
            'message' => 'Le stock a été mis à jour.',
            'movement' => new StockMovementResource($movement),
            'product' => new ProductResource($movement->product),
        ]);
    }

    public function movements(Request $request, Product $product): AnonymousResourceCollection
    {
        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        $movements = $product->stockMovements()
            ->with(['product.category', 'sale'])
            ->latest()
            ->paginate($perPage);

        return StockMovementResource::collection($movements);
    }

    private function generateReference(): string
    {
        do {
            $reference = 'PRD-'.strtoupper(Str::random(6));
        } while (Product::where('reference', $reference)->exists());

        return $reference;
    }
}
