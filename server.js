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
    const sql = "UPDATE produk SET namaBarang = ?, kategori =?,, harga =?, stok =? WHERE id = ?";

    db.query(sql, [nama, kategori, harga, stok, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message});
        res.json({message: "Data Berhasil Diperbarui"});
    });
});

app.put('/api/produk/:id', (req, res) =>{
    const { id } = req.params;
    const sql = "DELETE FROM produk WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message});
        res.json({message: "Data berhasil dihapus"});
    });
});

app.listen(PORT, () => {
    console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});