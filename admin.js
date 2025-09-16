// scripts/admin.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o administrador está logado
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (!currentAdmin) {
        window.location.href = 'login.html';
        return;
    }
    
    // Elementos da DOM
    const adminNameElement = document.getElementById('adminName');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const addVoterBtn = document.getElementById('addVoterBtn');
    const generateLinkBtn = document.getElementById('generateLinkBtn');
    const voterList = document.getElementById('voterList');
    const voterSearch = document.getElementById('voterSearch');
    const startVotingBtn = document.getElementById('startVotingBtn');
    const pauseVotingBtn = document.getElementById('pauseVotingBtn');
    const endVotingBtn = document.getElementById('endVotingBtn');
    const votingStatusText = document.getElementById('votingStatusText');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const candidateManagementList = document.getElementById('candidateManagementList');
    const resultsChart = document.getElementById('resultsChart');
    const voterModal = document.getElementById('voterModal');
    const candidateModal = document.getElementById('candidateModal');
    const linkModal = document.getElementById('linkModal');
    const voterForm = document.getElementById('voterForm');
    const candidateForm = document.getElementById('candidateForm');
    const generatedLink = document.getElementById('generatedLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const closeButtons = document.querySelectorAll('.close, .close-modal');
    
    // Elementos de estatísticas
    const totalVotersElement = document.getElementById('totalVoters');
    const totalCandidatesElement = document.getElementById('totalCandidates');
    const totalVotesElement = document.getElementById('totalVotes');
    const participationRateElement = document.getElementById('participationRate');
    
    // Variáveis de estado
    let voters = [];
    let candidates = [];
    let electionConfig = null;
    
    // Configurar interface
    adminNameElement.textContent = currentAdmin.name || 'Administrador';
    
    // Carregar dados iniciais
    async function loadInitialData() {
        try {
            await updateStats();
            await renderVoterList();
            await renderCandidateManagementList();
            await renderResultsChart();
            await loadElectionConfig();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    // Event listeners
    adminLogoutBtn.addEventListener('click', handleLogout);
    addVoterBtn.addEventListener('click', () => voterModal.style.display = 'flex');
    generateLinkBtn.addEventListener('click', generateRegistrationLink);
    addCandidateBtn.addEventListener('click', () => candidateModal.style.display = 'flex');
    
    voterSearch.addEventListener('input', renderVoterList);
    
    startVotingBtn.addEventListener('click', () => changeElectionStatus('ativa'));
    pauseVotingBtn.addEventListener('click', () => changeElectionStatus('pausada'));
    endVotingBtn.addEventListener('click', () => changeElectionStatus('encerrada'));
    
    voterForm.addEventListener('submit', handleAddVoter);
    candidateForm.addEventListener('submit', handleAddCandidate);
    copyLinkBtn.addEventListener('click', copyLinkToClipboard);
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            voterModal.style.display = 'none';
            candidateModal.style.display = 'none';
            linkModal.style.display = 'none';
        });
    });
    
    // Fechar modais clicando fora deles
    window.addEventListener('click', (e) => {
        if (e.target === voterModal) voterModal.style.display = 'none';
        if (e.target === candidateModal) candidateModal.style.display = 'none';
        if (e.target === linkModal) linkModal.style.display = 'none';
    });
    
    // Funções
    async function loadElectionConfig() {
        try {
            const { data, error } = await adminAPI.getElectionConfig();
            
            if (error) {
                console.error('Erro ao carregar configuração:', error);
                return;
            }
            
            electionConfig = data;
            updateVotingControls();
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
        }
    }
    
    async function updateStats() {
        try {
            const stats = await adminAPI.getElectionStats();
            
            if (stats.error) {
                console.error('Erro ao carregar estatísticas:', stats.error);
                return;
            }
            
            totalVotersElement.textContent = stats.totalVoters;
            totalCandidatesElement.textContent = candidates.length;
            totalVotesElement.textContent = stats.totalVotes;
            participationRateElement.textContent = `${stats.participationRate}%`;
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }
    
    async function renderVoterList() {
        try {
            const searchTerm = voterSearch.value;
            const { data, error } = await adminAPI.getVoters(searchTerm);
            
            if (error) {
                voterList.innerHTML = '<div class="no-results"><p>Erro ao carregar eleitores</p></div>';
                return;
            }
            
            voters = data || [];
            voterList.innerHTML = '';
            
            if (voters.length === 0) {
                voterList.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>Nenhum eleitor encontrado</p></div>';
                return;
            }
            
            voters.forEach(voter => {
                const div = document.createElement('div');
                div.className = 'voter-item';
                div.innerHTML = `
                    <div>
                        <strong>${voter.nome}</strong>
                        <div>ID: ${voter.numero_identificacao}</div>
                    </div>
                    <div class="voter-status ${voter.ja_votou ? 'voted' : 'not-voted'}">
                        ${voter.ja_votou ? 'Já votou' : 'Não votou'}
                    </div>
                `;
                
                voterList.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao carregar eleitores:', error);
        }
    }
    
    async function renderCandidateManagementList() {
        try {
            const { data, error } = await votingAPI.getCandidates();
            
            if (error) {
                candidateManagementList.innerHTML = '<div class="no-results"><p>Erro ao carregar candidatos</p></div>';
                return;
            }
            
            candidates = data || [];
            candidateManagementList.innerHTML = '';
            
            if (candidates.length === 0) {
                candidateManagementList.innerHTML = '<div class="no-results"><i class="fas fa-user-tie"></i><p>Nenhum candidato cadastrado</p></div>';
                return;
            }
            
            candidates.forEach(candidate => {
                const div = document.createElement('div');
                div.className = 'candidate-management-item';
                div.innerHTML = `
                    <div>
                        <strong>${candidate.nome}</strong>
                        <div>${candidate.partido} - Nº ${candidate.numero}</div>
                    </div>
                    <div>Votos: ${candidate.votos || 0}</div>
                `;
                
                candidateManagementList.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao carregar candidatos:', error);
        }
    }
    
    async function renderResultsChart() {
        try {
            const { data, error } = await adminAPI.getElectionResults();
            
            if (error) {
                resultsChart.innerHTML = '<div class="no-results"><p>Erro ao carregar resultados</p></div>';
                return;
            }
            
            const candidatesData = data || [];
            resultsChart.innerHTML = '';
            
            if (candidatesData.length === 0) {
                resultsChart.innerHTML = '<div class="no-results"><i class="fas fa-chart-pie"></i><p>Nenhum candidato para mostrar resultados</p></div>';
                return;
            }
            
            // Calcular total de votos
            const totalVotes = candidatesData.reduce((sum, candidate) => sum + (candidate.votos || 0), 0);
            
            candidatesData.forEach(candidate => {
                const percentage = totalVotes > 0 ? ((candidate.votos || 0) / totalVotes) * 100 : 0;
                
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.innerHTML = `
                    <div class="chart-bar-label">${candidate.nome}: ${candidate.votos || 0} votos (${percentage.toFixed(1)}%)</div>
                    <div class="chart-bar-fill" style="width: ${percentage}%"></div>
                `;
                
                resultsChart.appendChild(bar);
            });
            
            // Adicionar contagem de votos em branco
            const votedVoters = voters.filter(v => v.ja_votou).length;
            const whiteVotes = votedVoters - totalVotes;
            
            if (whiteVotes > 0) {
                const whitePercentage = votedVoters > 0 ? (whiteVotes / votedVoters) * 100 : 0;
                
                const whiteBar = document.createElement('div');
                whiteBar.className = 'chart-bar';
                whiteBar.innerHTML = `
                    <div class="chart-bar-label">Votos em branco: ${whiteVotes} votos (${whitePercentage.toFixed(1)}%)</div>
                    <div class="chart-bar-fill" style="width: ${whitePercentage}%; background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);"></div>
                `;
                
                resultsChart.appendChild(whiteBar);
            }
        } catch (error) {
            console.error('Erro ao carregar resultados:', error);
        }
    }
    
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
    
    async function handleAddCandidate(e) {
        e.preventDefault();
        
        const number = document.getElementById('candidateNumber').value;
        const name = document.getElementById('candidateName').value;
        const party = document.getElementById('candidateParty').value;
        const photo = document.getElementById('candidatePhoto').value;
        
        try {
            const candidateData = {
                numero: number,
                nome: name,
                partido: party,
                foto_url: photo || null,
                votos: 0
            };
            
            const { data, error } = await adminAPI.addCandidate(candidateData);
            
            if (error) {
                alert('Erro ao adicionar candidato: ' + error.message);
                return;
            }
            
            await renderCandidateManagementList();
            await renderResultsChart();
            await updateStats();
            
            candidateForm.reset();
            candidateModal.style.display = 'none';
            
            showSuccessMessage('Candidato adicionado com sucesso!');
        } catch (error) {
            alert('Erro ao adicionar candidato');
            console.error(error);
        }
    }
    
    async function generateRegistrationLink() {
        try {
            // Gerar código único
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            const linkData = {
                codigo: code,
                criado_por: currentAdmin.id,
                data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
            generatedLink.value = `${window.location.origin}/register.html?code=${code}`;
            
            linkModal.style.display = 'flex';
        } catch (error) {
            alert('Erro ao gerar link de registro');
            console.error(error);
        }
    }
    
    function copyLinkToClipboard() {
        generatedLink.select();
        document.execCommand('copy');
        
        // Feedback visual
        copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        copyLinkBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
            copyLinkBtn.style.backgroundColor = '';
        }, 2000);
    }
    
    async function changeElectionStatus(status) {
        try {
            if (!electionConfig) {
                alert('Configuração de eleição não carregada.');
                return;
            }
            
            const configData = {
                ...electionConfig,
                status: status
            };
            
            if (status === 'ativa') {
                configData.data_inicio = new Date().toISOString();
            } else if (status === 'encerrada') {
                configData.data_termino = new Date().toISOString();
            }
            
            const { error } = await adminAPI.updateElectionConfig(configData);
            
            if (error) {
                alert('Erro ao atualizar status: ' + error.message);
                return;
            }
            
            electionConfig = configData;
            updateVotingControls();
            
            let statusMessage = '';
            switch(status) {
                case 'ativa': statusMessage = 'Votação iniciada com sucesso!'; break;
                case 'pausada': statusMessage = 'Votação pausada.'; break;
                case 'encerrada': statusMessage = 'Votação encerrada.'; break;
            }
            
            showSuccessMessage(statusMessage);
        } catch (error) {
            alert('Erro ao alterar status da votação');
            console.error(error);
        }
    }
    
    function updateVotingControls() {
        if (!electionConfig) return;
        
        const status = electionConfig.status;
        startVotingBtn.disabled = status === 'ativa';
        pauseVotingBtn.disabled = status !== 'ativa';
        endVotingBtn.disabled = status === 'encerrada';
        
        // Atualizar texto do status
        let statusText = '';
        switch(status) {
            case 'ativa': statusText = 'Votação em andamento'; break;
            case 'pausada': statusText = 'Votação pausada'; break;
            case 'encerrada': statusText = 'Votação encerrada'; break;
            default: statusText = 'Não iniciada';
        }
        votingStatusText.textContent = statusText;
    }
    
    function showSuccessMessage(message) {
        // Criar elemento de mensagem de sucesso
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(successMessage);
        
        // Animação de entrada
        setTimeout(() => {
            successMessage.classList.add('show');
        }, 10);
        
        // Remover após 3 segundos
        setTimeout(() => {
            successMessage.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 300);
        }, 3000);
    }
    
    function handleLogout() {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    }
    
    // Adicionar estilos para a mensagem de sucesso
    const successStyles = document.createElement('style');
    successStyles.textContent = `
        .success-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1100;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .success-message.show {
            transform: translateX(0);
        }
        
        .success-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .success-content i {
            font-size: 20px;
        }
        
        .no-results {
            text-align: center;
            padding: 30px;
            color: var(--gray-500);
        }
        
        .no-results i {
            font-size: 32px;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(successStyles);
    
    // Carregar dados iniciais
    loadInitialData();
});

// scripts/admin.js - Funções corrigidas para adicionar eleitores e candidatos

// ... código anterior ...

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
            console.error('Detalhes do erro:', error);
            return;
        }
        
        await updateStats();
        await renderVoterList();
        
        voterForm.reset();
        voterModal.style.display = 'none';
        
        showSuccessMessage('Eleitor adicionado com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar eleitor: ' + error.message);
        console.error('Erro completo:', error);
    }
}

async function handleAddCandidate(e) {
    e.preventDefault();
    
    const number = document.getElementById('candidateNumber').value;
    const name = document.getElementById('candidateName').value;
    const party = document.getElementById('candidateParty').value;
    const photo = document.getElementById('candidatePhoto').value;
    
    // Validação básica
    if (!number || !name || !party) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    try {
        const candidateData = {
            numero: number,
            nome: name,
            partido: party,
            foto_url: photo || null,
            votos: 0
        };
        
        const { data, error } = await adminAPI.addCandidate(candidateData);
        
        if (error) {
            alert('Erro ao adicionar candidato: ' + error.message);
            console.error('Detalhes do erro:', error);
            return;
        }
        
        await renderCandidateManagementList();
        await renderResultsChart();
        await updateStats();
        
        candidateForm.reset();
        candidateModal.style.display = 'none';
        
        showSuccessMessage('Candidato adicionado com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar candidato: ' + error.message);
        console.error('Erro completo:', error);
    }
}

async function generateRegistrationLink() {
    try {
        // Gerar código único
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const linkData = {
            codigo: code,
            criado_por: currentAdmin.id,
            data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            max_usos: 100,
            usos_atuais: 0,
            ativo: true
        };
        
        const { data, error } = await adminAPI.generateRegistrationLink(linkData);
        
        if (error) {
            alert('Erro ao gerar link: ' + error.message);
            console.error('Detalhes do erro:', error);
            return;
        }
        
        // Atualizar o link no modal
        generatedLink.value = `${window.location.origin}/register.html?code=${code}`;
        
        linkModal.style.display = 'flex';
    } catch (error) {
        alert('Erro ao gerar link de registro: ' + error.message);
        console.error('Erro completo:', error);
    }
}

// ... resto do código ...