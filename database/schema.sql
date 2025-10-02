-- Criar tabela para solicitações de manutenção
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante TEXT NOT NULL,
  setor TEXT NOT NULL,
  data_solicitacao DATE NOT NULL,
  local_equipamento TEXT,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta')) NOT NULL,
  tipo_manutencao TEXT CHECK (tipo_manutencao IN ('predial', 'mecanica')) NOT NULL,
  descricao TEXT NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pendente', 'em_execucao', 'concluida', 'cancelada')) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_prioridade ON maintenance_requests(prioridade);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tipo ON maintenance_requests(tipo_manutencao);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_setor ON maintenance_requests(setor);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_maintenance_requests_updated_at 
    BEFORE UPDATE ON maintenance_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (ajuste conforme necessário)
CREATE POLICY "Permitir leitura pública" ON maintenance_requests
    FOR SELECT USING (true);

-- Política para permitir inserção pública (ajuste conforme necessário)
CREATE POLICY "Permitir inserção pública" ON maintenance_requests
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública (ajuste conforme necessário)
CREATE POLICY "Permitir atualização pública" ON maintenance_requests
    FOR UPDATE USING (true);
