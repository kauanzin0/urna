// Script para a página de administração (admin.html)
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
    const voterForm = document.getElementById('voterForm');
    const candidateForm = document.getElementById('candidateForm');
    const closeButtons = document.querySelectorAll('.close');
    
    // Variáveis de estado
    let voters = JSON.parse(localStorage.getItem('voters')) || [];
    let candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    let votingStatus = JSON.parse(localStorage.getItem('votingStatus')) || 'stopped';
    
    // Configurar interface
    adminNameElement.textContent = currentAdmin.name || 'Administrador';
    updateVotingControls();
    renderVoterList();
    renderCandidateManagementList();
    renderResultsChart();
    
    // Event listeners
    adminLogoutBtn.addEventListener('click', handleLogout);
    addVoterBtn.addEventListener('click', () => voterModal.style.display = 'flex');
    addCandidateBtn.addEventListener('click', () => candidateModal.style.display = 'flex');
    
    voterSearch.addEventListener('input', renderVoterList);
    
    startVotingBtn.addEventListener('click', () => changeVotingStatus('active'));
    pauseVotingBtn.addEventListener('click', () => changeVotingStatus('paused'));
    endVotingBtn.addEventListener('click', () => changeVotingStatus('stopped'));
    
    voterForm.addEventListener('submit', handleAddVoter);
    candidateForm.addEventListener('submit', handleAddCandidate);
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            voterModal.style.display = 'none';
            candidateModal.style.display = 'none';
        });
    });
    
    // Fechar modais clicando fora deles
    window.addEventListener('click', (e) => {
        if (e.target === voterModal) voterModal.style.display = 'none';
        if (e.target === candidateModal) candidateModal.style.display = 'none';
    });
    
    // Funções
    function renderVoterList() {
        voterList.innerHTML = '';
        
        const searchTerm = voterSearch.value.toLowerCase();
        const filteredVoters = voters.filter(voter => 
            voter.name.toLowerCase().includes(searchTerm) || 
            voter.id.toLowerCase().includes(searchTerm)
        );
        
        if (filteredVoters.length === 0) {
            voterList.innerHTML = '<p>Nenhum eleitor encontrado.</p>';
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
            candidateManagementList.innerHTML = '<p>Nenhum candidato cadastrado.</p>';
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
            resultsChart.innerHTML = '<p>Nenhum candidato para mostrar resultados.</p>';
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
                <div class="chart-bar-fill" style="width: ${whitePercentage}%; background-color: #6b7280;"></div>
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
        
        voterForm.reset();
        voterModal.style.display = 'none';
        
        alert('Eleitor adicionado com sucesso!');
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
        
        candidateForm.reset();
        candidateModal.style.display = 'none';
        
        alert('Candidato adicionado com sucesso!');
    }
    
    function changeVotingStatus(status) {
        votingStatus = status;
        localStorage.setItem('votingStatus', JSON.stringify(votingStatus));
        updateVotingControls();
        alert(`Status da votação alterado para: ${getStatusText(status)}`);
    }
    
    function updateVotingControls() {
        startVotingBtn.disabled = votingStatus === 'active';
        pauseVotingBtn.disabled = votingStatus !== 'active';
        endVotingBtn.disabled = votingStatus === 'stopped';
        
        // Atualizar texto do status
        votingStatusText.textContent = getStatusText(votingStatus);
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'active': return 'Votação em andamento';
            case 'paused': return 'Votação pausada';
            case 'stopped': return 'Votação encerrada';
            default: return 'Status desconhecido';
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    }
});