# Finance Pessoal - Dashboard

Aplicação moderna de gestão financeira pessoal desenvolvida com Next.js e Supabase.

## ✨ Funcionalidades

- 📊 **Visão Geral**: Dashboard com saldo mensal e gráficos.
- 💸 **Transações**: Controle total de receitas e despesas.
- 🔁 **Recorrentes**: Gerenciamento de despesas fixas mensais.
- 💳 **Cartões**: Controle de faturas e limites de cartões de crédito.
- 👤 **Perfil**: Personalização de avatar e mensagens de boas-vindas.
- 🌓 **Interface**: Design premium com suporte a Dark Mode.
- 🔒 **Privacidade**: Modo oculto para esconder valores sensíveis.

## 🚀 Tecnologias

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Estização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validação**: [Zod](https://zod.dev/)

## 🛠️ Instalação

### Pré-requisitos
- Node.js 20+
- Conta no Supabase

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Juniorreis25/Finance_pessoal.git
   ```

2. **Instale as dependências**
   ```bash
   cd web
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Copie `.env.example` para `.env.local` na pasta `web` e preencha a URL do seu projeto Supabase e a chave anon/publicável:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```
   Essas variáveis `NEXT_PUBLIC_` ficam disponíveis no navegador. Use somente a chave anon/publicável; nunca coloque `service_role` ou uma chave secreta nelas nem versione arquivos `.env`.

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## 🧪 Testes

Para rodar a suíte de testes unitários:
```bash
npm test
```

## 📄 Notas de Versão

### v0.1.0
- Estrutura inicial do projeto.
- Implementação de transações e cartões.
- Dashboard dinâmico com gráficos.
- Adição de despesas recorrentes.
- Perfil de usuário com upload de imagem.
