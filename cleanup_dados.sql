-- ============================================
-- SCRIPT DE LIMPEZA DE DADOS - Finance Pessoal
-- ============================================
-- ⚠️ ATENÇÃO: Este script DELETARÁ TODOS os dados!
-- USE COM CUIDADO - Esta ação é IRREVERSÍVEL!
-- ============================================
-- 
-- IMPORTANTE: 
-- 1. Faça BACKUP antes de executar
-- 2. Substitua 'SEU_USER_ID_AQUI' pelo ID real do usuário
-- 3. Execute este script ANTES de importar novos dados
-- ============================================

-- ============================================
-- PASSO 1: VERIFICAR DADOS EXISTENTES
-- ============================================
-- Execute isto primeiro para ver o que será deletado:

SELECT 'Transações' as tabela, COUNT(*) as total 
FROM transactions 
WHERE user_id = 'SEU_USER_ID_AQUI'

UNION ALL

SELECT 'Cartões' as tabela, COUNT(*) as total 
FROM cards 
WHERE user_id = 'SEU_USER_ID_AQUI';

-- ============================================
-- PASSO 2: BACKUP (OPCIONAL - APENAS VISUALIZAÇÃO)
-- ============================================
-- Se quiser fazer backup manual antes:

-- Ver todas as transações que serão deletadas:
SELECT * FROM transactions 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY date DESC;

-- Ver todos os cartões que serão deletados:
SELECT * FROM cards 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY name;

-- ============================================
-- PASSO 3: LIMPEZA DE DADOS
-- ============================================
-- ⚠️ ATENÇÃO: Descomente as linhas abaixo para DELETAR

-- ORDEM IMPORTANTE: 
-- 1º Deletar TRANSAÇÕES (dependem de cards)
-- 2º Deletar CARTÕES

-- DELETAR TRANSAÇÕES
-- DELETE FROM transactions 
-- WHERE user_id = 'SEU_USER_ID_AQUI';

-- DELETAR CARTÕES
-- DELETE FROM cards 
-- WHERE user_id = 'SEU_USER_ID_AQUI';

-- ============================================
-- PASSO 4: VERIFICAR LIMPEZA
-- ============================================
-- Execute após deletar para confirmar:

SELECT 'Transações' as tabela, COUNT(*) as total 
FROM transactions 
WHERE user_id = 'SEU_USER_ID_AQUI'

UNION ALL

SELECT 'Cartões' as tabela, COUNT(*) as total 
FROM cards 
WHERE user_id = 'SEU_USER_ID_AQUI';

-- Resultado esperado: 0 em ambas as tabelas

-- ============================================
-- SCRIPT ALTERNATIVO: LIMPEZA AUTOMÁTICA (CUIDADO!)
-- ============================================
-- Se tiver certeza absoluta, descomente o bloco abaixo:

/*
DO $$
DECLARE
    v_user_id UUID := 'SEU_USER_ID_AQUI';
    v_transactions_count INTEGER;
    v_cards_count INTEGER;
BEGIN
    -- Contar registros antes
    SELECT COUNT(*) INTO v_transactions_count FROM transactions WHERE user_id = v_user_id;
    SELECT COUNT(*) INTO v_cards_count FROM cards WHERE user_id = v_user_id;
    
    -- Mostrar o que será deletado
    RAISE NOTICE 'Deletando % transações e % cartões...', v_transactions_count, v_cards_count;
    
    -- Deletar transações primeiro (foreign key)
    DELETE FROM transactions WHERE user_id = v_user_id;
    
    -- Deletar cartões
    DELETE FROM cards WHERE user_id = v_user_id;
    
    -- Confirmar
    RAISE NOTICE 'Limpeza concluída com sucesso!';
    RAISE NOTICE 'Transações deletadas: %', v_transactions_count;
    RAISE NOTICE 'Cartões deletados: %', v_cards_count;
END $$;
*/

-- ============================================
-- LIMPEZA SELETIVA (OPCIONAL)
-- ============================================

-- Se quiser deletar apenas transações de um período:
-- DELETE FROM transactions 
-- WHERE user_id = 'SEU_USER_ID_AQUI'
-- AND date BETWEEN '2024-01-01' AND '2024-01-31';

-- Se quiser deletar apenas um cartão específico:
-- DELETE FROM transactions WHERE card_id = 'ID_DO_CARTAO';
-- DELETE FROM cards WHERE id = 'ID_DO_CARTAO';

-- Se quiser deletar apenas transações de uma categoria:
-- DELETE FROM transactions 
-- WHERE user_id = 'SEU_USER_ID_AQUI'
-- AND category = 'Lazer';

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
/*
1. SEMPRE verifique os dados existentes primeiro (PASSO 1)
2. Se possível, faça backup visual (PASSO 2)
3. Descomente as linhas DELETE no PASSO 3
4. Execute o script
5. Verifique que tudo foi deletado (PASSO 4)
6. Pronto para importar novos dados!

DICA: Execute linha por linha se estiver com dúvida
*/
