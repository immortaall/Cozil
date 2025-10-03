import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK CHAMADO ===')
    
    // Processar dados recebidos
    const body = await request.json()
    console.log('Dados recebidos:', JSON.stringify(body, null, 2))
    
    // Mapear dados básicos
    const maintenanceData = {
      solicitante: body['Solicitante'] || 'Teste',
      setor: body['Setor'] || 'TI',
      data_solicitacao: body['Data da solicitação'] || new Date().toISOString().split('T')[0],
      local_equipamento: body['Local/Equipamento'] || 'Local Teste',
      prioridade: mapPriority(body['Prioridade']),
      tipo_manutencao: mapMaintenanceType(body['Tipo de Manutenção']),
      descricao: body['Descreva o serviço...'] || 'Teste de webhook',
      fotos: body['Upload de Foto do Problema'] ?
        (Array.isArray(body['Upload de Foto do Problema'])
          ? body['Upload de Foto do Problema']
          : [body['Upload de Foto do Problema']])
        : [],
      status: 'pendente' as const
    }
    
    console.log('Dados mapeados:', JSON.stringify(maintenanceData, null, 2))
    
    // Inserir no banco de dados
    console.log('Inserindo no Supabase...')
    const { data: result, error } = await supabase
      .from('maintenance_requests')
      .insert([maintenanceData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir no Supabase:', error)
      return NextResponse.json(
        { 
          error: 'Erro ao salvar no banco de dados',
          details: error.message 
        },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
          }
        }
      )
    }

    console.log('Nova solicitação salva no Supabase:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Solicitação salva com sucesso!',
      id: result.id,
      received: maintenanceData,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      }
    })

  } catch (error) {
    console.error('Erro ao processar webhook do Google Forms:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        }
      }
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

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  console.log('=== OPTIONS REQUEST ===')
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    }
  })
}
