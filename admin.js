// Script para a página de administração (admin.html) - Versão melhorada
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
    let voters = JSON.parse(localStorage.getItem('voters')) || [];
    let candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    let votingStatus = JSON.parse(localStorage.getItem('votingStatus')) || 'stopped';
    
    // Configurar interface
    adminNameElement.textContent = currentAdmin.name || 'Administrador';
    updateVotingControls();
    updateStats();
    renderVoterList();
    renderCandidateManagementList();
    renderResultsChart();
    
    // Event listeners
    adminLogoutBtn.addEventListener('click', handleLogout);
    addVoterBtn.addEventListener('click', () => voterModal.style.display = 'flex');
    generateLinkBtn.addEventListener('click', () => linkModal.style.display = 'flex');
    addCandidateBtn.addEventListener('click', () => candidateModal.style.display = 'flex');
    
    voterSearch.addEventListener('input', renderVoterList);
    
    startVotingBtn.addEventListener('click', () => changeVotingStatus('active'));
    pauseVotingBtn.addEventListener('click', () => changeVotingStatus('paused'));
    endVotingBtn.addEventListener('click', () => changeVotingStatus('stopped'));
    
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
    function updateStats() {
        // Atualizar estatísticas
        totalVotersElement.textContent = voters.length;
        totalCandidatesElement.textContent = candidates.length;
        
        // Calcular votos totais
        const totalVotes = candidates.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
        totalVotesElement.textContent = totalVotes;
        
        // Calcular taxa de participação
        const votedVoters = voters.filter(voter => voter.hasVoted).length;
        const participationRate = voters.length > 0 ? Math.round((votedVoters / voters.length) * 100) : 0;
        participationRateElement.textContent = `${participationRate}%`;
    }
    
    function renderVoterList() {
        voterList.innerHTML = '';
        
        const searchTerm = voterSearch.value.toLowerCase();
        const filteredVoters = voters.filter(voter => 
            voter.name.toLowerCase().includes(searchTerm) || 
            voter.id.toLowerCase().includes(searchTerm)
        );
        
        if (filteredVoters.length === 0) {
            voterList.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>Nenhum eleitor encontrado</p></div>';
            return;
        }
        
        filteredVoters.forEach(voter => {
            const div = document.createElement('div');
            div.className = 'voter-item';
            div.innerHTML = `
                <div>
                    <strong>${voter.name}</strong>
                    <div>ID: ${voter.id}</div>
                </div>
                <div class="voter-status ${voter.hasVoted ? 'voted' : 'not-voted'}">
                    ${voter.hasVoted ? 'Já votou' : 'Não votou'}
                </div>
            `;
            
            voterList.appendChild(div);
        });
    }
    
    function renderCandidateManagementList() {
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
                    <strong>${candidate.name}</strong>
                    <div>${candidate.party} - Nº ${candidate.number}</div>
                </div>
                <div>Votos: ${candidate.votes || 0}</div>
            `;
            
            candidateManagementList.appendChild(div);
        });
    }
    
    function renderResultsChart() {
        resultsChart.innerHTML = '';
        
        if (candidates.length === 0) {
            resultsChart.innerHTML = '<div class="no-results"><i class="fas fa-chart-pie"></i><p>Nenhum candidato para mostrar resultados</p></div>';
            return;
        }
        
        // Ordenar candidatos por votos (do maior para o menor)
        const sortedCandidates = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
        
        // Calcular total de votos
        const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + (candidate.votes || 0), 0);
        
        sortedCandidates.forEach(candidate => {
            const percentage = totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.innerHTML = `
                <div class="chart-bar-label">${candidate.name}: ${candidate.votes || 0} votos (${percentage.toFixed(1)}%)</div>
                <div class="chart-bar-fill" style="width: ${percentage}%"></div>
            `;
            
            resultsChart.appendChild(bar);
        });
        
        // Adicionar contagem de votos em branco (simulado)
        const whiteVotes = voters.filter(v => v.hasVoted).length - totalVotes;
        if (whiteVotes > 0) {
            const whitePercentage = totalVotes > 0 ? (whiteVotes / (totalVotes + whiteVotes)) * 100 : 0;
            
            const whiteBar = document.createElement('div');
            whiteBar.className = 'chart-bar';
            whiteBar.innerHTML = `
                <div class="chart-bar-label">Votos em branco: ${whiteVotes} votos (${whitePercentage.toFixed(1)}%)</div>
                <div class="chart-bar-fill" style="width: ${whitePercentage}%; background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);"></div>
            `;
            
            resultsChart.appendChild(whiteBar);
        }
    }
    
    function handleAddVoter(e) {
        e.preventDefault();
        
        const id = document.getElementById('newVoterId').value;
        const name = document.getElementById('newVoterName').value;
        const password = document.getElementById('newVoterPassword').value;
        
        // Verificar se o ID já existe
        if (voters.some(v => v.id === id)) {
            alert('Já existe um eleitor com este ID!');
            return;
        }
        
        voters.push({
            id,
            name,
            password,
            hasVoted: false
        });
        
        localStorage.setItem('voters', JSON.stringify(voters));
        renderVoterList();
        updateStats();
        
        voterForm.reset();
        voterModal.style.display = 'none';
        
        showSuccessMessage('Eleitor adicionado com sucesso!');
    }
    
    function handleAddCandidate(e) {
        e.preventDefault();
        
        const number = document.getElementById('candidateNumber').value;
        const name = document.getElementById('candidateName').value;
        const party = document.getElementById('candidateParty').value;
        const photo = document.getElementById('candidatePhoto').value;
        
        // Verificar se o número já existe
        if (candidates.some(c => c.number === number)) {
            alert('Já existe um candidato com este número!');
            return;
        }
        
        candidates.push({
            number,
            name,
            party,
            photo,
            votes: 0
        });
        
        localStorage.setItem('candidates', JSON.stringify(candidates));
        renderCandidateManagementList();
        renderResultsChart();
        updateStats();
        
        candidateForm.reset();
        candidateModal.style.display = 'none';
        
        showSuccessMessage('Candidato adicionado com sucesso!');
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
    
    function changeVotingStatus(status) {
        votingStatus = status;
        localStorage.setItem('votingStatus', JSON.stringify(votingStatus));
        updateVotingControls();
        
        let statusMessage = '';
        switch(status) {
            case 'active': statusMessage = 'Votação iniciada com sucesso!'; break;
            case 'paused': statusMessage = 'Votação pausada.'; break;
            case 'stopped': statusMessage = 'Votação encerrada.'; break;
        }
        
        showSuccessMessage(statusMessage);
    }
    
    function updateVotingControls() {
        startVotingBtn.disabled = votingStatus === 'active';
        pauseVotingBtn.disabled = votingStatus !== 'active';
        endVotingBtn.disabled = votingStatus === 'stopped';
        
        // Atualizar texto do status
        let statusText = '';
        switch(votingStatus) {
            case 'active': statusText = 'Votação em andamento'; break;
            case 'paused': statusText = 'Votação pausada'; break;
            case 'stopped': statusText = 'Votação encerrada'; break;
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
});