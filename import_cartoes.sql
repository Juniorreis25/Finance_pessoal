-- ============================================
-- IMPORTAÇÃO DE CARTÕES - Finance Pessoal
-- ============================================
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
-- 
-- Como obter o user_id:
-- 1. Acesse SQL Editor no Supabase Dashboard
-- 2. Execute: SELECT id, email FROM auth.users;
-- 3. Copie o 'id' retornado
-- ============================================

-- Inserir cartões
-- Todos com limite de R$ 1.000,00
-- Datas de fechamento e vencimento padrão (pode ajustar depois)

INSERT INTO cards (user_id, name, limit_amount, closing_day, due_day)
VALUES
  -- Cartões da Bel
  ('SEU_USER_ID_AQUI', 'Bel - Mercado Pago Bel', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Bel - Samsung', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Bel - Click Bel', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Bel - BB Bel', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Bel - Azul', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Bel - Nubank Bel', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Bel - Santander', 1000.00, 15, 20),
  
  -- Cartões do Jr
  ('SEU_USER_ID_AQUI', 'Jr - Pic Pay Jr', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - BB Junior', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Nubank', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Porto', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Pan', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Mercado Pago Jr', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Itau Jr (Iti)', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Renner', 1000.00, 15, 20),
  ('SEU_USER_ID_AQUI', 'Jr - Itau Brasil digital', 1000.00, 15, 20);

-- ============================================
-- VERIFICAÇÃO PÓS-IMPORTAÇÃO
-- ============================================

-- Ver todos os cartões inseridos
SELECT 
  name,
  limit_amount,
  closing_day,
  due_day,
  created_at
FROM cards 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY name;

-- Contar total de cartões
SELECT COUNT(*) as total_cartoes 
FROM cards 
WHERE user_id = 'SEU_USER_ID_AQUI';

-- Separar por dono (Bel vs Jr)
SELECT 
  CASE 
    WHEN name LIKE 'Bel -%' THEN 'Bel'
    WHEN name LIKE 'Jr -%' THEN 'Jr'
    ELSE 'Outros'
  END as dono,
  COUNT(*) as quantidade,
  SUM(limit_amount) as limite_total
FROM cards 
WHERE user_id = 'SEU_USER_ID_AQUI'
GROUP BY dono;

-- ============================================
-- AJUSTES OPCIONAIS
-- ============================================

-- Se quiser atualizar datas de fechamento e vencimento específicas:
-- UPDATE cards 
-- SET closing_day = 10, due_day = 18 
-- WHERE name = 'Bel - Nubank Bel';

-- Se quiser atualizar limite de um cartão específico:
-- UPDATE cards 
-- SET limit_amount = 5000.00 
-- WHERE name = 'Jr - Porto';
