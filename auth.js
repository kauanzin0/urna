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
        
        // Verificar credenciais de administrador
        if (voterId === 'escolahelena.adm@gmail.com') {
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
            const { data: electionConfig } = await adminAPI.getElectionConfig();
            
            if (electionConfig?.status !== 'ativa') {
                alert('A votação não está aberta no momento!');
                return;
            }
            
            // Login bem-sucedido
            localStorage.setItem('currentUser', JSON.stringify(data));
            window.location.href = 'voting.html';
        } catch (error) {
            alert('Erro ao fazer login');
            console.error(error);
        }
    });
});





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
        
        // Verificar credenciais de administrador
        if (voterId === 'escolahelena.adm@gmail.com') {
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
            const { data: electionConfig } = await adminAPI.getElectionConfig();
            
            if (electionConfig?.status !== 'ativa') {
                alert('A votação não está aberta no momento!');
                return;
            }
            
            // Login bem-sucedido
            localStorage.setItem('currentUser', JSON.stringify(data));
            window.location.href = 'voting.html';
        } catch (error) {
            alert('Erro ao fazer login');
            console.error(error);
        }
    });
});