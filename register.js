// scripts/register.js
import { authAPI } from '../supabase.js'

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerLinkInput = document.getElementById('registerLink');
    const registerIdInput = document.getElementById('registerId');
    const registerNameInput = document.getElementById('registerName');
    const registerPasswordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Verificar se há código de registro na URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        registerLinkInput.value = code;
    }
    
    // Manipular o envio do formulário de registro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const registerLink = registerLinkInput.value;
        const registerId = registerIdInput.value;
        const registerName = registerNameInput.value;
        const registerPassword = registerPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
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
        
        try {
            // Validar link de registro
            const { data: linkData, error: linkError } = await authAPI.validateRegistrationLink(registerLink);
            
            if (linkError || !linkData) {
                alert('Link de registro inválido ou expirado!');
                return;
            }
            
            // Verificar se o ID já existe
            const { data: existingVoter } = await supabase
                .from('eleitores')
                .select('id')
                .eq('numero_identificacao', registerId)
                .single();
            
            if (existingVoter) {
                alert('Já existe um eleitor com este ID!');
                return;
            }
            
            // Adicionar novo eleitor
            const voterData = {
                numero_identificacao: registerId,
                nome: registerName,
                senha: registerPassword,
                ja_votou: false,
                link_registro_id: linkData.id,
                ativo: true
            };
            
            const { data, error } = await authAPI.registerVoter(voterData);
            
            if (error) {
                alert('Erro ao registrar: ' + error.message);
                return;
            }
            
            // Atualizar contador de usos do link
            await supabase
                .from('links_registro')
                .update({ usos_atuais: linkData.usos_atuais + 1 })
                .eq('id', linkData.id);
            
            alert('Registro realizado com sucesso! Agora você pode fazer login.');
            window.location.href = 'login.html';
        } catch (error) {
            alert('Erro ao processar registro');
            console.error(error);
        }
    });
});