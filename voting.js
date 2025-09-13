// scripts/voting.js
import { votingAPI, adminAPI } from '../supabase.js'

document.addEventListener('DOMContentLoaded', function() {
    // ... código anterior ...
    
    // Variáveis de estado
    let currentVote = '';
    let candidates = [];
    
    // Carregar candidatos do Supabase
    async function loadCandidates() {
        try {
            const { data, error } = await votingAPI.getCandidates();
            
            if (error) {
                console.error('Erro ao carregar candidatos:', error);
                candidateList.innerHTML = '<p>Erro ao carregar candidatos.</p>';
                return;
            }
            
            candidates = data || [];
            renderCandidateList();
        } catch (error) {
            console.error('Erro ao carregar candidatos:', error);
        }
    }
    
    // Confirmar voto (atualizada)
    async function confirmVote() {
        try {
            let candidate = null;
            
            if (currentVote !== 'BR') {
                candidate = candidates.find(c => c.numero === currentVote);
                if (candidate) {
                    // Atualizar contador de votos do candidato
                    const newVoteCount = (candidate.votos || 0) + 1;
                    await votingAPI.updateCandidateVotes(candidate.id, newVoteCount);
                }
            }
            
            // Registrar voto na tabela de votos
            const voteData = {
                eleitor_id: currentUser.id,
                candidato_id: candidate ? candidate.id : null,
                voto_branco: currentVote === 'BR',
                ip_address: await getIPAddress()
            };
            
            await votingAPI.castVote(voteData);
            
            // Marcar eleitor como votado
            await votingAPI.updateVoterStatus(currentUser.numero_identificacao, true);
            
            // Atualizar usuário atual
            currentUser.ja_votou = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Mostrar mensagem de sucesso
            if (currentVote === 'BR') {
                showSuccessMessage('Voto em branco confirmado com sucesso!');
            } else {
                showSuccessMessage(`Voto em ${candidate.name} confirmado com sucesso!`);
            }
            
            confirmationModal.style.display = 'none';
            
            // Aguardar um pouco antes de redirecionar
            setTimeout(handleLogout, 2000);
        } catch (error) {
            console.error('Erro ao registrar voto:', error);
            alert('Erro ao registrar voto. Tente novamente.');
        }
    }
    
    // Função auxiliar para obter endereço IP
    async function getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
    
    // Carregar candidatos ao inicializar
    loadCandidates();
    
    // ... resto do código ...
});