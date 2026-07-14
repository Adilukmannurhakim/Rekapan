const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rekapan'
});

db.connect((err) => {
    if (err) {
    console.error('Koneksi gagal', err.message);
    return;
    }
    console.log('Koneksi Berhasil');
});

app.get('/api/produk', (req, res) => {
    const sql = "SELECT * FROM produk";
    db.query(sql, (err,results) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

app.post('/api/produk', (req, res) => {
    const {nama, kategori, harga, stok} = req.body;
    const sql = "INSERT INTO produk (nama, kategori, harga, stok) VALUES (?, ?, ?, ?)";

    db.query(sql, [nama, kategori, harga, stok], (err, result) => {
        if (err) {
            console.error("Eror database", err.message);
            return res.status(500).json({error:err.message});
    }
        res.json({message: "Data Berhasil ditambahkan", id: result.insertId});       
    });
});

app.put('/api/produk/:id', (req, res) => {
    const { id } = req.params;
    const { nama, kategori, harga, stok} = req.body;
    const sql = "UPDATE produk SET nama = ?, kategori = ?, harga = ?, stok = ? WHERE id = ?";

    db.query(sql, [nama, kategori, harga, stok, id], (err, result) => {
        if (err){
            console.error("Detail Eror", err.message);
            return res.status(500).json({ error: err.message});
        }
            
        res.json({message: "Data Berhasil Diperbarui"});
    });
});

app.delete('/api/produk/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM produk WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(" Error DELETE", err.message);
            return res.status(500).json({ error: err.message});
        }
            
        res.json({message: "Data berhasil dihapus"});
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM pengguna WHERE username = ? AND password =?";

    db.query (sql, [username, password], (err,results) => {
        if (err) {
            console.error("Eror Login", err.message);
            return res.status(500).json({success: false, error: err.message});
        }
        if (results.length > 0) {
            res.json({success: true, message: "Login Berhasil", user: results[0].username});
        }
        else {
            res.status(401).json({ success: false, message: "Username Password salah"});
        }
    });
});

// =======================================================
// 7. API KHUSUS DASHBOARD (AGGREGATION DATA)
// =======================================================
app.get('/api/dashboard/summary', (req, res) => {
    // Perintah A: Hitung total pendapatan dan produk terjual (Hanya yang bertipe Keluar/Penjualan)
    const sqlTransaksi = "SELECT SUM(total_harga) AS total_pendapatan, SUM(jumlah) AS total_terjual FROM transaksi WHERE tipe = 'Keluar'";
    
    // Perintah B: Hitung ada berapa produk yang stoknya menipis (di bawah atau sama dengan 10 pcs)
    const sqlStokMenipis = "SELECT COUNT(*) AS total_menipis FROM produk WHERE stok <= 10";

    db.query(sqlTransaksi, (err, trxResult) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(sqlStokMenipis, (err, stokResult) => {
            if (err) return res.status(500).json({ error: err.message });

            // Kirim gabungan hasilnya ke frontend
            res.json({
                total_pendapatan: trxResult[0].total_pendapatan || 0,
                total_terjual: trxResult[0].total_terjual || 0,
                stok_menipis: stokResult[0].total_menipis || 0
            });
        });
    });
});

app.get('/api/dashboard/chart', (req, res) => {
    // Query untuk menjumlahkan pendapatan (Keluar) dikelompokkan per bulan di tahun 2026
    const sql = `
        SELECT MONTH(tanggal) AS bulan, SUM(total_harga) AS total 
        FROM transaksi 
        WHERE tipe = 'Keluar' AND YEAR(tanggal) = 2026 
        GROUP BY MONTH(tanggal) 
        ORDER BY MONTH(tanggal) ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error GET chart data:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/transaksi', (req, res) => {
    
    // 2. PERBAIKAN: Mengubah 'tanggaj' menjadi 'tanggal' DESC (terbaru di atas)
    const sql = "SELECT * FROM transaksi ORDER BY tanggal DESC"; 
    
    db.query(sql, (err, results) => {
        if(err) {
            console.error("Error transaksi", err.message);
            return res.status(500).json({ error: err.message});
        }
        res.json(results);
    });
});

app.post('/api/transaksi', (req, res) => {
    const { nama_produk, tipe, jumlah, total_harga} = req.body;
    const sqlInsert = "INSERT INTO transaksi (nama_produk, tipe, jumlah, total_harga) VALUES (?, ?, ?, ?)";

    // Perintah 1: Masukkan data riwayat transaksi
    db.query(sqlInsert, [nama_produk, tipe, jumlah, total_harga], (err, result) => {
        if (err) {
            console.error("Error POST transaksi", err.message);
            return res.status(500).json({ error: err.message});
        }
            
        // Perintah 2: Logika Pengurangan / Penambahan Stok Otomatis di tabel produk
        let sqlUpdateStok = "";
        if (tipe === 'Keluar') {
            sqlUpdateStok = "UPDATE produk SET stok = stok - ? WHERE nama = ?";
        } else if (tipe === 'Masuk') {
            sqlUpdateStok = "UPDATE produk SET stok = stok + ? WHERE nama = ?";
        }

        // Jalankan update stok jika tipenya valid
        if (sqlUpdateStok) {
            db.query(sqlUpdateStok, [jumlah, nama_produk], (errUpdate) => {
                if (errUpdate) {
                    console.error("❌ Gagal memperbarui stok otomatis:", errUpdate.message);
                    // Kita tidak return error di sini agar transaksi tetap tersimpan, 
                    // namun memberikan log peringatan di terminal server
                } else {
                    console.log(`🚀 Stok untuk [${nama_produk}] berhasil diperbarui (${tipe} sebanyak ${jumlah})`);
                }
            });
        }

        res.json({ message: "Transaksi Berhasil Dicatat dan Stok Diperbarui", id: result.insertId});
    });
});

app.put('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    const { nama_produk, tipe, jumlah, total_harga} = req.body;
    const sql = "UPDATE transaksi SET nama_produk = ?, tipe = ?, jumlah = ?, total_harga = ? WHERE id = ?";

    db.query(sql, [nama_produk, tipe, jumlah, total_harga, id], (err, result) => {
        if (err) {
            console.error("Error PUT transaksi:", err.message);
            return res.status(500).json({ error: err.message});
        }
            
        res.json({ message: "Transaksi Berhasil Update"});
    });
});

app.delete('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM transaksi WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error DELETE transaksi:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Transaksi Berhasil dihapus"});
    });
});
app.listen(PORT, () => {
    console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});