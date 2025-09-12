// Script de autenticação para login.html
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const voterIdInput = document.getElementById('voterId');
    const voterPasswordInput = document.getElementById('voterPassword');
    
    // Verificar se já está logado
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    
    if (currentUser) {
        window.location.href = 'voting.html';
        return;
    } else if (currentAdmin) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Manipular o envio do formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const voterId = voterIdInput.value;
        const password = voterPasswordInput.value;
        
        // Verificar credenciais de administrador
        if (voterId === 'escolahelena.adm@gmail.com' && password === 'adm123') {
            // Login de administrador bem-sucedido
            localStorage.setItem('currentAdmin', JSON.stringify({
                email: voterId,
                name: 'Administrador'
            }));
            window.location.href = 'admin.html';
            return;
        }
        
        // Verificar credenciais de eleitor
        const voters = JSON.parse(localStorage.getItem('voters')) || [];
        const voter = voters.find(v => v.id === voterId && v.password === password);
        
        if (!voter) {
            alert('ID ou senha incorretos!');
            return;
        }
        
        if (voter.hasVoted) {
            alert('Este eleitor já votou!');
            return;
        }
        
        const votingStatus = JSON.parse(localStorage.getItem('votingStatus')) || 'stopped';
        if (votingStatus !== 'active') {
            alert('A votação não está aberta no momento!');
            return;
        }
        
        // Login bem-sucedido
        localStorage.setItem('currentUser', JSON.stringify(voter));
        window.location.href = 'voting.html';
    });
});