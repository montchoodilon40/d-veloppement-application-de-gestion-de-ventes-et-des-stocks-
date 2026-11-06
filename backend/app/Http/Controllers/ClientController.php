<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Http\Resources\SaleResource;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ClientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $completedSales = fn ($query) => $query->where('status', 'completed');

        $query = Client::query()
            ->withCount(['sales' => $completedSales])
            ->withSum(['sales as total_spent' => $completedSales], 'total');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->search($search);
        }

        $sortable = ['name', 'created_at', 'total_spent'];
        $sort = in_array($request->input('sort'), $sortable, true) ? $request->input('sort') : 'created_at';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        if ($request->boolean('all')) {
            return ClientResource::collection($query->get());
        }

        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        return ClientResource::collection($query->paginate($perPage)->withQueryString());
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Client::create($request->validated());

        return (new ClientResource($client))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Client $client): JsonResponse
    {
        $client->loadCount(['sales' => fn ($query) => $query->where('status', 'completed')])
            ->loadSum(['sales as total_spent' => fn ($query) => $query->where('status', 'completed')], 'total');

        $sales = $client->sales()
            ->with('client')
            ->withCount('items')
            ->latest('sale_date')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => new ClientResource($client),
            'sales' => SaleResource::collection($sales),
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $client->update($request->validated());

        $client->loadCount(['sales' => fn ($query) => $query->where('status', 'completed')])
            ->loadSum(['sales as total_spent' => fn ($query) => $query->where('status', 'completed')], 'total');

        return response()->json(['data' => new ClientResource($client)]);
    }

    public function destroy(Client $client): Response|JsonResponse
    {
        if ($client->sales()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce client car il possède des ventes enregistrées.',
            ], 422);
        }

        $client->delete();

        return response()->noContent();
    }
}
