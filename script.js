function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-message");

  if (user === "Kauan Mota" && pass === "09042008") {
    alert("Login realizado com sucesso!");
    window.location.href = "painel.html"; // Redireciona após login
  } else {
    errorMsg.textContent = "Usuário ou senha incorretos!";
  }
}
