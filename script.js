// Carregar dados do LocalStorage
let candidatos = JSON.parse(localStorage.getItem("candidatos")) || {};
let votos = JSON.parse(localStorage.getItem("votos")) || {};

function confirmarVoto() {
  let numero = document.getElementById("voto").value;
  let nome = candidatos[numero];

  if (nome) {
    votos[numero] = (votos[numero] || 0) + 1;
    localStorage.setItem("votos", JSON.stringify(votos));
    document.getElementById("mensagem").innerText = "Voto confirmado para " + nome;
  } else {
    document.getElementById("mensagem").innerText = "Número inválido!";
  }
  document.getElementById("voto").value = "";
}

function corrigirVoto() {
  document.getElementById("voto").value = "";
  document.getElementById("mensagem").innerText = "Digite novamente.";
}
