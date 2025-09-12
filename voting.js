// Script para a página de votação (voting.html) - Versão melhorada
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
    const digits = document.querySelectorAll('.digit');
    const keys = document.querySelectorAll('.key');
    const clearBtn = document.getElementById('clearBtn');
    const whiteVoteBtn = document.getElementById('whiteVoteBtn');
    const confirmVoteBtn = document.getElementById('confirmVoteBtn');
    const candidateInfo = document.getElementById('candidateInfo');
    const candidateDetails = document.getElementById('candidateDetails');
    const infoPlaceholder = document.querySelector('.info-placeholder');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmCandidateName = document.getElementById('confirmCandidateName');
    const confirmCandidateParty = document.getElementById('confirmCandidateParty');
    const cancelVoteBtn = document.getElementById('cancelVoteBtn');
    const finalConfirmVoteBtn = document.getElementById('finalConfirmVoteBtn');
    const candidateSearch = document.getElementById('candidateSearch');
    
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
        if (!key.classList.contains('control')) {
            key.addEventListener('click', () => handleKeyPress(key.dataset.value));
        }
    });
    
    clearBtn.addEventListener('click', clearVote);
    whiteVoteBtn.addEventListener('click', handleWhiteVote);
    confirmVoteBtn.addEventListener('click', showConfirmationModal);
    cancelVoteBtn.addEventListener('click', () => confirmationModal.style.display = 'none');
    finalConfirmVoteBtn.addEventListener('click', confirmVote);
    
    candidateSearch.addEventListener('input', renderCandidateList);
    
    // Fechar modal clicando fora dele
    window.addEventListener('click', (e) => {
        if (e.target === confirmationModal) confirmationModal.style.display = 'none';
    });
    
    // Funções
    function renderCandidateList() {
        candidateList.innerHTML = '';
        
        const searchTerm = candidateSearch.value.toLowerCase();
        let filteredCandidates = candidates;
        
        if (searchTerm) {
            filteredCandidates = candidates.filter(candidate => 
                candidate.name.toLowerCase().includes(searchTerm) || 
                candidate.party.toLowerCase().includes(searchTerm) ||
                candidate.number.includes(searchTerm)
            );
        }
        
        if (filteredCandidates.length === 0) {
            candidateList.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>Nenhum candidato encontrado</p></div>';
            return;
        }
        
        filteredCandidates.forEach(candidate => {
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
        showInfoPlaceholder();
        
        document.querySelectorAll('.candidate-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    function updateVoteDisplay() {
        digits[0].textContent = currentVote.length > 0 ? currentVote[0] : '_';
        digits[1].textContent = currentVote.length > 1 ? currentVote[1] : '_';
    }
    
    function setVoteNumber(number) {
        currentVote = number;
        updateVoteDisplay();
        checkCandidate();
    }
    
    function checkCandidate() {
        const candidate = candidates.find(c => c.number === currentVote);
        
        if (candidate) {
            showCandidateInfo(candidate);
            
            // Selecionar o candidato na lista
            document.querySelectorAll('.candidate-item').forEach(item => {
                item.classList.remove('selected');
                if (item.dataset.number === candidate.number) {
                    item.classList.add('selected');
                    // Scroll to selected candidate
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        } else {
            showInfoPlaceholder();
        }
    }
    
    function showCandidateInfo(candidate) {
        infoPlaceholder.style.display = 'none';
        candidateDetails.style.display = 'block';
        candidateDetails.innerHTML = `
            <h4>${candidate.name}</h4>
            <p>Partido: ${candidate.party}</p>
            <p>Número: ${candidate.number}</p>
        `;
        candidateInfo.style.backgroundColor = 'var(--primary-light)';
    }
    
    function showInfoPlaceholder() {
        infoPlaceholder.style.display = 'flex';
        candidateDetails.style.display = 'none';
        candidateInfo.style.backgroundColor = 'var(--gray-100)';
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
            showSuccessMessage('Voto em branco confirmado com sucesso!');
        } else {
            const candidate = candidates.find(c => c.number === currentVote);
            if (candidate) {
                candidate.votes = (candidate.votes || 0) + 1;
                localStorage.setItem('candidates', JSON.stringify(candidates));
                showSuccessMessage(`Voto em ${candidate.name} confirmado com sucesso!`);
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
        
        // Aguardar um pouco antes de redirecionar para ver a mensagem de sucesso
        setTimeout(handleLogout, 2000);
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
        localStorage.removeItem('currentUser');
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