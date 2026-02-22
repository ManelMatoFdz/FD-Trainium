-- Script de datos de estrés: 10000 rutinas adicionales
-- Este script se ejecuta solo con el perfil test

-- Generar 10000 rutinas de estrés para pruebas de carga
-- Las rutinas se asignan solo a admin (userId=1) y entrenadorPremium (userId=3)
-- Todas son públicas (openPublic=TRUE)

INSERT INTO Routine(name, level, description, materials, userId, categoryId, openPublic)
SELECT 
    CONCAT('Rutina Estrés #', X) as name,
    CASE MOD(X, 3) WHEN 0 THEN 'Básico' WHEN 1 THEN 'Intermedio' ELSE 'Avanzado' END as level,
    CONCAT('Rutina generada automáticamente para pruebas de estrés. Número: ', X) as description,
    CASE MOD(X, 4) WHEN 0 THEN 'Mancuernas' WHEN 1 THEN 'Esterilla' WHEN 2 THEN 'Barra' ELSE 'Ninguno' END as materials,
    CASE MOD(X, 2) WHEN 0 THEN 1 ELSE 3 END as userId,
    MOD(X - 1, 4) + 1 as categoryId,
    TRUE as openPublic
FROM SYSTEM_RANGE(1, 2147483647);
