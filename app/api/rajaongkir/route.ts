import { NextResponse } from 'next/server';

// ID Kecamatan Bandung, Tulungagung di database Komerce (Default: 6170)
const ORIGIN_SUBDISTRICT_ID = process.env.KOMERCE_ORIGIN_SUBDISTRICT_ID || '6170'; 
const KOMERCE_API_KEY = process.env.RAJAONGKIR_API_KEY || 'C7JHXYk16893a0f7daa087b8UgxeyLCd';

// 1. GET: Pencarian Kecamatan / Kota Tujuan
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = (searchParams.get("q") || "").trim();
  const toTitleCase = (str: string) => str.replace(/\b\w/g, (char) => char.toUpperCase());
  const query = toTitleCase(rawQuery);

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(query)}&limit=15&offset=0`,
      {
        method: 'GET',
        headers: {
          key: KOMERCE_API_KEY,
        },
        next: { revalidate: 86400 }, // Cache hasil pencarian selama 24 jam
      }
    );

    const data = await res.json();
    const destinationList = data?.data || [];
    
    const results = destinationList.map((item: any) => {
      const subdistrict = item.subdistrict_name || item.subdistrict || '';
      const district = item.district_name || item.district || '';
      const city = item.city_name || item.city || '';
      const formattedLabel = item.label || [subdistrict, district, city].filter(Boolean).join(', ');

      return {
        city_id: String(item.id),
        type: 'Kecamatan',
        city_name: formattedLabel,
        province: item.province_name || item.province || '',
        postal_code: item.zip_code || item.postal_code || '',
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('Gagal memanggil API Destinasi Komerce:', err);
    return NextResponse.json({ results: [] });
  }
}

// 2. POST: Perhitungan Biaya Ongkir Khusus JNE, J&T, dan SiCepat (Reguler & Kargo)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { destination_city_id, weight } = body;

    if (!destination_city_id) {
      return NextResponse.json(
        { error: 'ID Destinasi tujuan wajib diisi' },
        { status: 400 }
      );
    }

    // Minimum berat 100 gram
    const totalWeight = Math.max(100, Number(weight) || 350);
    
    // HANYA MENGGUNAKAN JNE, J&T, DAN SICEPAT (YANG DUKUNG API RAJAONGKIR)
    const couriers = ['jne', 'jnt', 'sicepat'];
    const pricingList: any[] = [];
    const seenServices = new Set<string>();

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
      } catch (err) {
        console.error(`Error mengambil tarif kurir ${courier}:`, err);
        return [];
      }
    });

    const results = await Promise.all(requests);

    // Filter ketat: HANYA JNE, J&T, dan SiCepat (Reguler & Kargo)
    results.flat().forEach((c: any) => {
      const priceValue = Number(c.cost ?? c.tariff ?? c.price ?? 0);
      
      if (c && priceValue > 0) {
        // Pembersihan format ETD / durasi pengiriman
        const rawEtd = String(c.etd || c.duration || '').toUpperCase();
        let cleanEtd = rawEtd
          .replace(/HARI|DAY|DAYS/g, '')
          .trim();
        cleanEtd = cleanEtd ? `${cleanEtd} Hari` : '2-4 Hari';

        const rawService = String(c.service || c.service_name || 'REG').toUpperCase().trim();
        const rawCompany = String(c.code || c.courier || '').toLowerCase().trim();

        // Validasi Ekspedisi (Hanya JNE, J&T, SiCepat)
        const isAllowedCompany = 
          rawCompany.includes('jne') || 
          rawCompany.includes('jnt') || 
          rawCompany.includes('j&t') || 
          rawCompany.includes('sicepat');

        // Filter Layanan Reguler
        const isReguler = 
          rawService === 'REG' || 
          rawService === 'EZ' || 
          rawService === 'SIUNTUNG' ||
          rawService === 'CTC';

        // Filter Layanan Kargo (JNE JTR, SiCepat GOKIL)
        const isCargo = 
          rawService === 'JTR' || 
          rawService === 'GOKIL' ||
          rawService === 'J&T CARGO' || 
          rawService === 'CARGO' ||
          rawService === 'KARGO';

        // Hindari penambahan opsi duplikat
        const serviceKey = `${rawCompany}-${rawService}`;

        if (isAllowedCompany && (isReguler || isCargo) && !seenServices.has(serviceKey)) {
          seenServices.add(serviceKey);

          let displayCourierName = 'JNE';
          if (rawCompany.includes('jnt') || rawCompany.includes('j&t')) {
            displayCourierName = 'J&T EXPRESS';
          } else if (rawCompany.includes('sicepat')) {
            displayCourierName = 'SICEPAT';
          }

          let displayServiceName = rawService;
          if (rawService === 'JTR') displayServiceName = 'JTR (KARGO)';
          if (rawService === 'GOKIL') displayServiceName = 'GOKIL (KARGO)';

          pricingList.push({
            company: rawCompany,
            courier_name: displayCourierName,
            courier_service_name: displayServiceName,
            duration: cleanEtd,
            price: priceValue,
          });
        }
      }
    });

    // Urutkan opsi ongkir dari harga paling murah
    pricingList.sort((a, b) => a.price - b.price);

    // Fallback khusus JNE, J&T, SiCepat jika API Komerce mengalami kendala/timeout
    if (pricingList.length === 0) {
      const weightKg = Math.max(1, Math.ceil(totalWeight / 1000));
      const isHeavy = totalWeight >= 10000;

      return NextResponse.json({
        pricing: [
          // JNE
          { company: 'jne', courier_name: 'JNE', courier_service_name: 'REG', duration: '2-3 Hari', price: 16000 * weightKg },
          { company: 'jne', courier_name: 'JNE', courier_service_name: 'JTR (KARGO)', duration: '3-5 Hari', price: isHeavy ? 45000 + (weightKg * 2000) : 50000 },
          
          // J&T
          { company: 'jnt', courier_name: 'J&T EXPRESS', courier_service_name: 'EZ', duration: '2-3 Hari', price: 15000 * weightKg },
          
          // SiCepat
          { company: 'sicepat', courier_name: 'SICEPAT', courier_service_name: 'SIUNTUNG', duration: '2-3 Hari', price: 15000 * weightKg },
          { company: 'sicepat', courier_name: 'SICEPAT', courier_service_name: 'GOKIL (KARGO)', duration: '3-5 Hari', price: isHeavy ? 40000 + (weightKg * 2000) : 48000 },
        ],
      });
    }

    return NextResponse.json({ pricing: pricingList });
  } catch (err: any) {
    console.error('Error POST calculate cost:', err);
    return NextResponse.json({ error: 'Gagal memproses perhitungan ongkir' }, { status: 500 });
  }
}