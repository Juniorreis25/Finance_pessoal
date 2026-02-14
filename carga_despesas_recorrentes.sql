-- ============================================
-- SCRIPT COMPLETO: LIMPEZA + IMPORTAÇÃO
-- Finance Pessoal - Despesas Recorrentes
-- ============================================
-- Este script faz:
-- 1. Limpeza de despesas recorrentes existentes
-- 2. Importação de 11 novas despesas recorrentes
-- 3. Verificação da importação
-- ============================================
-- User ID: 2570dd74-a1d1-4e77-a7d9-0662636d1b5f
-- ============================================

-- ============================================
-- ETAPA 1: VERIFICAÇÃO INICIAL
-- ============================================
SELECT '=== DADOS EXISTENTES ===' as info;

SELECT COUNT(*) as total_despesas_recorrentes
FROM recurring_expenses 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- ============================================
-- ETAPA 2: LIMPEZA TOTAL
-- ============================================
SELECT '=== INICIANDO LIMPEZA ===' as info;

-- Deletar despesas recorrentes existentes
DELETE FROM recurring_expenses 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

SELECT '=== LIMPEZA CONCLUÍDA ===' as info;

-- ============================================
-- ETAPA 3: IMPORTAÇÃO DE DESPESAS RECORRENTES
-- ============================================
SELECT '=== IMPORTANDO DESPESAS RECORRENTES ===' as info;

INSERT INTO recurring_expenses (user_id, description, amount, category, day_of_month, active)
VALUES
  -- Despesas Recorrentes (11 itens)
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Escola', 900.00, 'Educação', 5, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Material', 200.00, 'Educação', 5, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'RDC', 299.00, 'Serviços', 10, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'COOPERFORT', 540.00, 'Serviços', 10, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'CARRO', 2500.00, 'Transporte', 15, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'Empréstimo Biel', 625.00, 'Empréstimos', 20, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'INTERNET', 200.00, 'Casa', 8, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'MARTA', 1300.00, 'Casa', 5, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'ÁGUA E LUZ', 800.00, 'Casa', 12, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'DENTISTA', 359.00, 'Saúde', 25, TRUE),
  ('2570dd74-a1d1-4e77-a7d9-0662636d1b5f', 'TELEFONES', 110.00, 'Comunicação', 15, TRUE);

SELECT '=== IMPORTAÇÃO CONCLUÍDA ===' as info;

-- ============================================
-- ETAPA 4: VERIFICAÇÃO FINAL
-- ============================================
SELECT '=== RESUMO FINAL ===' as info;

-- Contar total e soma
SELECT 
  'Total de Despesas Recorrentes' as metrica, 
  COUNT(*) as quantidade,
  SUM(amount) as total_mensal
FROM recurring_expenses 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- Resumo por categoria
SELECT '=== DESPESAS POR CATEGORIA ===' as info;

SELECT 
  category as categoria,
  COUNT(*) as quantidade,
  SUM(amount) as total,
  ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM recurring_expenses WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'), 2) as percentual
FROM recurring_expenses 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'
GROUP BY category
ORDER BY total DESC;

-- Listar todas as despesas recorrentes
SELECT '=== TODAS AS DESPESAS RECORRENTES ===' as info;

SELECT 
  description as despesa,
  amount as valor,
  category as categoria,
  day_of_month as dia_vencimento,
  active as ativa,
  created_at as criado_em
FROM recurring_expenses 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'
ORDER BY amount DESC;

-- Despesas ordenadas por dia de vencimento
SELECT '=== DESPESAS POR DIA DO MÊS ===' as info;

SELECT 
  day_of_month as dia,
  STRING_AGG(description || ' (R$ ' || amount::TEXT || ')', ', ' ORDER BY amount DESC) as despesas,
  SUM(amount) as total_dia
FROM recurring_expenses 
WHERE user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f'
GROUP BY day_of_month
ORDER BY day_of_month;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Total de Despesas: 11
-- Total Mensal: R$ 7.833,00
-- 
-- Por Categoria:
-- Transporte: R$ 2.500,00 (31,91%)
-- Casa: R$ 2.300,00 (29,37%)
-- Educação: R$ 1.100,00 (14,05%)
-- Empréstimos: R$ 625,00 (7,98%)
-- Serviços: R$ 839,00 (10,71%)
-- Saúde: R$ 359,00 (4,58%)
-- Comunicação: R$ 110,00 (1,40%)
-- 
-- Distribuição por Dia do Mês:
-- Dia 5: Escola, Material, Marta
-- Dia 8: Internet
-- Dia 10: RDC, Cooperfort
-- Dia 12: Água e Luz
-- Dia 15: Carro, Telefones
-- Dia 20: Empréstimo Biel
-- Dia 25: Dentista
-- ============================================

-- ============================================
-- AJUSTES OPCIONAIS
-- ============================================

-- Se quiser desativar uma despesa específica:
-- UPDATE recurring_expenses 
-- SET active = FALSE 
-- WHERE description = 'DENTISTA' 
-- AND user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- Se quiser atualizar o valor de uma despesa:
-- UPDATE recurring_expenses 
-- SET amount = 950.00 
-- WHERE description = 'Escola' 
-- AND user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';

-- Se quiser mudar o dia de vencimento:
-- UPDATE recurring_expenses 
-- SET day_of_month = 10 
-- WHERE description = 'TELEFONES' 
-- AND user_id = '2570dd74-a1d1-4e77-a7d9-0662636d1b5f';
