import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK CHAMADO ===')
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    
    // Log para debug
    console.log('Webhook recebido:', JSON.stringify(body, null, 2))
    console.log('Tipo do body:', typeof body)
    console.log('Keys do body:', Object.keys(body))
    
    // Mapear os dados do Google Forms para nosso formato
    console.log('Processando dados...')
    console.log('Solicitante:', body['Solicitante'])
    console.log('Setor:', body['Setor'])
    console.log('Prioridade:', body['Prioridade'])
    console.log('Tipo de Manutenção:', body['Tipo de Manutenção'])
    console.log('Upload de Foto:', body['Upload de Foto do Problema'])
    
    const maintenanceData = {
      solicitante: body['Solicitante'] || '',
      setor: body['Setor'] || '',
      data_solicitacao: body['Data da solicitação'] || new Date().toISOString().split('T')[0],
      local_equipamento: body['Local/Equipamento'] || '',
      prioridade: mapPriority(body['Prioridade']),
      tipo_manutencao: mapMaintenanceType(body['Tipo de Manutenção']),
      descricao: body['Descreva o serviço...'] || '',
      fotos_url: body['Upload de Foto do Problema'] ? 
        (Array.isArray(body['Upload de Foto do Problema']) 
          ? body['Upload de Foto do Problema'] 
          : [body['Upload de Foto do Problema']]) 
        : [],
      status: 'pendente' as const
    }
    
    console.log('Dados mapeados:', JSON.stringify(maintenanceData, null, 2))

    // Validar dados obrigatórios
    if (!maintenanceData.solicitante || !maintenanceData.setor || !maintenanceData.descricao) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Inserir no banco de dados
    const { data: result, error } = await supabase
      .from('maintenance_requests')
      .insert([maintenanceData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir no Supabase:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar no banco de dados' },
        { status: 500 }
      )
    }

    console.log('Nova solicitação recebida do Google Forms:', result)

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Solicitação salva com sucesso' 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
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

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
