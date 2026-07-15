// 1. SATPAM HALAMAN: Cek login
if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert("⛔ Akses Ditolak! Anda harus login terlebih dahulu.");
    window.location.href = 'index.html';
}

// 2. DOM Elements Modal
const modal = document.getElementById('modalTransaksi');
const formTransaksi = document.getElementById('formTransaksi');
const modalTitle = document.getElementById('modalTitle');
const transaksiIdInput = document.getElementById('transaksiId');

// Buka modal untuk Tambah Data Baru
// Pemicu buka modal Tambah Data Baru
document.getElementById('btnBukaModal').addEventListener('click', () => {
    modalTitle.innerText = "Catat Transaksi Baru";
    formTransaksi.reset();
    transaksiIdInput.value = ""; 
    modal.style.display = "block";
    
    // PANGGIL FUNGSI INI AGAR DROPDOWN SELALU TERBARU DARI DATABASE
    muatDropdownProduk(); 
});

// Tutup Modal
document.getElementById('btnTutupModal').addEventListener('click', () => {
    modal.style.display = "none";
});

// Jalankan pengambilan data pertama kali saat load
ambilDataTransaksi();

// 3. READ DATA (Menampilkan Transaksi + Tombol Aksi)
async function ambilDataTransaksi() {
    const bodyTransaksi = document.getElementById('bodyTransaksi');
    if (!bodyTransaksi) return;

    bodyTransaksi.innerHTML = '<tr><td colspan="6" style="text-align:center;">Memuat data transaksi...</td></tr>';

    try {
        const response = await fetch('http://localhost:3000/api/transaksi');
        const data = await response.json();
        bodyTransaksi.innerHTML = ''; 

        if (data.length === 0) {
            bodyTransaksi.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada riwayat transaksi.</td></tr>';
            return;
        }

        data.forEach(trx => {
            const row = document.createElement('tr');
            const tanggalFormat = new Date(trx.tanggal).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const classWarna = trx.tipe === 'Masuk' ? 'status-masuk' : 'status-keluar';

            row.innerHTML = `
                <td>${tanggalFormat}</td>
                <td>${trx.nama_produk}</td>
                <td><span class="${classWarna}">${trx.tipe}</span></td>
                <td>${trx.jumlah} pcs</td>
                <td>Rp ${trx.total_harga.toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn-edit" onclick="siapkanEdit(${trx.id}, '${trx.nama_produk}', '${trx.tipe}', ${trx.jumlah}, ${trx.total_harga})">✏️ Edit</button>
                    <button class="btn-hapus" onclick="hapusTransaksi(${trx.id})">🗑️ Hapus</button>
                </td>
            `;
            bodyTransaksi.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        bodyTransaksi.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #ff4a68;">Gagal mengambil data dari server.</td></tr>';
    }
}

// 1. MEMUAT DROPDOWN SEKALIGUS MENYIMPAN HARGA SATUAN
async function muatDropdownProduk() {
    const trxNamaSelect = document.getElementById('trxNama');
    if (!trxNamaSelect) return;

    try {
        const response = await fetch('http://localhost:3000/api/produk');
        const produkList = await response.json();

        // Reset dropdown, sisakan opsi pertama
        trxNamaSelect.innerHTML = '<option value="">-- Pilih Produk --</option>';

        // Masukkan produk & simpan HARGA SATUAN di atribut 'data-harga'
        produkList.forEach(prod => {
            const opt = document.createElement('option');
            opt.value = prod.nama; 
            opt.dataset.harga = prod.harga; // <-- KUNCI: Menyimpan harga satuan produk
            opt.innerText = `${prod.nama} (Stok: ${prod.stok} | Rp ${prod.harga.toLocaleString('id-ID')}/pcs)`;
            trxNamaSelect.appendChild(opt);
        });
    } catch (error) {
        console.error("Gagal memuat daftar produk untuk dropdown:", error);
    }
}

// 2. FUNGSI MENGHITUNG TOTAL HARGA OTOMATIS
function hitungTotalOtomatis() {
    const selectProduk = document.getElementById('trxNama');
    const inputJumlah = document.getElementById('trxJumlah');
    const inputTotalHarga = document.getElementById('trxHarga');

    // Ambil opsi produk yang sedang terpilih
    const opsiTerpilih = selectProduk.options[selectProduk.selectedIndex];
    
    // Jika produk belum dipilih atau jumlah masih kosong, set total ke 0
    if (!opsiTerpilih || !opsiTerpilih.dataset.harga || !inputJumlah.value) {
        inputTotalHarga.value = 0;
        return;
    }

    // Hitung Rumus: Harga Satuan x Jumlah Pcs
    const hargaSatuan = parseInt(opsiTerpilih.dataset.harga);
    const jumlahPcs = parseInt(inputJumlah.value) || 0;
    
    // Masukkan hasil perkalian ke dalam input Total Harga
    inputTotalHarga.value = hargaSatuan * jumlahPcs;
}

// 3. PASANG EVENT LISTENER (Berjalan setiap kali user memilih produk atau mengetik jumlah)
document.getElementById('trxJumlah').addEventListener('input', hitungTotalOtomatis);
document.getElementById('trxNama').addEventListener('change', hitungTotalOtomatis);

// 4. CREATE & UPDATE (Proses Simpan Data)
formTransaksi.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = transaksiIdInput.value;
    const payload = {
        nama_produk: document.getElementById('trxNama').value,
        tipe: document.getElementById('trxTipe').value,
        jumlah: parseInt(document.getElementById('trxJumlah').value),
        total_harga: parseInt(document.getElementById('trxHarga').value)
    };

    // Deteksi apakah Mode Edit atau Tambah Baru
    const url = id ? `http://localhost:3000/api/transaksi/${id}` : 'http://localhost:3000/api/transaksi';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(id ? "Data transaksi berhasil diperbarui!" : "Transaksi baru berhasil dicatat!");
            modal.style.display = "none";
            ambilDataTransaksi(); // Reload tabel otomatis
        } else {
            alert("Gagal menyimpan data!");
        }
    } catch (error) {
        console.error(error);
        alert("Eror saat menghubungi server.");
    }
});

