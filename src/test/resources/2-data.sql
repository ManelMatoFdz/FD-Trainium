SET REFERENTIAL_INTEGRITY FALSE;

INSERT INTO Users(userName,password,firstName,lastName,email,role,avatarSeed,heightCm,weightKg,gender,premium)
VALUES
('admin','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Carlos','Rey','admin@udc.es',2,'seed-admin',180,78,'MALE',0),
('entrenador','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Laura','Souto','entrenador@udc.es',1,'seed-tr1',175,80,'FEMALE',0),
('entrenadorPremium','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Diego','Mera','trainerpremium@udc.es',1,'seed-tr2',190,82,'MALE',1),
('usuario','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Ana','Picos','usuario@udc.es',0,'seed-user1',168,65,'FEMALE',0),
('mateo','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Mateo','Díaz','mateo@udc.es',0,'seed-user2',172,68,'MALE',0),
('lucia','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Lucía','Ferreiro','lucia@udc.es',0,'seed-user3',165,58,'FEMALE',0),
('rodrigo','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Rodrigo','Varela','rodrigo@udc.es',0,'seed-user4',182,81,'MALE',0),
('paula','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Paula','Neira','paula@udc.es',0,'seed-user5',170,64,'FEMALE',0),
('alex','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Álex','Mirás','alex@udc.es',0,'seed-user6',178,73,'MALE',0),
('maria','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','María','López','maria@udc.es',0,'seed-user7',160,55,'FEMALE',0),
('jorge','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Jorge','Silva','jorge@udc.es',0,'seed-user8',185,84,'MALE',0),
('ines','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Inés','Dopazo','ines@udc.es',0,'seed-user9',167,59,'FEMALE',0),
('sergio','$2a$10$jOPUSn96jI71eMOLsRkw9.eXlW.9c6iiYWn.G3E1jVy0eWT0gnGl2','Sergio','Paz','sergio@udc.es',0,'seed-user10',175,77,'MALE',0);

-- ==========================
-- CATEGORÍAS
-- ==========================
INSERT INTO Category(name)
VALUES ('Fuerza'),('Cardio'),('Movilidad'),('Resistencia');

-- ==========================
-- RUTINAS
-- ==========================
INSERT INTO Routine(name, level, description, materials, userId, categoryId, openPublic)
VALUES
('Rutina Principiantes', 'Básico', 'Rutina inicial de fuerza centrada en el tren superior e inferior.', 'Mancuernas', 1, 1, 1),
('Rutina Cardio Express', 'Intermedio', 'Entrenamiento rápido de cardio con movimientos explosivos.', 'Esterilla', 1, 2, 1),
('Rutina Core y Estabilidad', 'Intermedio', 'Fortalece el abdomen y mejora la estabilidad general.', 'Esterilla', 1, 3, 1),
('Rutina Avanzada Full Body', 'Avanzado', 'Entrenamiento completo con énfasis en fuerza y control muscular.', 'Banco, Mancuernas', 1, 1, 1),
('Rutina Fuerza Superior', 'Intermedio', 'Fuerza de tren superior con empujes y tirones.', 'Mancuernas, Barra', 1, 1, 1),
('Rutina Cardio HIIT', 'Intermedio', 'Sesiones cortas de alta intensidad para mejorar la capacidad aeróbica.', 'Esterilla', 1, 2, 1),
('Rutina Movilidad Completa', 'Básico', 'Secuencia para mejorar rango de movimiento general.', 'Esterilla', 1, 3, 1),
('Rutina Resistencia Progresiva', 'Intermedio', 'Trabajo de resistencia con incremento de volumen semanal.', 'Mancuernas', 1, 4, 1),
('Piernas y Glúteos', 'Intermedio', 'Enfoque en fuerza de tren inferior.', 'Barra, Mancuernas', 1, 1, 1),
('Espalda y Bíceps', 'Intermedio', 'Tirones verticales y horizontales para espalda y bíceps.', 'Barra, Mancuernas', 1, 1, 1),
('Pecho y Tríceps', 'Intermedio', 'Empujes horizontales y verticales para pecho y tríceps.', 'Barra, Mancuernas', 1, 1, 1),
('Core Intenso', 'Intermedio', 'Trabajo abdominal y lumbar para estabilidad central.', 'Esterilla', 1, 3, 1),
('Full Body Express', 'Básico', 'Rutina rápida de cuerpo completo para días con poco tiempo.', 'Mancuernas', 1, 2, 1),
('Estabilidad y Hombros', 'Intermedio', 'Fortalece manguito rotador y estabilidad escapular.', 'Mancuernas, Bandas', 1, 3, 1);

