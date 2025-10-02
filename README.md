# Sistema de Manutenção - Cozil

Sistema completo de gestão de ordens de serviço com integração Google Forms e Supabase.

## 🚀 Funcionalidades

- **Dashboard em Tempo Real** - Indicadores dinâmicos de OS
- **Filtros Avançados** - Busca por status, prioridade, tipo e setor
- **Integração Google Forms** - Recebe dados automaticamente
- **Banco de Dados Supabase** - Armazenamento seguro e escalável
- **Interface Responsiva** - Funciona em desktop e mobile

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Integração**: Google Forms Webhook
- **Deploy**: Vercel

## 📋 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qskxstgctwklipnledjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza3hzdGdjdHdrbGlwbmxlZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Mjg3MDgsImV4cCI6MjA3NTAwNDcwOH0.qNAw3CO2GbJ6PXadFwXkqBZGsBqLKkain1TpCsDajO4
```

### 2. Banco de Dados

Execute o SQL do arquivo `database/schema.sql` no Supabase:

1. Acesse o painel do Supabase
2. Vá em "SQL Editor"
3. Cole e execute o conteúdo do arquivo `database/schema.sql`

### 3. Google Forms

Siga as instruções do arquivo `GOOGLE_FORMS_SETUP.md` para configurar o webhook.

## 🚀 Deploy

### Vercel

1. Conecte o repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático

### Comandos

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar em produção
pnpm start
```

## 📊 Estrutura do Banco

### Tabela: maintenance_requests

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| solicitante | TEXT | Nome do solicitante |
| setor | TEXT | Setor da empresa |
| data_solicitacao | DATE | Data da solicitação |
| local_equipamento | TEXT | Local/equipamento |
| prioridade | TEXT | Baixa/Média/Alta |
| tipo_manutencao | TEXT | Predial/Mecânica |
| descricao | TEXT | Descrição do problema |
| fotos | TEXT[] | URLs das fotos |
| status | TEXT | Pendente/Em Execução/Concluída |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## 🔧 API Endpoints

### POST /api/webhook/google-forms

Recebe dados do Google Forms e salva no banco.

**Body:**
```json
{
  "Solicitante": "João Silva",
  "Setor": "Produção",
  "Data da solicitação": "2024-01-15",
  "Local/Equipamento": "Máquina 01",
  "Prioridade": "Alta",
  "Tipo de Manutenção": "Mecânica",
  "Descreva o serviço...": "Descrição do problema",
  "Upload de Foto do Problema": "url_da_foto"
}
```

## 📱 Interface

### Dashboard
- Indicadores em tempo real
- Cards de tipos de manutenção
- Lista de OS recentes

### Todas as OS
- Filtros avançados
- Lista completa de solicitações
- Status e prioridades visuais

### Relatórios
- Geração de relatórios
- Indicadores por setor
- Análise de tempo de execução

## 🎯 Próximos Passos

1. ✅ Configurar Supabase
2. ✅ Criar repositório GitHub
3. 🔄 Deploy na Vercel
4. 🔄 Configurar Google Forms
5. 🔄 Testar integração completa

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.
