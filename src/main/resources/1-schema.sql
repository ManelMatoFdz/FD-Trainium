SET REFERENTIAL_INTEGRITY FALSE;

DROP TABLE IF EXISTS ExerciseExecutionSet;
DROP TABLE IF EXISTS ExerciseExecution;
DROP TABLE IF EXISTS RoutineExecutionComments;
DROP TABLE IF EXISTS RoutineExecution;
DROP TABLE IF EXISTS RoutineExecutionLikes;
DROP TABLE IF EXISTS RoutineExercise;
DROP TABLE IF EXISTS UserRoutines;
DROP TABLE IF EXISTS UserFollows;
DROP TABLE IF EXISTS Exercise;
DROP TABLE IF EXISTS Routine;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Users;

SET REFERENTIAL_INTEGRITY TRUE;

CREATE TABLE Users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userName VARCHAR(60) NOT NULL,
  password VARCHAR(60) NOT NULL,
  firstName VARCHAR(60) NOT NULL,
  lastName VARCHAR(60) NOT NULL,
  email VARCHAR(60) NOT NULL UNIQUE,
  role SMALLINT NOT NULL,                  
  formation VARCHAR(100),
  avatarSeed VARCHAR(64) NOT NULL,
  avatarUrl VARCHAR(255),
  avatarImage BLOB NULL,
  avatarImageType VARCHAR(64) NULL,
  heightCm DOUBLE NULL,
  weightKg DOUBLE NULL,
  gender VARCHAR(16) NULL,
  followersCount BIGINT DEFAULT 0,
  followingCount BIGINT DEFAULT 0,
  premium BOOLEAN NOT NULL DEFAULT FALSE,
  bannedByAdmin BOOLEAN NOT NULL DEFAULT FALSE
);



CREATE TABLE Category
(
    id   BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Routine
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    level       VARCHAR(50)  NOT NULL,
    description TEXT,
    materials   VARCHAR(255),
    userId      BIGINT       NOT NULL,
    categoryId  BIGINT,
    openPublic  BOOLEAN,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routines_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE,
    CONSTRAINT fk_routines_category FOREIGN KEY (categoryId) REFERENCES Category (id) ON DELETE SET NULL
);

CREATE TABLE Exercise
(
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    name_norm   VARCHAR(100) AS (LOWER(TRIM(name))),
    material    VARCHAR(100),
    repetitions INT,
    type        VARCHAR(20) DEFAULT 'REPS',
    status      VARCHAR(20) DEFAULT 'PENDING',
    muscles     VARCHAR(100),
    description TEXT,
    image       BLOB,
    imageMimeType VARCHAR(255),
    CONSTRAINT uq_exercise_name_norm UNIQUE (name_norm)
);

CREATE TABLE RoutineExercise
(
    id          BIGINT NOT NULL AUTO_INCREMENT,
    routineId   BIGINT NOT NULL,
    exerciseId  BIGINT NOT NULL,
    repetitions INT,
    sets        INT,
    distanceMeters DECIMAL(8,2),
    durationSeconds INT,
    material    VARCHAR(100),
    PRIMARY KEY (id),
    CONSTRAINT fk_routineExercises_routine FOREIGN KEY (routineId) REFERENCES Routine (id) ON DELETE CASCADE,
    CONSTRAINT fk_routineExercises_exercise FOREIGN KEY (exerciseId) REFERENCES Exercise (id) ON DELETE CASCADE
);

CREATE TABLE RoutineExecution
(
    id          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId      BIGINT NOT NULL,
    routineId   BIGINT NOT NULL,
    performedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    startedAt   TIMESTAMP NULL,
    finishedAt  TIMESTAMP NULL,
    totalDurationSec INT NULL,
    CONSTRAINT fk_execution_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE,
    CONSTRAINT fk_execution_routine FOREIGN KEY (routineId) REFERENCES Routine (id) ON DELETE CASCADE
);

CREATE TABLE RoutineExecutionLikes (
    routineExecutionId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    likedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (routineExecutionId, userId),
    CONSTRAINT fk_routineExecutionLikes_execution FOREIGN KEY (routineExecutionId) REFERENCES RoutineExecution (id) ON DELETE CASCADE,
    CONSTRAINT fk_routineExecutionLikes_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
);

CREATE TABLE RoutineExecutionComments
(
    id                 BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    routineExecutionId BIGINT NOT NULL,
    userId             BIGINT NOT NULL,
    text               VARCHAR(1000) NOT NULL,
    createdAt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routineExecutionComments_execution FOREIGN KEY (routineExecutionId) REFERENCES RoutineExecution (id) ON DELETE CASCADE,
    CONSTRAINT fk_routineExecutionComments_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
);

CREATE TABLE ExerciseExecution
(
    id                 BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    routineExecutionId BIGINT NOT NULL,
    exerciseId         BIGINT NOT NULL,
    performedSets      INT,
    performedReps      INT,
    weightUsed         DECIMAL(5, 2),
    notes              TEXT,
    type               VARCHAR(20) NULL,
    distanceMeters     DECIMAL(8,2) NULL,
    durationSeconds    INT NULL,
    CONSTRAINT fk_exerciseExecution_execution FOREIGN KEY (routineExecutionId) REFERENCES RoutineExecution (id) ON DELETE CASCADE,
    CONSTRAINT fk_exerciseExecution_exercise FOREIGN KEY (exerciseId) REFERENCES Exercise (id) ON DELETE CASCADE
);

CREATE TABLE ExerciseExecutionSet
(
    id                   BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    exerciseExecutionId  BIGINT NOT NULL,
    setIndex             INT NOT NULL,
    reps                 INT NULL,
    seconds              INT NULL,
    weight               DECIMAL(5,2) NULL,
    CONSTRAINT fk_exerciseExecutionSet_execution FOREIGN KEY (exerciseExecutionId) REFERENCES ExerciseExecution (id) ON DELETE CASCADE
);

CREATE TABLE UserRoutines
(
    userId    BIGINT NOT NULL,
    routineId BIGINT NOT NULL,
    savedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, routineId),
    CONSTRAINT fk_userRoutines_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE,
    CONSTRAINT fk_userRoutines_routine FOREIGN KEY (routineId) REFERENCES Routine (id) ON DELETE CASCADE
);

CREATE TABLE Notifications
(
    id        BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId    BIGINT       NOT NULL,
    title     VARCHAR(100) NOT NULL,
    message   TEXT         NOT NULL,
    is_read   BOOLEAN  DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT  fk_notifications_user FOREIGN KEY (userId) REFERENCES Users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE UserFollows (
    followerId BIGINT NOT NULL,
    followeeId BIGINT NOT NULL,
    followedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (followerId, followeeId),
    CONSTRAINT fk_userFollows_follower FOREIGN KEY (followerId) REFERENCES Users (id) ON DELETE CASCADE,
    CONSTRAINT fk_userFollows_followee FOREIGN KEY (followeeId) REFERENCES Users (id) ON DELETE CASCADE
);

CREATE TABLE user_blocks (
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    blockedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT fk_user_blocks_blocker FOREIGN KEY (blocker_id) REFERENCES Users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_blocks_blocked FOREIGN KEY (blocked_id) REFERENCES Users (id) ON DELETE CASCADE
);
