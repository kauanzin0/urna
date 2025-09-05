function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-message");

  if (user === "Kauan Mota" && pass === "09042008") {
    errorMsg.textContent = ""; // limpa mensagens anteriores
    window.location.href = "painel.html"; 
  } else {
    errorMsg.textContent = "❌ Usuário ou senha incorretos!";
  }
}
