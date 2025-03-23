-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: todo
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `goal`
--

DROP TABLE IF EXISTS `goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goal` (
  `idGoal` int NOT NULL AUTO_INCREMENT,
  `nameGoal` varchar(100) DEFAULT NULL,
  `AbNameGoal` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idGoal`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goal`
--

LOCK TABLES `goal` WRITE;
/*!40000 ALTER TABLE `goal` DISABLE KEYS */;
INSERT INTO `goal` VALUES (59,'Выйти на новый рынок','NewM'),(60,'Привлечь новую аудиторию','GNewC'),(61,'Повышение качества продукции','ПКП'),(62,'Увеличение удовлетворенности клиентов','УУК'),(63,'Развитие инновационных технологий','РИТ'),(64,'Оптимизация бизнес-процессов','ОБП');
/*!40000 ALTER TABLE `goal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goal_has_project`
--

DROP TABLE IF EXISTS `goal_has_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goal_has_project` (
  `goal_idGoal` int NOT NULL,
  `project_idProject` int NOT NULL,
  PRIMARY KEY (`goal_idGoal`,`project_idProject`),
  KEY `fk_goal_has_project_project1_idx` (`project_idProject`),
  CONSTRAINT `fk_goal_has_project_goal1` FOREIGN KEY (`goal_idGoal`) REFERENCES `goal` (`idGoal`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_goal_has_project_project1` FOREIGN KEY (`project_idProject`) REFERENCES `project` (`idProject`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goal_has_project`
--

LOCK TABLES `goal_has_project` WRITE;
/*!40000 ALTER TABLE `goal_has_project` DISABLE KEYS */;
INSERT INTO `goal_has_project` VALUES (59,97),(60,97),(64,97);
/*!40000 ALTER TABLE `goal_has_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `idProject` int NOT NULL AUTO_INCREMENT,
  `nameProject` varchar(100) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `stateProject` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `completed` tinyint DEFAULT '0',
  PRIMARY KEY (`idProject`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (46,'ТЕСТ','2025-03-15','1 месяц','ТЕСТ',0),(59,'123','2025-03-16','123','123',0),(81,'тест','2025-03-21','ываываы','тест',0),(82,'фыв','2025-03-21','яыв','фыв',0),(83,'йоп','2025-03-21','Сделать to do list','asdasdasd',0),(85,'ывааыва','2025-03-21','фыв','фыв',0),(93,'ТЕСМТ','2025-03-21','фыв','фыв',0),(95,'тест','2025-03-21','тест','тест',0),(97,'Организовать логистику','2025-03-21','да','Между Саратовым и Москвой',0);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder`
--

DROP TABLE IF EXISTS `stakeholder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stakeholder` (
  `idStake` int NOT NULL AUTO_INCREMENT,
  `nameStake` varchar(100) DEFAULT NULL,
  `AbNameStake` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idStake`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder`
--

LOCK TABLES `stakeholder` WRITE;
/*!40000 ALTER TABLE `stakeholder` DISABLE KEYS */;
INSERT INTO `stakeholder` VALUES (29,'Руководитель проекта','PrMan'),(30,'Дизайнер','UX/UI'),(31,'Сотрудники','Сот'),(32,'Инвесторы','ИНВ'),(33,'Поставщики','ПОСТ'),(34,'Акционеры','АКЦ'),(35,'Конкуренты','КОНК');
/*!40000 ALTER TABLE `stakeholder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder_has_project`
--

DROP TABLE IF EXISTS `stakeholder_has_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stakeholder_has_project` (
  `stakeholder_idStake` int NOT NULL,
  `project_idProject` int NOT NULL,
  PRIMARY KEY (`stakeholder_idStake`,`project_idProject`),
  KEY `fk_stakeholder_has_project_project1_idx` (`project_idProject`),
  CONSTRAINT `fk_stakeholder_has_project_project1` FOREIGN KEY (`project_idProject`) REFERENCES `project` (`idProject`) ON DELETE CASCADE,
  CONSTRAINT `fk_stakeholder_has_project_stakeholder1` FOREIGN KEY (`stakeholder_idStake`) REFERENCES `stakeholder` (`idStake`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder_has_project`
--

LOCK TABLES `stakeholder_has_project` WRITE;
/*!40000 ALTER TABLE `stakeholder_has_project` DISABLE KEYS */;
INSERT INTO `stakeholder_has_project` VALUES (29,97),(32,97),(33,97);
/*!40000 ALTER TABLE `stakeholder_has_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `idTask` int NOT NULL AUTO_INCREMENT,
  `nameTask` varchar(45) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `deadLine` date DEFAULT NULL,
  `idProject` int DEFAULT NULL,
  `status` tinyint DEFAULT '0',
  PRIMARY KEY (`idTask`),
  KEY `fk_task_project1_idx` (`idProject`),
  CONSTRAINT `fk_task_project1` FOREIGN KEY (`idProject`) REFERENCES `project` (`idProject`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (28,'CREATE','CR','2025-03-15',46,1),(29,'UPDATE','UP','2025-03-15',46,0),(30,'READ','RD','2025-03-15',46,0),(31,'DELETE','DEL','2025-03-15',46,0),(72,'Рассчитать издержки','и тд ','2025-03-21',97,1),(73,'Увеличить штат трактористов','статы','2025-03-21',97,1);
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `username` varchar(30) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `surname` varchar(45) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `salt` varchar(45) DEFAULT NULL,
  `is_admin` tinyint DEFAULT '0',
  PRIMARY KEY (`idUser`),
  KEY `idUser1_idx` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (12,'hash','test','test','rgWg5V5xjIlW6rDdGf5lKaZqnZE00cvrHZSOAmigM18=','xQadzJvie8t4HiK8WGZ3Mg==',1),(16,'anger101','Михаил','Матвиенко','V9sJcaoiDvJpd6swKrLdCGohWv9Qb9empmszUPz3ggE=','t+oE+5Q066AAMjQCavGmPw==',0),(19,'mrTvister','Дмитрий','Константинович','5qgCd6/4CwzkjqvSsuUZVnfJY22buMuH1bH+Bic/ZOE=','l4v65qh53OAV+I/J3HB/vQ==',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_has_project`
--

DROP TABLE IF EXISTS `user_has_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_has_project` (
  `user_idUser` int NOT NULL,
  `project_idProject` int NOT NULL,
  `user_role` int DEFAULT '0',
  PRIMARY KEY (`user_idUser`,`project_idProject`),
  KEY `fk_user_has_project_project1_idx` (`project_idProject`),
  CONSTRAINT `fk_user_has_project_project1` FOREIGN KEY (`project_idProject`) REFERENCES `project` (`idProject`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_has_project_user` FOREIGN KEY (`user_idUser`) REFERENCES `user` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_has_project`
--

LOCK TABLES `user_has_project` WRITE;
/*!40000 ALTER TABLE `user_has_project` DISABLE KEYS */;
INSERT INTO `user_has_project` VALUES (12,97,1),(16,97,0);
/*!40000 ALTER TABLE `user_has_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_has_task`
--

DROP TABLE IF EXISTS `user_has_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_has_task` (
  `user_idUser` int NOT NULL,
  `task_idTask` int NOT NULL,
  `user_role` int DEFAULT '0',
  PRIMARY KEY (`user_idUser`,`task_idTask`),
  KEY `index2` (`user_idUser`),
  KEY `fk_user_has_task_task1_idx` (`task_idTask`),
  CONSTRAINT `fk_user_has_task_task1` FOREIGN KEY (`task_idTask`) REFERENCES `task` (`idTask`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_has_task_user1` FOREIGN KEY (`user_idUser`) REFERENCES `user` (`idUser`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_has_task`
--

LOCK TABLES `user_has_task` WRITE;
/*!40000 ALTER TABLE `user_has_task` DISABLE KEYS */;
INSERT INTO `user_has_task` VALUES (12,72,1),(12,73,1),(16,72,0),(16,73,0);
/*!40000 ALTER TABLE `user_has_task` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-23 15:03:40