// Ganti fungsi siapkanEdit lama Anda dengan yang ini:
async function siapkanEdit(id, nama_produk, tipe, jumlah, total_harga) {
    // 1. Ubah judul dan buka modal agar pengguna langsung melihat reaksi klik
    document.getElementById('modalTitle').innerText = "Ubah Data Transaksi";
    document.getElementById('modalTransaksi').style.display = "block";
    document.getElementById('transaksiId').value = id;

    // 2. TUNGGU dropdown produk selesai dimuat dari database
    await muatDropdownProduk(); 

    // 3. Set nilai input teks dan angka biasa
    document.getElementById('tipe').value = tipe; // Pastikan ID ini sesuai di HTML Anda
    document.getElementById('jumlah').value = jumlah; // Pastikan ID ini sesuai di HTML Anda
    document.getElementById('totalHarga').value = total_harga; // Pastikan ID ini sesuai di HTML Anda

    // 4. LOGIKA PINTAR: Cocokkan Nama Produk di Dropdown
    const dropdownProduk = document.getElementById('id_produk'); // PENTING: Ganti 'id_produk' dengan ID <select> produk Anda di HTML!
    
    if (dropdownProduk) {
        // Lakukan perulangan untuk mengecek setiap pilihan di dropdown
        for (let i = 0; i < dropdownProduk.options.length; i++) {
            // Jika teks di dropdown (misal: "Belimbing") SAMA dengan nama_produk dari tabel
            if (dropdownProduk.options[i].text === nama_produk) {
                dropdownProduk.selectedIndex = i; // Pilih opsi ini!
                break; // Hentikan pencarian jika sudah ketemu
            }
        }
    }
}

// 6. DELETE DATA (Hapus riwayat transaksi)
window.hapusTransaksi = async function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data riwayat transaksi ini secara permanen?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/transaksi/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Data riwayat transaksi berhasil dihapus!");
                ambilDataTransaksi(); // Reload tabel otomatis
            } else {
                alert("Gagal menghapus data!");
            }
        } catch (error) {
            console.error(error);
            alert("Eror saat menghubungkan ke server.");
        }
    }
};

// 7. Tombol Logout
document.getElementById('menuLogout').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm("Apakah Anda yakin ingin keluar aplikasi?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
});