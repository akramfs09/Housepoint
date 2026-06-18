<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyFilterRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Traits\ApiResponse;
use App\Models\FeaturedListing;
use App\Models\Property;
use App\Models\PropertyView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PublicPropertyController extends Controller
{
    use ApiResponse;

    private const VIEW_DEDUPLICATION_MINUTES = 30;

    /**
     * Katalog properti publik (hanya yang published).
     */
    public function index(PropertyFilterRequest $request)
    {
        $user = $this->optionalUser($request);
        $perPage = $request->per_page ?? 12;

        // ========== 1. POPULER (7 hari terakhir) ==========
        $popularIds = PropertyView::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('property_id, count(*) as total')
            ->groupBy('property_id')
            ->orderByDesc('total')
            ->limit(8)
            ->pluck('property_id');

        $popular = Property::published()
            ->whereIn('id', $popularIds)
            ->with('images')
            ->when($user, fn($q) => $q->with(['favoritedByUsers' => fn($q) => $q->where('user_id', $user->id)]))
            ->get()
            ->sortBy(fn($p) => array_search($p->id, $popularIds->toArray()));

        // ========== 2. TERFAVORIT (7 hari terakhir) ==========
        $favoritedIds = DB::table('favorites')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('property_id, count(*) as total')
            ->groupBy('property_id')
            ->orderByDesc('total')
            ->limit(8)
            ->pluck('property_id');

        $favorited = Property::published()
            ->whereIn('id', $favoritedIds)
            ->with('images')
            ->when($user, fn($q) => $q->with(['favoritedByUsers' => fn($q) => $q->where('user_id', $user->id)]))
            ->get()
            ->sortBy(fn($p) => array_search($p->id, $favoritedIds->toArray()));

        // ========== 3. SEMUA (filter + sort + pagination) ==========
        $query = Property::published()->with('images');
        if ($user) {
            $query->with(['favoritedByUsers' => fn($q) => $q->where('user_id', $user->id)]);
        }

        if ($search = $request->search) {
            $query->where('title', 'like', '%' . $search . '%');
        }
        if ($type = $request->type) {
            $query->where('type', $type);
        }
        if ($city = $request->city) {
            $query->where('city', 'like', '%' . $city . '%');
        }
        if ($province = $request->province) {
            $query->where('province', 'like', '%' . $province . '%');
        }
        if ($minPrice = $request->min_price) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->max_price) {
            $query->where('price', '<=', $maxPrice);
        }
        if ($bedrooms = $request->bedrooms) {
            $query->where('bedrooms', '>=', $bedrooms);
        }

        switch ($request->sort_by) {
            case 'price_asc': $query->orderBy('price', 'asc'); break;
            case 'price_desc': $query->orderBy('price', 'desc'); break;
            case 'popular': $query->orderBy('views_count', 'desc'); break;
            default: $query->latest('published_at'); break;
        }

        $all = $query->paginate($perPage);

        return response()->json([
            'success'   => true,
            'popular'   => PropertyResource::collection($popular),
            'favorited' => PropertyResource::collection($favorited),
            'data'      => PropertyResource::collection($all)->response()->getData(true),
        ]);
    }

    /**
     * Properti unggulan yang sedang aktif (maks 8).
     */
    public function featured()
    {
        $featured = FeaturedListing::where('status', 'active')
            ->where('started_at', '<=', now())
            ->where('expires_at', '>', now())
            ->whereHas('property', fn ($query) => $query->where('status', 'published'))
            ->with(['property.images', 'property.sellerProfile.user'])
            ->latest('started_at')
            ->limit(8)
            ->get()
            ->pluck('property')
            ->filter()
            ->values(); // hanya properti yang masih ada

        return PropertyResource::collection($featured);
    }

    /**
     * Detail properti publik berdasarkan slug.
     */
    public function show(Request $request, string $slug)
    {
        $user = $this->optionalUser($request);

        $query = Property::published()
            ->where('slug', $slug)
            ->with(['images', 'sellerProfile', 'sellerProfile.user']);

        if ($user) {
            $query->with(['favoritedByUsers' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        $property = $query->firstOrFail();

        $this->recordViewOnce($request, $property, $user);

        return $this->success(new PropertyResource($property));
    }

    /**
     * Toggle favorit properti untuk user yang sedang login.
     */
    public function toggleFavorite(Property $property): JsonResponse
    {
        $user = request()->user();

        if ($property->status !== 'published') {
            return $this->error('Properti tidak tersedia.', 404);
        }

        $exists = $user->favorites()->where('property_id', $property->id)->exists();

        if ($exists) {
            $user->favorites()->detach($property->id);
            return $this->success(['is_favorited' => false], 'Properti dihapus dari favorit.');
        }

        $user->favorites()->attach($property->id);
        return $this->success(['is_favorited' => true], 'Properti ditambahkan ke favorit.');
    }

    /**
     * Daftar properti favorit user yang sedang login.
     */
    public function favorites(): JsonResponse
    {
        $user = request()->user();

        $properties = $user->favorites()
            ->published()
            ->with('images')
            ->latest('favorites.created_at')
            ->paginate(12);

        $properties->load(['favoritedByUsers' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);

        return $this->success(
            PropertyResource::collection($properties)->response()->getData(true)
        );
    }

    private function optionalUser(Request $request)
    {
        return $request->user() ?: Auth::guard('sanctum')->user();
    }

    private function recordViewOnce(Request $request, Property $property, $user): void
    {
        $cacheKey = $this->viewCacheKey($request, $property, $user);
        $ttl = now()->addMinutes(self::VIEW_DEDUPLICATION_MINUTES);

        if (! Cache::add($cacheKey, true, $ttl)) {
            return;
        }

        DB::transaction(function () use ($property, $user) {
            $property->increment('views_count');

            PropertyView::create([
                'property_id' => $property->id,
                'user_id'     => $user?->id,
                'created_at'  => now(),
            ]);
        });
    }

    private function viewCacheKey(Request $request, Property $property, $user): string
    {
        $viewer = $user
            ? 'user:' . $user->id
            : 'guest:' . hash('sha256', $request->ip() . '|' . $request->userAgent());

        return "property-view:{$property->id}:{$viewer}";
    }
}
