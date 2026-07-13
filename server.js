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

app.listen(PORT, () => {
    console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});