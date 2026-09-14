export interface OrderItemResi {
  id: number;
  nama_produk: string;
  qty: number;
  warna: string;
  ukuran: string;
  harga: number;
  subtotal: number;
  berat?: number;
}

export interface OrderRecordResi {
  id: number;
  invoice_no: string;
  nama_pembeli: string;
  no_hp: string;
  alamat_lengkap: string;
  status: string;
  subtotal: number;
  ongkir: number;
  total: number;
  total_harga?: number;
  no_resi?: string | null;
  kurir?: string | null;
  berat_total?: number;
  created_at: string;
  order_items: OrderItemResi[];
}

export const cetakLabelPacking = (
  item: OrderRecordResi,
  customResi?: string,
  customKurir?: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Izinkan pop-up untuk mencetak label pengiriman.');
    return;
  }

  // Hitung total kuantitas barang
  const totalQty = (item.order_items || []).reduce((acc, curr) => acc + (curr.qty || 1), 0);
  
  // Estimasi berat paket (default 250gr per pcs)
  const beratGram = item.berat_total 
    ? item.berat_total 
    : (item.order_items || []).reduce((acc, curr) => acc + ((curr.berat || 250) * (curr.qty || 1)), 0);
  
  const beratDisplay = beratGram >= 1000 ? `${(beratGram / 1000).toFixed(1)} Kg` : `${beratGram} gr`;

  // Format total pembayaran
  const totalBayar = Number(item.total || item.total_harga || 0);
  const totalHargaDisplay = `Rp ${totalBayar.toLocaleString('id-ID')}`;

  const rowsItemsHtml = (item.order_items || [])
    .map(
      (prod, i) => `
      <tr style="border-bottom: 1px dashed #cccccc;">
        <td style="padding: 5px 3px; vertical-align: top; width: 20px;">${i + 1}.</td>
        <td style="padding: 5px 3px; vertical-align: top;">
          <div style="font-weight: bold; font-size: 11px;">${prod.nama_produk}</div>
          <div style="font-size: 10px; color: #555555;">Varian: ${prod.warna || '-'} | Size: ${prod.ukuran || '-'}</div>
        </td>
        <td style="padding: 5px 3px; text-align: right; vertical-align: top; font-weight: bold; font-size: 12px; width: 35px;">
          x${prod.qty}
        </td>
      </tr>
    `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Label Pengiriman - ${item.invoice_no}</title>
        <style>
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 10px;
            color: #000000;
            font-size: 11px;
            line-height: 1.3;
          }
          .container {
            border: 2px solid #000000;
            padding: 10px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
          }
          .brand-box {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .logo-img {
            width: 38px;
            height: 38px;
            object-fit: contain;
          }
          .brand-title {
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 0.5px;
            line-height: 1.1;
          }
          .brand-sub {
            font-size: 9px;
            color: #555555;
          }
          .invoice-box {
            text-align: right;
          }
          .invoice-label {
            font-size: 8.5px;
            text-transform: uppercase;
            color: #666666;
            font-weight: bold;
          }
          .invoice-val {
            font-family: monospace;
            font-size: 11px;
            font-weight: 900;
          }
          .resi-box {
            border-bottom: 2px dashed #000000;
            padding: 12px 8px;
            text-align: center;
          }
          .tempel-area {
            border: 1.5px dashed #888888;
            padding: 14px 10px;
            font-size: 10px;
            font-weight: bold;
            color: #666666;
            background: #fafafa;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .info-grid {
            border-bottom: 2px solid #000000;
            padding: 8px 0;
          }
          .meta-bar {
            display: grid;
            grid-template-columns: 1fr 1fr 1.3fr;
            background: #f0f0f0;
            padding: 5px 6px;
            border: 1px solid #000000;
            font-size: 9.5px;
            font-weight: bold;
            margin-bottom: 6px;
            text-align: center;
          }
          .section-title {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            color: #555555;
            margin-bottom: 2px;
          }
          .buyer-name {
            font-size: 13px;
            font-weight: bold;
          }
          .buyer-phone {
            font-weight: bold;
            margin-bottom: 4px;
          }
          .buyer-address {
            font-size: 10.5px;
            line-height: 1.35;
          }
          .items-box {
            padding: 8px 0;
            flex: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .footer {
            border-top: 2px solid #000000;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
          }
          @media print {
            body { padding: 6px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div>
            <!-- KOP TOKO (TANPA BADGE KURIR) -->
            <div class="header">
              <div class="brand-box">
                <img 
                  src="/logo.png" 
                  alt="Almaco Logo" 
                  class="logo-img" 
                  onerror="this.style.display='none'"
                />
                <div>
                  <div class="brand-title">ALMACO FASHION</div>
                  <div class="brand-sub">Official Store Fashion & Butik</div>
                </div>
              </div>
              <div class="invoice-box">
                <div class="invoice-label">No. Pesanan:</div>
                <div class="invoice-val">${item.invoice_no}</div>
              </div>
            </div>

            <!-- AREA STIKER RESI KOSONG (UNTUK COUNTER EKSPEDISI) -->
            <div class="resi-box">
              <div class="tempel-area">
                [ TEMPAT MENEMPEL STIKER RESI DARI COUNTER ]
              </div>
            </div>

            <!-- DETAIL PENERIMA, BERAT, QTY & TOTAL -->
            <div class="info-grid">
              <div class="meta-bar">
                <span>BERAT: ${beratDisplay}</span>
                <span style="border-left: 1px solid #cccccc; border-right: 1px solid #cccccc;">QTY: ${totalQty} PCS</span>
                <span style="color: #000000;">TOTAL: ${totalHargaDisplay}</span>
              </div>
              
              <div class="section-title">PENERIMA:</div>
              <div class="buyer-name">${item.nama_pembeli}</div>
              <div class="buyer-phone">Telp: ${item.no_hp}</div>
              <div class="buyer-address">${item.alamat_lengkap}</div>
            </div>

            <!-- CHECKLIST PACKING BARANG -->
            <div class="items-box">
              <div class="section-title" style="margin-bottom: 4px;">CHECKLIST PACKING BARANG:</div>
              <table>
                ${rowsItemsHtml}
              </table>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <span>Pengirim: ALMACO FASHION</span>
            <span>Packing Selesai: [ &nbsp; ]</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};