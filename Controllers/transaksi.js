// 1. SATPAM HALAMAN: Cek login
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert("⛔ Akses Ditolak! Anda harus login terlebih dahulu.");
    window.location.href = 'index.html';
}

// 2. Jalankan fungsi ambil data otomatis saat halaman terbuka
ambilDataTransaksi();

// 3. Fungsi Ambil Data Transaksi Dari Server Backend
async function ambilDataTransaksi() {
    const bodyTransaksi = document.getElementById('bodyTransaksi');
    if (!bodyTransaksi) return;

    bodyTransaksi.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat data transaksi...</td></tr>';

    try {
        const response = await fetch('http://localhost:3000/api/transaksi');
        const data = await response.json();

        bodyTransaksi.innerHTML = ''; // Bersihkan tulisan loading

        if (data.length === 0) {
            bodyTransaksi.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada riwayat transaksi.</td></tr>';
            return;
        }

        // Looping data dari MySQL ke dalam tabel HTML
        data.forEach(trx => {
            const row = document.createElement('tr');
            
            // Format tanggal agar rapi
            const tanggalFormat = new Date(trx.tanggal).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Gunakan class warna dari CSS
            const classWarna = trx.tipe === 'Masuk' ? 'status-masuk' : 'status-keluar';

            row.innerHTML = `
                <td>${tanggalFormat}</td>
                <td>${trx.nama_produk}</td>
                <td><span class="${classWarna}">${trx.tipe}</span></td>
                <td>${trx.jumlah} pcs</td>
                <td>Rp ${trx.total_harga.toLocaleString('id-ID')}</td>
            `;
            bodyTransaksi.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        bodyTransaksi.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ff4a68;">Gagal mengambil data dari server.</td></tr>';
    }
}

// 4. Fungsi Tombol Logout
document.getElementById('menuLogout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin keluar aplikasi?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
});