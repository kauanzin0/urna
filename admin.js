// scripts/admin.js
import { adminAPI, authAPI } from '../supabase.js'

document.addEventListener('DOMContentLoaded', function() {
    // ... código anterior ...
    
    // Carregar dados iniciais
    async function loadInitialData() {
        try {
            await updateStats();
            await renderVoterList();
            await renderCandidateManagementList();
            await renderResultsChart();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    // Atualizar estatísticas (modificada)
    async function updateStats() {
        try {
            const stats = await adminAPI.getElectionStats();
            
            totalVotersElement.textContent = stats.totalVoters;
            totalCandidatesElement.textContent = candidates.length;
            totalVotesElement.textContent = stats.totalVotes;
            participationRateElement.textContent = `${stats.participationRate}%`;
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }
    
    // Renderizar lista de eleitores (modificada)
    async function renderVoterList() {
        try {
            const searchTerm = voterSearch.value;
            const { data, error } = await adminAPI.getVoters(searchTerm);
            
            if (error) {
                voterList.innerHTML = '<div class="no-results"><p>Erro ao carregar eleitores</p></div>';
                return;
            }
            
            voters = data || [];
            
            // Resto do código de renderização...
        } catch (error) {
            console.error('Erro ao carregar eleitores:', error);
        }
    }
    
    // Adicionar eleitor (modificada)
    async function handleAddVoter(e) {
        e.preventDefault();
        
        const id = document.getElementById('newVoterId').value;
        const name = document.getElementById('newVoterName').value;
        const password = document.getElementById('newVoterPassword').value;
        
        try {
            const voterData = {
                numero_identificacao: id,
                nome: name,
                senha: password,
                ja_votou: false,
                ativo: true
            };
            
            const { data, error } = await adminAPI.addVoter(voterData);
            
            if (error) {
                alert('Erro ao adicionar eleitor: ' + error.message);
                return;
            }
            
            await updateStats();
            await renderVoterList();
            
            voterForm.reset();
            voterModal.style.display = 'none';
            
            showSuccessMessage('Eleitor adicionado com sucesso!');
        } catch (error) {
            alert('Erro ao adicionar eleitor');
            console.error(error);
        }
    }
    
    // Gerar link de registro (nova função)
    async function generateRegistrationLink() {
        try {
            // Gerar código único
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            const linkData = {
                codigo: code,
                data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
                max_usos: 100,
                usos_atuais: 0,
                ativo: true
            };
            
            const { data, error } = await adminAPI.generateRegistrationLink(linkData);
            
            if (error) {
                alert('Erro ao gerar link: ' + error.message);
                return;
            }
            
            // Atualizar o link no modal
            const generatedLink = document.getElementById('generatedLink');
            generatedLink.value = `${window.location.origin}/register.html?code=${code}`;
            
            linkModal.style.display = 'flex';
        } catch (error) {
            alert('Erro ao gerar link de registro');
            console.error(error);
        }
    }
    
    // Carregar dados iniciais
    loadInitialData();
    
    // ... resto do código ...
});