# Configuração do Google Forms para Integração

## 1. Configurar o Google Forms

### Campos do Formulário:
- **Solicitante** (Texto curto)
- **Setor** (Lista suspensa com as opções: Portaria, Recepção, RH, Comercial, Engenharia, Controladoria, Financeiro, Diretoria, Projetos, Acabamento, Mobiliário, CPC, Caldeiraria, Recebimento, Laboratório, Desenvolvimento, Logística, Show room, Estacionamento 1, Estacionamento 2, Almoxarifado)
- **Data da solicitação** (Data)
- **Local/Equipamento** (Texto curto)
- **Prioridade** (Lista suspensa: Baixa, Média, Alta)
- **Tipo de Manutenção** (Lista suspensa: Predial, Mecânica)
- **Descreva o serviço...** (Parágrafo)
- **Upload de Foto do Problema** (Arquivo)

## 2. Configurar Webhook no Google Forms

### Opção 1: Usando Google Apps Script
1. No Google Forms, vá em "Mais" → "Script do editor"
2. Cole o seguinte código:

```javascript
function onSubmit(e) {
  const formData = e.namedValues;
  
  const payload = {
    'Solicitante': formData['Solicitante'] ? formData['Solicitante'][0] : '',
    'Setor': formData['Setor'] ? formData['Setor'][0] : '',
    'Data da solicitação': formData['Data da solicitação'] ? formData['Data da solicitação'][0] : '',
    'Local/Equipamento': formData['Local/Equipamento'] ? formData['Local/Equipamento'][0] : '',
    'Prioridade': formData['Prioridade'] ? formData['Prioridade'][0] : '',
    'Tipo de Manutenção': formData['Tipo de Manutenção'] ? formData['Tipo de Manutenção'][0] : '',
    'Descreva o serviço...': formData['Descreva o serviço...'] ? formData['Descreva o serviço...'][0] : '',
    'Upload de Foto do Problema': formData['Upload de Foto do Problema'] ? formData['Upload de Foto do Problema'][0] : ''
  };

  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'payload': JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch('https://seu-dominio.com/api/webhook/google-forms', options);
    console.log('Resposta:', response.getContentText());
  } catch (error) {
    console.error('Erro ao enviar dados:', error);
  }
}
```

3. Salve o script
4. Configure o trigger: "Triggers" → "Novo trigger" → "onSubmit" → "On form submit"

### Opção 2: Usando Zapier
1. Crie uma conta no Zapier
2. Conecte o Google Forms como trigger
3. Configure webhook como ação
4. URL do webhook: `https://seu-dominio.com/api/webhook/google-forms`
5. Método: POST
6. Headers: `Content-Type: application/json`
7. Body: Mapear os campos do formulário

## 3. Configurar Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

### 2. Configurar Banco de Dados
1. Vá em "SQL Editor" no painel do Supabase
2. Execute o script do arquivo `database/schema.sql`

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 4. Testar a Integração

### 1. Iniciar o Servidor
```bash
pnpm dev
```

### 2. Testar o Formulário
1. Preencha o Google Forms
2. Verifique se os dados aparecem no dashboard
3. Verifique se as estatísticas são atualizadas

### 3. Verificar Logs
- Console do navegador para erros do frontend
- Console do Supabase para logs do banco
- Logs do servidor Next.js

## 5. Deploy em Produção

### 1. Deploy do Next.js
- Vercel: `vercel --prod`
- Netlify: Conectar repositório
- Outros: Seguir documentação do Next.js

### 2. Atualizar URLs
- Atualizar URL do webhook no Google Apps Script
- Atualizar URL no Zapier (se usando)

### 3. Configurar Domínio
- Configurar domínio personalizado
- Configurar SSL/HTTPS

## 6. Monitoramento

### 1. Logs do Supabase
- Verificar logs de autenticação
- Verificar logs de banco de dados

### 2. Logs da Aplicação
- Verificar logs do Vercel/Netlify
- Configurar alertas de erro

### 3. Métricas
- Número de solicitações por dia
- Tempo de resposta
- Taxa de erro
