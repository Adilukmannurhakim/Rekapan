if(localStorage.getItem('isLoggedIn') !== 'true') {
    alert("Akses ditolak");
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function(){
    const API_URL = 'http://localhost:3000/api/produk';
    let dataStok =[];
    let editId = null;

    const productForm = document.getElementById('productForm');
    const stockTableBody = document.getElementById('stockTableBody');
    const submitBtn = productForm.querySelector('.btn-submit');

    async function tampilkanData(){
        try{
            const response = await fetch(API_URL);
            dataStok = await response.json();
            stockTableBody.innerHTML = "";

        dataStok.forEach((produk) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td><strong>${produk.nama}</strong></td>
            <td>${produk.kategori}</td>
            <td>Rp ${produk.harga.toLocaleString('id-ID')}</td>
            <td>${produk.stok} Pcs</td>
            <td>
                <button class="btn-edit" data-id="${produk.id}">Edit</button>
                <button class="btn-delete" data-id="${produk.id}">Hapus</button>
            </td>
            `;
            stockTableBody.appendChild(row);
        });
        aktifkanTombolHapus();
        aktifkanTombolEdit();
    } catch (error) {
        console.error("gagal memuat database", error);
    }
    }
    productForm.addEventListener('submit', async function(event){
        event.preventDefault();

        const produkData = {
        nama : document.getElementById('nama').value,
        kategori : document.getElementById('kategori').value,
        harga : parseInt(document.getElementById('harga').value),
        stok : parseInt(document.getElementById('stok').value)
        };

        try{
            let response;
        if (editId === null) {

            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(produkData)
            });
        }
        else{
           response = await fetch(`${API_URL}/${editId}`, { 
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(produkData)
            });
        }
        if (!response.ok){
            const errorResult = await response.json();
            alert(`Gagal menyimpan`);
            console.error("Detail Error SQL:", errorResult.error);
            return;
        }

            editId = null;
            submitBtn.textContent = "Simpan";
            submitBtn.style.backgrounColor = "#fff";

        tampilkanData();
        productForm.reset();
    }
    catch (error) {
        console.error("Gagal Menyimpan data", error);
    }  
    });

    function aktifkanTombolEdit() {
        const tombolEdit = document.querySelectorAll('.btn-edit');
        tombolEdit.forEach(tombol => {
            tombol.addEventListener('click', function(){
                editId = this.getAttribute('data-id');
                const produkDipilih = dataStok.find(p => p.id == editId);

                document.getElementById('nama').value = produkDipilih.nama;
                document.getElementById('kategori').value = produkDipilih.kategori;
                document.getElementById('harga').value = produkDipilih.harga;
                document.getElementById('stok').value = produkDipilih.stok;


                submitBtn.textContent = "Perbarui Produk";
                submitBtn.style.backgrounColor = "#ffc107";
                submitBtn.style.color = "#1a1a2e";
            });
        });
    }

    function aktifkanTombolHapus() {
        const tombolHapus = document.querySelectorAll('.btn-delete');

        tombolHapus.forEach(tombol => {
            tombol.addEventListener('click', async function(){
                const idYangDihapus = this.getAttribute('data-id');
                const produkDipilih = dataStok.find(p => p.id == idYangDihapus);

                if(confirm('Yakin ingin menghapus "${dataStok[idYangDihapus].nama}"?')) {
                    try{
                        await fetch(`${API_URL}/${idYangDihapus}`, {
                            method: 'DELETE'
                        });
                    if  (editId === idYangDihapus) {
                        editId = null;
                        submitBtn.textContent = "Simpan";
                        submitBtn.style.backgrounColor = "#1a1a2e";
                        productForm.reset();
                    }
                    tampilkanData();
                }
                catch(error) {
                    console.error("Gagal Menghapus Data", error);
                }
            }
            });
        });
    }
    tampilkanData();
});