// Script principal para a página inicial
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Urna Eletrônica carregado');
    
    // Verificar se há uma sessão ativa
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    
    if (currentUser) {
        // Redirecionar para a página de votação se o usuário estiver logado
        window.location.href = 'voting.html';
    } else if (currentAdmin) {
        // Redirecionar para a página de administração se o admin estiver logado
        window.location.href = 'admin.html';
    }
});