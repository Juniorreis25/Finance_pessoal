-- ==========================================================
-- SCRIPT PARA DELETAR TODAS AS TRANSAÇÕES
-- CUIDADO: Esta operação é IRREVERSÍVEL!
-- ==========================================================

-- 1. Deleta todas as transações da tabela
DELETE FROM transactions;

-- 2. Verifica se a tabela está vazia
SELECT 
    count(*) as total_transacoes_restantes 
FROM transactions;

-- Nota: Isso limpará tanto despesas normais quanto todas as parcelas 
-- criadas, já que cada parcela é uma linha nesta tabela.