-- ==========================
-- EJERCICIOS
-- ==========================
INSERT INTO Exercise(name, material, status, muscles, type, description)
VALUES
('Flexiones', 'Ninguno', 'APPROVED', 'CHEST,TRICEPS,SHOULDERS', 'REPS',
 'Ejercicio clásico de empuje que fortalece el pecho, los tríceps y los hombros. Ideal para desarrollar fuerza en la parte superior del cuerpo.'),
('Sentadillas', 'Ninguno', 'APPROVED', 'LEGS,GLUTES,CALVES', 'REPS',
 'Movimiento fundamental que trabaja los músculos de las piernas y los glúteos, mejorando la estabilidad y la fuerza del tren inferior.'),
('Plancha abdominal', 'Esterilla', 'APPROVED', 'ABS,BACK,SHOULDERS', 'TIME',
 'Ejercicio isométrico que fortalece el abdomen, la espalda y los hombros. Mejora la postura y la estabilidad del core.'),
('Burpees', 'Esterilla', 'APPROVED', 'CHEST,LEGS,ABS', 'REPS',
 'Ejercicio completo de alta intensidad que combina fuerza y cardio. Activa todo el cuerpo y mejora la resistencia.'),
('Zancadas', 'Ninguno', 'APPROVED', 'LEGS,GLUTES', 'REPS',
 'Ejercicio unilateral que trabaja piernas y glúteos, mejorando el equilibrio y la coordinación.'),
('Press militar', 'Mancuernas', 'APPROVED', 'SHOULDERS,TRICEPS', 'REPS',
 'Ejercicio de empuje vertical que fortalece los hombros y tríceps. Ayuda a mejorar la estabilidad del tronco superior.'),
('Curl de bíceps', 'Mancuernas', 'APPROVED', 'BICEPS,FOREARMS', 'REPS',
 'Ejercicio de aislamiento para desarrollar la fuerza y volumen de los bíceps. También activa los antebrazos.'),
('Peso muerto', 'Barra', 'APPROVED', 'BACK,GLUTES,LEGS', 'REPS',
 'Ejercicio compuesto que trabaja espalda baja, glúteos y piernas. Mejora la fuerza general y la postura.'),
('Dominadas', 'Barra', 'APPROVED', 'BACK,BICEPS', 'REPS',
 'Ejercicio de tracción vertical que fortalece la espalda y los brazos. Desarrolla fuerza funcional y control corporal.'),
('Elevaciones de talones', 'Ninguno', 'APPROVED', 'CALVES', 'REPS',
 'Ejercicio sencillo y efectivo para fortalecer los gemelos y mejorar la estabilidad del tobillo.'),
('Crunch abdominal', 'Esterilla', 'APPROVED', 'ABS', 'REPS',
 'Ejercicio tradicional para fortalecer la zona abdominal superior. Ayuda a tonificar y definir el core.'),
('Fondos en paralelas', 'Banco', 'APPROVED', 'TRICEPS,CHEST', 'REPS',
 'Ejercicio de empuje que desarrolla tríceps, pecho y hombros. Puede realizarse en paralelas o con apoyo en banco.'),
('Remo con mancuerna', 'Mancuernas', 'APPROVED', 'BACK,BICEPS', 'REPS',
 'Ejercicio de tracción horizontal que fortalece la espalda media y los bíceps. Mejora la postura y la fuerza dorsal.'),
('Puente de glúteos', 'Esterilla', 'APPROVED', 'GLUTES,LEGS', 'REPS',
 'Ejercicio de empuje de cadera que activa los glúteos y los isquiotibiales. Ideal para mejorar la fuerza y la estabilidad pélvica.'),
('Estiramientos dinámicos', 'Ninguno', 'APPROVED', 'SHOULDERS,LEGS,BACK', 'REPS',
 'Conjunto de movimientos controlados que preparan los músculos y articulaciones para el ejercicio. Mejoran la movilidad y reducen el riesgo de lesiones.'),
('Press banca inclinado', 'Barra', 'APPROVED', 'CHEST,TRICEPS,SHOULDERS', 'REPS',
 'Ejercicio de empuje que trabaja principalmente la parte superior del pecho y los tríceps. Ideal para desarrollar fuerza en el torso.'),
('Remo con barra', 'Barra', 'APPROVED', 'BACK,BICEPS,FOREARMS', 'REPS',
 'Ejercicio de tracción que fortalece la espalda, los bíceps y los antebrazos. Mejora la postura y la fuerza dorsal.'),
('Extensión de tríceps', 'Mancuernas', 'APPROVED', 'TRICEPS,SHOULDERS', 'REPS',
 'Ejercicio de aislamiento para fortalecer y definir los tríceps. Puede realizarse de pie o sentado.'),
('Elevaciones laterales', 'Mancuernas', 'APPROVED', 'SHOULDERS', 'REPS',
 'Ejercicio de aislamiento para los deltoides laterales. Mejora la anchura y la forma de los hombros.'),
