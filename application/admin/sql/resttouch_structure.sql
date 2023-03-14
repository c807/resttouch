CREATE DATABASE IF NOT EXISTS RT_DATABASE_NAME /*!40100 DEFAULT CHARACTER SET utf8 */;
--USE RT_DATABASE_NAME;

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
-- Table structure for table acceso
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.acceso;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.acceso (
  acceso int(11) NOT NULL AUTO_INCREMENT,
  modulo int(11) NOT NULL,
  usuario int(11) NOT NULL,
  submodulo int(11) NOT NULL,
  opcion int(11) NOT NULL,
  activo tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (acceso),
  UNIQUE KEY UsrModSubOpc (usuario,modulo,submodulo,opcion),
  KEY fk_acceso_modulo1_idx (modulo),
  KEY fk_acceso_usuario1_idx (usuario),
  KEY idx_acceso_submodulo1 (submodulo),
  KEY idx_acceso_opcion1 (opcion),
  CONSTRAINT fk_acceso_modulo1 FOREIGN KEY (modulo) REFERENCES RT_DATABASE_NAME.modulo (modulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_acceso_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table accion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.accion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.accion (
  accion int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) DEFAULT NULL,
  PRIMARY KEY (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table area
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.area;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.area (
  area int(11) NOT NULL AUTO_INCREMENT,
  sede int(11) NOT NULL,
  area_padre int(11) DEFAULT NULL,
  nombre varchar(100) NOT NULL,
  impresora int(11) NOT NULL DEFAULT '0',
  impresora_factura int(11) DEFAULT '0',
  PRIMARY KEY (area),
  KEY fk_area_sede1_idx (sede),
  KEY fk_area_area1_idx (area_padre),
  CONSTRAINT fk_area_area1 FOREIGN KEY (area_padre) REFERENCES RT_DATABASE_NAME.area (area),
  CONSTRAINT fk_area_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table articulo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.articulo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.articulo (
  articulo int(11) NOT NULL AUTO_INCREMENT,
  categoria_grupo int(11) NOT NULL,
  presentacion int(11) NOT NULL,
  descripcion varchar(250) NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT '0.00',
  venta tinyint(1) NOT NULL DEFAULT '0' COMMENT '1. indica que es un artículo para venta final, de lo contrario no.',
  bien_servicio char(1) NOT NULL DEFAULT 'B' COMMENT 'B: bien, S: servicio',
  existencias decimal(10,2) NOT NULL DEFAULT '0.00',
  shopify_id varchar(25) DEFAULT NULL,
  codigo varchar(25) DEFAULT NULL,
  produccion tinyint(1) NOT NULL DEFAULT '0',
  presentacion_reporte int(11) DEFAULT NULL,
  mostrar_pos tinyint(1) NOT NULL DEFAULT '1',
  impuesto_especial int(11) DEFAULT NULL,
  combo tinyint(1) NOT NULL DEFAULT '0',
  multiple tinyint(1) NOT NULL DEFAULT '0',
  cantidad_minima int(11) NOT NULL DEFAULT '1',
  cantidad_maxima int(11) NOT NULL DEFAULT '1',
  rendimiento decimal(10,2) DEFAULT '0.00',
  costo decimal(10,2) NOT NULL DEFAULT '0.00',
  mostrar_inventario tinyint(1) NOT NULL DEFAULT '0',
  esreceta tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (articulo),
  KEY fk_articulo_categoria_grupo1_idx (categoria_grupo),
  KEY fk_articulo_presentacion1_idx (presentacion),
  KEY fk_articulo_impuesto_especial1_idx (impuesto_especial),
  CONSTRAINT fk_articulo_categoria_grupo1 FOREIGN KEY (categoria_grupo) REFERENCES RT_DATABASE_NAME.categoria_grupo (categoria_grupo),
  CONSTRAINT fk_articulo_impuesto_especial1 FOREIGN KEY (impuesto_especial) REFERENCES RT_DATABASE_NAME.impuesto_especial (impuesto_especial) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_presentacion1 FOREIGN KEY (presentacion) REFERENCES RT_DATABASE_NAME.presentacion (presentacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table articulo_detalle
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.articulo_detalle;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.articulo_detalle (
  articulo_detalle int(11) NOT NULL AUTO_INCREMENT,
  receta int(11) NOT NULL,
  racionable tinyint(1) NOT NULL DEFAULT '0',
  articulo int(11) NOT NULL,
  cantidad decimal(10,2) NOT NULL DEFAULT '0.00',
  medida int(11) NOT NULL,
  anulado tinyint(1) NOT NULL DEFAULT '0',
  precio_extra tinyint(1) NOT NULL DEFAULT '0',
  precio decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (articulo_detalle),
  KEY fk_articulo_detalle_articulo1_idx (receta),
  KEY fk_articulo_detalle_articulo2_idx (articulo),
  KEY fk_articulo_detalle_medida1_idx (medida),
  CONSTRAINT fk_articulo_detalle_articulo1 FOREIGN KEY (receta) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_detalle_articulo2 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_detalle_medida1 FOREIGN KEY (medida) REFERENCES RT_DATABASE_NAME.medida (medida) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table bitacora
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.bitacora;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.bitacora (
  bitacora int(11) NOT NULL AUTO_INCREMENT,
  accion int(11) NOT NULL,
  usuario int(11) NOT NULL,
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tabla varchar(45) DEFAULT NULL,
  registro int(11) DEFAULT NULL,
  comentario text,
  PRIMARY KEY (bitacora),
  KEY fk_bitacora_accion1_idx (accion),
  KEY fk_bitacora_usuario1_idx (usuario),
  CONSTRAINT fk_bitacora_accion1 FOREIGN KEY (accion) REFERENCES RT_DATABASE_NAME.accion (accion) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_bitacora_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table bodega
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.bodega;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.bodega (
  bodega int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(75) NOT NULL,
  sede int(11) NOT NULL,
  merma tinyint(1) NOT NULL,
  PRIMARY KEY (bodega),
  KEY fk_bodega_sede1_idx (sede),
  CONSTRAINT fk_bodega_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table bodega_articulo_costo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.bodega_articulo_costo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.bodega_articulo_costo (
  bodega_articulo_costo int(11) NOT NULL AUTO_INCREMENT,
  bodega int(11) NOT NULL,
  articulo int(11) NOT NULL,
  costo_ultima_compra decimal(10,5) NOT NULL DEFAULT '0.00000',
  costo_promedio decimal(10,5) NOT NULL DEFAULT '0.00000',
  PRIMARY KEY (bodega_articulo_costo),
  UNIQUE KEY bodega_articulo (bodega,articulo),
  KEY fk_bodega_articulo_costo_articulo1_idx (articulo),
  KEY fk_bodega_articulo_costo_bodega1_idx (bodega),
  CONSTRAINT fk_bodega_articulo_costo_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_bodega_articulo_costo_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table caja_corte
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.caja_corte;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.caja_corte (
  caja_corte int(11) NOT NULL AUTO_INCREMENT,
  creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario int(11) NOT NULL,
  turno int(11) NOT NULL,
  confirmado datetime DEFAULT NULL,
  anulado tinyint(1) NOT NULL DEFAULT '0',
  caja_corte_tipo int(11) NOT NULL,
  PRIMARY KEY (caja_corte),
  KEY fk_caja_corte_usuario1_idx (usuario),
  KEY fk_caja_corte_turno1_idx (turno),
  KEY fk_caja_corte_caja_corte_tipo1_idx (caja_corte_tipo),
  CONSTRAINT fk_caja_corte_caja_corte_tipo1 FOREIGN KEY (caja_corte_tipo) REFERENCES RT_DATABASE_NAME.caja_corte_tipo (caja_corte_tipo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_caja_corte_turno1 FOREIGN KEY (turno) REFERENCES RT_DATABASE_NAME.turno (turno) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_caja_corte_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table caja_corte_detalle
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.caja_corte_detalle;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.caja_corte_detalle (
  caja_corte_detalle int(11) NOT NULL AUTO_INCREMENT,
  caja_corte int(11) NOT NULL,
  cantidad int(11) NOT NULL DEFAULT '0',
  total decimal(10,2) NOT NULL DEFAULT '0.00',
  anulado tinyint(1) NOT NULL DEFAULT '0',
  caja_corte_nominacion int(11) NOT NULL,
  PRIMARY KEY (caja_corte_detalle),
  KEY fk_caja_corte_detalle_caja_corte1_idx (caja_corte),
  KEY fk_caja_corte_detalle_caja_corte_nominacion1_idx (caja_corte_nominacion),
  CONSTRAINT fk_caja_corte_detalle_caja_corte1 FOREIGN KEY (caja_corte) REFERENCES RT_DATABASE_NAME.caja_corte (caja_corte) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_caja_corte_detalle_caja_corte_nominacion1 FOREIGN KEY (caja_corte_nominacion) REFERENCES RT_DATABASE_NAME.caja_corte_nominacion (caja_corte_nominacion) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table caja_corte_nominacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.caja_corte_nominacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.caja_corte_nominacion (
  caja_corte_nominacion int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(75) NOT NULL,
  valor decimal(10,2) NOT NULL DEFAULT '0.00',
  calcula tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (caja_corte_nominacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table caja_corte_tipo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.caja_corte_tipo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.caja_corte_tipo (
  caja_corte_tipo int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(75) NOT NULL,
  PRIMARY KEY (caja_corte_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table categoria
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.categoria;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.categoria (
  categoria int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(150) NOT NULL,
  sede int(11) NOT NULL,
  PRIMARY KEY (categoria),
  KEY fk_categoria_sede1_idx (sede),
  CONSTRAINT fk_categoria_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table categoria_grupo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.categoria_grupo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.categoria_grupo (
  categoria_grupo int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  categoria int(11) NOT NULL,
  categoria_grupo_grupo int(11) DEFAULT NULL,
  receta tinyint(1) NOT NULL DEFAULT '0',
  impresora int(11) DEFAULT NULL,
  descuento tinyint(1) NOT NULL DEFAULT '1',
  cuenta_contable varchar(10) DEFAULT NULL,
  bodega int(11) DEFAULT NULL,
  PRIMARY KEY (categoria_grupo),
  KEY fk_categoria_grupo_categoria1_idx (categoria),
  KEY fk_categoria_grupo_categoria_grupo1_idx (categoria_grupo_grupo),
  KEY fk_categoria_grupo_impresora1_idx (impresora),
  KEY fk_categoria_grupo_bodega1_idx (bodega),
  CONSTRAINT fk_categoria_grupo_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_categoria_grupo_categoria1 FOREIGN KEY (categoria) REFERENCES RT_DATABASE_NAME.categoria (categoria),
  CONSTRAINT fk_categoria_grupo_categoria_grupo1 FOREIGN KEY (categoria_grupo_grupo) REFERENCES RT_DATABASE_NAME.categoria_grupo (categoria_grupo),
  CONSTRAINT fk_categoria_grupo_impresora1 FOREIGN KEY (impresora) REFERENCES RT_DATABASE_NAME.impresora (impresora) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table certificador_configuracion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.certificador_configuracion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.certificador_configuracion (
  certificador_configuracion int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(75) NOT NULL,
  vinculo_factura varchar(250) NOT NULL,
  vinculo_firma varchar(250) DEFAULT NULL,
  metodo_factura varchar(50) DEFAULT NULL,
  vinculo_anulacion varchar(250) DEFAULT NULL,
  metodo_anulacion varchar(50) DEFAULT NULL,
  vinculo_grafo varchar(250) DEFAULT NULL,
  metodo_grafo varchar(50) DEFAULT NULL,
  PRIMARY KEY (certificador_configuracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table certificador_fel
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.certificador_fel;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.certificador_fel (
  certificador_fel int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(75) NOT NULL,
  vinculo_factura varchar(250) DEFAULT NULL,
  vinculo_firma varchar(250) DEFAULT NULL,
  llave varchar(75) DEFAULT NULL,
  usuario varchar(25) DEFAULT NULL,
  metodo_factura varchar(50) DEFAULT NULL,
  vinculo_anulacion varchar(250) DEFAULT NULL,
  metodo_anulacion varchar(50) DEFAULT NULL,
  firma_llave varchar(75) DEFAULT NULL,
  firma_codigo varchar(25) DEFAULT NULL,
  firma_alias varchar(25) DEFAULT NULL,
  nit varchar(25) DEFAULT NULL,
  correo_emisor varchar(75) DEFAULT NULL,
  frase_retencion_isr int(11) DEFAULT NULL,
  frase_retencion_iva int(11) DEFAULT NULL,
  vinculo_grafo varchar(250) DEFAULT NULL,
  metodo_grafo varchar(50) DEFAULT NULL,
  certificador_configuracion int(11) NOT NULL,
  PRIMARY KEY (certificador_fel),
  KEY fk_certificador_fel_certificador_configuracion1_idx (certificador_configuracion),
  CONSTRAINT fk_certificador_fel_certificador_configuracion1 FOREIGN KEY (certificador_configuracion) REFERENCES RT_DATABASE_NAME.certificador_configuracion (certificador_configuracion) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table cliente
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.cliente;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.cliente (
  cliente int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  direccion varchar(150) DEFAULT NULL,
  nit varchar(25) DEFAULT NULL,
  telefono varchar(25) DEFAULT NULL,
  correo varchar(50) DEFAULT NULL,
  codigo_postal varchar(25) DEFAULT NULL,
  municipio varchar(100) DEFAULT NULL,
  departamento varchar(100) DEFAULT NULL,
  pais_iso_dos char(2) DEFAULT NULL,
  observaciones varchar(500) DEFAULT NULL,
  PRIMARY KEY (cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table cliente_corporacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.cliente_corporacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.cliente_corporacion (
  cliente_corporacion int(11) NOT NULL AUTO_INCREMENT,
  cliente int(11) NOT NULL,
  llave varchar(100) NOT NULL COMMENT 'Este campo debera ser un UUID que se insetara automaticamente en restouch.coporacion',
  PRIMARY KEY (cliente_corporacion),
  KEY fk_cliente_corporacion_cliente1_idx (cliente),
  CONSTRAINT fk_cliente_corporacion_cliente1 FOREIGN KEY (cliente) REFERENCES RT_DATABASE_NAME.cliente (cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table cliente_corporacion_modulo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.cliente_corporacion_modulo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.cliente_corporacion_modulo (
  cliente_corporacion int(11) NOT NULL,
  modulo int(11) NOT NULL,
  PRIMARY KEY (cliente_corporacion,modulo),
  KEY fk_cliente_corporacion_has_modulo_modulo1_idx (modulo),
  KEY fk_cliente_corporacion_has_modulo_cliente_corporacion1_idx (cliente_corporacion),
  CONSTRAINT fk_cliente_corporacion_has_modulo_cliente_corporacion1 FOREIGN KEY (cliente_corporacion) REFERENCES RT_DATABASE_NAME.cliente_corporacion (cliente_corporacion),
  CONSTRAINT fk_cliente_corporacion_has_modulo_modulo1 FOREIGN KEY (modulo) REFERENCES RT_DATABASE_NAME.modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table comanda
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.comanda;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.comanda (
  comanda int(11) NOT NULL AUTO_INCREMENT,
  usuario int(11) NOT NULL,
  sede int(11) NOT NULL,
  estatus int(11) NOT NULL DEFAULT '1',
  turno int(11) NOT NULL,
  domicilio tinyint(1) NOT NULL DEFAULT '0',
  comanda_origen int(11) DEFAULT NULL,
  comanda_origen_datos text,
  mesero int(11) DEFAULT NULL,
  comandaenuso tinyint(1) NOT NULL DEFAULT '0',
  fhcreacion datetime DEFAULT CURRENT_TIMESTAMP,
  numero_pedido int(11) DEFAULT '0',
  notas_generales varchar(1000) DEFAULT NULL,
  PRIMARY KEY (comanda),
  KEY fk_comanda_usuario1_idx (usuario),
  KEY fk_comanda_sede1_idx (sede),
  KEY fk_comanda_turno1_idx (turno),
  KEY fk_comanda_comanda_origen1_idx (comanda_origen),
  KEY fk_comanda_usuario2_idx (mesero),
  CONSTRAINT fk_comanda_comanda_origen1 FOREIGN KEY (comanda_origen) REFERENCES RT_DATABASE_NAME.comanda_origen (comanda_origen) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_comanda_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede),
  CONSTRAINT fk_comanda_turno1 FOREIGN KEY (turno) REFERENCES RT_DATABASE_NAME.turno (turno) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_comanda_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario),
  CONSTRAINT fk_comanda_usuario2 FOREIGN KEY (mesero) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table comanda_has_mesa
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.comanda_has_mesa;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.comanda_has_mesa (
  comanda int(11) NOT NULL,
  mesa int(11) NOT NULL,
  PRIMARY KEY (comanda,mesa),
  KEY fk_comanda_has_mesa_mesa1_idx (mesa),
  KEY fk_comanda_has_mesa_comanda1_idx (comanda),
  CONSTRAINT fk_comanda_has_mesa_comanda1 FOREIGN KEY (comanda) REFERENCES RT_DATABASE_NAME.comanda (comanda),
  CONSTRAINT fk_comanda_has_mesa_mesa1 FOREIGN KEY (mesa) REFERENCES RT_DATABASE_NAME.mesa (mesa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table comanda_origen
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.comanda_origen;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.comanda_origen (
  comanda_origen int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  PRIMARY KEY (comanda_origen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table configuracion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.configuracion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.configuracion (
  configuracion int(11) NOT NULL AUTO_INCREMENT,
  campo varchar(50) NOT NULL,
  tipo int(11) NOT NULL DEFAULT '1',
  valor varchar(150) NOT NULL,
  fhcreacion datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (configuracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table corporacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.corporacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.corporacion (
  corporacion int(11) NOT NULL AUTO_INCREMENT,
  admin_llave varchar(100) NOT NULL,
  nombre varchar(100) NOT NULL,
  PRIMARY KEY (corporacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table cuenta
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.cuenta;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.cuenta (
  cuenta int(11) NOT NULL AUTO_INCREMENT,
  comanda int(11) NOT NULL,
  nombre varchar(50) DEFAULT NULL,
  numero int(11) NOT NULL DEFAULT '0',
  propina_monto decimal(10,2) NOT NULL DEFAULT '0.00',
  propina_porcentaje decimal(10,2) NOT NULL DEFAULT '0.00',
  cerrada tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (cuenta),
  KEY fk_cuenta_comanda1_idx (comanda),
  CONSTRAINT fk_cuenta_comanda1 FOREIGN KEY (comanda) REFERENCES RT_DATABASE_NAME.comanda (comanda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table cuenta_forma_pago
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.cuenta_forma_pago;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.cuenta_forma_pago (
  cuenta_forma_pago int(11) NOT NULL AUTO_INCREMENT,
  cuenta int(11) NOT NULL,
  forma_pago int(11) NOT NULL,
  monto decimal(10,2) NOT NULL DEFAULT '0.00',
  documento varchar(45) DEFAULT NULL,
  observaciones varchar(150) DEFAULT NULL,
  propina decimal(10,2) NOT NULL DEFAULT '0.00',
  comision_monto decimal(10,2) NOT NULL DEFAULT '0.00',
  retencion_monto decimal(10,2) NOT NULL DEFAULT '0.00',
  tarjeta_respuesta text,
  PRIMARY KEY (cuenta_forma_pago),
  KEY fk_cuenta_forma_pago_cuenta1_idx (cuenta),
  KEY fk_cuenta_forma_pago_forma_pago1_idx (forma_pago),
  CONSTRAINT fk_cuenta_forma_pago_cuenta1 FOREIGN KEY (cuenta) REFERENCES RT_DATABASE_NAME.cuenta (cuenta) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_cuenta_forma_pago_forma_pago1 FOREIGN KEY (forma_pago) REFERENCES RT_DATABASE_NAME.forma_pago (forma_pago) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table detalle_comanda
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.detalle_comanda;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.detalle_comanda (
  detalle_comanda int(11) NOT NULL AUTO_INCREMENT,
  comanda int(11) NOT NULL,
  articulo int(11) NOT NULL,
  cantidad decimal(10,2) NOT NULL DEFAULT '0.00',
  precio decimal(10,2) NOT NULL DEFAULT '0.00',
  impreso tinyint(1) NOT NULL DEFAULT '0',
  total decimal(10,2) NOT NULL DEFAULT '0.00',
  notas varchar(1000) DEFAULT NULL,
  cocinado tinyint(1) NOT NULL DEFAULT '0',
  presentacion int(11) DEFAULT NULL,
  numero int(11) DEFAULT NULL,
  fecha datetime DEFAULT NULL,
  tiempo_preparacion time DEFAULT NULL,
  fecha_impresion datetime DEFAULT NULL,
  fecha_proceso datetime DEFAULT NULL,
  detalle_comanda_id int(11) DEFAULT NULL,
  bodega int(11) DEFAULT NULL,
  PRIMARY KEY (detalle_comanda),
  KEY fk_detalle_comanda_comanda1_idx (comanda),
  KEY fk_detalle_comanda_articulo1_idx (articulo),
  KEY fk_detalle_comanda_bodega1_idx (bodega),
  CONSTRAINT fk_detalle_comanda_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo),
  CONSTRAINT fk_detalle_comanda_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_detalle_comanda_comanda1 FOREIGN KEY (comanda) REFERENCES RT_DATABASE_NAME.comanda (comanda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table detalle_cuenta
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.detalle_cuenta;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.detalle_cuenta (
  detalle_cuenta int(11) NOT NULL AUTO_INCREMENT,
  cuenta_cuenta int(11) NOT NULL,
  detalle_comanda int(11) NOT NULL,
  PRIMARY KEY (detalle_cuenta),
  KEY fk_detalle_cuenta_cuenta1_idx (cuenta_cuenta),
  KEY fk_detalle_cuenta_detalle_comanda1_idx (detalle_comanda),
  CONSTRAINT fk_detalle_cuenta_cuenta1 FOREIGN KEY (cuenta_cuenta) REFERENCES RT_DATABASE_NAME.cuenta (cuenta),
  CONSTRAINT fk_detalle_cuenta_detalle_comanda1 FOREIGN KEY (detalle_comanda) REFERENCES RT_DATABASE_NAME.detalle_comanda (detalle_comanda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table detalle_factura
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.detalle_factura;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.detalle_factura (
  detalle_factura int(11) NOT NULL AUTO_INCREMENT,
  factura int(11) NOT NULL,
  articulo int(11) NOT NULL,
  cantidad decimal(10,2) NOT NULL DEFAULT '0.00',
  precio_unitario decimal(10,2) NOT NULL DEFAULT '0.00',
  total decimal(10,2) NOT NULL DEFAULT '0.00',
  monto_base decimal(10,2) NOT NULL DEFAULT '0.00',
  monto_iva decimal(10,2) NOT NULL DEFAULT '0.00',
  bien_servicio char(1) NOT NULL,
  descuento decimal(10,2) NOT NULL DEFAULT '0.00',
  presentacion int(11) DEFAULT NULL,
  impuesto_especial int(11) DEFAULT NULL,
  porcentaje_impuesto_especial decimal(10,2) NOT NULL DEFAULT '0.00',
  valor_impuesto_especial decimal(10,2) NOT NULL DEFAULT '0.00',
  detalle_factura_id int(11) DEFAULT NULL,
  PRIMARY KEY (detalle_factura),
  KEY fk_detalle_factura_factura1_idx (factura),
  KEY fk_detalle_factura_articulo1_idx (articulo),
  KEY fk_detalle_factura_impuesto_especial1_idx (impuesto_especial),
  KEY fk_detalle_factura_detalle_factura1_idx (detalle_factura_id),
  CONSTRAINT fk_detalle_factura_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_detalle_factura_detalle_factura1 FOREIGN KEY (detalle_factura_id) REFERENCES RT_DATABASE_NAME.detalle_factura (detalle_factura) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_detalle_factura_factura1 FOREIGN KEY (factura) REFERENCES RT_DATABASE_NAME.factura (factura),
  CONSTRAINT fk_detalle_factura_impuesto_especial1 FOREIGN KEY (impuesto_especial) REFERENCES RT_DATABASE_NAME.impuesto_especial (impuesto_especial) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table detalle_factura_detalle_cuenta
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.detalle_factura_detalle_cuenta;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.detalle_factura_detalle_cuenta (
  detalle_factura_detalle_cuenta int(11) NOT NULL AUTO_INCREMENT,
  detalle_factura int(11) NOT NULL,
  detalle_cuenta int(11) NOT NULL,
  PRIMARY KEY (detalle_factura_detalle_cuenta),
  KEY fk_detalle_factura_detalle_cuenta_detalle_factura1_idx (detalle_factura),
  KEY fk_detalle_factura_detalle_cuenta_detalle_cuenta1_idx (detalle_cuenta),
  CONSTRAINT fk_detalle_factura_detalle_cuenta_detalle_cuenta1 FOREIGN KEY (detalle_cuenta) REFERENCES RT_DATABASE_NAME.detalle_cuenta (detalle_cuenta),
  CONSTRAINT fk_detalle_factura_detalle_cuenta_detalle_factura1 FOREIGN KEY (detalle_factura) REFERENCES RT_DATABASE_NAME.detalle_factura (detalle_factura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table detalle_inventario_fisico
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.detalle_inventario_fisico;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.detalle_inventario_fisico (
  detalle_inventario_fisico int(11) NOT NULL AUTO_INCREMENT,
  inventario_fisico int(11) NOT NULL,
  articulo int(11) NOT NULL,
  precio decimal(10,2) NOT NULL DEFAULT '0.00',
  existencia_sistema decimal(10,2) NOT NULL,
  existencia_fisica decimal(10,2) NOT NULL DEFAULT '0.00',
  diferencia decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (detalle_inventario_fisico),
  KEY fk_detalle_inventario_fisico_inventario_fisico1_idx (inventario_fisico),
  KEY fk_detalle_inventario_fisico_articulo1_idx (articulo),
  CONSTRAINT fk_detalle_inventario_fisico_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_detalle_inventario_fisico_inventario_fisico1 FOREIGN KEY (inventario_fisico) REFERENCES RT_DATABASE_NAME.inventario_fisico (inventario_fisico) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table documento
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.documento;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.documento (
  documento int(11) NOT NULL AUTO_INCREMENT,
  ingreso int(11) NOT NULL,
  documento_tipo int(11) NOT NULL,
  serie varchar(50) NOT NULL,
  numero varchar(50) NOT NULL,
  fecha date NOT NULL,
  tipo_compra_venta int(11) NOT NULL,
  enviado tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (documento),
  KEY fk_documento_documento_tipo1_idx (documento_tipo),
  KEY fk_documento_ingreso1_idx (ingreso),
  KEY fk_documento_tipo_compra_venta1_idx (tipo_compra_venta),
  CONSTRAINT fk_documento_documento_tipo1 FOREIGN KEY (documento_tipo) REFERENCES RT_DATABASE_NAME.documento_tipo (documento_tipo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_documento_ingreso1 FOREIGN KEY (ingreso) REFERENCES RT_DATABASE_NAME.ingreso (ingreso) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_documento_tipo_compra_venta1 FOREIGN KEY (tipo_compra_venta) REFERENCES RT_DATABASE_NAME.tipo_compra_venta (tipo_compra_venta) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table documento_tipo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.documento_tipo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.documento_tipo (
  documento_tipo int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  codigo varchar(45) DEFAULT NULL,
  PRIMARY KEY (documento_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table egreso
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.egreso;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.egreso (
  egreso int(11) NOT NULL AUTO_INCREMENT,
  tipo_movimiento int(11) NOT NULL,
  bodega int(11) NOT NULL,
  fecha date NOT NULL,
  creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario int(11) NOT NULL,
  estatus_movimiento int(11) NOT NULL,
  traslado tinyint(1) NOT NULL DEFAULT '0',
  idcomandafox varchar(50) DEFAULT NULL,
  PRIMARY KEY (egreso),
  KEY fk_egreso_tipo_movimiento1_idx (tipo_movimiento),
  KEY fk_egreso_bodega1_idx (bodega),
  KEY fk_egreso_usuario1_idx (usuario),
  KEY fk_egreso_estatus_movimiento1_idx (estatus_movimiento),
  CONSTRAINT fk_egreso_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_egreso_estatus_movimiento1 FOREIGN KEY (estatus_movimiento) REFERENCES RT_DATABASE_NAME.estatus_movimiento (estatus_movimiento) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_egreso_tipo_movimiento1 FOREIGN KEY (tipo_movimiento) REFERENCES RT_DATABASE_NAME.tipo_movimiento (tipo_movimiento),
  CONSTRAINT fk_egreso_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table egreso_detalle
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.egreso_detalle;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.egreso_detalle (
  egreso_detalle int(11) NOT NULL AUTO_INCREMENT,
  egreso int(11) NOT NULL,
  cantidad decimal(10,2) NOT NULL DEFAULT '0.00',
  articulo int(11) NOT NULL,
  precio_unitario decimal(10,2) NOT NULL DEFAULT '0.00',
  precio_total decimal(10,2) NOT NULL DEFAULT '0.00',
  presentacion int(11) NOT NULL,
  PRIMARY KEY (egreso_detalle),
  KEY fk_egreso_detalle_egreso1_idx (egreso),
  KEY fk_egreso_detalle_articulo1_idx (articulo),
  KEY fk_egreso_detalle_presentacion1_idx (presentacion),
  CONSTRAINT fk_egreso_detalle_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_egreso_detalle_egreso1 FOREIGN KEY (egreso) REFERENCES RT_DATABASE_NAME.egreso (egreso),
  CONSTRAINT fk_egreso_detalle_presentacion1 FOREIGN KEY (presentacion) REFERENCES RT_DATABASE_NAME.presentacion (presentacion) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table empresa
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.empresa;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.empresa (
  empresa int(11) NOT NULL AUTO_INCREMENT,
  corporacion int(11) NOT NULL,
  nombre varchar(100) DEFAULT NULL,
  numero_acceso varchar(25) DEFAULT NULL,
  afiliacion_iva varchar(5) DEFAULT NULL,
  codigo_establecimiento varchar(25) DEFAULT NULL,
  correo_emisor varchar(50) DEFAULT NULL,
  nit varchar(25) DEFAULT NULL,
  nombre_comercial varchar(150) DEFAULT NULL,
  direccion varchar(150) DEFAULT NULL,
  codigo_postal varchar(25) DEFAULT NULL,
  municipio varchar(100) DEFAULT NULL,
  departamento varchar(100) DEFAULT NULL,
  pais_iso_dos char(2) DEFAULT NULL,
  agente_retenedor tinyint(1) NOT NULL DEFAULT '0',
  porcentaje_iva decimal(10,2) NOT NULL DEFAULT '0.00',
  visa_merchant_id varchar(25) DEFAULT NULL,
  visa_transaction_key varchar(150) DEFAULT NULL,
  codigo varchar(45) DEFAULT NULL,
  metodo_costeo int(11) NOT NULL DEFAULT '1',
  leyenda_isr varchar(255) DEFAULT NULL,
  PRIMARY KEY (empresa),
  KEY fk_empresa_corporacion_idx (corporacion),
  CONSTRAINT fk_empresa_corporacion FOREIGN KEY (corporacion) REFERENCES RT_DATABASE_NAME.corporacion (corporacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table entidad_facturacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.entidad_facturacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.entidad_facturacion (
  entidad_facturacion int(11) NOT NULL AUTO_INCREMENT,
  cliente_corporacion int(11) NOT NULL,
  PRIMARY KEY (entidad_facturacion),
  KEY fk_entidad_facturacion_cliente_corporacion1_idx (cliente_corporacion),
  CONSTRAINT fk_entidad_facturacion_cliente_corporacion1 FOREIGN KEY (cliente_corporacion) REFERENCES RT_DATABASE_NAME.cliente_corporacion (cliente_corporacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table estatus_movimiento
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.estatus_movimiento;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.estatus_movimiento (
  estatus_movimiento int(11) NOT NULL AUTO_INCREMENT COMMENT '1. Abierto\\\\n2. Confirmado\\\\n3. Anulado',
  descripcion varchar(75) DEFAULT NULL,
  PRIMARY KEY (estatus_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table factura
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.factura;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.factura (
  factura int(11) NOT NULL AUTO_INCREMENT,
  usuario int(11) NOT NULL,
  factura_serie int(11) NOT NULL,
  cliente int(11) NOT NULL,
  numero_factura varchar(25) DEFAULT NULL,
  serie_factura varchar(25) DEFAULT NULL,
  fecha_factura date DEFAULT NULL,
  fel_uuid varchar(150) DEFAULT NULL,
  fel_uuid_anulacion varchar(150) DEFAULT NULL,
  moneda int(11) NOT NULL,
  certificador_fel int(11) NOT NULL,
  exenta tinyint(1) NOT NULL DEFAULT '0',
  notas varchar(500) DEFAULT NULL,
  sede int(11) NOT NULL,
  correo_receptor varchar(250) DEFAULT NULL,
  razon_anulacion int(11) DEFAULT NULL,
  comentario_anulacion varchar(250) DEFAULT NULL,
  PRIMARY KEY (factura),
  KEY fk_factura_usuario1_idx (usuario),
  KEY fk_factura_factura_serie1_idx (factura_serie),
  KEY fk_factura_cliente1_idx (cliente),
  KEY fk_factura_moneda1_idx (moneda),
  KEY fk_factura_certificador_fel1_idx (certificador_fel),
  KEY fk_factura_sede1_idx (sede),
  KEY fk_factura_razon_anulacion1_idx (razon_anulacion),
  CONSTRAINT fk_factura_certificador_fel1 FOREIGN KEY (certificador_fel) REFERENCES RT_DATABASE_NAME.certificador_fel (certificador_fel) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_factura_cliente1 FOREIGN KEY (cliente) REFERENCES RT_DATABASE_NAME.cliente (cliente) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_factura_factura_serie1 FOREIGN KEY (factura_serie) REFERENCES RT_DATABASE_NAME.factura_serie (factura_serie),
  CONSTRAINT fk_factura_moneda1 FOREIGN KEY (moneda) REFERENCES RT_DATABASE_NAME.moneda (moneda) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_factura_razon_anulacion1 FOREIGN KEY (razon_anulacion) REFERENCES RT_DATABASE_NAME.razon_anulacion (razon_anulacion) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_factura_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_factura_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table factura_fel
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.factura_fel;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.factura_fel (
  factura_fel int(11) NOT NULL AUTO_INCREMENT,
  factura int(11) NOT NULL,
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resultado text NOT NULL,
  usuario int(11) NOT NULL,
  PRIMARY KEY (factura_fel),
  KEY fk_factura_fel_factura1_idx (factura),
  KEY fk_factura_fel_usuario1_idx (usuario),
  CONSTRAINT fk_factura_fel_factura1 FOREIGN KEY (factura) REFERENCES RT_DATABASE_NAME.factura (factura) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_factura_fel_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table factura_serie
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.factura_serie;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.factura_serie (
  factura_serie int(11) NOT NULL AUTO_INCREMENT,
  serie varchar(25) NOT NULL,
  correlativo int(11) NOT NULL,
  activo tinyint(1) NOT NULL DEFAULT '1',
  xmldte text,
  xmldte_anulacion text,
  tipo varchar(5) DEFAULT NULL,
  PRIMARY KEY (factura_serie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table forma_pago
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.forma_pago;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.forma_pago (
  forma_pago int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  activo tinyint(1) NOT NULL DEFAULT '1',
  descuento tinyint(1) NOT NULL DEFAULT '0',
  comision_porcentaje decimal(10,2) NOT NULL DEFAULT '0.00',
  retencion_porcentaje decimal(10,2) NOT NULL DEFAULT '0.00',
  pedirdocumento tinyint(1) NOT NULL DEFAULT '0',
  adjuntararchivo tinyint(1) NOT NULL DEFAULT '0',
  pedirautorizacion tinyint(1) NOT NULL DEFAULT '0',
  sinfactura tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (forma_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table impresora
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.impresora;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.impresora (
  impresora int(11) NOT NULL AUTO_INCREMENT,
  sede int(11) NOT NULL,
  nombre varchar(75) NOT NULL,
  direccion_ip varchar(40) DEFAULT NULL,
  ubicacion varchar(150) DEFAULT NULL,
  bluetooth tinyint(1) NOT NULL DEFAULT '0' COMMENT 'identifica si la impresora es bluetooth',
  bluetooth_mac_address varchar(40) DEFAULT NULL,
  modelo varchar(50) DEFAULT NULL,
  PRIMARY KEY (impresora),
  KEY fk_impresora_sede1_idx (sede),
  CONSTRAINT fk_impresora_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table impuesto_especial
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.impuesto_especial;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.impuesto_especial (
  impuesto_especial int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(50) NOT NULL,
  porcentaje decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (impuesto_especial)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table ingreso
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.ingreso;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.ingreso (
  ingreso int(11) NOT NULL AUTO_INCREMENT,
  tipo_movimiento int(11) NOT NULL,
  fecha date DEFAULT NULL,
  creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  bodega int(11) NOT NULL,
  usuario int(11) NOT NULL,
  bodega_origen int(11) DEFAULT NULL,
  comentario varchar(500) DEFAULT NULL,
  proveedor int(11) NOT NULL,
  estatus_movimiento int(11) NOT NULL,
  PRIMARY KEY (ingreso),
  KEY fk_ingreso_tipo_movimiento1_idx (tipo_movimiento),
  KEY fk_ingreso_bodega1_idx (bodega),
  KEY fk_ingreso_usuario1_idx (usuario),
  KEY fk_ingreso_bodega2_idx (bodega_origen),
  KEY fk_ingreso_proveedor1_idx (proveedor),
  KEY fk_ingreso_estatus_movimiento1_idx (estatus_movimiento),
  CONSTRAINT fk_ingreso_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_ingreso_bodega2 FOREIGN KEY (bodega_origen) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_ingreso_estatus_movimiento1 FOREIGN KEY (estatus_movimiento) REFERENCES RT_DATABASE_NAME.estatus_movimiento (estatus_movimiento) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_ingreso_proveedor1 FOREIGN KEY (proveedor) REFERENCES RT_DATABASE_NAME.proveedor (proveedor) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_ingreso_tipo_movimiento1 FOREIGN KEY (tipo_movimiento) REFERENCES RT_DATABASE_NAME.tipo_movimiento (tipo_movimiento),
  CONSTRAINT fk_ingreso_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table ingreso_detalle
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.ingreso_detalle;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.ingreso_detalle (
  ingreso_detalle int(11) NOT NULL AUTO_INCREMENT,
  ingreso int(11) NOT NULL,
  articulo int(11) NOT NULL,
  cantidad decimal(10,2) NOT NULL DEFAULT '0.00',
  precio_unitario decimal(10,2) NOT NULL DEFAULT '0.00',
  precio_total decimal(10,2) NOT NULL DEFAULT '0.00',
  presentacion int(11) NOT NULL,
  precio_costo_iva decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (ingreso_detalle),
  KEY fk_ingreso_detalle_ingreso1_idx (ingreso),
  KEY fk_ingreso_detalle_articulo1_idx (articulo),
  KEY fk_ingreso_detalle_presentacion1_idx (presentacion),
  CONSTRAINT fk_ingreso_detalle_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo),
  CONSTRAINT fk_ingreso_detalle_ingreso1 FOREIGN KEY (ingreso) REFERENCES RT_DATABASE_NAME.ingreso (ingreso),
  CONSTRAINT fk_ingreso_detalle_presentacion1 FOREIGN KEY (presentacion) REFERENCES RT_DATABASE_NAME.presentacion (presentacion) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table ingreso_has_orden_compra
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.ingreso_has_orden_compra;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.ingreso_has_orden_compra (
  ingreso int(11) NOT NULL,
  orden_compra int(11) NOT NULL,
  PRIMARY KEY (ingreso,orden_compra),
  KEY fk_ingreso_has_orden_compra_orden_compra1_idx (orden_compra),
  KEY fk_ingreso_has_orden_compra_ingreso1_idx (ingreso),
  CONSTRAINT fk_ingreso_has_orden_compra_ingreso1 FOREIGN KEY (ingreso) REFERENCES RT_DATABASE_NAME.ingreso (ingreso) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_ingreso_has_orden_compra_orden_compra1 FOREIGN KEY (orden_compra) REFERENCES RT_DATABASE_NAME.orden_compra (orden_compra) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table inventario_fisico
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.inventario_fisico;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.inventario_fisico (
  inventario_fisico int(11) NOT NULL AUTO_INCREMENT,
  sede int(11) NOT NULL,
  usuario int(11) NOT NULL,
  categoria_grupo int(11) DEFAULT NULL,
  bodega int(11) DEFAULT NULL,
  fhcreacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha datetime DEFAULT NULL,
  notas varchar(100) DEFAULT NULL,
  confirmado tinyint(1) NOT NULL DEFAULT '0',
  confirmado_fecha datetime DEFAULT NULL,
  PRIMARY KEY (inventario_fisico),
  KEY fk_inventario_fisico_usuario1_idx (usuario),
  KEY fk_inventario_fisico_categoria_grupo1_idx (categoria_grupo),
  KEY fk_inventario_fisico_sede1_idx (sede),
  KEY fk_inventario_fisico_bodega1_idx (bodega),
  CONSTRAINT fk_inventario_fisico_categoria_grupo1 FOREIGN KEY (categoria_grupo) REFERENCES RT_DATABASE_NAME.categoria_grupo (categoria_grupo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_inventario_fisico_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_inventario_fisico_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table jerarquia
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.jerarquia;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.jerarquia (
  jerarquia int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(75) NOT NULL,
  PRIMARY KEY (jerarquia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table medida
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.medida;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.medida (
  medida int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(75) DEFAULT NULL,
  PRIMARY KEY (medida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table mesa
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.mesa;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.mesa (
  mesa int(11) NOT NULL AUTO_INCREMENT,
  area int(11) NOT NULL,
  numero int(11) NOT NULL,
  posx decimal(14,4) NOT NULL DEFAULT '0.0000',
  posy decimal(14,4) NOT NULL DEFAULT '0.0000',
  tamanio decimal(14,4) DEFAULT '48.0000',
  estatus int(1) unsigned NOT NULL DEFAULT '1',
  ancho decimal(14,4) NOT NULL DEFAULT '0.0000',
  alto decimal(14,4) NOT NULL DEFAULT '0.0000',
  esmostrador tinyint(1) NOT NULL DEFAULT '0',
  vertical tinyint(1) NOT NULL DEFAULT '0',
  impresora int(11) NOT NULL DEFAULT '0',
  debaja tinyint(1) NOT NULL DEFAULT '0',
  etiqueta varchar(3) DEFAULT NULL,
  escallcenter tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (mesa),
  KEY fk_mesa_area1_idx (area),
  CONSTRAINT fk_mesa_area1 FOREIGN KEY (area) REFERENCES RT_DATABASE_NAME.area (area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table modulo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.modulo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.modulo (
  modulo int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  corporacion int(11) NOT NULL,
  PRIMARY KEY (modulo),
  KEY fk_modulo_corporacion1_idx (corporacion),
  CONSTRAINT fk_modulo_corporacion1 FOREIGN KEY (corporacion) REFERENCES RT_DATABASE_NAME.corporacion (corporacion) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table moneda
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.moneda;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.moneda (
  moneda int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(25) NOT NULL,
  codigo varchar(5) NOT NULL,
  simbolo char(1) NOT NULL,
  PRIMARY KEY (moneda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table notas
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.notas;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.notas (
  notas int(11) NOT NULL AUTO_INCREMENT,
  titulo varchar(25) NOT NULL,
  detalle varchar(500) NOT NULL,
  sede int(11) NOT NULL,
  PRIMARY KEY (notas),
  KEY fk_notas_sede1_idx (sede),
  CONSTRAINT fk_notas_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table orden_compra
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.orden_compra;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.orden_compra (
  orden_compra int(11) NOT NULL AUTO_INCREMENT,
  proveedor int(11) NOT NULL,
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario int(11) NOT NULL,
  notas varchar(1000) DEFAULT NULL,
  estatus_movimiento int(11) NOT NULL,
  PRIMARY KEY (orden_compra),
  KEY fk_orden_compra_proveedor1_idx (proveedor),
  KEY fk_orden_compra_usuario1_idx (usuario),
  KEY fk_orden_compra_estatus_movimiento1_idx (estatus_movimiento),
  CONSTRAINT fk_orden_compra_estatus_movimiento1 FOREIGN KEY (estatus_movimiento) REFERENCES RT_DATABASE_NAME.estatus_movimiento (estatus_movimiento) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_orden_compra_proveedor1 FOREIGN KEY (proveedor) REFERENCES RT_DATABASE_NAME.proveedor (proveedor) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_orden_compra_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table orden_compra_detalle
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.orden_compra_detalle;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.orden_compra_detalle (
  orden_compra_detalle int(11) NOT NULL AUTO_INCREMENT,
  orden_compra int(11) NOT NULL,
  articulo int(11) NOT NULL,
  cantidad int(11) NOT NULL DEFAULT '0',
  monto decimal(10,2) NOT NULL DEFAULT '0.00',
  total decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (orden_compra_detalle),
  KEY fk_orden_compra_detalle_orden_compra1_idx (orden_compra),
  KEY fk_orden_compra_detalle_articulo1_idx (articulo),
  CONSTRAINT fk_orden_compra_detalle_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo),
  CONSTRAINT fk_orden_compra_detalle_orden_compra1 FOREIGN KEY (orden_compra) REFERENCES RT_DATABASE_NAME.orden_compra (orden_compra)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table orden_facturacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.orden_facturacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.orden_facturacion (
  orden_facturacion int(11) NOT NULL AUTO_INCREMENT,
  entidad_facturacion int(11) NOT NULL,
  PRIMARY KEY (orden_facturacion),
  KEY fk_orden_facturacion_entidad_facturacion1_idx (entidad_facturacion),
  CONSTRAINT fk_orden_facturacion_entidad_facturacion1 FOREIGN KEY (entidad_facturacion) REFERENCES RT_DATABASE_NAME.entidad_facturacion (entidad_facturacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table presentacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.presentacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.presentacion (
  presentacion int(11) NOT NULL AUTO_INCREMENT,
  medida int(11) NOT NULL,
  descripcion varchar(75) NOT NULL,
  cantidad decimal(10,2) NOT NULL,
  PRIMARY KEY (presentacion),
  KEY fk_presentacion_medida1_idx (medida),
  CONSTRAINT fk_presentacion_medida1 FOREIGN KEY (medida) REFERENCES RT_DATABASE_NAME.medida (medida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table propina_distribucion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.propina_distribucion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.propina_distribucion (
  propina_distribucion int(11) NOT NULL AUTO_INCREMENT,
  usuario_tipo int(11) NOT NULL,
  porcentaje decimal(10,2) NOT NULL DEFAULT '0.00',
  anulado tinyint(1) NOT NULL DEFAULT '0',
  sede int(11) NOT NULL,
  grupal tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (propina_distribucion),
  KEY fk_propina_distribucion_usuario_tipo1_idx (usuario_tipo),
  KEY fk_propina_distribucion_sede1_idx (sede),
  CONSTRAINT fk_propina_distribucion_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_propina_distribucion_usuario_tipo1 FOREIGN KEY (usuario_tipo) REFERENCES RT_DATABASE_NAME.usuario_tipo (usuario_tipo) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table proveedor
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.proveedor;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.proveedor (
  proveedor int(11) NOT NULL AUTO_INCREMENT,
  razon_social varchar(150) NOT NULL,
  nit varchar(25) NOT NULL,
  corporacion int(11) NOT NULL,
  codigo varchar(45) DEFAULT NULL,
  cuenta_contable_gasto varchar(10) DEFAULT NULL,
  PRIMARY KEY (proveedor),
  KEY fk_proveedor_corporacion1_idx (corporacion),
  CONSTRAINT fk_proveedor_corporacion1 FOREIGN KEY (corporacion) REFERENCES RT_DATABASE_NAME.corporacion (corporacion) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table razon_anulacion
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.razon_anulacion;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.razon_anulacion (
  razon_anulacion int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(100) NOT NULL,
  anulado tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (razon_anulacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table sede
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.sede;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.sede (
  sede int(11) NOT NULL AUTO_INCREMENT,
  empresa int(11) NOT NULL,
  sede_padre int(11) DEFAULT NULL,
  nombre varchar(100) NOT NULL,
  certificador_fel int(11) DEFAULT NULL,
  fel_establecimiento int(11) DEFAULT NULL,
  direccion varchar(150) DEFAULT NULL,
  telefono varchar(25) DEFAULT NULL,
  correo varchar(75) DEFAULT NULL,
  codigo varchar(45) DEFAULT NULL,
  cuenta_contable varchar(10) DEFAULT NULL,
  PRIMARY KEY (sede),
  KEY fk_sede_empresa1_idx (empresa),
  KEY fk_sede_sede1_idx (sede_padre),
  KEY fk_sede_certificador_fel1_idx (certificador_fel),
  CONSTRAINT fk_sede_certificador_fel1 FOREIGN KEY (certificador_fel) REFERENCES RT_DATABASE_NAME.certificador_fel (certificador_fel) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_sede_empresa1 FOREIGN KEY (empresa) REFERENCES RT_DATABASE_NAME.empresa (empresa),
  CONSTRAINT fk_sede_sede1 FOREIGN KEY (sede_padre) REFERENCES RT_DATABASE_NAME.sede (sede)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table shopify
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.shopify;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.shopify (
  id int(11) NOT NULL AUTO_INCREMENT,
  product_id varchar(25) DEFAULT NULL,
  shopify_id varchar(25) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY Shopify_Id_ASC (shopify_id),
  KEY Prodcut_Id_ASC (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table tipo_compra_venta
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.tipo_compra_venta;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.tipo_compra_venta (
  tipo_compra_venta int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  abreviatura char(1) NOT NULL,
  codigo varchar(45) DEFAULT NULL,
  PRIMARY KEY (tipo_compra_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table tipo_movimiento
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.tipo_movimiento;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.tipo_movimiento (
  tipo_movimiento int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  ingreso tinyint(1) NOT NULL DEFAULT '0',
  egreso tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table traslado_detalle
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.traslado_detalle;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.traslado_detalle (
  egreso_detalle int(11) NOT NULL,
  ingreso_detalle int(11) NOT NULL,
  PRIMARY KEY (egreso_detalle,ingreso_detalle),
  KEY fk_egreso_detalle_has_ingreso_detalle_ingreso_detalle1_idx (ingreso_detalle),
  KEY fk_egreso_detalle_has_ingreso_detalle_egreso_detalle1_idx (egreso_detalle),
  CONSTRAINT fk_egreso_detalle_has_ingreso_detalle_egreso_detalle1 FOREIGN KEY (egreso_detalle) REFERENCES RT_DATABASE_NAME.egreso_detalle (egreso_detalle) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_egreso_detalle_has_ingreso_detalle_ingreso_detalle1 FOREIGN KEY (ingreso_detalle) REFERENCES RT_DATABASE_NAME.ingreso_detalle (ingreso_detalle) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table turno
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.turno;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.turno (
  turno int(11) NOT NULL AUTO_INCREMENT,
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  turno_tipo int(11) NOT NULL,
  inicio datetime NOT NULL,
  fin datetime DEFAULT NULL,
  sede int(11) NOT NULL,
  PRIMARY KEY (turno),
  KEY fk_turno_turno_tipo1_idx (turno_tipo),
  KEY fk_turno_sede1_idx (sede),
  CONSTRAINT fk_turno_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_turno_turno_tipo1 FOREIGN KEY (turno_tipo) REFERENCES RT_DATABASE_NAME.turno_tipo (turno_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table turno_has_usuario
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.turno_has_usuario;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.turno_has_usuario (
  turno int(11) NOT NULL,
  usuario int(11) NOT NULL,
  usuario_tipo int(11) NOT NULL,
  anulado tinyint(1) NOT NULL DEFAULT '0',
  id int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (id),
  KEY fk_turno_has_usuario_usuario1_idx (usuario),
  KEY fk_turno_has_usuario_turno1_idx (turno),
  KEY fk_turno_has_usuario_usuario_tipo1_idx (usuario_tipo),
  CONSTRAINT fk_turno_has_usuario_turno1 FOREIGN KEY (turno) REFERENCES RT_DATABASE_NAME.turno (turno),
  CONSTRAINT fk_turno_has_usuario_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario),
  CONSTRAINT fk_turno_has_usuario_usuario_tipo1 FOREIGN KEY (usuario_tipo) REFERENCES RT_DATABASE_NAME.usuario_tipo (usuario_tipo) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table turno_tipo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.turno_tipo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.turno_tipo (
  turno_tipo int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  activo tinyint(1) NOT NULL,
  PRIMARY KEY (turno_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table usuario
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.usuario;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.usuario (
  usuario int(11) NOT NULL AUTO_INCREMENT,
  sede int(11) NOT NULL,
  nombres varchar(255) NOT NULL,
  apellidos varchar(255) NOT NULL,
  usrname varchar(15) NOT NULL,
  contrasenia varchar(512) DEFAULT NULL,
  debaja tinyint(1) unsigned NOT NULL DEFAULT '0',
  esmesero tinyint(1) NOT NULL DEFAULT '0',
  pindesbloqueo varchar(32) DEFAULT NULL,
  usatecladovirtual tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (usuario),
  KEY fk_usuario_sede1_idx (sede),
  CONSTRAINT fk_usuario_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table usuario_sede
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.usuario_sede;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.usuario_sede (
  usuario_sede int(11) NOT NULL AUTO_INCREMENT,
  sede int(11) NOT NULL,
  usuario int(11) NOT NULL,
  anulado tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (usuario_sede),
  UNIQUE KEY UsuarioSedeAnulado (sede,usuario,anulado),
  KEY fk_usuario_sede_sede1_idx (sede),
  KEY fk_usuario_sede_usuario1_idx (usuario),
  CONSTRAINT fk_usuario_sede_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_usuario_sede_usuario1 FOREIGN KEY (usuario) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table usuario_tipo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.usuario_tipo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.usuario_tipo (
  usuario_tipo int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(75) NOT NULL,
  jerarquia int(11) NOT NULL,
  PRIMARY KEY (usuario_tipo),
  KEY fk_usuario_tipo_jerarquia1_idx (jerarquia),
  CONSTRAINT fk_usuario_tipo_jerarquia1 FOREIGN KEY (jerarquia) REFERENCES RT_DATABASE_NAME.jerarquia (jerarquia) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table usuario_tipo_categoria_grupo
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.usuario_tipo_categoria_grupo;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.usuario_tipo_categoria_grupo (
  usuario_tipo_categoria_grupo int(11) NOT NULL AUTO_INCREMENT,
  usuario_tipo int(11) NOT NULL,
  categoria_grupo int(11) NOT NULL,
  debaja tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (usuario_tipo_categoria_grupo),
  KEY fk_usario_tipo_categoria_grupo_usuario_tipo1_idx (usuario_tipo),
  KEY fk_usario_tipo_categoria_grupo_categoria_grupo1_idx (categoria_grupo),
  CONSTRAINT fk_usario_tipo_categoria_grupo_categoria_grupo1 FOREIGN KEY (categoria_grupo) REFERENCES RT_DATABASE_NAME.categoria_grupo (categoria_grupo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_usario_tipo_categoria_grupo_usuario_tipo1 FOREIGN KEY (usuario_tipo) REFERENCES RT_DATABASE_NAME.usuario_tipo (usuario_tipo) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table webhook
--

DROP TABLE IF EXISTS RT_DATABASE_NAME.webhook;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE RT_DATABASE_NAME.webhook (
  webhook int(11) NOT NULL AUTO_INCREMENT,
  evento varchar(45) NOT NULL,
  link varchar(100) NOT NULL,
  token varchar(45) DEFAULT NULL,
  tipo_llamada varchar(5) DEFAULT NULL COMMENT 'SOAP	\nJSON',
  metodo varchar(20) DEFAULT NULL,
  PRIMARY KEY (webhook)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO RT_DATABASE_NAME.jerarquia(descripcion) VALUES('Administrador'), ('Operador');
INSERT INTO RT_DATABASE_NAME.tipo_movimiento(descripcion, ingreso, egreso) VALUES('Ingreso', 1, 0);
INSERT INTO RT_DATABASE_NAME.tipo_movimiento(descripcion, ingreso, egreso) VALUES('Egreso', 0, 1);
INSERT INTO RT_DATABASE_NAME.estatus_movimiento(descripcion) VALUES('Abierto');
INSERT INTO RT_DATABASE_NAME.estatus_movimiento(descripcion) VALUES('Confirmado');
INSERT INTO RT_DATABASE_NAME.accion(descripcion) VALUES('Creación');
INSERT INTO RT_DATABASE_NAME.accion(descripcion) VALUES('Modificación');
INSERT INTO RT_DATABASE_NAME.moneda(nombre, codigo, simbolo) VALUES('Quetzal', 'GTQ', 'Q');
INSERT INTO RT_DATABASE_NAME.medida(medida, descripcion) VALUES(1, 'Unidad');
INSERT INTO RT_DATABASE_NAME.presentacion(presentacion, medida, descripcion, cantidad) VALUES(1, 1, 'Unidad', 1);
INSERT INTO RT_DATABASE_NAME.factura_serie(factura_serie, serie, correlativo, activo, xmldte, xmldte_anulacion, tipo) VALUES(1, 'FEL', 1, 1,'<dte:GTDocumento xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:cfc="http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0" xmlns:cno="http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0" xmlns:cex="http://www.sat.gob.gt/face2/ComplementoExportaciones/0.1.0" xmlns:cfe="http://www.sat.gob.gt/face2/ComplementoFacturaEspecial/0.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="0.1" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0"><dte:SAT ClaseDocumento="dte"><dte:DTE ID="DatosCertificados"><dte:DatosEmision ID="DatosEmision"><dte:DatosGenerales CodigoMoneda="GTQ"  FechaHoraEmision="2018-08-01T09:30:47Z" Tipo="FACT"></dte:DatosGenerales><dte:Emisor AfiliacionIVA="GEN" CodigoEstablecimiento="1" CorreoEmisor="" NITEmisor="800000001433" NombreComercial="DEMO" NombreEmisor="DEMO"><dte:DireccionEmisor></dte:DireccionEmisor></dte:Emisor><dte:Receptor CorreoReceptor="" IDReceptor="CF" NombreReceptor="a"><dte:DireccionReceptor></dte:DireccionReceptor></dte:Receptor><dte:Frases></dte:Frases><dte:Items></dte:Items><dte:Totales><dte:TotalImpuestos><dte:TotalImpuesto NombreCorto="IVA" TotalMontoImpuesto="0"></dte:TotalImpuesto></dte:TotalImpuestos><dte:GranTotal></dte:GranTotal></dte:Totales></dte:DatosEmision></dte:DTE></dte:SAT></dte:GTDocumento>','<dte:GTAnulacionDocumento xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:dte="http://www.sat.gob.gt/dte/fel/0.1.0" xmlns:n1="http://www.altova.com/samplexml/other-namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="0.1" xsi:schemaLocation="http://www.sat.gob.gt/dte/fel/0.1.0 C:UsersUserDesktopFELEsquemasGT_AnulacionDocumento-0.1.0.xsd"><dte:SAT><dte:AnulacionDTE ID="DatosCertificados"><dte:DatosGenerales FechaEmisionDocumentoAnular="" FechaHoraAnulacion="" ID="DatosAnulacion" IDReceptor="" MotivoAnulacion="" NITEmisor="" NumeroDocumentoAAnular=""></dte:DatosGenerales></dte:AnulacionDTE></dte:SAT></dte:GTAnulacionDocumento>', 'FACT');
ALTER TABLE RT_DATABASE_NAME.configuracion ADD COLUMN descripcion VARCHAR(500) NULL AFTER fhcreacion;
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_IMPRESORA_DEFECTO', 1, '0', 'Impresora por defecto.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_PANTALLA_TOMA_COMANDA', 1, '1', 'UI/UX para toma de comanda. 1 = Normal, 2 = Móvil.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_HABILITA_BLOQUEO_INACTIVIDAD', 3, '0', 'Habilitar/Deshabilitar bloqueo por inactividad.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_SEGUNDOS_INACTIVIDAD', 1, '60', 'Segundos de espera para entrar a inactividad.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_FACTURA_PROPINA', 3, '1', 'Habilitar/Deshabilitar la facturación de la propina.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_CONCEPTO_MAYOR_VENTA', 2, '', 'Concepto que se envía al sistema de contabilidad por la venta.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_CUENTA_CONTABLE_IVA_VENTA', 2, '', 'Cuenta contable del IVA para facturas de venta.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_INGRESO_NUMERO_PEDIDO', 3, '0', 'Habilita/Deshabilita solicitar el número de pedido para restaurantes.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_TOTAL_NUMEROS_PEDIDO', 1, '20', 'Cantidad de botones con número para pedidos.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_VENDE_NEGATIVO', 3, '1', 'Habilita/Deshabilita la venta de productos en negativo si usa WMS.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_MODO_COMANDA', 1, '1', 'Impresión de comanda (1), pantalla de cocina(2) o las dos(3).');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_COMANDA_SIN_FACTURA', 3, '0', 'Habilita/Deshabilita la creación de formas de pago sin factura.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES('RT_MODO_FACTURA', 1, '1', 'Imprime factura en ticketera (1) o solo muestra el PDF del certificador (2) en comanda en línea.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_MESERO_POR_DEFECTO', '1', '0', 'ID único del mesero por defecto.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_FIRMA_DTE_AUTOMATICA', 3, '0', 'Habilita/Deshabilita sacar firma automática para DTEs con Shopify.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_CAMPO_NIT', '2', '', 'Campo del que se hala el NIT para pedidos de Shopify.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_ORDER_ITEMS_FULLFILLED', '3', '1', 'Habilita/Deshabilita el campo del que se halan los artículos de Shopify.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_CUENTA_CONTABLE_PROPINA', '2', '', 'Cuenta contable para la propina en facturas de venta.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_CUENTA_CONTABLE_IVA_PROPINA', '2', '', 'Cuenta contable para el IVA de las propinas en facturas de venta.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_IMPRIME_PROPINA_SUGERIDA', '3', '1', 'Habilita/Deshabilita la impresión de propina sugerida.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_USA_CODIGO_BARRAS', '3', '0', 'Habilita/Deshabilita el uso de código de barras para POS.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_REPORTES_FECHAS_TURNOS', '3', '0', 'Habilita/Deshabilita el uso dela fecha de turnos para algunos reportes de POS.');
INSERT INTO RT_DATABASE_NAME.configuracion(campo, tipo, valor, descripcion) VALUES ('RT_ENVIA_COMO_BASE64', '3', '1', 'Habilita/Deshabilita el envío como BASE64 de los string para la app móvil.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_IMPRIME_RECETA_EN_COMANDA', '3', '1', 'Habilita/Deshabilita la impresión de la receta en la comanda.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_FACTURA_REDONDEA_MONTOS', '3', '1', 'Habilita/Deshabilita el redondeo de montos en el XML para el certificador.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_COMBOS_CICLICOS', '3', '1', 'Habilita/Deshabilita la solicitud de combos de forma cíclica.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_DETALLE_FACTURA_PERSONALIZADO', '2', 'Por consumo.', 'Texto por defecto para personalizar el detalle de una factura.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PORCENTAJE_MAXIMO_PROPINA', '1', '10', 'Porcentaje máximo para propina sugerida.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_AUTOIMPRIMIR_PEDIDO', '3', '0', 'Habilita/Deshabilita la impresión automática de pedidos en comanda en línea.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PORCENTAJE_PROPINA', '1', '10', 'Porcentaje para el cálculo automático de la propina sugerida.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PROPINA_AUTOMATICA', '3', '1', 'Habilita/Deshabilita el cálculo automático de la propina sugerida.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_AUTORIZA_CAMBIO_PROPINA', '3', '1', 'Habilita/Deshabilita si se debe solicitar permiso del gerente para cambiar el monto de la propina sugerida.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PROPINA_EN_CALLCENTER', '3', '0', 'Habilita/Deshabilita si se pude ingresar propina desde call center.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_AUDIO_NOTIFICACION', '2', 'notificacion.mp3', 'Nombre del archivo de audio de notificación de recepción de pedido en comanda en línea.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PEDIR_CANTIDAD_ARTICULO', '3', '0', 'Habilita/Deshabilita solicitar cantidad de artículos en POS.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PANTALLA_TOMA_COMBO', '1', '1', 'UI/UX para la pantalla de toma de combos. 1 = Normal, 2 = Mejorada.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_GK_SEDE_COBRA_PROPINA', '1', '0', 'ID único de la sede que cobra la propina en el modelo de Ghost Kitchen.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_GK_SEDE_COBRA_ENTREGA', '1', '0', 'ID único de la sede que cobra la entrega en el modelo de Ghost Kitchen.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_PERMITE_DETALLE_FACTURA_PERSONALIZADO', '3', '1', 'Habilita/Deshabilita si una corporación puede o no generar facturas con detalle personalizado.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_MAX_DIAS_ANTIGUEDAD_INVENTARIO_FISICO', '1', '1', 'Cantidad de días de antiguedad que permite generar inventario físico/cuadre diario.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_SHOPIFY_CHECK_FINANCIAL_STATUS', '3', '0', 'Habilita/Deshabilita el chequeo de una orden de Shopify para ver si fue pagada o no.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_ACTUALIZA_CORREO_CF', '3', '0', 'Habilita/Deshabilita actualización automática de correo del cliente cuando el NIT es CF.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_HORAS_VALIDEZ_TOKEN', '1', '12', 'Establece cantidad de horas de validez del token del usuario. 12 horas por defecto.');
INSERT INTO RT_DATABASE_NAME.configuracion (campo, tipo, valor, descripcion) VALUES ('RT_AUTO_FIRMA_DTE_COMANDA_LINEA', '3', '0', 'Habilita/Desahabilita la firma automática desde comanda en línea.');

INSERT INTO RT_DATABASE_NAME.cliente (nombre, direccion, nit) VALUES ('CONSUMIDOR FINAL', 'Ciudad', 'CF');

INSERT INTO RT_DATABASE_NAME.corporacion(admin_llave, nombre) VALUES('RT_CORPORACION_ADMIN_LLAVE', 'RT_CORPORACION_NOMBRE');
INSERT INTO RT_DATABASE_NAME.empresa(corporacion, nombre, porcentaje_iva) VALUES(1, 'RT_EMPRESA_NOMBRE', 0.12);
INSERT INTO RT_DATABASE_NAME.sede(empresa, nombre) VALUES(1, 'RT_SEDE_NOMBRE');
ALTER TABLE RT_DATABASE_NAME.bodega ADD COLUMN pordefecto TINYINT(1) NOT NULL DEFAULT 0 AFTER merma;
INSERT INTO RT_DATABASE_NAME.bodega(descripcion, sede, merma, pordefecto) VALUES('CENTRAL', 1, 0, 1);
INSERT INTO RT_DATABASE_NAME.usuario(sede, nombres, apellidos, usrname, contrasenia, debaja, esmesero, pindesbloqueo) VALUES (1, 'RT_USUARIO_NOMBRE', 'RT_USUARIO_APELLIDO', 'RT_USUARIO_USUARIO', '$2y$12$GJPzoFMq9NYc0J4mi.M4cOG0t3AjUi5tP48Hi5KahYcWVk2W1X1G2', 0, 0, NULL);
INSERT INTO RT_DATABASE_NAME.usuario_sede(sede, usuario, anulado) VALUES(1, 1, 0);

INSERT INTO RT_DATABASE_NAME.certificador_configuracion(nombre, vinculo_factura, vinculo_firma, metodo_factura, vinculo_anulacion, metodo_anulacion, vinculo_grafo, metodo_grafo) VALUES ('Infile, S.A.','https://certificador.feel.com.gt/fel/certificacion/v2/dte','https://certificador.feel.com.gt/fel/procesounificado/transaccion/v2/xml','enviarInfile','https://certificador.feel.com.gt/fel/procesounificado/transaccion/v2/xml','enviarInfile','https://report.feel.com.gt/ingfacereport/ingfacereport_documento?uuid=','pdfInfile');
INSERT INTO RT_DATABASE_NAME.certificador_configuracion(nombre, vinculo_factura, vinculo_firma, metodo_factura, vinculo_anulacion, metodo_anulacion, vinculo_grafo, metodo_grafo) VALUES ('Digifact Servicios, S.A.','https://felgtaws.digifact.com.gt/felapiv2/api/login/get_token','https://felgtaws.digifact.com.gt/felapiv2/api/FELRequest?TIPO=CERTIFICATE_DTE_XML_TOSIGN&FORMAT=XML&NIT=','enviarDigiFact','https://felgtaws.digifact.com.gt/felapiv2/api/FELRequest?TIPO=ANULAR_FEL_TOSIGN&FORMAT=XML&NIT=','enviarDigiFact','https://felgtaws.digifact.com.gt/felapiv2/api/FELRequest?TIPO=GET_DOCUMENT&FORMAT=PDF','pdfDigiFact');
INSERT INTO RT_DATABASE_NAME.certificador_configuracion(nombre, vinculo_factura, vinculo_firma, metodo_factura, vinculo_anulacion, metodo_anulacion, vinculo_grafo, metodo_grafo) VALUES ('COFIDI, S.A.','https://portal.cofidiguatemala.com/webservicefrontfeltest/factwsfront.asmx?WSDL','POST_DOCUMENT_SAT','enviarCofidi','VOID_DOCUMENT','enviarCofidi','GET_DOCUMENT','pdfCofidi');
INSERT INTO RT_DATABASE_NAME.certificador_configuracion(nombre, vinculo_factura, vinculo_firma, metodo_factura, vinculo_anulacion, metodo_anulacion, vinculo_grafo, metodo_grafo) VALUES ('CORPOSISTEMAS','https://app.corposistemasgt.com/webservicefront/factwsfront.asmx?WSDL','POST_DOCUMENT_SAT','enviarCorposistemas','VOID_DOCUMENT','enviarCorposistemas','GET_DOCUMENT','pdfCorposistemas');

INSERT INTO RT_DATABASE_NAME.modulo(descripcion, corporacion) VALUES('admin', 1);
INSERT INTO RT_DATABASE_NAME.modulo(descripcion, corporacion) VALUES('pos', 1);
INSERT INTO RT_DATABASE_NAME.modulo(modulo, descripcion, corporacion) VALUES(4, 'wms', 1);
INSERT INTO RT_DATABASE_NAME.modulo(modulo, descripcion, corporacion) VALUES(6, 'cc', 1);

INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 1, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 2, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 3, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 4, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 5, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 6, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 7, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 8, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 9, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 10, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 11, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 12, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 13, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 14, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 15, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 16, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 17, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 18, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 19, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 20, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 1, 21, 1);

INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 2, 1, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 2, 2, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 2, 3, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 2, 4, 1);

INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 3, 1, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(1, 1, 3, 2, 1);

INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 1, 1, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 1, 2, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 1, 3, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 1, 4, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 1, 6, 1);

INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 2, 1, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 2, 3, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 2, 4, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 2, 5, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 2, 6, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 2, 7, 1);

INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 3, 1, 1);
INSERT INTO RT_DATABASE_NAME.acceso (modulo, usuario, submodulo, opcion, activo) VALUES(2, 1, 3, 2, 1);

ALTER TABLE RT_DATABASE_NAME.inventario_fisico ADD CONSTRAINT fk_inventario_fisico_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.bodega_articulo_costo CHANGE COLUMN costo_ultima_compra costo_ultima_compra DECIMAL(10,5) NOT NULL DEFAULT 0.00000, CHANGE COLUMN costo_promedio costo_promedio DECIMAL(10,5) NOT NULL DEFAULT 0.00000;
ALTER TABLE RT_DATABASE_NAME.detalle_factura CHANGE COLUMN cantidad cantidad DECIMAL(10,2) NOT NULL DEFAULT '0.00' ;
ALTER TABLE RT_DATABASE_NAME.egreso ADD COLUMN ajuste TINYINT(1) NOT NULL DEFAULT 0 AFTER idcomandafox;
ALTER TABLE RT_DATABASE_NAME.ingreso ADD COLUMN ajuste TINYINT(1) NOT NULL DEFAULT 0 AFTER estatus_movimiento;
ALTER TABLE RT_DATABASE_NAME.area CHANGE COLUMN impresora_factura impresora_factura INT(11) NULL DEFAULT '0' ;
ALTER TABLE RT_DATABASE_NAME.detalle_factura ADD COLUMN bodega INT NULL AFTER detalle_factura_id, ADD INDEX fk_detalle_factura_bodega1_idx (bodega ASC);
ALTER TABLE RT_DATABASE_NAME.detalle_factura ADD CONSTRAINT fk_detalle_factura_bodega1 FOREIGN KEY (bodega) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.detalle_factura ADD COLUMN precio_unitario_ext DECIMAL(20,10) NOT NULL DEFAULT 0.0000000000 AFTER precio_unitario, ADD COLUMN total_ext DECIMAL(20,10) NULL DEFAULT 0.0000000000 AFTER total, ADD COLUMN monto_base_ext DECIMAL(20,10) NULL DEFAULT 0.0000000000 AFTER monto_base, ADD COLUMN monto_iva_ext DECIMAL(20,10) NULL DEFAULT 0.0000000000 AFTER monto_iva, ADD COLUMN descuento_ext DECIMAL(20,10) NULL DEFAULT 0.0000000000 AFTER descuento, ADD COLUMN valor_impuesto_especial_ext DECIMAL(20,10) NULL DEFAULT 0.0000000000 AFTER valor_impuesto_especial;


ALTER TABLE RT_DATABASE_NAME.caja_corte_tipo ADD COLUMN unico TINYINT(1) NOT NULL DEFAULT 0 AFTER descripcion, ADD COLUMN pedirautorizacion TINYINT(1) NOT NULL DEFAULT 0 AFTER unico, ADD COLUMN pedirdocumento TINYINT(1) NOT NULL DEFAULT 0 AFTER pedirautorizacion, ADD COLUMN conformaspago TINYINT(1) NOT NULL DEFAULT 0 AFTER pedirdocumento;
ALTER TABLE RT_DATABASE_NAME.caja_corte_tipo ADD COLUMN imprimecorte TINYINT(1) NOT NULL DEFAULT 0 AFTER conformaspago;
INSERT INTO RT_DATABASE_NAME.caja_corte_tipo (descripcion, unico, pedirautorizacion, pedirdocumento, conformaspago, imprimecorte) VALUES ('Saldo inicial', 1, 0, 0, 0, 0);
INSERT INTO RT_DATABASE_NAME.caja_corte_tipo (descripcion, unico, pedirautorizacion, pedirdocumento, conformaspago, imprimecorte) VALUES ('Retiro', 0, 1, 1, 0, 0);
INSERT INTO RT_DATABASE_NAME.caja_corte_tipo (descripcion, unico, pedirautorizacion, pedirdocumento, conformaspago, imprimecorte) VALUES ('Arqueo', 0, 0, 0, 1, 1);
INSERT INTO RT_DATABASE_NAME.caja_corte_tipo (descripcion, unico, pedirautorizacion, pedirdocumento, conformaspago, imprimecorte) VALUES ('Saldo final', 1, 0, 0, 1, 1);

ALTER TABLE RT_DATABASE_NAME.articulo ADD COLUMN cantidad_gravable DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER esreceta, ADD COLUMN precio_sugerido DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER cantidad_gravable;
ALTER TABLE RT_DATABASE_NAME.impuesto_especial ADD COLUMN descripcion_interna VARCHAR(150) NOT NULL AFTER porcentaje, ADD COLUMN codigo_sat VARCHAR(3) NULL AFTER descripcion_interna;
ALTER TABLE RT_DATABASE_NAME.detalle_factura ADD COLUMN cantidad_gravable DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER bodega, ADD COLUMN precio_sugerido DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER cantidad_gravable, ADD COLUMN precio_sugerido_ext DECIMAL(20,10) NOT NULL DEFAULT 0.0000000000 AFTER precio_sugerido;

ALTER TABLE RT_DATABASE_NAME.caja_corte_nominacion ADD COLUMN orden INT NOT NULL DEFAULT 0 AFTER calcula;
ALTER TABLE RT_DATABASE_NAME.caja_corte_nominacion ADD INDEX OrdenASC (orden ASC);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('0.01', 0.01, 13);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('0.05', 0.05, 12);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('0.10', 0.10, 11);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('0.25', 0.25, 10);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('0.50', 0.50, 9);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('1 (M)', 1.00, 8);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('1 (B)', 1.00, 7);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('5', 5.00, 6);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('10', 10.00, 5);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('20', 20.00, 4);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('50', 50.00, 3);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('100', 100.00, 2);
INSERT INTO RT_DATABASE_NAME.caja_corte_nominacion(nombre, valor, orden) VALUES('200', 200.00, 1);

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.estatus_orden_gk (
  estatus_orden_gk INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(100) NOT NULL,
  color VARCHAR(10) NULL,
  PRIMARY KEY (estatus_orden_gk))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.orden_gk (
  orden_gk INT NOT NULL AUTO_INCREMENT,
  corporacion INT NOT NULL,
  protocolo VARCHAR(10) NULL,
  host VARCHAR(75) NULL,
  ip VARCHAR(75) NULL,
  url_original VARCHAR(250) NULL,
  fhcreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  numero_orden VARCHAR(50) NOT NULL,
  estatus_orden_gk INT NOT NULL,
  raw_orden TEXT NOT NULL,
  PRIMARY KEY (orden_gk),
  INDEX fk_orden_gk_corporacion1_idx (corporacion ASC),
  INDEX fk_orden_gk_estatus_orden_gk1_idx (estatus_orden_gk ASC),
  CONSTRAINT fk_orden_gk_corporacion1
    FOREIGN KEY (corporacion)
    REFERENCES RT_DATABASE_NAME.corporacion (corporacion)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_orden_gk_estatus_orden_gk1
    FOREIGN KEY (estatus_orden_gk)
    REFERENCES RT_DATABASE_NAME.estatus_orden_gk (estatus_orden_gk)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.estatus_orden_gk_sede (
  estatus_orden_gk_sede INT NOT NULL AUTO_INCREMENT,
  orden_gk INT NOT NULL,
  sede INT NOT NULL,
  estatus_orden_gk INT NOT NULL,
  comentario VARCHAR(500) NULL,
  fhestatus TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (estatus_orden_gk_sede),
  INDEX fk_estatus_orden_gk_sede_orden_gk1_idx (orden_gk ASC),
  INDEX fk_estatus_orden_gk_sede_sede1_idx (sede ASC),
  INDEX fk_estatus_orden_gk_sede_estatus_orden_gk1_idx (estatus_orden_gk ASC),
  CONSTRAINT fk_estatus_orden_gk_sede_orden_gk1
    FOREIGN KEY (orden_gk)
    REFERENCES RT_DATABASE_NAME.orden_gk (orden_gk)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_estatus_orden_gk_sede_sede1
    FOREIGN KEY (sede)
    REFERENCES RT_DATABASE_NAME.sede (sede)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_estatus_orden_gk_sede_estatus_orden_gk1
    FOREIGN KEY (estatus_orden_gk)
    REFERENCES RT_DATABASE_NAME.estatus_orden_gk (estatus_orden_gk)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.configuracion_comanda_origen (
  configuracion_comanda_origen INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  PRIMARY KEY (configuracion_comanda_origen))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.detalle_configuracion_comanda_origen (
  detalle_configuracion_comanda_origen INT NOT NULL AUTO_INCREMENT,
  configuracion_comanda_origen INT NOT NULL,
  comanda_origen INT NOT NULL,
  ruta VARCHAR(50) NOT NULL,
  PRIMARY KEY (detalle_configuracion_comanda_origen),
  INDEX fk_det_config_comanda_origen_configuracion_comanda_origen1_idx (configuracion_comanda_origen ASC),
  INDEX fk_det_config_comanda_origen_comanda_origen1_idx (comanda_origen ASC),
  CONSTRAINT fk_det_config_comanda_origen_configuracion_comanda_origen1
    FOREIGN KEY (configuracion_comanda_origen)
    REFERENCES RT_DATABASE_NAME.configuracion_comanda_origen (configuracion_comanda_origen)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_det_config_comanda_origen_comanda_origen1
    FOREIGN KEY (comanda_origen)
    REFERENCES RT_DATABASE_NAME.comanda_origen (comanda_origen)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

ALTER TABLE RT_DATABASE_NAME.orden_gk 
ADD COLUMN comanda_origen INT NOT NULL AFTER url_original,
ADD INDEX fk_orden_gk_comanda_origen1_idx (comanda_origen ASC);
;
ALTER TABLE RT_DATABASE_NAME.orden_gk 
ADD CONSTRAINT fk_orden_gk_comanda_origen1
  FOREIGN KEY (comanda_origen)
  REFERENCES RT_DATABASE_NAME.comanda_origen (comanda_origen)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.vendor_tercero (
  vendor_tercero INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(75) NOT NULL,
  comanda_origen INT NOT NULL,
  PRIMARY KEY (vendor_tercero),
  INDEX fk_vendor_tercero_comanda_origen1_idx (comanda_origen ASC),
  CONSTRAINT fk_vendor_tercero_comanda_origen1
    FOREIGN KEY (comanda_origen)
    REFERENCES RT_DATABASE_NAME.comanda_origen (comanda_origen)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.sede_vendor_tercero (
  sede_vendor_tercero INT NOT NULL AUTO_INCREMENT,
  sede INT NOT NULL,
  vendor_tercero INT NOT NULL,
  PRIMARY KEY (sede_vendor_tercero),
  INDEX fk_sede_vendor_tercero_sede1_idx (sede ASC),
  INDEX fk_sede_vendor_tercero_vendor_tercero1_idx (vendor_tercero ASC),
  CONSTRAINT fk_sede_vendor_tercero_sede1
    FOREIGN KEY (sede)
    REFERENCES RT_DATABASE_NAME.sede (sede)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_sede_vendor_tercero_vendor_tercero1
    FOREIGN KEY (vendor_tercero)
    REFERENCES RT_DATABASE_NAME.vendor_tercero (vendor_tercero)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
;

ALTER TABLE RT_DATABASE_NAME.sede_vendor_tercero ADD UNIQUE INDEX Sede_Vendor_Tercero (sede ASC, vendor_tercero ASC);

ALTER TABLE RT_DATABASE_NAME.orden_gk ADD COLUMN orden_rt TEXT NULL AFTER raw_orden;

ALTER TABLE RT_DATABASE_NAME.detalle_configuracion_comanda_origen CHANGE COLUMN ruta ruta VARCHAR(1000) NOT NULL ;

ALTER TABLE RT_DATABASE_NAME.comanda 
ADD COLUMN orden_gk INT NULL AFTER notas_generales,
ADD INDEX fk_comanda_orden_gk1_idx (orden_gk ASC);
;
ALTER TABLE RT_DATABASE_NAME.comanda 
ADD CONSTRAINT fk_comanda_orden_gk1
  FOREIGN KEY (orden_gk)
  REFERENCES RT_DATABASE_NAME.orden_gk (orden_gk)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.articulo_vendor_tercero (
  articulo_vendor_tercero INT NOT NULL AUTO_INCREMENT,
  articulo INT NOT NULL,
  vendor_tercero INT NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  PRIMARY KEY (articulo_vendor_tercero),
  INDEX fk_articulo_vendor_tercero_articulo1_idx (articulo ASC),
  INDEX fk_articulo_vendor_tercero_vendor_tercero1_idx (vendor_tercero ASC),
  UNIQUE INDEX ArticuloVendorCodigo (articulo ASC, vendor_tercero ASC, codigo ASC),
  INDEX Codigo (codigo ASC),
  CONSTRAINT fk_articulo_vendor_tercero_articulo1
    FOREIGN KEY (articulo)
    REFERENCES RT_DATABASE_NAME.articulo (articulo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_vendor_tercero_vendor_tercero1
    FOREIGN KEY (vendor_tercero)
    REFERENCES RT_DATABASE_NAME.vendor_tercero (vendor_tercero)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.forma_pago_comanda_origen (
  forma_pago_comanda_origen INT NOT NULL AUTO_INCREMENT,
  forma_pago INT NULL,
  comanda_origen INT NOT NULL,
  codigo VARCHAR(500) NOT NULL,
  PRIMARY KEY (forma_pago_comanda_origen),
  INDEX fk_forma_pago_comanda_origen_forma_pago1_idx (forma_pago ASC),
  UNIQUE INDEX FormaPagoComandaOrigenCodigo (forma_pago ASC, comanda_origen ASC, codigo ASC),
  INDEX fk_forma_pago_comanda_origen_comanda_origen1_idx (comanda_origen ASC),
  CONSTRAINT fk_forma_pago_comanda_origen_forma_pago1
    FOREIGN KEY (forma_pago)
    REFERENCES RT_DATABASE_NAME.forma_pago (forma_pago)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_forma_pago_comanda_origen_comanda_origen1
    FOREIGN KEY (comanda_origen)
    REFERENCES RT_DATABASE_NAME.comanda_origen (comanda_origen)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
;

ALTER TABLE RT_DATABASE_NAME.estatus_orden_gk_sede ADD UNIQUE INDEX OrdenGKSedeEstatus (orden_gk ASC, sede ASC, estatus_orden_gk ASC);

ALTER TABLE RT_DATABASE_NAME.orden_gk ADD COLUMN encabezados VARCHAR(500) NULL AFTER url_original;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.tipo_endpoint (
  tipo_endpoint INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(75) NOT NULL,
  PRIMARY KEY (tipo_endpoint))
ENGINE = InnoDB
;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.comanda_origen_endpoint (
  comanda_origen_endpoint INT NOT NULL AUTO_INCREMENT,
  comanda_origen INT NOT NULL,
  tipo_endpoint INT NOT NULL,
  verbo VARCHAR(10) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  PRIMARY KEY (comanda_origen_endpoint),
  INDEX fk_comanda_origen_endpoint_comanda_origen1_idx (comanda_origen ASC),
  INDEX fk_comanda_origen_endpoint_tipo_endpoint1_idx (tipo_endpoint ASC),
  CONSTRAINT fk_comanda_origen_endpoint_comanda_origen1
    FOREIGN KEY (comanda_origen)
    REFERENCES RT_DATABASE_NAME.comanda_origen (comanda_origen)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_comanda_origen_endpoint_tipo_endpoint1
    FOREIGN KEY (tipo_endpoint)
    REFERENCES RT_DATABASE_NAME.tipo_endpoint (tipo_endpoint)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
;
ALTER TABLE RT_DATABASE_NAME.impresora ADD COLUMN pordefecto TINYINT(1) NOT NULL DEFAULT 0 AFTER modelo;

ALTER TABLE RT_DATABASE_NAME.egreso ADD COLUMN raw_egreso TEXT NULL AFTER ajuste;

ALTER TABLE RT_DATABASE_NAME.categoria 
ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER sede,
ADD COLUMN fechabaja DATE NULL AFTER debaja,
ADD COLUMN usuariobaja INT NULL AFTER fechabaja,
ADD INDEX fk_categoria_usuario1_idx (usuariobaja ASC);
;
ALTER TABLE RT_DATABASE_NAME.categoria 
ADD CONSTRAINT fk_categoria_usuario1
  FOREIGN KEY (usuariobaja)
  REFERENCES RT_DATABASE_NAME.usuario (usuario)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE RT_DATABASE_NAME.categoria_grupo 
ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER bodega,
ADD COLUMN fechabaja DATE NULL AFTER debaja,
ADD COLUMN usuariobaja INT NULL AFTER fechabaja,
ADD INDEX fk_categoria_grupo_usuario1_idx (usuariobaja ASC);
;
ALTER TABLE RT_DATABASE_NAME.categoria_grupo 
ADD CONSTRAINT fk_categoria_grupo_usuario1
  FOREIGN KEY (usuariobaja)
  REFERENCES RT_DATABASE_NAME.usuario (usuario)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE RT_DATABASE_NAME.articulo 
ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER esreceta,
ADD COLUMN fechabaja DATE NULL AFTER debaja,
ADD COLUMN usuariobaja INT NULL AFTER fechabaja,
ADD INDEX fk_articulo_usuario1_idx (usuariobaja ASC);
;
ALTER TABLE RT_DATABASE_NAME.articulo 
ADD CONSTRAINT fk_articulo_usuario1
  FOREIGN KEY (usuariobaja)
  REFERENCES RT_DATABASE_NAME.usuario (usuario)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE RT_DATABASE_NAME.forma_pago ADD COLUMN esefectivo TINYINT(1) NOT NULL DEFAULT 0 AFTER sinfactura;

DELETE FROM RT_DATABASE_NAME.acceso WHERE modulo = 2 AND submodulo = 1 AND opcion = 5;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.caja_corte_detalle_forma_pago (
  caja_corte_detalle_forma_pago INT NOT NULL AUTO_INCREMENT,
  caja_corte INT NOT NULL,
  forma_pago INT NOT NULL,
  total DECIMAL(10,2) NULL,
  PRIMARY KEY (caja_corte_detalle_forma_pago),
  INDEX caja_corte_detalle_forma_pago_caja_corte1_idx (caja_corte ASC),
  INDEX caja_corte_detalle_forma_pago_forma_pago1_idx (forma_pago ASC),
  CONSTRAINT caja_corte_detalle_forma_pago_caja_corte1
    FOREIGN KEY (caja_corte)
    REFERENCES RT_DATABASE_NAME.caja_corte (caja_corte)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT caja_corte_detalle_forma_pago_forma_pago1
    FOREIGN KEY (forma_pago)
    REFERENCES RT_DATABASE_NAME.forma_pago (forma_pago)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
;  

ALTER TABLE RT_DATABASE_NAME.caja_corte ADD COLUMN serie VARCHAR(75) NULL AFTER caja_corte_tipo, ADD COLUMN numero VARCHAR(75) NULL AFTER serie, ADD COLUMN fecha DATE NULL AFTER numero, ADD COLUMN total DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER fecha;

ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN razon_anulacion INT NULL AFTER orden_gk, ADD INDEX fk_comanda_razon_anulacion1_idx (razon_anulacion ASC);

ALTER TABLE RT_DATABASE_NAME.comanda 
ADD CONSTRAINT fk_comanda_razon_anulacion1
  FOREIGN KEY (razon_anulacion)
  REFERENCES RT_DATABASE_NAME.razon_anulacion (razon_anulacion)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE RT_DATABASE_NAME.articulo ADD COLUMN cobro_mas_caro TINYINT(1) NOT NULL DEFAULT 0 AFTER precio_sugerido;

UPDATE RT_DATABASE_NAME.articulo SET esreceta = 0 WHERE combo = 1;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.cliente_master (
  cliente_master INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(250) NOT NULL,
  correo VARCHAR(75) NULL,
  fecha_nacimiento DATE NULL,
  PRIMARY KEY (cliente_master))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.telefono (
  telefono INT NOT NULL AUTO_INCREMENT,
  numero VARCHAR(25) NOT NULL,
  PRIMARY KEY (telefono),
  UNIQUE INDEX Numero (numero ASC))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.tipo_direccion (
  tipo_direccion INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(50) NOT NULL,
  PRIMARY KEY (tipo_direccion))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.cliente_master_direccion (
  cliente_master_direccion INT NOT NULL AUTO_INCREMENT,
  cliente_master INT NOT NULL,
  tipo_direccion INT NOT NULL,
  direccion1 VARCHAR(250) NOT NULL,
  direccion2 VARCHAR(250) NULL,
  zona INT NULL,
  codigo_postal VARCHAR(25) NULL,
  municipio VARCHAR(75) NULL,
  departamento VARCHAR(75) NULL,
  pais VARCHAR(75) NULL,
  notas TEXT NULL,
  PRIMARY KEY (cliente_master_direccion),
  INDEX fk_direccion_tipo_direccion1_idx (tipo_direccion ASC),
  INDEX fk_direccion_cliente_master1_idx (cliente_master ASC),
  CONSTRAINT fk_direccion_tipo_direccion1
    FOREIGN KEY (tipo_direccion)
    REFERENCES RT_DATABASE_NAME.tipo_direccion (tipo_direccion)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_direccion_cliente_master1
    FOREIGN KEY (cliente_master)
    REFERENCES RT_DATABASE_NAME.cliente_master (cliente_master)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.cliente_master_cliente (
  cliente_master_cliente INT NOT NULL AUTO_INCREMENT,
  cliente_master INT NOT NULL,
  cliente INT NOT NULL,
  PRIMARY KEY (cliente_master_cliente),
  INDEX fk_cliente_master_cliente_cliente_master1_idx (cliente_master ASC),
  INDEX fk_cliente_master_cliente_cliente1_idx (cliente ASC),
  CONSTRAINT fk_cliente_master_cliente_cliente_master1
    FOREIGN KEY (cliente_master)
    REFERENCES RT_DATABASE_NAME.cliente_master (cliente_master)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_cliente_master_cliente_cliente1
    FOREIGN KEY (cliente)
    REFERENCES RT_DATABASE_NAME.cliente (cliente)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.cliente_master_nota (
  cliente_master_nota INT NOT NULL AUTO_INCREMENT,
  cliente_master INT NOT NULL,
  fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nota TEXT NOT NULL,
  PRIMARY KEY (cliente_master_nota),
  INDEX fk_cliente_master_nota_cliente_master1_idx (cliente_master ASC),
  CONSTRAINT fk_cliente_master_nota_cliente_master1
    FOREIGN KEY (cliente_master)
    REFERENCES RT_DATABASE_NAME.cliente_master (cliente_master)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS RT_DATABASE_NAME.cliente_master_telefono (
  cliente_master_telefono INT NOT NULL AUTO_INCREMENT,
  cliente_master INT NOT NULL,
  telefono INT NOT NULL,
  PRIMARY KEY (cliente_master_telefono),
  INDEX fk_cliente_master_telefono_cliente_master1_idx (cliente_master ASC),
  INDEX fk_cliente_master_telefono_telefono1_idx (telefono ASC),
  CONSTRAINT fk_cliente_master_telefono_cliente_master1
    FOREIGN KEY (cliente_master)
    REFERENCES RT_DATABASE_NAME.cliente_master (cliente_master)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_cliente_master_telefono_telefono1
    FOREIGN KEY (telefono)
    REFERENCES RT_DATABASE_NAME.telefono (telefono)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

ALTER TABLE RT_DATABASE_NAME.cliente_master_telefono ADD COLUMN desasociado TINYINT(1) NOT NULL DEFAULT 0 AFTER telefono;
ALTER TABLE RT_DATABASE_NAME.cliente_master_direccion ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER notas;
ALTER TABLE RT_DATABASE_NAME.detalle_comanda ADD COLUMN cantidad_inventario DECIMAL(10,2) NULL AFTER bodega;
ALTER TABLE RT_DATABASE_NAME.factura ADD COLUMN descripcion_unica TEXT NULL AFTER comentario_anulacion;
ALTER TABLE RT_DATABASE_NAME.factura ADD COLUMN enviar_descripcion_unica TINYINT(1) NOT NULL DEFAULT 0 AFTER comentario_anulacion;
INSERT INTO RT_DATABASE_NAME.forma_pago(descripcion, activo, descuento, comision_porcentaje, retencion_porcentaje, pedirdocumento, adjuntararchivo, pedirautorizacion, sinfactura, esefectivo) VALUES('Efectivo', 1, 0, 0.00, 0.00, 0, 0, 0, 0, 1);
INSERT INTO RT_DATABASE_NAME.comanda_origen(descripcion) VALUES('Shopify');
INSERT INTO RT_DATABASE_NAME.comanda_origen(descripcion) VALUES('API');
ALTER TABLE RT_DATABASE_NAME.bodega_articulo_costo ADD COLUMN existencia DECIMAL(20,2) NOT NULL DEFAULT 0.00 AFTER costo_promedio;
ALTER TABLE RT_DATABASE_NAME.detalle_comanda ADD INDEX fk_detalle_comanda_detalle_comanda1_idx (detalle_comanda_id ASC);
ALTER TABLE RT_DATABASE_NAME.detalle_comanda ADD CONSTRAINT fk_detalle_comanda_detalle_comanda1 FOREIGN KEY (detalle_comanda_id) REFERENCES RT_DATABASE_NAME.detalle_comanda (detalle_comanda) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.articulo ADD COLUMN esextra TINYINT(1) NOT NULL DEFAULT 0 AFTER cobro_mas_caro;
ALTER TABLE RT_DATABASE_NAME.articulo ADD COLUMN stock_minimo DECIMAL(10,2) NULL AFTER esextra, ADD COLUMN stock_maximo DECIMAL(10,2) NULL AFTER stock_minimo;
ALTER TABLE RT_DATABASE_NAME.cliente_master_nota ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER nota;
ALTER TABLE RT_DATABASE_NAME.caja_corte ADD COLUMN descripcion_documento VARCHAR(1000) NULL AFTER total;
ALTER TABLE RT_DATABASE_NAME.cliente_master_direccion ADD COLUMN sede INT NOT NULL AFTER notas, ADD INDEX fk_direccion_sede1_idx (sede ASC);
ALTER TABLE RT_DATABASE_NAME.cliente_master_direccion ADD CONSTRAINT fk_direccion_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN cliente_master INT NULL AFTER razon_anulacion, ADD INDEX fk_comanda_cliente_master1_idx (cliente_master ASC);
ALTER TABLE RT_DATABASE_NAME.comanda ADD CONSTRAINT fk_comanda_cliente_master1 FOREIGN KEY (cliente_master) REFERENCES RT_DATABASE_NAME.cliente_master (cliente_master) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.cliente_master_cliente ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER cliente;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN detalle_comanda_original TEXT NULL AFTER cliente_master;
CREATE TABLE RT_DATABASE_NAME.tiempo_entrega (
  tiempo_entrega int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(50) NOT NULL,
  orden int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (tiempo_entrega),
  KEY orden_idx (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN tiempo_entrega INT NULL AFTER detalle_comanda_original, ADD INDEX fk_comanda_tiempo_entrega1_idx (tiempo_entrega ASC);
ALTER TABLE RT_DATABASE_NAME.comanda ADD CONSTRAINT fk_comanda_tiempo_entrega1 FOREIGN KEY (tiempo_entrega) REFERENCES RT_DATABASE_NAME.tiempo_entrega (tiempo_entrega) ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE TABLE RT_DATABASE_NAME.estatus_callcenter (
  estatus_callcenter int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(35) NOT NULL,
  color varchar(10) NOT NULL,
  orden int(11) NOT NULL,
  esautomatico tinyint(1) NOT NULL DEFAULT '0',
  pedir_repartidor tinyint(1) NOT NULL DEFAULT '0',
  esultimo tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (estatus_callcenter),
  KEY Orden_idx (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden, esautomatico) VALUES('Pendiente', '#F3F781', 1, 1);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden, esautomatico) VALUES('Recibido en restaurante', '#F7D358', 2, 1);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden) VALUES('Confirmado por encargado', '#608E5E', 3);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden) VALUES('Cobro aprobado', '#A9F5F2', 4);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden) VALUES('Cobro rechazado', '#FF0000', 5);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden) VALUES('Producción', '#2EFE2E', 6);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden, pedir_repartidor) VALUES('En camino', '#0080FF', 7, 1);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden, esultimo) VALUES('Entregado', '#ACACAC', 8, 1);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter(descripcion, color, orden, esautomatico) VALUES('Error al recibir en restaurante', '#FF4242', 9, 1);
INSERT INTO RT_DATABASE_NAME.estatus_callcenter (descripcion, color, orden, esautomatico, esultimo) VALUES ('Cancelado', '#ACACAC', 10, 1, 1);

ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN estatus_callcenter INT NULL AFTER tiempo_entrega, ADD INDEX fk_comanda_estatus_callcenter1_idx (estatus_callcenter ASC);
ALTER TABLE RT_DATABASE_NAME.comanda ADD CONSTRAINT fk_comanda_estatus_callcenter1 FOREIGN KEY (estatus_callcenter) REFERENCES RT_DATABASE_NAME.estatus_callcenter (estatus_callcenter) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.area ADD COLUMN escallcenter TINYINT(1) NOT NULL DEFAULT 0 AFTER impresora_factura;
ALTER TABLE RT_DATABASE_NAME.comanda ADD INDEX fhcreacion_desc_idx (fhcreacion DESC);
CREATE TABLE RT_DATABASE_NAME.tipo_domicilio (
  tipo_domicilio int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(45) NOT NULL,
  PRIMARY KEY (tipo_domicilio),
  KEY Descripcion_idx (descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO RT_DATABASE_NAME.tipo_domicilio (descripcion) VALUES ('Domicilio');
INSERT INTO RT_DATABASE_NAME.tipo_domicilio (descripcion) VALUES ('Llevar');
INSERT INTO RT_DATABASE_NAME.tipo_domicilio (descripcion) VALUES ('Pasa a traer');  
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN tipo_domicilio INT NULL AFTER estatus_callcenter, ADD INDEX fk_comanda_tipo_domicilio1_idx (tipo_domicilio ASC);
ALTER TABLE RT_DATABASE_NAME.comanda ADD CONSTRAINT fk_comanda_tipo_domicilio1 FOREIGN KEY (tipo_domicilio) REFERENCES RT_DATABASE_NAME.tipo_domicilio (tipo_domicilio) ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE TABLE RT_DATABASE_NAME.repartidor (
  repartidor int(11) NOT NULL AUTO_INCREMENT,
  sede int(11) NOT NULL,
  nombre varchar(250) NOT NULL,
  debaja tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (repartidor),
  KEY Nombre_idx (nombre),
  KEY Debaja_idx (debaja),
  KEY fk_repartidor_sede1_idx (sede),
  CONSTRAINT fk_repartidor_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN repartidor INT NULL AFTER tipo_domicilio, ADD INDEX fk_comanda_repartidor1_idx (repartidor ASC);
ALTER TABLE RT_DATABASE_NAME.comanda ADD CONSTRAINT fk_comanda_repartidor1 FOREIGN KEY (repartidor) REFERENCES RT_DATABASE_NAME.repartidor (repartidor) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN fhtomapedido DATETIME NULL AFTER repartidor;
ALTER TABLE RT_DATABASE_NAME.usuario_tipo_categoria_grupo ADD COLUMN desde DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER debaja, ADD INDEX Desde_idx (desde ASC);
ALTER TABLE RT_DATABASE_NAME.forma_pago ADD COLUMN aumento_porcentaje DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER descuento;
ALTER TABLE RT_DATABASE_NAME.detalle_comanda ADD COLUMN aumento_porcentaje DECIMAL(10,2) NULL DEFAULT 0.00 AFTER total, ADD COLUMN aumento DECIMAL(10,2) NULL DEFAULT 0.00 AFTER aumento_porcentaje;
ALTER TABLE RT_DATABASE_NAME.cuenta_forma_pago ADD COLUMN vuelto_para DECIMAL(10,2) NULL DEFAULT 0.00 AFTER tarjeta_respuesta, ADD COLUMN vuelto DECIMAL(10,2) NULL DEFAULT 0.00 AFTER vuelto_para;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN comensales INT NULL DEFAULT 0 AFTER fhtomapedido;
CREATE TABLE RT_DATABASE_NAME.tipo_cliente (
  tipo_cliente int(11) NOT NULL AUTO_INCREMENT,
  descripcion varchar(150) NOT NULL,
  PRIMARY KEY (tipo_cliente),
  KEY DescripcionASC (descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE RT_DATABASE_NAME.cliente ADD COLUMN tipo_cliente INT NULL AFTER observaciones, ADD INDEX fk_cliente_tipo_cliente1_idx (tipo_cliente ASC);
ALTER TABLE RT_DATABASE_NAME.cliente ADD CONSTRAINT fk_cliente_tipo_cliente1 FOREIGN KEY (tipo_cliente) REFERENCES RT_DATABASE_NAME.tipo_cliente (tipo_cliente) ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE TABLE RT_DATABASE_NAME.articulo_tipo_cliente (
  articulo_tipo_cliente INT NOT NULL AUTO_INCREMENT,
  articulo INT NOT NULL,
  tipo_cliente INT NOT NULL,
  precio DECIMAL(10,2) NULL,
  PRIMARY KEY (articulo_tipo_cliente),
  INDEX fk_articulo_tipo_cliente_articulo1_idx (articulo ASC),
  INDEX fk_articulo_tipo_cliente_tipo_cliente1_idx (tipo_cliente ASC),
  CONSTRAINT fk_articulo_tipo_cliente_articulo1
    FOREIGN KEY (articulo)
    REFERENCES RT_DATABASE_NAME.articulo (articulo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_tipo_cliente_tipo_cliente1
    FOREIGN KEY (tipo_cliente)
    REFERENCES RT_DATABASE_NAME.tipo_cliente (tipo_cliente)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
  ALTER TABLE RT_DATABASE_NAME.sede ADD COLUMN alias VARCHAR(100) NULL AFTER cuenta_contable;  
  UPDATE RT_DATABASE_NAME.sede SET alias = TRIM(nombre);
  ALTER TABLE RT_DATABASE_NAME.cuenta_forma_pago CHANGE COLUMN documento documento VARCHAR(1000) NULL DEFAULT NULL;
  ALTER TABLE RT_DATABASE_NAME.orden_gk CHANGE COLUMN encabezados encabezados TEXT NULL DEFAULT NULL ;
  ALTER TABLE RT_DATABASE_NAME.inventario_fisico ADD COLUMN escuadrediario TINYINT(1) NULL DEFAULT 0 AFTER confirmado_fecha;
  ALTER TABLE RT_DATABASE_NAME.bodega_articulo_costo CHANGE COLUMN existencia existencia DECIMAL(20,2) NULL DEFAULT '0.00';
  CREATE TABLE RT_DATABASE_NAME.articulo_ultima_compra (
  articulo_ultima_compra int(11) NOT NULL AUTO_INCREMENT,
  articulo int(11) NOT NULL,
  presentacion int(11) NOT NULL,
  ultimo_proveedor int(11) NOT NULL,
  ultimo_costo decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (articulo_ultima_compra),
  UNIQUE KEY ArticuloPresentacionProveedor (articulo,presentacion,ultimo_proveedor),
  KEY fk_articulo_ultima_compra_presentacion1_idx (presentacion),
  KEY fk_articulo_ultima_compra_proveedor1_idx (ultimo_proveedor),
  CONSTRAINT fk_articulo_ultima_compra_articulo1 FOREIGN KEY (articulo) REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_ultima_compra_presentacion1 FOREIGN KEY (presentacion) REFERENCES RT_DATABASE_NAME.presentacion (presentacion) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_ultima_compra_proveedor1 FOREIGN KEY (ultimo_proveedor) REFERENCES RT_DATABASE_NAME.proveedor (proveedor) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE RT_DATABASE_NAME.orden_compra DROP FOREIGN KEY fk_orden_compra_estatus_movimiento1;
ALTER TABLE RT_DATABASE_NAME.orden_compra ADD COLUMN fecha_orden DATE NOT NULL AFTER proveedor, CHANGE COLUMN estatus_movimiento estatus_movimiento INT(11) NOT NULL DEFAULT 1;
ALTER TABLE RT_DATABASE_NAME.orden_compra ADD CONSTRAINT fk_orden_compra_estatus_movimiento1 FOREIGN KEY (estatus_movimiento) REFERENCES RT_DATABASE_NAME.estatus_movimiento (estatus_movimiento) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.orden_compra ADD COLUMN sede INT NULL AFTER orden_compra, ADD INDEX fk_orden_compra_sede1_idx (sede ASC);
ALTER TABLE RT_DATABASE_NAME.orden_compra ADD CONSTRAINT fk_orden_compra_sede1 FOREIGN KEY (sede) REFERENCES RT_DATABASE_NAME.sede (sede) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.orden_compra_detalle ADD COLUMN presentacion INT NULL AFTER total, ADD INDEX fk_orden_compra_detalle_presentacion1_idx (presentacion ASC);
ALTER TABLE RT_DATABASE_NAME.orden_compra_detalle ADD CONSTRAINT fk_orden_compra_detalle_presentacion1 FOREIGN KEY (presentacion) REFERENCES RT_DATABASE_NAME.presentacion (presentacion) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.factura_fel CHANGE COLUMN resultado resultado LONGTEXT NOT NULL;
ALTER TABLE RT_DATABASE_NAME.ingreso_detalle CHANGE COLUMN precio_unitario precio_unitario DECIMAL(10,4) NOT NULL DEFAULT '0.0000' ;
ALTER TABLE RT_DATABASE_NAME.egreso ADD COLUMN bodega_destino INT NULL AFTER raw_egreso, ADD INDEX fk_egreso_bodega2_idx (bodega_destino ASC);
ALTER TABLE RT_DATABASE_NAME.egreso ADD CONSTRAINT fk_egreso_bodega2 FOREIGN KEY (bodega_destino) REFERENCES RT_DATABASE_NAME.bodega (bodega) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.impresora ADD COLUMN pordefectocuenta TINYINT(1) NOT NULL DEFAULT 0 AFTER pordefecto, ADD COLUMN pordefectofactura TINYINT(1) NOT NULL DEFAULT 0 AFTER pordefectocuenta;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN esevento TINYINT(1) NULL DEFAULT 0 AFTER comensales;
ALTER TABLE RT_DATABASE_NAME.usuario ADD COLUMN confirmar_ingreso TINYINT(1) NULL DEFAULT 0 AFTER usatecladovirtual, ADD COLUMN confirmar_egreso TINYINT(1) NULL DEFAULT 0 AFTER confirmar_ingreso;
ALTER TABLE RT_DATABASE_NAME.turno_tipo ADD COLUMN enviar_reporte TINYINT(1) NOT NULL DEFAULT 0 AFTER activo, ADD COLUMN correo_cierre VARCHAR(150) NULL AFTER enviar_reporte, ADD COLUMN bodega INT NULL AFTER correo_cierre, ADD INDEX idx1_turno_tipo (bodega ASC);
ALTER TABLE RT_DATABASE_NAME.egreso ADD COLUMN comentario VARCHAR(500) NULL;
ALTER TABLE RT_DATABASE_NAME.presentacion ADD COLUMN debaja TINYINT(1) NULL DEFAULT 0 AFTER cantidad, ADD COLUMN fechabaja DATETIME NULL AFTER debaja, ADD COLUMN usuariobaja INT NULL AFTER fechabaja, ADD INDEX fk_presentacion_usuario1_idx (usuariobaja ASC);
ALTER TABLE RT_DATABASE_NAME.presentacion ADD CONSTRAINT fk_presentacion_usuario1 FOREIGN KEY (usuariobaja) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.factura_serie ADD COLUMN pequenio_contribuyente TINYINT(1) NOT NULL DEFAULT 0 AFTER tipo;
ALTER TABLE RT_DATABASE_NAME.cliente ADD INDEX Nombre_ASC (nombre ASC);
ALTER TABLE RT_DATABASE_NAME.factura ADD INDEX fel_uuid_ASC (fel_uuid ASC), ADD INDEX fel_uuid_anulacion_ASC (fel_uuid_anulacion ASC), ADD INDEX fecha_factura_ASC (fecha_factura ASC), ADD INDEX fecha_factura_DESC (fecha_factura DESC), ADD INDEX factura_DESC (factura DESC);
ALTER TABLE RT_DATABASE_NAME.detalle_comanda ADD COLUMN presentacion_bck INT NULL AFTER presentacion;
INSERT INTO RT_DATABASE_NAME.impresora (sede, nombre, bluetooth, pordefecto, pordefectocuenta, pordefectofactura) VALUES (1, 'IMPRESORA', 0, 1, 1, 1);
ALTER TABLE RT_DATABASE_NAME.bodega ADD COLUMN permitir_requisicion int NOT NULL DEFAULT 0 AFTER merma;
ALTER TABLE RT_DATABASE_NAME.tipo_movimiento ADD COLUMN requisicion TINYINT(1) NOT NULL DEFAULT 0 AFTER egreso;
ALTER TABLE RT_DATABASE_NAME.articulo ADD INDEX PresentacionReporte_ASC (presentacion_reporte ASC), ADD INDEX MostrarInventario_ASC (mostrar_inventario ASC);
ALTER TABLE RT_DATABASE_NAME.articulo ADD INDEX MostrarPOS_ASC (mostrar_pos ASC), ADD INDEX EsReceta_ASC (esreceta ASC), ADD INDEX Combo_ASC (combo ASC), ADD INDEX Multiple_ASC (multiple ASC);
ALTER TABLE RT_DATABASE_NAME.factura ADD COLUMN factura_serie_correlativo INT(11) NULL;
ALTER TABLE RT_DATABASE_NAME.bodega ADD COLUMN debaja TINYINT(1) NOT NULL DEFAULT 0 AFTER pordefecto, ADD COLUMN usuariodebaja INT NULL AFTER debaja, ADD COLUMN fechabaja DATETIME NULL AFTER usuariodebaja, ADD INDEX fk_bodega_usuario_idx (usuariodebaja ASC);
ALTER TABLE RT_DATABASE_NAME.bodega ADD CONSTRAINT fk_bodega_usuario1 FOREIGN KEY (usuariodebaja) REFERENCES RT_DATABASE_NAME.usuario (usuario) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.mesa ADD COLUMN esreservable TINYINT(1) NOT NULL DEFAULT 0 AFTER escallcenter;
ALTER TABLE RT_DATABASE_NAME.mesa ADD COLUMN eshabitacion TINYINT(1) NOT NULL DEFAULT 0 AFTER esreservable;
CREATE TABLE RT_DATABASE_NAME.tipo_documento (
  tipo_documento INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(45) NOT NULL,
  abreviatura VARCHAR(5) NOT NULL,
  PRIMARY KEY (tipo_documento));  
ALTER TABLE RT_DATABASE_NAME.cliente_master ADD COLUMN tipo_documento INT NULL AFTER fecha_nacimiento, ADD COLUMN numero_documento VARCHAR(250) NULL AFTER tipo_documento, ADD INDEX fk_cliente_master_tipo_documento1_idx (tipo_documento ASC), ADD INDEX Numero_documentoASC (numero_documento ASC);
ALTER TABLE RT_DATABASE_NAME.cliente_master ADD CONSTRAINT fk_cliente_master_tipo_documento1 FOREIGN KEY (tipo_documento) REFERENCES RT_DATABASE_NAME.tipo_documento (tipo_documento) ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE TABLE RT_DATABASE_NAME.estatus_reserva (
  estatus_reserva INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(45) NOT NULL,
  color VARCHAR(7) NOT NULL,
  PRIMARY KEY (estatus_reserva));  
  CREATE TABLE RT_DATABASE_NAME.tipo_habitacion (
  tipo_habitacion INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(45) NOT NULL,
  icono VARCHAR(45) NULL,
  PRIMARY KEY (tipo_habitacion));
CREATE TABLE RT_DATABASE_NAME.tarifa_reserva (
  tarifa_reserva int(11) NOT NULL AUTO_INCREMENT,
  tipo_habitacion int(11) NOT NULL,
  cantidad_adultos int(11) NOT NULL DEFAULT '0',
  cantidad_menores int(11) NOT NULL DEFAULT '0',
  monto decimal(20,2) NOT NULL DEFAULT '0.00',
  monto_adicional_adulto decimal(20,2) NOT NULL DEFAULT '0.00',
  monto_adicional_menor decimal(20,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (tarifa_reserva),
  KEY fk_tarifa_reserva_tipo_habitacion1_idx (tipo_habitacion),
  CONSTRAINT fk_tarifa_reserva_tipo_habitacion1 FOREIGN KEY (tipo_habitacion) REFERENCES RT_DATABASE_NAME.tipo_habitacion (tipo_habitacion) ON DELETE NO ACTION ON UPDATE NO ACTION);  
CREATE TABLE RT_DATABASE_NAME.reserva (
  reserva INT NOT NULL AUTO_INCREMENT,
  mesa INT NOT NULL,
  tarifa_reserva INT NOT NULL,
  cliente_master INT NOT NULL,
  estatus_reserva INT NOT NULL,
  fecha_del DATE NOT NULL,
  hora_inicio TIME NULL,
  fecha_al DATE NOT NULL,
  hora_fin TIME NULL,
  cantidad_adultos INT NOT NULL DEFAULT 0,
  cantidad_menores INT NOT NULL DEFAULT 0,
  PRIMARY KEY (reserva),
  INDEX fk_reserva_mesa1_idx (mesa ASC),
  INDEX fk_reserva_tarifa_reserva1_idx (tarifa_reserva ASC),
  INDEX fk_reserva_cliente_master1_idx (cliente_master ASC),
  INDEX fk_reserva_estatus_reserva1_idx (estatus_reserva ASC),
  INDEX Fecha_delASC (fecha_del ASC),
  INDEX Fecha_alASC (fecha_al ASC),
  CONSTRAINT fk_reserva_mesa1
    FOREIGN KEY (mesa)
    REFERENCES RT_DATABASE_NAME.mesa (mesa)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_reserva_tarifa_reserva1
    FOREIGN KEY (tarifa_reserva)
    REFERENCES RT_DATABASE_NAME.tarifa_reserva (tarifa_reserva)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_reserva_cliente_master1
    FOREIGN KEY (cliente_master)
    REFERENCES RT_DATABASE_NAME.cliente_master (cliente_master)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_reserva_estatus_reserva1
    FOREIGN KEY (estatus_reserva)
    REFERENCES RT_DATABASE_NAME.estatus_reserva (estatus_reserva)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
CREATE TABLE RT_DATABASE_NAME.detalle_reserva (
  detalle_reserva INT NOT NULL AUTO_INCREMENT,
  reserva INT NOT NULL,
  fecha DATE NOT NULL,
  PRIMARY KEY (detalle_reserva),
  INDEX fk_detalle_reserva_reserva1_idx (reserva ASC),
  INDEX FechaASC (fecha ASC),
  CONSTRAINT fk_detalle_reserva_reserva1
    FOREIGN KEY (reserva)
    REFERENCES RT_DATABASE_NAME.reserva (reserva)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
ALTER TABLE RT_DATABASE_NAME.mesa ADD COLUMN tipo_habitacion INT NULL AFTER eshabitacion, ADD INDEX fk_mesa_tipo_habitacion1_idx (tipo_habitacion ASC);
ALTER TABLE RT_DATABASE_NAME.mesa ADD CONSTRAINT fk_mesa_tipo_habitacion1 FOREIGN KEY (tipo_habitacion) REFERENCES RT_DATABASE_NAME.tipo_habitacion (tipo_habitacion) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.forma_pago ADD COLUMN escobrohabitacion TINYINT(1) NOT NULL DEFAULT 0 AFTER esefectivo;
ALTER TABLE RT_DATABASE_NAME.comanda ADD COLUMN reserva INT NULL AFTER esevento, ADD INDEX fk_comanda_reserva1_idx (reserva ASC);
ALTER TABLE RT_DATABASE_NAME.comanda ADD CONSTRAINT fk_comanda_reserva1 FOREIGN KEY (reserva) REFERENCES RT_DATABASE_NAME.reserva (reserva) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.tarifa_reserva ADD COLUMN articulo INT NULL AFTER monto_adicional_menor, ADD INDEX fk_tarifa_reserva_articulo1_idx (articulo ASC);
ALTER TABLE RT_DATABASE_NAME.tarifa_reserva ADD CONSTRAINT fk_tarifa_reserva_articulo1 FOREIGN KEY (articulo)  REFERENCES RT_DATABASE_NAME.articulo (articulo) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE RT_DATABASE_NAME.reserva ADD COLUMN cobradoencomanda TINYINT(1) NOT NULL DEFAULT 0 AFTER cantidad_menores;
ALTER TABLE RT_DATABASE_NAME.cliente_master ADD COLUMN enlistanegra TINYINT(1) NOT NULL DEFAULT 0 AFTER numero_documento;
DROP TABLE IF EXISTS RT_DATABASE_NAME.notas;
CREATE TABLE RT_DATABASE_NAME.nota_predefinida (
  nota_predefinida INT NOT NULL AUTO_INCREMENT,
  nota VARCHAR(1000) NOT NULL,
  PRIMARY KEY (nota_predefinida),
  INDEX NotaASC (nota ASC));
ALTER TABLE RT_DATABASE_NAME.estatus_reserva CHANGE COLUMN color color VARCHAR(7) NULL ;
INSERT INTO RT_DATABASE_NAME.estatus_reserva(estatus_reserva, descripcion) VALUES(1, 'RESERVADA');
INSERT INTO RT_DATABASE_NAME.estatus_reserva(estatus_reserva, descripcion) VALUES(2, 'CHECK-IN');
INSERT INTO RT_DATABASE_NAME.estatus_reserva(estatus_reserva, descripcion) VALUES(3, 'CHECK-OUT');
INSERT INTO RT_DATABASE_NAME.estatus_reserva(estatus_reserva, descripcion) VALUES(4, 'CANCELADA');
INSERT INTO RT_DATABASE_NAME.tipo_documento(tipo_documento, descripcion, abreviatura) VALUES(1, 'Código Único de Identificación', 'CUI');
INSERT INTO RT_DATABASE_NAME.tipo_documento(tipo_documento, descripcion, abreviatura) VALUES(2, 'Pasaporte', 'PP');
CREATE TABLE RT_DATABASE_NAME.correlativo (
  correlativo int(11) NOT NULL AUTO_INCREMENT,
  tabla varchar(50) NOT NULL,
  fecha date NOT NULL,
  siguiente int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (correlativo)
);
ALTER TABLE RT_DATABASE_NAME.cliente ADD COLUMN cui VARCHAR(20) NULL AFTER nit, ADD COLUMN pasaporte VARCHAR(50) NULL AFTER cui;
CREATE TABLE RT_DATABASE_NAME.municipio (
  municipio INT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(5) NOT NULL,
  depto VARCHAR(50) NOT NULL,
  mupio VARCHAR(50) NOT NULL,
  PRIMARY KEY (municipio),
  INDEX Codigo_ASC (codigo ASC));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0101'), TRIM('Guatemala'), TRIM('Guatemala'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0102'), TRIM('Guatemala'), TRIM('Santa Catarina Pinula'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0103'), TRIM('Guatemala'), TRIM('San José Pinula'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0104'), TRIM('Guatemala'), TRIM('San José del Golfo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0105'), TRIM('Guatemala'), TRIM('Palencia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0106'), TRIM('Guatemala'), TRIM('Chinautla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0107'), TRIM('Guatemala'), TRIM('San Pedro Ayampuc'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0108'), TRIM('Guatemala'), TRIM('Mixco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0109'), TRIM('Guatemala'), TRIM('San Pedro Sacatepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0110'), TRIM('Guatemala'), TRIM('San Juan Sacatépequez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0111'), TRIM('Guatemala'), TRIM('San Raymundo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0112'), TRIM('Guatemala'), TRIM('Chuarrancho'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0113'), TRIM('Guatemala'), TRIM('Fraijanes'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0114'), TRIM('Guatemala'), TRIM('Amatitlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0115'), TRIM('Guatemala'), TRIM('Villa Nueva'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0116'), TRIM('Guatemala'), TRIM('Villa Canales'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0117'), TRIM('Guatemala'), TRIM('Petapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0201'), TRIM('El Progreso'), TRIM('Guastatoya'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0202'), TRIM('El Progreso'), TRIM('Morazán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0203'), TRIM('El Progreso'), TRIM('San Agustín Acasaguastlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0204'), TRIM('El Progreso'), TRIM('San Cristóbal Acasaguastlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0205'), TRIM('El Progreso'), TRIM('El Jícaro'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0206'), TRIM('El Progreso'), TRIM('Sansare'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0207'), TRIM('El Progreso'), TRIM('Sanarate'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0208'), TRIM('El Progreso'), TRIM('San Antonio La Paz'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0301'), TRIM('Sacatepéquez'), TRIM('Antigua Guatemala'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0302'), TRIM('Sacatepéquez'), TRIM('Jocotenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0303'), TRIM('Sacatepéquez'), TRIM('Pastores'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0304'), TRIM('Sacatepéquez'), TRIM('Sumpango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0305'), TRIM('Sacatepéquez'), TRIM('Sto. Domingo Xenacoj'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0306'), TRIM('Sacatepéquez'), TRIM('Santiago Sacatepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0307'), TRIM('Sacatepéquez'), TRIM('San Bartolomé Millpas Altas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0308'), TRIM('Sacatepéquez'), TRIM('San Lucas Sacatepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0309'), TRIM('Sacatepéquez'), TRIM('Santa Lucia Milpas Altas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0310'), TRIM('Sacatepéquez'), TRIM('Magdalena Milpas Altas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0311'), TRIM('Sacatepéquez'), TRIM('Santa María de Jesús'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0312'), TRIM('Sacatepéquez'), TRIM('Ciudad Vieja'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0313'), TRIM('Sacatepéquez'), TRIM('San Miguel Dueñas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0314'), TRIM('Sacatepéquez'), TRIM('Alotenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0315'), TRIM('Sacatepéquez'), TRIM('San Antonio Aguas Calientes'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0316'), TRIM('Sacatepéquez'), TRIM('Santa Catarina Barahona'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0401'), TRIM('Chimaltenango'), TRIM('Chimaltenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0402'), TRIM('Chimaltenango'), TRIM('San José Poaquil'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0403'), TRIM('Chimaltenango'), TRIM('San Martín Jilotepeque'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0404'), TRIM('Chimaltenango'), TRIM('Comalapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0405'), TRIM('Chimaltenango'), TRIM('Santa Apolonia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0406'), TRIM('Chimaltenango'), TRIM('Tecpán Guatemala'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0407'), TRIM('Chimaltenango'), TRIM('Patzún'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0408'), TRIM('Chimaltenango'), TRIM('Pochuta'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0409'), TRIM('Chimaltenango'), TRIM('Patzicia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0410'), TRIM('Chimaltenango'), TRIM('Santa Cruz Balanyá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0411'), TRIM('Chimaltenango'), TRIM('Acatenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0412'), TRIM('Chimaltenango'), TRIM('Yepocapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0413'), TRIM('Chimaltenango'), TRIM('San Andrés Iztapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0414'), TRIM('Chimaltenango'), TRIM('Parramos'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0415'), TRIM('Chimaltenango'), TRIM('Zaragoza'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0416'), TRIM('Chimaltenango'), TRIM('El Tejar'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0501'), TRIM('Escuintla'), TRIM('Escuintla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0502'), TRIM('Escuintla'), TRIM('Santa Lucía Cotzumalguapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0503'), TRIM('Escuintla'), TRIM('La Democracia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0504'), TRIM('Escuintla'), TRIM('Siquinalá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0505'), TRIM('Escuintla'), TRIM('Masagua'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0506'), TRIM('Escuintla'), TRIM('Tiquisate'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0507'), TRIM('Escuintla'), TRIM('La Gomera'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0508'), TRIM('Escuintla'), TRIM('Guanagazapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0509'), TRIM('Escuintla'), TRIM('San José'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0510'), TRIM('Escuintla'), TRIM('Iztapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0511'), TRIM('Escuintla'), TRIM('Palín'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0512'), TRIM('Escuintla'), TRIM('San Vicente Pacaya'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0513'), TRIM('Escuintla'), TRIM('Nueva Concepción'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0601'), TRIM('Santa Rosa'), TRIM('Cuilapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0602'), TRIM('Santa Rosa'), TRIM('Barberena'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0603'), TRIM('Santa Rosa'), TRIM('Santa Rosa de Lima'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0604'), TRIM('Santa Rosa'), TRIM('Casillas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0605'), TRIM('Santa Rosa'), TRIM('San Rafael Las Flores'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0606'), TRIM('Santa Rosa'), TRIM('Oratorio'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0607'), TRIM('Santa Rosa'), TRIM('San Juan Tecuaco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0608'), TRIM('Santa Rosa'), TRIM('Chiquimulilla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0609'), TRIM('Santa Rosa'), TRIM('Taxisco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0610'), TRIM('Santa Rosa'), TRIM('Santa María Ixhuatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0611'), TRIM('Santa Rosa'), TRIM('Guazacapán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0612'), TRIM('Santa Rosa'), TRIM('Santa Cruz Naranjo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0613'), TRIM('Santa Rosa'), TRIM('Pueblo Nuevo Viñas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0614'), TRIM('Santa Rosa'), TRIM('Nueva Santa Rosa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0701'), TRIM('Sololá'), TRIM('Sololá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0702'), TRIM('Sololá'), TRIM('San José Chacayá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0703'), TRIM('Sololá'), TRIM('Santa María Visitación'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0704'), TRIM('Sololá'), TRIM('Santa Lucía Utatlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0705'), TRIM('Sololá'), TRIM('Nahualá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0706'), TRIM('Sololá'), TRIM('Santa Catarina Ixtahuacán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0707'), TRIM('Sololá'), TRIM('Santa Clara La Laguna'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0708'), TRIM('Sololá'), TRIM('Concepción'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0709'), TRIM('Sololá'), TRIM('San Andrés Semetabaj'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0710'), TRIM('Sololá'), TRIM('Panajachel'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0711'), TRIM('Sololá'), TRIM('Santa Catarina Palopó'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0712'), TRIM('Sololá'), TRIM('San Antonio Palopó'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0713'), TRIM('Sololá'), TRIM('San Lucas Tolimán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0714'), TRIM('Sololá'), TRIM('Santa Cruz La Laguna'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0715'), TRIM('Sololá'), TRIM('San Pablo La Laguna'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0716'), TRIM('Sololá'), TRIM('San Marcos La Laguna'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0717'), TRIM('Sololá'), TRIM('San Juan La Laguna'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0718'), TRIM('Sololá'), TRIM('San Pedro La Laguna'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0719'), TRIM('Sololá'), TRIM('Santiago Atitlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0801'), TRIM('Totonicapán'), TRIM('Totonicapán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0802'), TRIM('Totonicapán'), TRIM('San Cristóbal Totonicapán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0803'), TRIM('Totonicapán'), TRIM('San Francisco El Alto'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0804'), TRIM('Totonicapán'), TRIM('San Andrés Xecul'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0805'), TRIM('Totonicapán'), TRIM('Momostenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0806'), TRIM('Totonicapán'), TRIM('Santa María Chiquimula'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0807'), TRIM('Totonicapán'), TRIM('Santa Lucía La Reforma'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0808'), TRIM('Totonicapán'), TRIM('San Bartolo Aguas Calientes'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0901'), TRIM('Quetzaltenango'), TRIM('Quetzaltenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0902'), TRIM('Quetzaltenango'), TRIM('Salcajá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0903'), TRIM('Quetzaltenango'), TRIM('Olintepeque'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0904'), TRIM('Quetzaltenango'), TRIM('San Carlos Sija'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0905'), TRIM('Quetzaltenango'), TRIM('Sibilia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0906'), TRIM('Quetzaltenango'), TRIM('Cabricán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0907'), TRIM('Quetzaltenango'), TRIM('Cajolá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0908'), TRIM('Quetzaltenango'), TRIM('San Miguel Siguilá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0909'), TRIM('Quetzaltenango'), TRIM('San Juan Ostuncalco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0910'), TRIM('Quetzaltenango'), TRIM('San Mateo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0911'), TRIM('Quetzaltenango'), TRIM('Concepción Chiquirichapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0912'), TRIM('Quetzaltenango'), TRIM('San Martín Sacatepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0913'), TRIM('Quetzaltenango'), TRIM('Almolonga'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0914'), TRIM('Quetzaltenango'), TRIM('Cantel'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0915'), TRIM('Quetzaltenango'), TRIM('Huitán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0916'), TRIM('Quetzaltenango'), TRIM('Zunil'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0917'), TRIM('Quetzaltenango'), TRIM('Colomba'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0918'), TRIM('Quetzaltenango'), TRIM('San Francisco La Unión'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0919'), TRIM('Quetzaltenango'), TRIM('El Palmar'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0920'), TRIM('Quetzaltenango'), TRIM('Coatepeque'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0921'), TRIM('Quetzaltenango'), TRIM('Génova'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0922'), TRIM('Quetzaltenango'), TRIM('Flores Costa Cuca'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0923'), TRIM('Quetzaltenango'), TRIM('La Esperanza'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('0924'), TRIM('Quetzaltenango'), TRIM('Palestina de los Altos'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1001'), TRIM('Suchitepéquez'), TRIM('Mazatenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1002'), TRIM('Suchitepéquez'), TRIM('Cuyotenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1003'), TRIM('Suchitepéquez'), TRIM('San Francisco Zapotitlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1004'), TRIM('Suchitepéquez'), TRIM('San Bernardino'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1005'), TRIM('Suchitepéquez'), TRIM('San José El ídolo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1006'), TRIM('Suchitepéquez'), TRIM('Santo Domingo Suchitepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1007'), TRIM('Suchitepéquez'), TRIM('San Lorenzo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1008'), TRIM('Suchitepéquez'), TRIM('Samayac'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1009'), TRIM('Suchitepéquez'), TRIM('San Pablo Jocopilas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1010'), TRIM('Suchitepéquez'), TRIM('San Antonio Suchitepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1011'), TRIM('Suchitepéquez'), TRIM('San Miguel Panán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1012'), TRIM('Suchitepéquez'), TRIM('San Gabriel'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1013'), TRIM('Suchitepéquez'), TRIM('Chicacao'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1014'), TRIM('Suchitepéquez'), TRIM('Patulul'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1015'), TRIM('Suchitepéquez'), TRIM('Santa Bárbara'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1016'), TRIM('Suchitepéquez'), TRIM('San Juan Bautista'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1017'), TRIM('Suchitepéquez'), TRIM('Santo Tomás La Unión'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1018'), TRIM('Suchitepéquez'), TRIM('Zunilito'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1019'), TRIM('Suchitepéquez'), TRIM('Pueblo Nuevo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1020'), TRIM('Suchitepéquez'), TRIM('Río Bravo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1101'), TRIM('Retalhuleu'), TRIM('Retalhuleu'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1102'), TRIM('Retalhuleu'), TRIM('San Sebastián'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1103'), TRIM('Retalhuleu'), TRIM('Santa Cruz Muluá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1104'), TRIM('Retalhuleu'), TRIM('San Martín Zapotitlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1105'), TRIM('Retalhuleu'), TRIM('San Felipe Retalhuleu'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1106'), TRIM('Retalhuleu'), TRIM('San Andrés Villa Seca'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1107'), TRIM('Retalhuleu'), TRIM('Champerico'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1108'), TRIM('Retalhuleu'), TRIM('Nuevo San Carlos'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1109'), TRIM('Retalhuleu'), TRIM('El Asintal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1201'), TRIM('San Marcos'), TRIM('San Marcos'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1202'), TRIM('San Marcos'), TRIM('San Pedro Sacatepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1203'), TRIM('San Marcos'), TRIM('San Antonio Sacatepéquez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1204'), TRIM('San Marcos'), TRIM('Comitancillo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1205'), TRIM('San Marcos'), TRIM('San Miguel Ixtahuacán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1206'), TRIM('San Marcos'), TRIM('Concepción Tutuapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1207'), TRIM('San Marcos'), TRIM('Tacaná'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1208'), TRIM('San Marcos'), TRIM('Sibinal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1209'), TRIM('San Marcos'), TRIM('Tajumulco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1210'), TRIM('San Marcos'), TRIM('Tejutla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1211'), TRIM('San Marcos'), TRIM('San Rafael Pie de la Cuesta'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1212'), TRIM('San Marcos'), TRIM('Nuevo Progreso'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1213'), TRIM('San Marcos'), TRIM('El Tumbador'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1214'), TRIM('San Marcos'), TRIM('El Rodeo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1215'), TRIM('San Marcos'), TRIM('Malacatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1216'), TRIM('San Marcos'), TRIM('Catarina'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1217'), TRIM('San Marcos'), TRIM('Ayutla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1218'), TRIM('San Marcos'), TRIM('Ocós'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1219'), TRIM('San Marcos'), TRIM('San Pablo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1220'), TRIM('San Marcos'), TRIM('El Quetzal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1221'), TRIM('San Marcos'), TRIM('La Reforma'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1222'), TRIM('San Marcos'), TRIM('Pajapita'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1223'), TRIM('San Marcos'), TRIM('Ixchiguán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1224'), TRIM('San Marcos'), TRIM('San José Ojetenam'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1225'), TRIM('San Marcos'), TRIM('San Cristóbal Cucho'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1226'), TRIM('San Marcos'), TRIM('Sipacapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1227'), TRIM('San Marcos'), TRIM('Esquipulas Palo Gordo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1228'), TRIM('San Marcos'), TRIM('Río Blanco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1229'), TRIM('San Marcos'), TRIM('San Lorenzo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1301'), TRIM('Huehuetenango'), TRIM('Huehuetenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1302'), TRIM('Huehuetenango'), TRIM('Chiantla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1303'), TRIM('Huehuetenango'), TRIM('Malacatancito'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1304'), TRIM('Huehuetenango'), TRIM('Cuilco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1305'), TRIM('Huehuetenango'), TRIM('Nentón'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1306'), TRIM('Huehuetenango'), TRIM('San Pedro Necta'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1307'), TRIM('Huehuetenango'), TRIM('Jacaltenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1308'), TRIM('Huehuetenango'), TRIM('Soloma'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1309'), TRIM('Huehuetenango'), TRIM('San Idelfonso Ixtahuacán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1310'), TRIM('Huehuetenango'), TRIM('Santa Bárbara'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1311'), TRIM('Huehuetenango'), TRIM('La Libertad'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1312'), TRIM('Huehuetenango'), TRIM('La Democracia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1313'), TRIM('Huehuetenango'), TRIM('San Miguel Acatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1314'), TRIM('Huehuetenango'), TRIM('San Rafael La Indepencia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1315'), TRIM('Huehuetenango'), TRIM('Todos Santos Cuchumatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1316'), TRIM('Huehuetenango'), TRIM('San Juan Atitán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1317'), TRIM('Huehuetenango'), TRIM('Santa Eulalia'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1318'), TRIM('Huehuetenango'), TRIM('San Mateo Ixtatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1319'), TRIM('Huehuetenango'), TRIM('Colotenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1320'), TRIM('Huehuetenango'), TRIM('San Sebastián Huehuetenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1321'), TRIM('Huehuetenango'), TRIM('Tectitán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1322'), TRIM('Huehuetenango'), TRIM('Concepción Huista'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1323'), TRIM('Huehuetenango'), TRIM('San Juan Ixcoy'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1324'), TRIM('Huehuetenango'), TRIM('San Antonio Huista'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1325'), TRIM('Huehuetenango'), TRIM('San Sebastián Coatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1326'), TRIM('Huehuetenango'), TRIM('Barillas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1327'), TRIM('Huehuetenango'), TRIM('Aguacatán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1328'), TRIM('Huehuetenango'), TRIM('San Rafael Pétzal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1329'), TRIM('Huehuetenango'), TRIM('San Gaspar Ixchil'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1330'), TRIM('Huehuetenango'), TRIM('Santiago Chimaltenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1331'), TRIM('Huehuetenango'), TRIM('Santa Ana Huista'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1401'), TRIM('Quiché'), TRIM('Santa Cruz del Quiché'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1402'), TRIM('Quiché'), TRIM('Chiché'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1403'), TRIM('Quiché'), TRIM('Chinique'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1404'), TRIM('Quiché'), TRIM('Zacualpa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1405'), TRIM('Quiché'), TRIM('Chajul'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1406'), TRIM('Quiché'), TRIM('Chichicastenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1407'), TRIM('Quiché'), TRIM('Patzité'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1408'), TRIM('Quiché'), TRIM('San Antonio Ilotenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1409'), TRIM('Quiché'), TRIM('San Pedro Jocopilas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1410'), TRIM('Quiché'), TRIM('Cunén'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1411'), TRIM('Quiché'), TRIM('San Juan Cotzal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1412'), TRIM('Quiché'), TRIM('Joyabaj'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1413'), TRIM('Quiché'), TRIM('Nebaj'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1414'), TRIM('Quiché'), TRIM('San Andrés Sajcabajá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1415'), TRIM('Quiché'), TRIM('Uspantán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1416'), TRIM('Quiché'), TRIM('Sacapulas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1417'), TRIM('Quiché'), TRIM('San Bartolomé Jocotenango'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1418'), TRIM('Quiché'), TRIM('Canillá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1419'), TRIM('Quiché'), TRIM('Chicamán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1420'), TRIM('Quiché'), TRIM('Playa Grande -Ixcán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1421'), TRIM('Quiché'), TRIM('Pachalum'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1501'), TRIM('Baja Verapaz'), TRIM('Salamá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1502'), TRIM('Baja Verapaz'), TRIM('San Miguel Chicaj'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1503'), TRIM('Baja Verapaz'), TRIM('Rabinal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1504'), TRIM('Baja Verapaz'), TRIM('Cubulco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1505'), TRIM('Baja Verapaz'), TRIM('Granados'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1506'), TRIM('Baja Verapaz'), TRIM('El Chol'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1507'), TRIM('Baja Verapaz'), TRIM('San Jerónimo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1508'), TRIM('Baja Verapaz'), TRIM('Purulhá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1601'), TRIM('Alta Verapaz'), TRIM('Cobán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1602'), TRIM('Alta Verapaz'), TRIM('Santa Cruz Verapaz'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1603'), TRIM('Alta Verapaz'), TRIM('San Cristóbal Verapaz'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1604'), TRIM('Alta Verapaz'), TRIM('Tactic'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1605'), TRIM('Alta Verapaz'), TRIM('Tamahú'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1606'), TRIM('Alta Verapaz'), TRIM('Tucurú'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1607'), TRIM('Alta Verapaz'), TRIM('Panzós'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1608'), TRIM('Alta Verapaz'), TRIM('Senahú'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1609'), TRIM('Alta Verapaz'), TRIM('San Pedro Carchá'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1610'), TRIM('Alta Verapaz'), TRIM('San Juan Chamelco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1611'), TRIM('Alta Verapaz'), TRIM('Lanquín'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1612'), TRIM('Alta Verapaz'), TRIM('Cahabón'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1613'), TRIM('Alta Verapaz'), TRIM('Chisec'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1614'), TRIM('Alta Verapaz'), TRIM('Chahal'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1615'), TRIM('Alta Verapaz'), TRIM('Fray Bartolomé de las Casas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1616'), TRIM('Alta Verapaz'), TRIM('La Tinta'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1701'), TRIM('Petén'), TRIM('Flores'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1702'), TRIM('Petén'), TRIM('San José'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1703'), TRIM('Petén'), TRIM('San Benito'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1704'), TRIM('Petén'), TRIM('San Andrés'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1705'), TRIM('Petén'), TRIM('La Libertad'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1706'), TRIM('Petén'), TRIM('San Francisco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1707'), TRIM('Petén'), TRIM('Santa Ana'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1708'), TRIM('Petén'), TRIM('Dolores'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1709'), TRIM('Petén'), TRIM('San Luis'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1710'), TRIM('Petén'), TRIM('Sayaxché'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1711'), TRIM('Petén'), TRIM('Melchor de Mencos'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1712'), TRIM('Petén'), TRIM('Poptún'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1801'), TRIM('Izabal'), TRIM('Puerto Barrios'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1802'), TRIM('Izabal'), TRIM('Livingston'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1803'), TRIM('Izabal'), TRIM('El Estor'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1804'), TRIM('Izabal'), TRIM('Morales'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1805'), TRIM('Izabal'), TRIM('Los Amates'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1901'), TRIM('Zacapa'), TRIM('Zacapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1902'), TRIM('Zacapa'), TRIM('Estanzuela'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1903'), TRIM('Zacapa'), TRIM('Río Hondo'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1904'), TRIM('Zacapa'), TRIM('Gualán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1905'), TRIM('Zacapa'), TRIM('Teculután'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1906'), TRIM('Zacapa'), TRIM('Usumatlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1907'), TRIM('Zacapa'), TRIM('Cabañas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1908'), TRIM('Zacapa'), TRIM('San Diego'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1909'), TRIM('Zacapa'), TRIM('La Unión'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('1910'), TRIM('Zacapa'), TRIM('Huité'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2001'), TRIM('Chiquimula'), TRIM('Chiquimula'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2002'), TRIM('Chiquimula'), TRIM('San José La Arada'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2003'), TRIM('Chiquimula'), TRIM('San Juan Ermita'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2004'), TRIM('Chiquimula'), TRIM('Jocotán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2005'), TRIM('Chiquimula'), TRIM('Camotán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2006'), TRIM('Chiquimula'), TRIM('Olopa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2007'), TRIM('Chiquimula'), TRIM('Esquipulas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2008'), TRIM('Chiquimula'), TRIM('Concepción Las Minas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2009'), TRIM('Chiquimula'), TRIM('Quetzaltepeque'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2010'), TRIM('Chiquimula'), TRIM('San Jacinto'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2011'), TRIM('Chiquimula'), TRIM('Ipala'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2101'), TRIM('Jalapa'), TRIM('Jalapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2102'), TRIM('Jalapa'), TRIM('San Pedro Pinula'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2103'), TRIM('Jalapa'), TRIM('San Luis Jilotepeque'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2104'), TRIM('Jalapa'), TRIM('San Manuel Chaparrón'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2105'), TRIM('Jalapa'), TRIM('San Carlos Alzatate'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2106'), TRIM('Jalapa'), TRIM('Monjas'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2107'), TRIM('Jalapa'), TRIM('Mataquescuintla'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2201'), TRIM('Jutiapa'), TRIM('Jutiapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2202'), TRIM('Jutiapa'), TRIM('El Progreso'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2203'), TRIM('Jutiapa'), TRIM('Santa Catarina Mita'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2204'), TRIM('Jutiapa'), TRIM('Agua Blanca'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2205'), TRIM('Jutiapa'), TRIM('Asunción Mita'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2206'), TRIM('Jutiapa'), TRIM('Yupiltepeque'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2207'), TRIM('Jutiapa'), TRIM('Atescatempa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2208'), TRIM('Jutiapa'), TRIM('Jerez'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2209'), TRIM('Jutiapa'), TRIM('El Adelanto'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2210'), TRIM('Jutiapa'), TRIM('Zapotitlán'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2211'), TRIM('Jutiapa'), TRIM('Comapa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2212'), TRIM('Jutiapa'), TRIM('Jalpatagua'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2213'), TRIM('Jutiapa'), TRIM('Conguaco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2214'), TRIM('Jutiapa'), TRIM('Moyuta'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2215'), TRIM('Jutiapa'), TRIM('Pasaco'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2216'), TRIM('Jutiapa'), TRIM('San José Acatempa'));
INSERT INTO RT_DATABASE_NAME.municipio(codigo, depto, mupio) VALUES(TRIM('2217'), TRIM('Jutiapa'), TRIM('Quesada'));
ALTER TABLE RT_DATABASE_NAME.factura ADD COLUMN documento_receptor VARCHAR(100) NULL AFTER factura_serie_correlativo, ADD COLUMN tipo_documento_receptor VARCHAR(5) NULL AFTER documento_receptor;
ALTER TABLE RT_DATABASE_NAME.sede ADD COLUMN codigo_postal VARCHAR(25) NULL AFTER alias, ADD COLUMN municipio VARCHAR(100) NULL AFTER codigo_postal, ADD COLUMN departamento VARCHAR(100) NULL AFTER municipio, ADD COLUMN pais_iso_dos CHAR(2) NULL AFTER departamento;
ALTER TABLE RT_DATABASE_NAME.articulo ADD COLUMN essellado TINYINT(1) NOT NULL DEFAULT 0 AFTER stock_maximo;
ALTER TABLE RT_DATABASE_NAME.detalle_factura ADD COLUMN cantidad_inventario DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER cantidad;
CREATE TABLE RT_DATABASE_NAME.articulo_eliminado_comanda (
  articulo_eliminado_comanda INT NOT NULL AUTO_INCREMENT,
  comanda INT NOT NULL,
  articulo INT NOT NULL,
  usuario INT NOT NULL,
  fechahora DATETIME NOT NULL,
  PRIMARY KEY (articulo_eliminado_comanda),
  INDEX fk_articulo_eliminado_comanda_comanda1_idx (comanda ASC),
  INDEX fk_articulo_eliminado_comanda_articulo1_idx (articulo ASC),
  INDEX fk_articulo_eliminado_comanda_usuario1_idx (usuario ASC),
  CONSTRAINT fk_articulo_eliminado_comanda_comanda1
    FOREIGN KEY (comanda)
    REFERENCES RT_DATABASE_NAME.comanda (comanda)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_eliminado_comanda_articulo1
    FOREIGN KEY (articulo)
    REFERENCES RT_DATABASE_NAME.articulo (articulo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_articulo_eliminado_comanda_usuario1
    FOREIGN KEY (usuario)
    REFERENCES RT_DATABASE_NAME.usuario (usuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
ALTER TABLE RT_DATABASE_NAME.empresa ADD COLUMN cuenta_contable_iva_venta VARCHAR(10) NULL AFTER leyenda_isr, ADD COLUMN cuenta_contable_propina VARCHAR(10) NULL AFTER cuenta_contable_iva_venta, ADD COLUMN cuenta_contable_iva_propina VARCHAR(10) NULL AFTER cuenta_contable_propina, ADD COLUMN concepto_mayor_venta VARCHAR(500) NULL AFTER cuenta_contable_iva_propina;
ALTER TABLE RT_DATABASE_NAME.certificador_fel ADD COLUMN numero_resolucion VARCHAR(100) NULL AFTER frase_retencion_iva, ADD COLUMN fecha_resolucion DATE NULL AFTER numero_resolucion;
CREATE TABLE RT_DATABASE_NAME.forma_pago_sede_cuenta_contable (
  forma_pago_sede_cuenta_contable INT NOT NULL AUTO_INCREMENT,
  forma_pago INT NOT NULL,
  sede INT NOT NULL,
  cuenta_contable VARCHAR(10) NOT NULL,
  PRIMARY KEY (forma_pago_sede_cuenta_contable),
  INDEX fk_forma_pago_sede_cuenta_contable_forma_pago1_idx (forma_pago ASC),
  INDEX fk_forma_pago_sede_cuenta_contable_sede1_idx (sede ASC),
  CONSTRAINT fk_forma_pago_sede_cuenta_contable_forma_pago1
    FOREIGN KEY (forma_pago)
    REFERENCES RT_DATABASE_NAME.forma_pago (forma_pago)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_forma_pago_sede_cuenta_contable_sede1
    FOREIGN KEY (sede)
    REFERENCES RT_DATABASE_NAME.sede (sede)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
ALTER TABLE RT_DATABASE_NAME.articulo ADD COLUMN cuenta_contable VARCHAR(10) NULL AFTER essellado;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;