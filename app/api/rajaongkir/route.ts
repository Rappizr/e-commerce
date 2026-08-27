import { NextResponse } from 'next/server';

const ORIGIN_SUBDISTRICT_ID = '6170'; 
const KOMERCE_API_KEY = process.env.RAJAONGKIR_API_KEY || 'C7JHXYk16893a0f7daa087b8UgxeyLCd';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(query)}&limit=10&offset=0`,
      {
        headers: {
          key: KOMERCE_API_KEY,
        },
      }
    );

    const data = await res.json();
    const destinationList = data?.data || [];
    const results = destinationList.map((item: any) => ({
      city_id: String(item.id),
      type: item.city_name ? '' : 'Kecamatan',
      city_name: item.label || `${item.subdistrict_name}, ${item.district_name}, ${item.city_name}`,
      province: item.province_name,
      postal_code: item.zip_code || '',
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Gagal memanggil API Destinasi Komerce:', err);
    return NextResponse.json({ results: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { destination_city_id, weight } = body;

    if (!destination_city_id) {
      return NextResponse.json(
        { error: 'ID Destinasi wajib diisi' },
        { status: 400 }
      );
    }

    const totalWeight = Math.max(100, Number(weight) || 500);
    const couriers = ['jne', 'jnt', 'sicepat', 'pos'];
    const pricingList: any[] = [];

    const requests = couriers.map(async (courier) => {
      try {
        const res = await fetch('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', {
          method: 'POST',
          headers: {
            key: KOMERCE_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            origin: ORIGIN_SUBDISTRICT_ID,
            destination: String(destination_city_id),
            weight: String(totalWeight),
            courier: courier,
          }),
        });

        const json = await res.json();
        return json?.data || [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(requests);

    results.flat().forEach((c: any) => {
      if (c && c.cost) {
        pricingList.push({
          company: c.code || '',
          courier_name: c.name || (c.code ? c.code.toUpperCase() : 'Kurir'),
          courier_service_name: c.service || '',
          duration: c.etd ? `${c.etd.replace(/hari|HARI/g, '').trim()} Hari` : '2-3 Hari',
          price: Number(c.cost) || 0,
        });
      }
    });

    if (pricingList.length === 0) {
      const weightKg = totalWeight <= 1300 ? 1 : Math.ceil((totalWeight - 300) / 1000);
      return NextResponse.json({
        pricing: [
          { company: 'jne', courier_name: 'JNE', courier_service_name: 'REG (Reguler)', duration: '2-3 Hari', price: 18000 * weightKg },
          { company: 'jnt', courier_name: 'J&T Express', courier_service_name: 'EZ', duration: '2-3 Hari', price: 17000 * weightKg },
          { company: 'sicepat', courier_name: 'SiCepat', courier_service_name: 'SIUNTUNG', duration: '2-3 Hari', price: 16500 * weightKg },
          { company: 'pos', courier_name: 'POS Indonesia', courier_service_name: 'Pos Reguler', duration: '2-4 Hari', price: 16000 * weightKg },
        ],
      });
    }

    return NextResponse.json({ pricing: pricingList });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memproses ongkir' }, { status: 500 });
  }
}