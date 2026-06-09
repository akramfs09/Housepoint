<?php

namespace Database\Seeders;

use App\Models\Province;
use App\Models\City;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'Aceh' => ['Banda Aceh', 'Sabang', 'Langsa', 'Lhokseumawe', 'Subulussalam', 'Aceh Besar', 'Aceh Barat', 'Aceh Selatan'],
            'Sumatera Utara' => ['Medan', 'Binjai', 'Tebing Tinggi', 'Pematangsiantar', 'Sibolga', 'Tanjungbalai', 'Deli Serdang', 'Langkat', 'Karo'],
            'Sumatera Barat' => ['Padang', 'Bukittinggi', 'Padang Panjang', 'Payakumbuh', 'Solok', 'Pariaman', 'Agam', 'Tanah Datar'],
            'Riau' => ['Pekanbaru', 'Dumai', 'Kampar', 'Siak', 'Pelalawan', 'Bengkalis', 'Rokan Hulu'],
            'Jambi' => ['Jambi', 'Sungai Penuh', 'Muaro Jambi', 'Batanghari', 'Bungo', 'Merangin'],
            'Sumatera Selatan' => ['Palembang', 'Prabumulih', 'Lubuklinggau', 'Pagar Alam', 'Banyuasin', 'Musi Banyuasin'],
            'Lampung' => ['Bandar Lampung', 'Metro', 'Lampung Selatan', 'Lampung Tengah', 'Lampung Timur'],
            'DKI Jakarta' => ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Kepulauan Seribu'],
            'Jawa Barat' => ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cimahi', 'Sukabumi', 'Cirebon', 'Tasikmalaya', 'Banjar', 'Kabupaten Bandung', 'Kabupaten Bekasi'],
            'Jawa Tengah' => ['Semarang', 'Surakarta', 'Salatiga', 'Magelang', 'Pekalongan', 'Tegal', 'Kabupaten Semarang', 'Banyumas', 'Cilacap'],
            'DI Yogyakarta' => ['Kota Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul'],
            'Jawa Timur' => ['Surabaya', 'Malang', 'Kediri', 'Blitar', 'Mojokerto', 'Madiun', 'Pasuruan', 'Batu', 'Sidoarjo', 'Jember'],
            'Banten' => ['Tangerang', 'Tangerang Selatan', 'Cilegon', 'Serang', 'Kabupaten Tangerang', 'Pandeglang', 'Lebak'],
            'Bali' => ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Bangli', 'Karasem', 'Buleleng', 'Jembrana', 'Klungkung'],
            'Kalimantan Timur' => ['Samarinda', 'Balikpapan', 'Bontang', 'Kutai Kartanegara', 'Berau', 'Paser', 'Penajam Paser Utara'],
            'Kalimantan Selatan' => ['Banjarmasin', 'Banjarbaru', 'Banjar', 'Barito Kuala', 'Hulu Sungai Selatan'],
            'Sulawesi Selatan' => ['Makassar', 'Parepare', 'Palopo', 'Gowa', 'Maros', 'Bone', 'Bulukumba'],
            'Sulawesi Utara' => ['Manado', 'Bitung', 'Tomohon', 'Kotamobagu', 'Minahasa', 'Bolaang Mongondow'],
            'Nusa Tenggara Barat' => ['Mataram', 'Bima', 'Lombok Barat', 'Lombok Tengah', 'Lombok Timur', 'Sumbawa'],
            'Nusa Tenggara Timur' => ['Kupang', 'Ende', 'Sikka', 'Manggarai', 'Belu', 'Alor', 'Flores Timur'],
            'Papua' => ['Jayapura', 'Kabupaten Jayapura', 'Biak Numfor', 'Kepulauan Yapen', 'Sarmi', 'Waropen'],
        ];

        foreach ($data as $provinceName => $cities) {
            $province = Province::create(['nama' => $provinceName]);
            foreach ($cities as $cityName) {
                City::create([
                    'province_id' => $province->id,
                    'nama' => $cityName,
                ]);
            }
        }
    }
}