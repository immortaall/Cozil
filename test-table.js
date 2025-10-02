const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qskxstgctwklipnledjp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza3hzdGdjdHdrbGlwbmxlZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Mjg3MDgsImV4cCI6MjA3NTAwNDcwOH0.qNAw3CO2GbJ6PXadFwXkqBZGsBqLKkain1TpCsDajO4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTable() {
  try {
    console.log('Testando conexão com Supabase...')
    
    // Tentar inserir um registro de teste
    const testData = {
      solicitante: 'Teste',
      setor: 'Teste',
      data_solicitacao: '2024-01-15',
      local_equipamento: 'Teste',
      prioridade: 'media',
      tipo_manutencao: 'predial',
      descricao: 'Teste de conexão',
      status: 'pendente'
    }
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([testData])
      .select()
    
    if (error) {
      console.log('❌ Erro ao inserir dados:')
      console.log('Código:', error.code)
      console.log('Mensagem:', error.message)
      console.log('Detalhes:', error.details)
      
      if (error.code === 'PGRST116') {
        console.log('\n🔧 A tabela não existe! Precisamos criá-la manualmente.')
        console.log('Vá no Supabase Dashboard e execute o SQL manualmente.')
      }
    } else {
      console.log('✅ Tabela existe e funcionando!')
      console.log('Dados inseridos:', data)
    }
    
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

testTable()
