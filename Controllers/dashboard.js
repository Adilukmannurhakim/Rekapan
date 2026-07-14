document.addEventListener("DOMContentLoaded", () => {
    muatRingkasanDashboard();
    muatTransaksiTerakhir();
    muatGrafikPendapatan();
});

// FUNGSI 1: ISI ANGKA DI 3 KOTAK UTAMA
async function muatRingkasanDashboard() {
    try {
        const response = await fetch('http://localhost:3000/api/dashboard/summary');
        const data = await response.json();

        // 1. Tampilkan Total Pendapatan berformat Rupiah
        document.getElementById('statPendapatan').innerText = `Rp ${data.total_pendapatan.toLocaleString('id-ID')}`;
        
        // 2. Tampilkan Total Produk Terjual
        document.getElementById('statTerjual').innerText = `${data.total_terjual} pcs`;
        
        // 3. Tampilkan Jumlah Produk yang Stoknya Menipis
        document.getElementById('statMenipis').innerText = `${data.stok_menipis} Produk`;

    } catch (error) {
        console.error("Gagal memuat ringkasan dashboard:", error);
    }
}

// 2. FUNGSI UTAMA MENGGAMBAR GRAFIK
async function muatGrafikPendapatan() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    try {
        const response = await fetch('http://localhost:3000/api/dashboard/chart');
        const data = await response.json();

        // Siapkan keranjang kosong untuk 12 bulan (default diisi 0 rupiah)
        const pendapatanBulanan = new Array(12).fill(0);

        // Masukkan data dari database sesuai bulannya (Bulan 1 = Januari = Indeks 0)
        data.forEach(item => {
            const indeksBulan = item.bulan - 1; 
            pendapatanBulanan[indeksBulan] = item.total;
        });

        // Gambar grafik menggunakan library Chart.js
        new Chart(ctx, {
            type: 'line', // Jenis grafik garis (seperti di desain Anda)
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [{
                    label: 'Pendapatan Toko (Rp)',
                    data: pendapatanBulanan,
                    borderColor: '#ff4d6d', // Warna garis pink/merah sesuai tema dashboard Anda
                    backgroundColor: 'rgba(255, 77, 109, 0.1)', // Warna area transparan di bawah garis
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3, // Membuat lengkungan garis jadi halus
                    pointRadius: 4,
                    pointBackgroundColor: '#ff4d6d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            // Format angka di sumbu Y menjadi format Rupiah (Rp)
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Format angka saat titik grafik disentuh/hover
                            label: function(context) {
                                return ' Pendapatan: Rp ' + context.raw.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Gagal memuat grafik pendapatan:", error);
    }
}
// FUNGSI 2: ISI TABEL TRANSAKSI TERAKHIR (AMBIL 5 DATA TERBARU)
async function muatTransaksiTerakhir() {
    const tbody = document.getElementById('bodyDashboardTransaksi');
    if (!tbody) return;

    try {
        const response = await fetch('http://localhost:3000/api/transaksi');
        const transaksiList = await response.json();

        tbody.innerHTML = ""; // Bersihkan isi tabel lama

        // Batasi hanya menampilkan maksimal 5 transaksi terbaru saja di dashboard
        const limaTransaksiTerakhir = transaksiList.slice(0, 5);

        if (limaTransaksiTerakhir.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada riwayat transaksi</td></tr>`;
            return;
        }

        limaTransaksiTerakhir.forEach(trx => {
            const tr = document.createElement('tr');
            
            // Format Tanggal
            const tgl = new Date(trx.tanggal);
            const tglFormat = tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

            // Tentukan warna label tipe (Masuk = hijau, Keluar = merah)
            const labelWarna = trx.tipe === 'Masuk' ? 'status sukses' : 'status pending';

            tr.innerHTML = `
                <td>${tglFormat}</td>
                <td><strong>${trx.nama_produk}</strong></td>
                <td><span class="${labelWarna}">${trx.tipe}</span></td>
                <td>${trx.jumlah} pcs</td>
                <td>Rp ${trx.total_harga.toLocaleString('id-ID')}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Gagal memuat transaksi terakhir:", error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data dari server</td></tr>`;
    }
}