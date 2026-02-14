-- ============================================
-- SCRIPT COMPLETO: LIMPEZA + IMPORTAÇÃO
-- Finance Pessoal - Carga Completa de Cartões
-- ============================================
-- Este script faz:
-- 1. Limpeza de dados existentes
-- 2. Importação de 16 novos cartões
-- 3. Verificação da importação
-- ============================================
-- IMPORTANTE: Substitua '2570dd74-a1d1-4e77-a7d9-0662636d1b5f' pelo ID real
-- ============================================

-- ============================================
-- ETAPA 1: VERIFICAÇÃO INICIAL
-- ============================================
SELECT '=== DADOS EXISTENTES ===' as info;

SELECT 'Transações' as tabela, COUNT(*) as total 
FROM transactions 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'

UNION ALL

SELECT 'Cartões' as tabela, COUNT(*) as total 
FROM cards 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- ============================================
-- ETAPA 2: LIMPEZA TOTAL
-- ============================================
SELECT '=== INICIANDO LIMPEZA ===' as info;

-- Deletar transações primeiro (dependência de foreign key)
DELETE FROM transactions 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- Deletar cartões
DELETE FROM cards 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

SELECT '=== LIMPEZA CONCLUÍDA ===' as info;

-- ============================================
-- ETAPA 3: IMPORTAÇÃO DE CARTÕES
-- ============================================
SELECT '=== IMPORTANDO CARTÕES ===' as info;

INSERT INTO cards (user_id, name, limit_amount, closing_day, due_day)
VALUES
  -- Cartões da Bel (7 cartões)
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - Mercado Pago Bel', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - Samsung', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - Click Bel', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - BB Bel', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - Azul', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - Nubank Bel', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Bel - Santander', 1000.00, 15, 20),
  
  -- Cartões do Jr (9 cartões)
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Pic Pay Jr', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - BB Junior', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Nubank', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Porto', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Pan', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Mercado Pago Jr', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Itau Jr (Iti)', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Renner', 1000.00, 15, 20),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Jr - Itau Brasil digital', 1000.00, 15, 20);

SELECT '=== IMPORTAÇÃO CONCLUÍDA ===' as info;

-- ============================================
-- ETAPA 4: VERIFICAÇÃO FINAL
-- ============================================
SELECT '=== RESUMO FINAL ===' as info;

-- Contar total
SELECT 'Total de Cartões' as metrica, COUNT(*) as valor
FROM cards 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'

UNION ALL

SELECT 'Limite Total', SUM(limit_amount)
FROM cards 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- Resumo por dono
SELECT '=== CARTÕES POR DONO ===' as info;

SELECT 
  CASE 
    WHEN name LIKE 'Bel -%' THEN 'Bel'
    WHEN name LIKE 'Jr -%' THEN 'Jr'
    ELSE 'Outros'
  END as dono,
  COUNT(*) as quantidade,
  SUM(limit_amount) as limite_total
FROM cards 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'
GROUP BY dono
ORDER BY dono;

-- Listar todos os cartões
SELECT '=== TODOS OS CARTÕES ===' as info;

SELECT 
  name as cartao,
  limit_amount as limite,
  closing_day as fechamento,
  due_day as vencimento,
  created_at as criado_em
FROM cards 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'
ORDER BY name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Total de Cartões: 16
-- Limite Total: R$ 16.000,00
-- 
-- Por Dono:
-- Bel: 7 cartões, R$ 7.000,00
-- Jr: 9 cartões, R$ 9.000,00
-- ============================================
