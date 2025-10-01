// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cmotgxmepisuobieybzz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtb3RneG1lcGlzdW9iaWV5Ynp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzM4NDcsImV4cCI6MjA3MzMwOTg0N30.wYlO8N5flb_agcMipu_PVh4U4Qn2XNn_g2L0mT6FX4k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções de autenticação
export const authAPI = {
  // Login de administrador
  loginAdmin: async (email, password) => {
    const { data, error } = await supabase
      .from('administradores')
      .select('*')
      .eq('email', email)
      .eq('senha', password)
      .eq('ativo', true)
      .single()
    
    return { data, error }
  },

  // Login de eleitor
  loginVoter: async (voterId, password) => {
    const { data, error } = await supabase
      .from('eleitores')
      .select('*')
      .eq('numero_identificacao', voterId)
      .eq('senha', password)
      .eq('ativo', true)
      .single()
    
    return { data, error }
  },

  // Registrar novo eleitor
  registerVoter: async (voterData) => {
    const { data, error } = await supabase
      .from('eleitores')
      .insert([voterData])
      .select()
    
    return { data, error }
  },

  // Verificar se link de registro é válido
  validateRegistrationLink: async (linkCode) => {
    const { data, error } = await supabase
      .from('links_registro')
      .select('*')
      .eq('codigo', linkCode)
      .eq('ativo', true)
      .gt('data_expiracao', new Date().toISOString())
      .single()
    
    return { data, error }
  }
}

// Funções de votação
export const votingAPI = {
  // Obter todos os candidatos
  getCandidates: async () => {
    const { data, error } = await supabase
      .from('candidatos')
      .select('*')
      .order('numero')
    
    return { data, error }
  },

  // Registrar um voto
  castVote: async (voteData) => {
    const { data, error } = await supabase
      .from('votos')
      .insert([voteData])
      .select()
    
    return { data, error }
  },

  // Atualizar status do eleitor (marcar como votou)
  updateVoterStatus: async (voterId, hasVoted) => {
    const { data, error } = await supabase
      .from('eleitores')
      .update({ ja_votou: hasVoted })
      .eq('id', voterId)
    
    return { data, error }
  },

  // Atualizar contador de votos do candidato
  updateCandidateVotes: async (candidateId, voteCount) => {
    const { data, error } = await supabase
      .from('candidatos')
      .update({ votos: voteCount })
      .eq('id', candidateId)
    
    return { data, error }
  }
}

// Funções administrativas
export const adminAPI = {
  // Obter estatísticas da eleição
  getElectionStats: async () => {
    const { data: votersData, error: votersError } = await supabase
      .from('eleitores')
      .select('id, ja_votou')
    
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidatos')
      .select('id, votos')
    
    if (votersError || candidatesError) {
      console.error('Erro ao carregar estatísticas:', votersError || candidatesError)
      return { error: 'Erro ao carregar estatísticas' }
    }
    
    const totalVoters = votersData?.length || 0
    const votedVoters = votersData?.filter(v => v.ja_votou)?.length || 0
    const totalVotes = candidatesData?.reduce((sum, c) => sum + (c.votos || 0), 0) || 0
    
    return {
      totalVoters,
      votedVoters,
      totalVotes,
      participationRate: totalVoters > 0 ? Math.round((votedVoters / totalVoters) * 100) : 0
    }
  },

  // Obter todos os eleitores
  getVoters: async (searchTerm = '') => {
    let query = supabase
      .from('eleitores')
      .select('*')
      .order('nome')
    
    if (searchTerm) {
      query = query.or(`nome.ilike.%${searchTerm}%,numero_identificacao.ilike.%${searchTerm}%`)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  // Adicionar novo eleitor
  addVoter: async (voterData) => {
    console.log('Enviando dados do eleitor para Supabase:', voterData);
    
    const { data, error } = await supabase
      .from('eleitores')
      .insert([voterData])
      .select()
    
    console.log('Resposta do Supabase (eleitor):', { data, error });
    
    if (error) {
      console.error('Erro específico do Supabase (eleitor):', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error }
  },

  // Adicionar novo candidato
  addCandidate: async (candidateData) => {
    console.log('Enviando dados do candidato para Supabase:', candidateData);
    
    const { data, error } = await supabase
      .from('candidatos')
      .insert([candidateData])
      .select()
    
    console.log('Resposta do Supabase (candidato):', { data, error });
    
    if (error) {
      console.error('Erro específico do Supabase (candidato):', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error }
  },

  // Obter configuração da eleição
  getElectionConfig: async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_eleicao')
        .select('*')
        .order('data_criacao', { ascending: false })
        .limit(1)
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Erro ao obter configuração:', error)
      return { error }
    }
  },

  // Atualizar configuração da eleição
  updateElectionConfig: async (configData) => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_eleicao')
        .update(configData)
        .eq('id', configData.id)
      
      return { data, error }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      return { error }
    }
  },

  // Gerar novo link de registro
  generateRegistrationLink: async (linkData) => {
    console.log('Enviando dados do link para Supabase:', linkData);
    
    const { data, error } = await supabase
      .from('links_registro')
      .insert([linkData])
      .select()
    
    console.log('Resposta do Supabase (link):', { data, error });
    
    if (error) {
      console.error('Erro específico do Supabase (link):', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error }
  },

  // Obter resultados da eleição
  getElectionResults: async () => {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .order('votos', { ascending: false })
      
      return { data, error }
    } catch (error) {
      console.error('Erro ao obter resultados:', error)
      return { error }
    }
  }
}