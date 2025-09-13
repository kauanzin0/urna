// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções auxiliares para operações comuns
export const authAPI = {
  // Login de administrador
  loginAdmin: async (email, password) => {
    // Em um sistema real, isso seria feito via RPC ou tabela de administradores
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
      .eq('numero_identificacao', voterId)
    
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

export const adminAPI = {
  // Obter estatísticas da eleição
  getElectionStats: async () => {
    const { data: votersData } = await supabase
      .from('eleitores')
      .select('id, ja_votou')
    
    const { data: candidatesData } = await supabase
      .from('candidatos')
      .select('id, votos')
    
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

  // Obter todos os eleitors
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
    const { data, error } = await supabase
      .from('eleitores')
      .insert([voterData])
      .select()
    
    return { data, error }
  },

  // Adicionar novo candidato
  addCandidate: async (candidateData) => {
    const { data, error } = await supabase
      .from('candidatos')
      .insert([candidateData])
      .select()
    
    return { data, error }
  },

  // Obter configuração da eleição
  getElectionConfig: async () => {
    const { data, error } = await supabase
      .from('configuracoes_eleicao')
      .select('*')
      .order('data_criacao', { ascending: false })
      .limit(1)
      .single()
    
    return { data, error }
  },

  // Atualizar configuração da eleição
  updateElectionConfig: async (configData) => {
    const { data, error } = await supabase
      .from('configuracoes_eleicao')
      .update(configData)
      .eq('id', configData.id)
    
    return { data, error }
  },

  // Gerar novo link de registro
  generateRegistrationLink: async (linkData) => {
    const { data, error } = await supabase
      .from('links_registro')
      .insert([linkData])
      .select()
    
    return { data, error }
  }
}