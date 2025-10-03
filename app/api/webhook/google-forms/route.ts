import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK CHAMADO ===')
    
    // Teste simples primeiro
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook funcionando!',
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
    
    // Código original comentado temporariamente
    /*
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    
    // Log para debug
    console.log('Webhook recebido:', JSON.stringify(body, null, 2))
    console.log('Tipo do body:', typeof body)
    console.log('Keys do body:', Object.keys(body))
    
    */

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
