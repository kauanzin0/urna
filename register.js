// Script para a página de registro (register.html)
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerLinkInput = document.getElementById('registerLink');
    const registerIdInput = document.getElementById('registerId');
    const registerNameInput = document.getElementById('registerName');
    const registerPasswordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
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
    
    // Definir link de registro válido (em um sistema real, isso viria do backend)
    const validRegisterLink = "https://urna.escolahelena.com/register?token=abc123";
    
    // Manipular o envio do formulário de registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const registerLink = registerLinkInput.value;
        const registerId = registerIdInput.value;
        const registerName = registerNameInput.value;
        const registerPassword = registerPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validar link de registro
        if (registerLink !== validRegisterLink) {
            alert('Link de registro inválido! Por favor, use o link fornecido pela administração.');
            return;
        }
        
        // Validar se as senhas coincidem
        if (registerPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        
        // Validar comprimento da senha
        if (registerPassword.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres!');
            return;
        }
        
        // Verificar se o ID já existe
        const voters = JSON.parse(localStorage.getItem('voters')) || [];
        if (voters.some(v => v.id === registerId)) {
            alert('Já existe um eleitor com este ID!');
            return;
        }
        
        // Adicionar novo eleitor
        voters.push({
            id: registerId,
            name: registerName,
            password: registerPassword,
            hasVoted: false
        });
        
        localStorage.setItem('voters', JSON.stringify(voters));
        
        alert('Registro realizado com sucesso! Agora você pode fazer login.');
        window.location.href = 'login.html';
    });
});