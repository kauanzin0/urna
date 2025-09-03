let candidatos = JSON.parse(localStorage.getItem("candidatos")) || {};
let votos = JSON.parse(localStorage.getItem("votos")) || {};

function adicionarCandidato() {
  let numero = document.getElementById("numero").value;
  let nome = document.getElementById("nome").value;

  if (numero && nome) {
    candidatos[numero] = nome;
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
    atualizarLista();
  }
  document.getElementById("numero").value = "";
  document.getElementById("nome").value = "";
}

function atualizarLista() {
  let ul = document.getElementById("lista-candidatos");
  ul.innerHTML = "";
  for (let numero in candidatos) {
    let li = document.createElement("li");
    li.innerText = numero + " - " + candidatos[numero];
    ul.appendChild(li);
  }
  atualizarResultados();
}

function atualizarResultados() {
  let ul = document.getElementById("resultado");
  ul.innerHTML = "";
  for (let numero in candidatos) {
    let li = document.createElement("li");
    li.innerText = candidatos[numero] + ": " + (votos[numero] || 0) + " votos";
    ul.appendChild(li);
  }
}

function resetarSistema() {
  if (confirm("Tem certeza que deseja resetar todos os dados?")) {
    localStorage.removeItem("candidatos");
    localStorage.removeItem("votos");
    candidatos = {};
    votos = {};
    atualizarLista();
  }
}

atualizarLista();
