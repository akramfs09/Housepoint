<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyFilterRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Traits\ApiResponse;
use App\Models\Property;
use Illuminate\Support\Facades\DB;

class PublicPropertyController extends Controller
{
    use ApiResponse;

    /**
     * Katalog properti publik (hanya yang published).
     */
    public function index(PropertyFilterRequest $request)
    {
        $query = Property::published()->with('images');

        // Pencarian judul
        if ($search = $request->search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        // Filter tipe properti
        if ($type = $request->type) {
            $query->where('type', $type);
        }

        // Filter kota
        if ($city = $request->city) {
            $query->where('city', 'like', '%' . $city . '%');
        }

        // Filter provinsi
        if ($province = $request->province) {
            $query->where('province', 'like', '%' . $province . '%');
        }

        // Filter rentang harga
        if ($minPrice = $request->min_price) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice = $request->max_price) {
            $query->where('price', '<=', $maxPrice);
        }

        // Filter minimal kamar tidur
        if ($bedrooms = $request->bedrooms) {
            $query->where('bedrooms', '>=', $bedrooms);
        }

        // Sorting
        switch ($request->sort_by) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            default: // latest
                $query->latest('published_at');
                break;
        }

        $properties = $query->paginate($request->per_page ?? 12);

        return PropertyResource::collection($properties);
    }

    /**
     * Detail properti publik berdasarkan slug.
     */
    public function show(string $slug)
    {
        $property = Property::published()
            ->where('slug', $slug)
            ->with(['images', 'sellerProfile.user'])
            ->firstOrFail();

        // Increment views count secara atomic
        DB::table('properties')->where('id', $property->id)->increment('views_count');

        return $this->success(new PropertyResource($property));
    }
}