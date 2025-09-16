// scripts/auth.js (versão sem módulos ES6)
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
    
    // Função para login de administrador via API
    async function loginAdmin(email, password) {
        try {
            const { data, error } = await supabase
                .from('administradores')
                .select('*')
                .eq('email', email)
                .eq('senha', password)
                .eq('ativo', true)
                .single();
            
            return { data, error };
        } catch (error) {
            return { error };
        }
    }
    
    // Função para login de eleitor via API
    async function loginVoter(voterId, password) {
        try {
            const { data, error } = await supabase
                .from('eleitores')
                .select('*')
                .eq('numero_identificacao', voterId)
                .eq('senha', password)
                .eq('ativo', true)
                .single();
            
            return { data, error };
        } catch (error) {
            return { error };
        }
    }
    
    // Função para obter configuração da eleição
    async function getElectionConfig() {
        try {
            const { data, error } = await supabase
                .from('configuracoes_eleicao')
                .select('*')
                .order('data_criacao', { ascending: false })
                .limit(1)
                .single();
            
            return { data, error };
        } catch (error) {
            return { error };
        }
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
                acesso_inicial: true
            }));
            window.location.href = 'admin.html';
            return;
        }
        
        // Verificar credenciais de administrador - Email principal
        if (voterId === 'escolahelena.adm@gmail.com' || voterId === 'admin@escolahelena.com') {
            try {
                const { data, error } = await loginAdmin(voterId, password);
                
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
            const { data, error } = await loginVoter(voterId, password);
            
            if (error || !data) {
                alert('ID ou senha incorretos!');
                return;
            }
            
            if (data.ja_votou) {
                alert('Este eleitor já votou!');
                return;
            }
            
            // Verificar status da eleição
            const { data: electionConfig, error: electionError } = await getElectionConfig();
            
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