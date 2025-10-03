import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK CHAMADO ===')
    
    // Processar dados recebidos
    const body = await request.json()
    console.log('Dados recebidos:', JSON.stringify(body, null, 2))
    
    // Resposta simples para evitar problemas de build
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook recebido com sucesso!',
      received: body,
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
