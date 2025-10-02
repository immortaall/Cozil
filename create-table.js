const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qskxstgctwklipnledjp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza3hzdGdjdHdrbGlwbmxlZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Mjg3MDgsImV4cCI6MjA3NTAwNDcwOH0.qNAw3CO2GbJ6PXadFwXkqBZGsBqLKkain1TpCsDajO4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTable() {
  try {
    console.log('Criando tabela maintenance_requests...')
    
    // SQL para criar a tabela
    const sql = `
      CREATE TABLE IF NOT EXISTS public.maintenance_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        solicitante TEXT NOT NULL,
        setor TEXT NOT NULL,
        data_solicitacao DATE NOT NULL,
        local_equipamento TEXT NOT NULL,
        prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta')),
        tipo_manutencao TEXT NOT NULL CHECK (tipo_manutencao IN ('predial', 'mecanica')),
        descricao TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_execucao', 'concluida', 'cancelada')),
        fotos TEXT[] DEFAULT '{}'
      );
      
      ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Enable all operations for all users" ON public.maintenance_requests
        FOR ALL USING (true);
    `
    
    // Executar SQL usando a função exec_sql
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Erro ao criar tabela:', error)
    } else {
      console.log('✅ Tabela criada com sucesso!')
      console.log('Resultado:', data)
    }
    
  } catch (error) {
    console.error('Erro:', error)
  }
}

createTable()
