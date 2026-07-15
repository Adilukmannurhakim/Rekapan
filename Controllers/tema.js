document.addEventListener("DOMContentLoaded", () => {
    const btnTema = document.getElementById("btnTema");
    
    // 1. Cek memori browser: Apakah user sebelumnya mengaktifkan dark mode?
    const statusTemaSaatIni = localStorage.getItem("tema");

    if (statusTemaSaatIni === "gelap") {
        document.body.classList.add("dark-mode");
        btnTema.innerText = "☀️ Mode Terang";
    }

    // 2. Event saat tombol sakelar diklik
    btnTema.addEventListener("click", () => {
        // Toggle artinya: jika ada class 'dark-mode' hapus, jika tidak ada maka tambahkan
        document.body.classList.toggle("dark-mode");

        // 3. Simpan pilihan user ke dalam memori komputer (localStorage)
        if (document.body.classList.contains("dark-mode")) {
            btnTema.innerText = "☀️ Mode Terang";
            localStorage.setItem("tema", "gelap"); // Ingat sebagai gelap
        } else {
            btnTema.innerText = "🌙 Mode Gelap";
            localStorage.setItem("tema", "terang"); // Ingat sebagai terang
        }
    });
});