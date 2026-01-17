-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: matrip
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `agencias`
--

DROP TABLE IF EXISTS `agencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_fantasia` varchar(120) NOT NULL,
  `razao_social` varchar(150) NOT NULL,
  `cnpj` varchar(14) NOT NULL,
  `email` varchar(120) NOT NULL,
  `homepage` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) NOT NULL,
  `bairro` varchar(120) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `celular` varchar(20) NOT NULL,
  `status` enum('ativa','inativa') DEFAULT 'ativa',
  `logo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnpj` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agencias`
--

LOCK TABLES `agencias` WRITE;
/*!40000 ALTER TABLE `agencias` DISABLE KEYS */;
INSERT INTO `agencias` VALUES (4,'Maranhão Encantos Turismo','Maranhão Encantos Agência de Viagens Ltda','12345678000101','contato@maranhaoencantosturismo.com.br','https://www.maranhaoencantosturismo.com.br','Av. Litorânea, 1200','Calhau','(98) 3301-1001','(98) 9 8101-1001','ativa','1768366402592-1.jpeg','2026-01-14 04:53:22'),(5,'Lençóis Adventure','Lençóis Adventure Turismo e Receptivo Ltda','23456789000102','reservas@lencoisadventure.com.br','https://www.lencoisadventure.com.br','Rua Principal, 455','Centro','(98) 3349-2202','(98) 9 8222-2202','ativa','1768366545660-2.jpeg','2026-01-14 04:55:45'),(6,'Chapada das Mesas Experience','Chapada das Mesas Experiência Turística Ltda','34567890000103','atendimento@chapadadasmesasexperience.com.br','https://www.chapadadasmesasexperience.com.br','Rua das Cachoeiras, 89','Centro','(99) 3524-3303','(99) 9 8333-3303','ativa','1768366648715-3.jpeg','2026-01-14 04:57:28'),(7,'Rota Cultural Maranhão','Rota Cultural Maranhão Turismo Ltda','45678901000104','contato@rotaculturalma.com.br','https://www.rotaculturalma.com.br','Rua Portugal, 210','Praia Grande','(98) 3211-4404','(98) 9 8444-4404','ativa','1768366767054-4.jpeg','2026-01-14 04:59:27'),(8,'Imperatriz Travel','Imperatriz Travel & Tours Agência de Viagens Ltda','56789012000105','vendas@imperatriztravel.com.br','https://www.imperatriztravel.com.br','Av. Dorgival Pinheiro, 1780','Centro','(99) 3321-5505','(99) 9 8555-5505','ativa','1768366879906-5.jpeg','2026-01-14 05:01:19'),(9,'Atins & Dunas','Atins e Dunas Turismo de Aventura Ltda','67890123000106','contato@atinsedunas.com.br','https://www.atinsedunas.com.br','Rua das Dunas, 77','Atins','(98) 3351-6606','(98) 9 8666-6606','ativa','1768366981823-6.jpeg','2026-01-14 05:03:01'),(10,'Nordeste Prime','Nordeste Prime Turismo e Eventos Ltda','78901234000107','comercial@nordesteprime.com.br','https://www.nordesteprime.com.br','Av. dos Holandeses, 500','Ponta d’Areia','(98) 3227-7707','(98) 9 8777-7707','ativa','1768367076241-7.jpeg','2026-01-14 05:04:36'),(11,'Brasil Roteiros','Brasil Roteiros Integrados Turismo Ltda','90123456000109','contato@brasilroteiros.com.br','https://www.brasilroteiros.com.br','Av. Senador Vitorino Freire, 650','Areinha','(98) 3232-9909','(98) 9 8999-9909','ativa','1768367247777-9.jpeg','2026-01-14 05:07:27'),(13,'Trilhas do Cerrado','Trilhas do Cerrado Ecoturismo LTDA','89012345000108','reservas@trilhasdocerrado.com.br','https://www.trilhasdocerradoeco.com.br','Rua do Mirante, 304','Nova Carolina','9935318808','99988888808','ativa','1768373481354-8.jpeg','2026-01-14 06:51:21');
/*!40000 ALTER TABLE `agencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'passeios','2025-12-28 23:43:21'),(2,'aventuras','2025-12-28 23:43:21'),(3,'culinaria','2025-12-28 23:43:21'),(4,'cultural','2025-12-28 23:43:21'),(9,'ecoturismo','2025-12-28 23:46:23');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guias`
--

DROP TABLE IF EXISTS `guias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `mei` varchar(20) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuario_guia` (`usuario_id`),
  CONSTRAINT `fk_guias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guias`
--

LOCK TABLES `guias` WRITE;
/*!40000 ALTER TABLE `guias` DISABLE KEYS */;
INSERT INTO `guias` VALUES (6,9,'12345678000118','98991234567','joao@email.com','2026-01-13 13:28:07'),(7,10,'48912736000105','98991234567','jose@email.com','2026-01-14 06:02:34'),(8,11,'47821846000107','98987654321','edson@email.com','2026-01-14 06:10:02'),(9,12,'46713294000109','98991564784','mariana@email.com','2026-01-14 06:48:55');
/*!40000 ALTER TABLE `guias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passeio_imagens`
--

DROP TABLE IF EXISTS `passeio_imagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passeio_imagens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passeio_id` int DEFAULT NULL,
  `caminho` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `passeio_id` (`passeio_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passeio_imagens`
--

LOCK TABLES `passeio_imagens` WRITE;
/*!40000 ALTER TABLE `passeio_imagens` DISABLE KEYS */;
INSERT INTO `passeio_imagens` VALUES (20,16,'1767051342998-274984386_4837054576414274_5406000242970143223_n.jpg'),(21,16,'1767051343014-a-igreja-e-a-bela-fonte.jpg'),(22,16,'1767051343029-Casa_das_Tulhas.jpg'),(23,16,'1767051343080-DouglasJunior_Catedral_da_SÃ©_sÃ£oLuis_MA_(40156114344).jpg'),(24,17,'1767052094631-39852_local_mostra_beleza_natural_do_parque_estadual_do_bacanga_1830430357426059637.jpg'),(25,17,'1767052094738-Lagoa_da_Jansen_-_SÃ£o_LuÃ­s_-_MaranhÃ£o_-_Brasil_-_Lagoon_of_the_Jansen_-_SÃ£o_LuÃ­s_-_MaranhÃ£o_-_Brazil_(3870641863).jpg'),(26,17,'1767052094751-lagoa-jansen.jpg'),(27,17,'1767052094754-Sao-luis-Maranhao-por-do-sol-espigao-800x445.jpg'),(28,17,'1767052094756-unnamed-1-.webp'),(29,18,'1767061435022-274966197_4837055329747532_3102252651510733147_n.jpg'),(30,18,'1767061435068-area-externa-do-mercado.jpg'),(31,18,'1767061435078-b2ap3_large_5.jpg'),(32,18,'1767061435086-Escadaria_Reviver_(866919634).jpg'),(33,19,'1768289781659-casso1.jpg'),(34,19,'1768289781664-Image 2020-07-13 at 17.42.50 (1).jpeg'),(35,19,'1768289781669-Image 2020-07-13 at 17.59.08.jpeg'),(36,20,'1768353548340-63.jpg'),(37,21,'1768355041591-WhatsApp Image 2020-07-13 at 17.42.50 (1) (1).jpeg'),(38,22,'1768358890307-WhatsApp Image 2026-01-13 at 23.45.51.jpeg'),(39,23,'1768359256455-WhatsApp Image 2026-01-13 at 23.51.33.jpeg'),(40,23,'1768359551081-WhatsApp Image 2026-01-13 at 23.51.54.jpeg'),(41,24,'1768359868078-WhatsApp Image 2026-01-14 at 00.02.27.jpeg'),(42,25,'1768360110083-WhatsApp Image 2026-01-14 at 00.07.05.jpeg'),(43,26,'1768360382517-WhatsApp Image 2026-01-14 at 00.12.16.jpeg'),(44,27,'1768360960099-WhatsApp Image 2020-07-13 at 17.50.48.jpeg'),(45,28,'1768361626830-wwwwwwww.jpeg'),(46,29,'1768370304165-Passeio de Barco Tocantins.jpeg'),(47,30,'1768373232559-Passeio de Barco Tocantins.jpeg');
/*!40000 ALTER TABLE `passeio_imagens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passeios`
--

DROP TABLE IF EXISTS `passeios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passeios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria` varchar(50) DEFAULT NULL,
  `local` varchar(255) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` char(2) DEFAULT NULL,
  `descricao` text,
  `valor_adulto` decimal(10,2) DEFAULT NULL,
  `valor_estudante` decimal(10,2) DEFAULT NULL,
  `valor_crianca` decimal(10,2) DEFAULT NULL,
  `valor_final` decimal(10,2) DEFAULT NULL,
  `guia_id` int DEFAULT NULL,
  `data_passeio` date DEFAULT NULL,
  `roteiro` json DEFAULT NULL,
  `inclui` json DEFAULT NULL,
  `locais_embarque` json DEFAULT NULL,
  `horarios` json DEFAULT NULL,
  `frequencia` varchar(30) DEFAULT NULL,
  `classificacao` varchar(10) DEFAULT NULL,
  `informacoes_importantes` text,
  PRIMARY KEY (`id`),
  KEY `fk_passeios_guia` (`guia_id`),
  CONSTRAINT `fk_passeios_guia` FOREIGN KEY (`guia_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passeios`
--

LOCK TABLES `passeios` WRITE;
/*!40000 ALTER TABLE `passeios` DISABLE KEYS */;
INSERT INTO `passeios` VALUES (16,'cultural','Centro Histórico','São Luís','MA','Tour guiado pelo Centro Histórico de São Luís (Patrimônio Cultural), com caminhada leve por ruas e casarões coloniais, mirantes, igrejas e pontos culturais. Inclui paradas para fotos, histórias, curiosidades e tempo livre para compras e sabores locais.',79.90,59.90,39.90,79.90,5,'2026-01-20','{\"saida\": {\"hora\": \"08:30\", \"local\": \"Praça Deodoro (em frente ao Teatro Arthur Azevedo)\"}, \"paradas\": [{\"hora\": \"08:30\", \"local\": \"Teatro Arthur Azevedo (fachada + história)\"}, {\"hora\": \"08:50\", \"local\": \"Praça João Lisboa (introdução ao Centro Histórico)\"}, {\"hora\": \"09:10\", \"local\": \"Rua do Giz (arquitetura e azulejos portugueses)\"}, {\"hora\": \"09:40\", \"local\": \"Casa do Maranhão (cultura, tradições e artesanato)\"}, {\"hora\": \"10:10\", \"local\": \"Rua Portugal (cartão-postal, fotos e curiosidades)\"}, {\"hora\": \"10:40\", \"local\": \"Mercado das Tulhas / Feira da Praia Grande (tempo livre)\"}, {\"hora\": \"11:20\", \"local\": \"Catedral da Sé (visita externa e contexto histórico)\"}, {\"hora\": \"12:00\", \"local\": \"Praça Dom Pedro II / Mirante (fotos + Baía de São Marcos)\"}], \"retorno\": {\"hora\": \"12:30\", \"local\": \"Praça Dom Pedro II (Palácio dos Leões) – retorno final / ponto de dispersão\"}}','[\"Guia local credenciado (acompanhamento durante todo o roteiro)\", \"Água mineral (1 por pessoa)\", \"Kit boas-vindas (mapa/mini guia do Centro Histórico)\", \"Seguro passeio (básico)\", \"Suporte via WhatsApp (antes e durante o passeio)\"]','[\"Praça Deodoro (ponto principal)\", \"Hotel Luzeiros São Luís (retirada)\", \"Shopping da Ilha (retirada)\", \"Praia Grande – Terminal de Turismo (retirada)\"]','[\"08:30\", \"14:30\"]','semanal','livre','Use roupas leves e confortáveis e tênis (caminhada em ruas de pedra).\r\n\r\nLevar protetor solar, chapéu/boné e óculos de sol.\r\n\r\nRecomenda-se garrafinha extra de água.\r\n\r\nLevar documento com foto.\r\n\r\nO roteiro pode ajustar paradas em caso de chuva forte.\r\n\r\nAlguns pontos podem ter taxas/entradas opcionais (se o visitante quiser entrar).'),(18,'cultural','Rota do Centro & Sabores de São Luís (Azulejos + Mercado + Beco Catarina Mina)','São Luís','MA','Passeio guiado pelo Centro Histórico de São Luís com foco em arquitetura colonial e azulejos portugueses, visita ao Mercado das Tulhas para conhecer sabores locais, e encerramento com pôr do sol em um mirante da região. Ideal pra quem quer cultura, fotos e história em um roteiro leve e completo.',70.00,55.00,30.00,70.00,5,'2026-01-15','{\"saida\": {\"hora\": \"15:30\", \"local\": \"Passeio guiado pelo Centro Histórico de São Luís com foco em arquitetura colonial e azulejos portugueses, visita ao Mercado das Tulhas para conhecer sabores locais, e encerramento com pôr do sol em um mirante da região. Ideal pra quem quer cultura, fotos e história em um roteiro leve e completo.\"}, \"paradas\": [{\"hora\": null, \"local\": \"Palácio dos Leões + vista da Baía de São Marcos — contextualização histórica e fotos (20 min)\"}, {\"hora\": null, \"local\": \"Praça Benedito Leite + Catedral da Sé (parte externa) — história e curiosidades (25 min)\"}, {\"hora\": null, \"local\": \"Praça Benedito Leite + Catedral da Sé (parte externa) — história e curiosidades (25 min)\"}, {\"hora\": null, \"local\": \"Rua Portugal (fachadas e azulejos) — melhores pontos pra fotos (35 min)\"}, {\"hora\": null, \"local\": \"Beco Catarina Mina — cultura, lendas e memórias (20 min)\"}, {\"hora\": null, \"local\": \"Casa do Maranhão (parte externa) + Mirante — encerramento com panorama (25 min)\"}], \"retorno\": {\"hora\": \"18:30\", \"local\": \"Praça Nauro Machado (próximo ao Largo do Comércio)\"}}','[\"Guia local durante todo o roteiro\", \"Paradas guiadas e explicação histórica/cultural\", \"Sugestões de fotos e pontos “instagramáveis”\", \"Suporte para orientações de compras/degustações no Mercado das Tulhas\"]','[\"Shopping da Ilha (entrada principal)\", \"Hotel PraiaMar (Calhau)\"]','[\"15:30\", \"16:00\"]','semanal','livre','Levar água e protetor solar\r\n\r\nRoupas leves e calçado confortável (ruas de pedra)\r\n\r\nRecomenda-se chapéu/boné\r\n\r\nNão esqueça documento e dinheiro/cartão (Mercado das Tulhas)\r\n\r\nEm caso de chuva forte, o roteiro pode ser ajustado para áreas cobertas próximas'),(20,'passeios','City Tour Histórico e Panorâmico de São Luís (Centro Histórico + Litorânea)','São Luís','MA','Passeio guiado pelos principais pontos históricos e praias, com paradas para fotos',190.00,140.00,90.00,190.00,9,'2026-01-18','{\"saida\": {\"hora\": \"08:30\", \"local\": \"Hotel/pousada do cliente\"}, \"paradas\": [], \"retorno\": {\"hora\": \"13:00\", \"local\": \"Centro da cidade\"}}','[]','[]','[\"08:30\"]','mensal','livre','Não inclui alimentação.'),(21,'passeios','Bate-volta Lençóis Maranhenses com Pôr do Sol (São Luís — Barreirinhas)','São Luís','MA','Bate-volta em veículo até Barreirinhas + visita às dunas com pôr do sol.',280.00,240.00,180.00,280.00,9,'2026-01-18','{\"saida\": {\"hora\": \"04:00\", \"local\": \"São Luís (hotel/pousada)\"}, \"paradas\": [], \"retorno\": {\"hora\": \"20:15\", \"local\": \"São Luís (hotel/pousada)\"}}','[]','[]','[]','quinzenal','10','Alimentação não inclusa; paradas para banheiro e lanches não inclusas.'),(22,'passeios','Chapada das Mesas — Roteiro de 2 Dias (Natureza)','Carolina','MA','Roteiro guiado com veículo 4×4 visitando principais atrações naturais.',580.00,490.00,360.00,580.00,9,'2026-01-18','{\"saida\": {\"hora\": \"08:00\", \"local\": \"Carolina (agência)\"}, \"paradas\": [], \"retorno\": {\"hora\": \"17:00\", \"local\": \"Carolina\"}}','[]','[]','[]','semanal','14','Alimentação não incluída.'),(23,'cultural','Tour Cultural e Patrimônio Arquitetônico (Patrimônio Histórico + museus)','São Luís','MA','Caminhada guiada com foco na história e arquitetura colonial.',200.00,150.00,120.00,200.00,9,'2026-01-18','{\"saida\": {\"hora\": \"09:00\", \"local\": \"Praça Dom Pedro II\"}, \"paradas\": [], \"retorno\": {\"hora\": \"12:30\", \"local\": \"Praça Dom Pedro II\"}}','[]','[]','[]','diario','livre','Não inclui ingressos de museus se houver taxa.'),(24,'culinaria','Degustação Gastronômica pelo Centro Histórico de São Luís','São Luís','MA','Tour guiado por mercados históricos e restaurantes típicos (provas inclusas).',320.00,260.00,180.00,320.00,9,'2026-01-18','{\"saida\": {\"hora\": \"10:00\", \"local\": \"Ponto central no Centro Histórico\"}, \"paradas\": [], \"retorno\": {\"hora\": \"13:30\", \"local\": \"Centro Histórico\"}}','[]','[]','[]','diario','livre','Inclui degustações, não inclui almoço completo.'),(25,'culinaria','Almoço Típico + Comunidade de Atins','Barreirinhas','MA','Visita à vila de Atins e almoço em restaurante típico.',390.00,330.00,250.00,390.00,9,'2026-01-18','{\"saida\": {\"hora\": \"09:00\", \"local\": \"Barreirinhas\"}, \"paradas\": [], \"retorno\": {\"hora\": \"15:00\", \"local\": \"Barreirinhas\"}}','[]','[]','[]','diario','livre','Almoço incluso; bebidas não inclusas.'),(26,'culinaria','Gastronomia Imperatrizense + Mercado Municipal','Imperatriz','MA','Tour guiado por sabores regionais como arroz de cuxá adaptado e pratos típicos.',190.00,150.00,120.00,190.00,9,'2026-01-18','{\"saida\": {\"hora\": \"10:00\", \"local\": \"Mercado Municipal\"}, \"paradas\": [], \"retorno\": {\"hora\": \"13:00\", \"local\": \"Mercado Municipal\"}}','[]','[]','[]','diario','livre','Degustações com custo das refeições não incluído no pacote.'),(27,'aventuras','Circuito Quadriciclo + Lancha (Combo)','Barreirinhas','MA','Passeio combinando quadriciclo nas dunas e trajeto de lancha pelo rio.',550.00,450.00,350.00,550.00,9,'2026-01-18','{\"saida\": {\"hora\": \"08:30\", \"local\": \"Agência Barreirinhas\"}, \"paradas\": [], \"retorno\": {\"hora\": \"16:00\", \"local\": \"Barreirinhas\"}}','[]','[]','[]','diario','10','Não inclui refeições.'),(28,'aventuras','Cachoeira São Romão + Cachoeira da Prata (Chapada) - Parque Nacional da Chapada das Mesas','Carolina','MA','Excursão guiada com caminhada moderada até duas cachoeiras do parque.',420.00,350.00,280.00,420.00,9,'2026-01-18','{\"saida\": {\"hora\": \"08:00\", \"local\": \"agência\"}, \"paradas\": [], \"retorno\": {\"hora\": \"17:30\", \"local\": \"Carolina\"}}','[]','[]','[]','semanal','livre','Refeições e entradas podem não estar inclusas.'),(30,'aventuras','Passeio de Barco no Rio Tocantins + Pôr do Sol','Carolina','MA','Passeio guiado de barco com contemplação do pôr do sol e paradas para banho.',340.00,280.00,210.00,340.00,9,'2026-01-18','{\"saida\": {\"hora\": \"15:00\", \"local\": \"Porto de Carolina\"}, \"paradas\": [], \"retorno\": {\"hora\": \"19:00\", \"local\": \"Carolina\"}}','[]','[]','[]','diario','livre','Levar protetor solar e água.');
/*!40000 ALTER TABLE `passeios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicos`
--

DROP TABLE IF EXISTS `servicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guia_id` int NOT NULL,
  `passeio_id` int NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descricao` text NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `foto` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `guia_id` (`guia_id`),
  KEY `passeio_id` (`passeio_id`),
  CONSTRAINT `servicos_ibfk_1` FOREIGN KEY (`guia_id`) REFERENCES `guias` (`id`),
  CONSTRAINT `servicos_ibfk_2` FOREIGN KEY (`passeio_id`) REFERENCES `passeios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicos`
--

LOCK TABLES `servicos` WRITE;
/*!40000 ALTER TABLE `servicos` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `tipo` enum('admin','usuario','guia') DEFAULT 'usuario',
  `provider` varchar(20) DEFAULT NULL,
  `provider_id` varchar(100) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `facebook_id` (`facebook_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,'Administrador','admin@matrip.com','$2b$10$joparITJ.xNvPJw/D3kw8OzD1qFTB1UiFiPJ0rUOwMIb6gZ/3lmsG','admin',NULL,NULL,NULL),(5,'Elcio','elcio@gmail.com','$2b$10$9foKZaDG2Bsg8AOHCSjg9eq3NFscsyshbz1OK8TzIpwmm49s0efmO','guia',NULL,NULL,NULL),(9,'João','joao@email.com','$2b$10$cZ9p6KpWg6bFxF.BFYUL.eg1WTiUsaosvYDW6C8H2opeW0TQKra3m','guia',NULL,NULL,NULL),(10,'José','jose@email.com','$2b$10$afV2puwS8D.YzZXlBZw63O.kVdBhpstCDkLPY.84HwP5ueBCUoL1K','guia',NULL,NULL,NULL),(11,'Edson','edson@email.com','$2b$10$l6TiR4qQhHOMnWxnSR8H7uLKYt2Xh3h1oAzDxPv5mS1li2bgm.K8C','guia',NULL,NULL,NULL),(12,'Mariana','mariana@email.com','$2b$10$QAZPJKyLAu7PQMrISrTJKODO9uBK.bK2Ho0wKcRsfdIhJ01rPSQXq','guia',NULL,NULL,NULL),(13,'Sheila','sheila@email.com','$2b$10$fMNtBRv7gPsf.D9NX.kwDeqtvzV.n7ijZHQZOytQskECkMR1IUvsu','usuario',NULL,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16 15:10:07
