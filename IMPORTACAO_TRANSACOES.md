# Guia de Importação de Transações no Supabase

## 📋 Estrutura da Tabela `transactions`

```sql
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    card_id UUID REFERENCES cards(id),  -- Opcional (NULL para dinheiro/débito)
    type TEXT NOT NULL,                  -- 'income' ou 'expense'
    category TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📂 Método 1: Importação via CSV (Recomendado)

### Passo 1: Preparar arquivo CSV

Crie um arquivo `transactions.csv` com este formato:

```csv
user_id,card_id,type,category,amount,description,date
sua-user-id-aqui,,expense,Alimentação,45.50,Almoço no restaurante,2024-02-10
sua-user-id-aqui,sua-card-id-aqui,expense,Transporte,120.00,Uber para trabalho,2024-02-11
sua-user-id-aqui,,income,Salário,3500.00,Salário mensal,2024-02-05
sua-user-id-aqui,sua-card-id-aqui,expense,Lazer,89.90,Cinema + pipoca,2024-02-12
```

**Importante:**
- Deixe `card_id` vazio para transações em dinheiro/débito
- `type` deve ser `income` ou `expense`
- `date` no formato `YYYY-MM-DD`
- `amount` com ponto decimal (não vírgula)

### Passo 2: Obter seu `user_id`

**Opção A: Via SQL no Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Execute:

```sql
SELECT id, email FROM auth.users;
```

4. Copie o `id` do seu usuário

**Opção B: Via aplicação**

No console do navegador (F12) após login:

```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log(user.id);
```

### Passo 3: Obter `card_id` (opcional)

Se quiser vincular a um cartão:

```sql
SELECT id, name FROM cards WHERE user_id = 'seu-user-id-aqui';
```

### Passo 4: Importar CSV no Supabase

**Via Dashboard:**

1. Acesse **Table Editor** → `transactions`
2. Clique em **Insert** → **Import from CSV**
3. Faça upload do arquivo `transactions.csv`
4. Mapeie as colunas corretamente
5. Clique em **Import**

---

## 📂 Método 2: Importação via SQL (Para grandes volumes)

### Passo 1: Preparar script SQL

Crie um arquivo `import_transactions.sql`:

```sql
-- Substitua 'SUA_USER_ID' pelo ID real do usuário

INSERT INTO transactions (user_id, card_id, type, category, amount, description, date)
VALUES
  -- Transações de exemplo
  ('SUA_USER_ID', NULL, 'expense', 'Alimentação', 45.50, 'Almoço no restaurante', '2024-02-10'),
  ('SUA_USER_ID', NULL, 'expense', 'Transporte', 120.00, 'Uber para trabalho', '2024-02-11'),
  ('SUA_USER_ID', NULL, 'income', 'Salário', 3500.00, 'Salário mensal', '2024-02-05'),
  ('SUA_USER_ID', 'SUA_CARD_ID', 'expense', 'Lazer', 89.90, 'Cinema + pipoca', '2024-02-12'),
  ('SUA_USER_ID', 'SUA_CARD_ID', 'expense', 'Compras', 250.00, 'Supermercado', '2024-02-13'),
  ('SUA_USER_ID', NULL, 'expense', 'Saúde', 150.00, 'Farmácia', '2024-02-14'),
  ('SUA_USER_ID', NULL, 'income', 'Freelance', 800.00, 'Projeto freelance', '2024-02-08');
```

### Passo 2: Executar SQL

1. Acesse **SQL Editor** no Supabase Dashboard
2. Cole o conteúdo do arquivo
3. Substitua `SUA_USER_ID` e `SUA_CARD_ID`
4. Execute (Run)

---

## 📂 Método 3: Importação via Script Node.js (Automático)

Se você tem muitas transações em um arquivo Excel/CSV, use este script:

### Passo 1: Criar script de importação

Crie `scripts/import-transactions.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csv = require('csv-parser')

// Configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Usar Service Role Key!
const supabase = createClient(supabaseUrl, supabaseKey)