('Hip thrust', 'Barra', 'APPROVED', 'GLUTES,LEGS', 'REPS',
 'Ejercicio de empuje de cadera que potencia la fuerza de los glúteos y la parte posterior de las piernas. Muy eficaz para mejorar la potencia del tren inferior.');

-- Cardio: nuevo ejercicio y asignacion
INSERT INTO Exercise(name, material, status, muscles, type, description)
VALUES ('Carrera continua', 'Zapatillas', 'APPROVED', 'LEGS,CALVES', 'CARDIO',
        'Carrera suave para mejorar la resistencia aerobica y la capacidad cardiovascular.');

-- ==========================
-- RUTINA - EJERCICIOS
-- ==========================
-- Rutina Principiantes
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(1, 1, 10, 3),  -- Flexiones
(1, 2, 12, 3),  -- Sentadillas
(1, 7, 10, 2),  -- Curl de bíceps
(1, 10, 20, 2); -- Elevaciones de talones

-- Rutina Cardio Express
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(2, 4, 10, 3),  -- Burpees
(2, 5, 12, 3),  -- Zancadas
(2, 3, 30, 3);  -- Plancha abdominal (30s x3)

-- Rutina Core y Estabilidad
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(3, 3, 40, 3),  -- Plancha abdominal
(3, 11, 20, 3), -- Crunch abdominal
(3, 14, 15, 3); -- Puente de glúteos

-- Rutina Avanzada Full Body
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(4, 8, 8, 4),   -- Peso muerto
(4, 9, 10, 3),  -- Dominadas
(4, 6, 12, 3),  -- Press militar
(4, 12, 12, 3), -- Fondos en paralelas
(4, 13, 10, 4); -- Remo con mancuerna

INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(5, 16, 8, 4),   -- Press banca inclinado
(5, 17, 8, 4),   -- Remo con barra
(5, 9, 6, 3),    -- Dominadas
(5, 12, 12, 3);  -- Fondos en paralelas

-- Rutina Cardio HIIT (ID 6)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(6, 4, 12, 4),   -- Burpees
(6, 2, 20, 3),   -- Sentadillas
(6, 3, 30, 3);   -- Plancha abdominal (segundos)

-- Rutina Movilidad Completa (ID 7)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(7, 15, 10, 3),  -- Estiramientos dinámicos
(7, 3, 30, 2);   -- Plancha abdominal

-- Rutina Resistencia Progresiva (ID 8)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(8, 8, 6, 4),    -- Peso muerto
(8, 13, 10, 4),  -- Remo con mancuerna
(8, 5, 12, 4);   -- Zancadas

-- Piernas y Glúteos (ID 9)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(9, 2, 12, 4),   -- Sentadillas
(9, 20, 12, 4),  -- Hip thrust
(9, 10, 20, 3),  -- Elevaciones de talones
(9, 14, 15, 3);  -- Puente de glúteos

-- Espalda y Bíceps (ID 10)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(10, 17, 8, 4),  -- Remo con barra
(10, 13, 10, 3), -- Remo con mancuerna
(10, 9, 6, 3),   -- Dominadas
(10, 7, 10, 3);  -- Curl de bíceps

-- Pecho y Tríceps (ID 11)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(11, 16, 8, 4),  -- Press banca inclinado
(11, 1, 15, 3),  -- Flexiones
(11, 12, 12, 3), -- Fondos en paralelas
(11, 18, 12, 3), -- Extensión de tríceps
(11, 6, 10, 3);  -- Press militar

-- Core Intenso (ID 12)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(12, 3, 45, 3),  -- Plancha abdominal
(12, 11, 20, 3), -- Crunch abdominal
(12, 4, 10, 3);  -- Burpees

-- Full Body Express (routineId 13)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(13, 4, 10, 3),  -- Burpees
(13, 2, 12, 3),  -- Sentadillas
(13, 1, 12, 3),  -- Flexiones
(13, 13, 10, 3); -- Remo con mancuerna

-- Estabilidad y Hombros (routineId 14)
INSERT INTO RoutineExercise(routineId, exerciseId, repetitions, sets)
VALUES
(14, 19, 12, 3), -- Elevaciones laterales
(14, 6, 10, 3),  -- Press militar
(14, 3, 30, 2);  -- Plancha abdominal


-- ============================================
-- NOTIFICACIONES
-- ============================================

INSERT INTO Notifications(userId, title, message, is_read, createdAt)
VALUES
    (3, 'Bienvenido', 'Tu registro se completó exitosamente.', FALSE, NOW()),
    (3, 'Actualización de seguridad', 'Te recomendamos cambiar tu contraseña cada 90 días.', FALSE, NOW()),
    (3, 'Revisión de cuenta', 'Se detectó un inicio de sesión desde un nuevo dispositivo.', FALSE, NOW());

SET REFERENTIAL_INTEGRITY TRUE;
