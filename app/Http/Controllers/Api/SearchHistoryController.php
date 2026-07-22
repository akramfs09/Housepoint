<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSearchHistoryRequest;
use App\Http\Resources\SearchHistoryResource;
use App\Http\Traits\ApiResponse;
use App\Models\Property;
use App\Models\SearchHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchHistoryController extends Controller
{
    use ApiResponse;

    private const MAX_HISTORY_PER_USER = 20;

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 5), 20);

        $histories = $request->user()
            ->searchHistories()
            ->latest('last_searched_at')
            ->paginate($perPage);

        $histories->getCollection()->transform(function (SearchHistory $history) {
            $history->preview_property = $this->findPreviewProperty($history);

            return $history;
        });

        return $this->success(
            SearchHistoryResource::collection($histories)->response()->getData(true)
        );
    }

    public function store(StoreSearchHistoryRequest $request): JsonResponse
    {
        $user = $request->user();
        $filters = $this->normalizeFilters($request->input('filters', []));
        $searchText = trim((string) ($request->input('search_text') ?? $filters['search'] ?? ''));

        if ($searchText === '' && empty($filters)) {
            return $this->success(null, 'Riwayat kosong diabaikan.');
        }

        $queryHash = $this->makeQueryHash($searchText, $filters);

        $history = DB::transaction(function () use ($user, $searchText, $filters, $queryHash, $request) {
            $history = SearchHistory::where('user_id', $user->id)
                ->where('query_hash', $queryHash)
                ->first();

            if ($history) {
                $history->update([
                    'search_text' => $searchText ?: null,
                    'filters' => $filters,
                    'result_count' => (int) $request->input('result_count', $history->result_count),
                    'search_count' => $history->search_count + 1,
                    'last_searched_at' => now(),
                ]);
            } else {
                $history = SearchHistory::create([
                    'user_id' => $user->id,
                    'search_text' => $searchText ?: null,
                    'filters' => $filters,
                    'query_hash' => $queryHash,
                    'result_count' => (int) $request->input('result_count', 0),
                    'search_count' => 1,
                    'last_searched_at' => now(),
                ]);
            }

            $this->trimOldHistories($user->id);

            return $history->fresh();
        });

        $history->preview_property = $this->findPreviewProperty($history);

        return $this->success(new SearchHistoryResource($history), 'Riwayat pencarian disimpan.');
    }

    public function destroy(Request $request, SearchHistory $searchHistory): JsonResponse
    {
        if ($searchHistory->user_id !== $request->user()->id) {
            return $this->error('Riwayat pencarian tidak ditemukan.', 404);
        }

        $searchHistory->delete();

        return $this->success(null, 'Riwayat pencarian dihapus.');
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->searchHistories()->delete();

        return $this->success(null, 'Semua riwayat pencarian dihapus.');
    }

    private function normalizeFilters(array $filters): array
    {
        unset($filters['page'], $filters['per_page']);

        $normalized = [];
        foreach ($filters as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $normalized[$key] = is_string($value) ? trim($value) : $value;
        }

        ksort($normalized);

        return $normalized;
    }

    private function makeQueryHash(string $searchText, array $filters): string
    {
        return hash('sha256', json_encode([
            'search_text' => mb_strtolower($searchText),
            'filters' => $filters,
        ]));
    }

    private function trimOldHistories(int $userId): void
    {
        $idsToKeep = SearchHistory::where('user_id', $userId)
            ->latest('last_searched_at')
            ->limit(self::MAX_HISTORY_PER_USER)
            ->pluck('id');

        SearchHistory::where('user_id', $userId)
            ->whereNotIn('id', $idsToKeep)
            ->delete();
    }

    private function findPreviewProperty(SearchHistory $history): ?Property
    {
        $filters = $history->filters ?? [];

        return Property::published()
            ->with('images')
            ->when($history->search_text, fn ($query, $search) => $query->where('title', 'like', "%{$search}%"))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($filters['province_id'] ?? null, fn ($query, $provinceId) => $query->where('province_id', $provinceId))
            ->when($filters['city_id'] ?? null, fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->when($filters['city'] ?? null, fn ($query, $city) => $query->where('city', 'like', "%{$city}%"))
            ->when($filters['province'] ?? null, fn ($query, $province) => $query->where('province', 'like', "%{$province}%"))
            ->when($filters['min_price'] ?? null, fn ($query, $minPrice) => $query->where('price', '>=', $minPrice))
            ->when($filters['max_price'] ?? null, fn ($query, $maxPrice) => $query->where('price', '<=', $maxPrice))
            ->latest('published_at')
            ->first();
    }
}
