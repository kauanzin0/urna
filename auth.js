// scripts/auth.js
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
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const voterId = voterIdInput.value;
        const password = voterPasswordInput.value;
        
        // Verificar credenciais de administrador - Acesso inicial
        if (voterId === '123456' && password === '1234567') {
            // Login direto para o admin inicial
            localStorage.setItem('currentAdmin', JSON.stringify({
                id: 'admin-inicial',
                email: 'admin@escolahelena.com',
                name: 'Admin Inicial',
                acesso_inicial: true // Flag para identificar que é o acesso inicial
            }));
            window.location.href = 'admin.html';
            return;
        }
        
        // Verificar credenciais de administrador - Email principal
        if (voterId === 'escolahelena.adm@gmail.com' || voterId === 'admin@escolahelena.com') {
            try {
                const { data, error } = await authAPI.loginAdmin(voterId, password);
                
                if (error || !data) {
                    alert('Credenciais de administrador inválidas!');
                    return;
                }
                
                // Login de administrador bem-sucedido
                localStorage.setItem('currentAdmin', JSON.stringify({
                    id: data.id,
                    email: data.email,
                    name: data.nome
                }));
                window.location.href = 'admin.html';
                return;
            } catch (error) {
                alert('Erro ao fazer login como administrador');
                return;
            }
        }
        
        // Verificar credenciais de eleitor
        try {
            const { data, error } = await authAPI.loginVoter(voterId, password);
            
            if (error || !data) {
                alert('ID ou senha incorretos!');
                return;
            }
            
            if (data.ja_votou) {
                alert('Este eleitor já votou!');
                return;
            }
            
            // Verificar status da eleição
            const { data: electionConfig, error: electionError } = await adminAPI.getElectionConfig();
            
            if (electionError) {
                alert('Erro ao verificar status da eleição');
                return;
            }
            
            if (electionConfig?.status !== 'ativa') {
                alert('A votação não está aberta no momento!');
                return;
            }
            
            // Login bem-sucedido
            localStorage.setItem('currentUser', JSON.stringify(data));
            window.location.href = 'voting.html';
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    });
    
    // Adicionar dica de login para administradores (apenas para desenvolvimento)
    if (window.location.href.includes('login.html')) {
        const adminHint = document.createElement('div');
        adminHint.style.marginTop = '20px';
        adminHint.style.padding = '15px';
        adminHint.style.backgroundColor = '#f0f9ff';
        adminHint.style.border = '1px solid #bae6fd';
        adminHint.style.borderRadius = '8px';
        adminHint.style.fontSize = '14px';
        adminHint.innerHTML = `
            <strong>Dica de acesso administrativo:</strong><br>
            ID: <code>123456</code> | Senha: <code>1234567</code>
        `;
        
        // Adicionar após o formulário de login
        loginForm.parentNode.appendChild(adminHint);
    }
});