// Script para a página de votação (voting.html)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está logado
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Elementos da DOM
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const candidateList = document.getElementById('candidateList');
    const voteNumberDisplay = document.getElementById('voteNumber');
    const keys = document.querySelectorAll('.key');
    const clearBtn = document.getElementById('clearBtn');
    const whiteVoteBtn = document.getElementById('whiteVoteBtn');
    const confirmVoteBtn = document.getElementById('confirmVoteBtn');
    const candidateInfo = document.getElementById('candidateInfo');
    const candidateDetails = document.getElementById('candidateDetails');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmCandidateName = document.getElementById('confirmCandidateName');
    const confirmCandidateParty = document.getElementById('confirmCandidateParty');
    const cancelVoteBtn = document.getElementById('cancelVoteBtn');
    const finalConfirmVoteBtn = document.getElementById('finalConfirmVoteBtn');
    
    // Variáveis de estado
    let currentVote = '';
    let candidates = JSON.parse(localStorage.getItem('candidates')) || [];
    
    // Configurar interface
    userNameElement.textContent = currentUser.name;
    
    // Renderizar lista de candidatos
    renderCandidateList();
    
    // Event listeners
    logoutBtn.addEventListener('click', handleLogout);
    
    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (key.id !== 'clearBtn') {
                handleKeyPress(key.dataset.value);
            }
        });
    });
    
    clearBtn.addEventListener('click', clearVote);
    whiteVoteBtn.addEventListener('click', handleWhiteVote);
    confirmVoteBtn.addEventListener('click', showConfirmationModal);
    cancelVoteBtn.addEventListener('click', () => confirmationModal.style.display = 'none');
    finalConfirmVoteBtn.addEventListener('click', confirmVote);
    
    // Fechar modal clicando fora dele
    window.addEventListener('click', (e) => {
        if (e.target === confirmationModal) confirmationModal.style.display = 'none';
    });
    
    // Funções
    function renderCandidateList() {
        candidateList.innerHTML = '';
        
        if (candidates.length === 0) {
            candidateList.innerHTML = '<p>Nenhum candidato cadastrado.</p>';
            return;
        }
        
        candidates.forEach(candidate => {
            const div = document.createElement('div');
            div.className = 'candidate-item';
            div.dataset.number = candidate.number;
            div.innerHTML = `
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-party">${candidate.party} - ${candidate.number}</div>
            `;
            
            div.addEventListener('click', () => {
                document.querySelectorAll('.candidate-item').forEach(item => {
                    item.classList.remove('selected');
                });
                div.classList.add('selected');
                setVoteNumber(candidate.number);
            });
            
            candidateList.appendChild(div);
        });
    }
    
    function handleKeyPress(value) {
        if (currentVote.length < 2) {
            currentVote += value;
            updateVoteDisplay();
            
            if (currentVote.length === 2) {
                checkCandidate();
            }
        }
    }
    
    function clearVote() {
        currentVote = '';
        updateVoteDisplay();
        candidateInfo.style.display = 'none';
        
        document.querySelectorAll('.candidate-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    function updateVoteDisplay() {
        voteNumberDisplay.textContent = currentVote.padEnd(2, '_');
    }
    
    function setVoteNumber(number) {
        currentVote = number;
        updateVoteDisplay();
        checkCandidate();
    }
    
    function checkCandidate() {
        const candidate = candidates.find(c => c.number === currentVote);
        candidateInfo.style.display = candidate ? 'block' : 'none';
        
        if (candidate) {
            candidateDetails.innerHTML = `
                <h4>${candidate.name}</h4>
                <p>Partido: ${candidate.party}</p>
                <p>Número: ${candidate.number}</p>
            `;
            
            // Selecionar o candidato na lista
            document.querySelectorAll('.candidate-item').forEach(item => {
                item.classList.remove('selected');
                if (item.dataset.number === candidate.number) {
                    item.classList.add('selected');
                }
            });
        } else {
            candidateDetails.innerHTML = '<p>Candidato não encontrado</p>';
        }
    }
    
    function handleWhiteVote() {
        currentVote = 'BR';
        showConfirmationModal();
    }
    
    function showConfirmationModal() {
        if (currentVote === 'BR') {
            confirmCandidateName.textContent = 'VOTO EM BRANCO';
            confirmCandidateParty.textContent = '';
        } else {
            const candidate = candidates.find(c => c.number === currentVote);
            if (candidate) {
                confirmCandidateName.textContent = candidate.name;
                confirmCandidateParty.textContent = `${candidate.party} - Nº ${candidate.number}`;
            } else {
                alert('Número de candidato inválido!');
                return;
            }
        }
        
        confirmationModal.style.display = 'flex';
    }
    
    function confirmVote() {
        if (currentVote === 'BR') {
            // Voto em branco
            alert('Voto em branco confirmado!');
        } else {
            const candidate = candidates.find(c => c.number === currentVote);
            if (candidate) {
                candidate.votes = (candidate.votes || 0) + 1;
                localStorage.setItem('candidates', JSON.stringify(candidates));
                alert(`Voto em ${candidate.name} confirmado!`);
            }
        }
        
        // Marcar eleitor como votado
        const voters = JSON.parse(localStorage.getItem('voters')) || [];
        const voterIndex = voters.findIndex(v => v.id === currentUser.id);
        if (voterIndex !== -1) {
            voters[voterIndex].hasVoted = true;
            localStorage.setItem('voters', JSON.stringify(voters));
        }
        
        // Atualizar usuário atual
        currentUser.hasVoted = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        confirmationModal.style.display = 'none';
        handleLogout();
    }
    
    function handleLogout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
});