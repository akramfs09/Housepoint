/*
 * TODO: Ganti dengan API fetch dari /api/properties di Batch 3
 * Data ini hanya untuk pengembangan awal.
 */
export const USE_DUMMY = import.meta.env.VITE_USE_DUMMY === 'true';

const dummyProperties = [
    {
        id: 1,
        badge: 'TERSEDIA',
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db42?q=80&w=1200&auto=format&fit=crop',
        price: 'Rp 12,500,000,000',
        title: 'The Modern Oasis Villa',
        location: 'Menteng, Jakarta Pusat',
        city: 'Jakarta',
        size: '840',
        beds: '3',
        baths: '2',
        land_area: 840,
        bedrooms: 3,
        bathrooms: 2,
        status: 'published',
    },
    {
        id: 2,
        badge: 'BARU',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
        price: 'Rp 8,200,000,000',
        title: 'Hillside Contemporary',
        location: 'Canggu, Bali',
        city: 'Bali',
        size: '950',
        beds: '3',
        baths: '2',
        land_area: 950,
        bedrooms: 3,
        bathrooms: 2,
        status: 'published',
    },
    {
        id: 3,
        badge: 'TERSEDIA',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
        price: 'Rp 25,000,000,000',
        title: 'The Grand Pinnacle',
        location: 'Pondok Indah, Jakarta',
        city: 'Jakarta',
        size: '980',
        beds: '5',
        baths: '6',
        land_area: 980,
        bedrooms: 5,
        bathrooms: 6,
        status: 'published',
    },
    {
        id: 4,
        badge: 'HOT DEAL',
        image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop',
        price: 'Rp 5,600,000,000',
        title: 'Azure Bay Penthouse',
        location: 'Seminyak, Bali',
        city: 'Bali',
        size: '980',
        beds: '2',
        baths: '1',
        land_area: 980,
        bedrooms: 2,
        bathrooms: 1,
        status: 'published',
    },
];

export default dummyProperties;