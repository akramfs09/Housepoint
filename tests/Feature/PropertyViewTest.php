<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\PropertyView;
use App\Models\Role;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PropertyViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_property_detail_view_is_counted_once_for_duplicate_guest_requests(): void
    {
        Cache::flush();

        $property = $this->createPublishedProperty();

        $headers = ['User-Agent' => 'StrictMode-Test'];

        $this->getJson("/api/properties/{$property->slug}", $headers)->assertOk();
        $this->getJson("/api/properties/{$property->slug}", $headers)->assertOk();

        $property->refresh();

        $this->assertSame(1, $property->views_count);
        $this->assertSame(1, PropertyView::where('property_id', $property->id)->count());
    }

    public function test_property_detail_view_is_counted_once_for_duplicate_authenticated_requests(): void
    {
        Cache::flush();

        $property = $this->createPublishedProperty();
        $viewer = User::factory()->create();

        $this->actingAs($viewer, 'sanctum')
            ->getJson("/api/properties/{$property->slug}")
            ->assertOk();

        $this->actingAs($viewer, 'sanctum')
            ->getJson("/api/properties/{$property->slug}")
            ->assertOk();

        $property->refresh();

        $this->assertSame(1, $property->views_count);
        $this->assertSame(1, PropertyView::where('property_id', $property->id)->count());
        $this->assertSame($viewer->id, PropertyView::first()->user_id);
    }

    private function createPublishedProperty(): Property
    {
        $sellerRole = Role::create(['nama_role' => 'seller']);
        $sellerUser = User::factory()->create(['role_id' => $sellerRole->id]);

        $sellerProfile = SellerProfile::create([
            'user_id' => $sellerUser->id,
            'ktp_path' => 'ktp.jpg',
            'selfie_path' => 'selfie.jpg',
            'status' => 'approved',
            'no_hp_verified' => true,
        ]);

        return Property::create([
            'seller_id' => $sellerProfile->id,
            'title' => 'Rumah Test',
            'slug' => 'rumah-test',
            'description' => 'Rumah untuk test view.',
            'price' => 100000000,
            'type' => 'rumah',
            'address' => 'Jl. Test',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}
