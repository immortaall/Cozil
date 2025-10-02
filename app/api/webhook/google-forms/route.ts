import { NextRequest, NextResponse } from 'next/server'
import { insertMaintenanceRequest } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mapear os dados do Google Forms para nosso formato
    const maintenanceData = {
      solicitante: body['Solicitante'] || '',
      setor: body['Setor'] || '',
      data_solicitacao: body['Data da solicitação'] || new Date().toISOString().split('T')[0],
      local_equipamento: body['Local/Equipamento'] || '',
      prioridade: mapPriority(body['Prioridade']),
      tipo_manutencao: mapMaintenanceType(body['Tipo de Manutenção']),
      descricao: body['Descreva o serviço...'] || '',
      fotos: body['Upload de Foto do Problema'] ? 
        (Array.isArray(body['Upload de Foto do Problema']) 
          ? body['Upload de Foto do Problema'] 
          : [body['Upload de Foto do Problema']]) 
        : [],
      status: 'pendente' as const
    }

    // Validar dados obrigatórios
    if (!maintenanceData.solicitante || !maintenanceData.setor || !maintenanceData.descricao) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Inserir no banco de dados
    const result = await insertMaintenanceRequest(maintenanceData)

    console.log('Nova solicitação recebida do Google Forms:', result)

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Solicitação salva com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao processar webhook do Google Forms:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para mapear prioridade do Google Forms para nosso formato
function mapPriority(priority: string): 'baixa' | 'media' | 'alta' {
  switch (priority?.toLowerCase()) {
    case 'baixa':
      return 'baixa'
    case 'média':
    case 'media':
      return 'media'
    case 'alta':
      return 'alta'
    default:
      return 'media' // padrão
  }
}

// Função para mapear tipo de manutenção do Google Forms para nosso formato
function mapMaintenanceType(type: string): 'predial' | 'mecanica' {
  switch (type?.toLowerCase()) {
    case 'predial':
      return 'predial'
    case 'mecânica':
    case 'mecanica':
      return 'mecanica'
    default:
      return 'predial' // padrão
  }
}
