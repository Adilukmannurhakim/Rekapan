const FormLogin = document.getElementById('FormLogin');

FormLogin.addEventListener('submit', function(event){
    event.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    const usernameBenar = "admin";
    const passwordBenar = "123"

    if (usernameInput === usernameBenar && passwordInput === passwordBenar) {

        alert("Selamat, Login Anda Berhasil");

        window.location.href = "dashboard.html";
    
    }
    else{
        alert("Maaf Login Anda gagal");
    }
});