async function importTransactions(filePath) {
  const transactions = []
  
  // Ler CSV
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      transactions.push({
        user_id: row.user_id,
        card_id: row.card_id || null,
        type: row.type,
        category: row.category,
        amount: parseFloat(row.amount),
        description: row.description,
        date: row.date
      })
    })
    .on('end', async () => {
      console.log(`📊 Total de transações a importar: ${transactions.length}`)
      
      // Inserir em lote (500 por vez)
      const batchSize = 500
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize)
        
        const { data, error } = await supabase
          .from('transactions')
          .insert(batch)
        
        if (error) {
          console.error(`❌ Erro no batch ${i}:`, error)
        } else {
          console.log(`✅ Importadas ${batch.length} transações (${i + batch.length}/${transactions.length})`)
        }
      }
      
      console.log('🎉 Importação concluída!')
    })
}

// Executar
const csvFile = process.argv[2]
if (!csvFile) {
  console.error('❌ Usage: node import-transactions.js <arquivo.csv>')
  process.exit(1)
}

importTransactions(csvFile)
```

### Passo 2: Instalar dependências

```bash
npm install csv-parser
```

### Passo 3: Executar

```bash
node scripts/import-transactions.js transactions.csv
```

---

## 📊 Template CSV Completo

Use este template para organizar suas transações:

```csv
user_id,card_id,type,category,amount,description,date
uuid-do-usuario,,expense,Alimentação,35.90,Padaria,2024-01-15
uuid-do-usuario,,expense,Transporte,4.50,Ônibus,2024-01-15
uuid-do-usuario,uuid-do-cartao,expense,Compras,120.00,Supermercado,2024-01-16
uuid-do-usuario,,income,Salário,4500.00,Salário janeiro,2024-01-05
uuid-do-usuario,,expense,Lazer,45.00,Netflix,2024-01-10
uuid-do-usuario,uuid-do-cartao,expense,Saúde,89.90,Farmácia,2024-01-12
uuid-do-usuario,,expense,Casa,150.00,Conta de luz,2024-01-08
uuid-do-usuario,,expense,Internet,99.90,Internet fibra,2024-01-08
```

---

## 🎯 Categorias Sugeridas

Use estas categorias para organizar melhor:

**Despesas (expense):**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Vestuário
- Serviços
- Impostos
- Outros

**Receitas (income):**
- Salário
- Freelance
- Investimentos
- Presente
- Outros

---

## ⚠️ Avisos Importantes

1. **RLS está ativo**: Certifique-se de usar o `user_id` correto
2. **Service Role Key**: Para scripts, use a Service Role Key (não a anon key)
3. **Backup**: Faça backup antes de importações grandes
4. **Validação**: Teste com 5-10 registros antes de importar tudo

---

## 🔍 Verificar Importação

Após importar, verifique com SQL:

```sql
-- Contar transações
SELECT COUNT(*) as total FROM transactions WHERE user_id = 'seu-user-id';

-- Ver últimas transações
SELECT * FROM transactions 
WHERE user_id = 'seu-user-id' 
ORDER BY date DESC 
LIMIT 10;

-- Resumo por categoria
SELECT 
  category, 
  type,
  COUNT(*) as quantidade,
  SUM(amount) as total
FROM transactions 
WHERE user_id = 'seu-user-id'
GROUP BY category, type
ORDER BY total DESC;
```

---

## 📞 Problemas Comuns

### Erro: "violates row-level security policy"
- Use Service Role Key no script, não a anon key
- Ou importe via SQL Editor logado no Dashboard

### Erro: "invalid input syntax for type uuid"
- Verifique se `user_id` e `card_id` são UUIDs válidos
- Use `NULL` ou deixe vazio para `card_id` opcional

### Erro: "new row violates check constraint"
- `type` deve ser exatamente `income` ou `expense` (minúsculas)
- `amount` deve ser um número válido

---

## 🚀 Próximos Passos

Depois de importar:
1. Visualize no dashboard da aplicação
2. Confira os gráficos e estatísticas
3. Ajuste categorias se necessário
