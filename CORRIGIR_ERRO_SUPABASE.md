# ❌ ERRO: Failed to fetch no login
# ✅ SOLUÇÃO: Configurar credenciais corretas do Supabase

## 📋 Como Resolver:

### Passo 1: Obter as Credenciais Corretas

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto "Finance Pessoal"
3. Vá em: **Settings** → **API**
4. Você verá duas seções:

#### Project URL:
```
https://osscplmlycffgiorcmba.supabase.co
```
✅ Esta está correta no .env.local

#### Project API keys:
Procure por:
- **anon** / **public** key (começa com `eyJhbGci...`)
- NÃO use a "service_role" key (essa é secreta!)

### Passo 2: Atualizar .env.local

Abra: `web/.env.local`

Substitua a linha 10:
```env
# ❌ ERRADO (publishable key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_-TmME_acQbonbqrRp4u6kg_DZuI0TFN

# ✅ CORRETO (anon/public key - começa com eyJhbGci)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc2NwbG10eWNmdGdpb3JjbWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU...
```

### Passo 3: Reiniciar o Servidor

Após salvar o .env.local:

1. Pare o servidor: `Ctrl+C` no terminal
2. Inicie novamente: `npm run dev`
3. Aguarde o servidor iniciar
4. Recarregue a página: http://localhost:3000

---

## 🔍 Como Saber se a Key Está Correta:

### Anon/Public Key (CORRETA):
- ✅ Começa com: `eyJhbGci`
- ✅ É muito longa (centenas de caracteres)
- ✅ Tem pontos no meio: `eyJ...`.`eyJ...`.`abc123...`

### Publishable Key (ERRADA para este caso):
- ❌ Começa com: `sb_publishable_`
- ❌ É curta (poucos caracteres)
- ❌ Exemplo: `sb_publishable_-TmME_acQbonbqrRp4u6kg_DZuI0TFN`

---

## 📍 Onde Encontrar no Dashboard:

```
Supabase Dashboard
└── Seu Projeto "Finance Pessoal"
    └── Settings (ícone de engrenagem)
        └── API
            ├── Project URL: https://osscplmlycffgiorcmba.supabase.co ✅
            └── Project API keys:
                ├── anon public: eyJhbGci... ⬅️ COPIE ESTA!
                └── service_role: eyJhbGci... (NÃO USE!)
```

---

## ⚠️ Importante:

1. **NÃO use a service_role key** - ela tem permissões totais
2. **Use apenas a anon/public key** - é segura para o frontend
3. **Salve o arquivo** antes de reiniciar o servidor
4. **Recarregue a página** após reiniciar

---

## ✅ Checklist Rápido:

- [ ] Acessei Settings → API no Supabase
- [ ] Copiei a "anon public" key (começa com eyJhbGci)
- [ ] Colei no .env.local na linha NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Salvei o arquivo .env.local
- [ ] Parei o servidor (Ctrl+C)
- [ ] Iniciei novamente (npm run dev)
- [ ] Recarreguei http://localhost:3000

---

Me avise quando tiver a chave correta e eu ajudo a atualizar!

## MCP checklist

Use one single project ref everywhere:

- MCP URL: https://mcp.supabase.com/mcp?project_ref=osscplmlycffgiorcmba
- Project URL: https://osscplmlycffgiorcmba.supabase.co
- Vercel env: NEXT_PUBLIC_SUPABASE_URL=https://osscplmlycffgiorcmba.supabase.co
- Vercel env: NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-dashboard>

Supabase dashboard checks:

- Site URL should point to your Vercel domain.
- Redirect URLs should include `https://<vercel-domain>/auth/callback`.
- Use the anon/public key, not `service_role`.
- Keep the MCP server scoped to this project ref when connecting.

