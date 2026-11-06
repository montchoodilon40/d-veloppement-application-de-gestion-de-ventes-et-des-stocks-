<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::query()->withCount('products');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $query->orderBy('name');

        if ($request->boolean('all')) {
            return CategoryResource::collection($query->get());
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        return CategoryResource::collection($query->paginate($perPage)->withQueryString());
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return (new CategoryResource($category->loadCount('products')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->loadCount('products'));
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());

        return new CategoryResource($category->loadCount('products'));
    }

    public function destroy(Category $category): Response|JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient des produits.',
            ], 422);
        }

        $category->delete();

        return response()->noContent();
    }
}
