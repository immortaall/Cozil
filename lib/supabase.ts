import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as solicitações de manutenção
export interface MaintenanceRequest {
  id?: string
  solicitante: string
  setor: string
  data_solicitacao: string
  local_equipamento: string
  prioridade: 'baixa' | 'media' | 'alta'
  tipo_manutencao: 'predial' | 'mecanica'
  descricao: string
  fotos?: string[]
  status: 'pendente' | 'em_execucao' | 'concluida' | 'cancelada'
  created_at?: string
  updated_at?: string
}

// Função para inserir nova solicitação
export async function insertMaintenanceRequest(data: Omit<MaintenanceRequest, 'id' | 'created_at' | 'updated_at'>) {
  const { data: result, error } = await supabase
    .from('maintenance_requests')
    .insert([data])
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao inserir solicitação: ${error.message}`)
  }

  return result
}

// Função para buscar todas as solicitações
export async function getMaintenanceRequests() {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar solicitações: ${error.message}`)
  }

  return data
}

// Função para buscar solicitações com filtros
export async function getFilteredMaintenanceRequests(filters: {
  status?: string
  prioridade?: string
  tipo?: string
  setor?: string
  search?: string
}) {
  let query = supabase
    .from('maintenance_requests')
    .select('*')

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.prioridade && filters.prioridade !== 'all') {
    query = query.eq('prioridade', filters.prioridade)
  }

  if (filters.tipo && filters.tipo !== 'all') {
    query = query.eq('tipo_manutencao', filters.tipo)
  }

  if (filters.setor && filters.setor !== 'all') {
    query = query.eq('setor', filters.setor)
  }

  if (filters.search) {
    query = query.or(`solicitante.ilike.%${filters.search}%,local_equipamento.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar solicitações filtradas: ${error.message}`)
  }

  return data
}

// Função para atualizar status de uma solicitação
export async function updateMaintenanceRequestStatus(id: string, status: MaintenanceRequest['status']) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar status: ${error.message}`)
  }

  return data
}
