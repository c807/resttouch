<?php 
defined('BASEPATH') OR exit('No direct script access allowed');

$config['campos'] = [
	[
		"tabla_campo"=> 1,
		"tabla"=>2,
		"campo" => "descripcion", 
		"descripcion" => "articulo", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 2,
		"tabla"=>4,
		"campo" => "nombre", 
		"descripcion" => "cliente", 
		"ordenar_por" => 1, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 3,
		"tabla"=>3,
		"campo" => "fecha_factura", 
		"descripcion" => "Fecha Factura", 
		"ordenar_por" => 1, 
		"por_fecha" => 1, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 7,
		"tabla"=>3,
		"campo" => "numero_factura", 
		"descripcion" => "Número de Factura", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 4,
		"tabla"=>1,
		"campo" => "cantidad", 
		"descripcion" => "Cantidad", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 5,
		"tabla"=>1,
		"campo" => "total", 
		"descripcion" => "Total", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 6,
		"tabla"=>1,
		"campo" => "descuento", 
		"descripcion" => "Descuento", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 8,
		"tabla"=>1,
		"campo" => "bien_servicio", 
		"descripcion" => "Bien/Servicio", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 9,
		"tabla"=>3,
		"campo" => "notas", 
		"descripcion" => "Factura Notas", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 10,
		"tabla"=>3,
		"campo" => "correo_receptor", 
		"descripcion" => "Correo Recepto", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 11,
		"tabla"=>7,
		"campo" => "nombre", 
		"descripcion" => "Cuenta Nombre", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 12,
		"tabla"=>7,
		"campo" => "numero", 
		"descripcion" => "Cuenta Número", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 13,
		"tabla"=>8,
		"campo" => "domicilio", 
		"descripcion" => "A domicilio", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 14,
		"tabla"=>14,
		"campo" => "descripcion", 
		"descripcion" => "Comanda Origen", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 15,
		"tabla"=>9,
		"campo" => "inicio", 
		"descripcion" => "Turno Inicio", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 16,
		"tabla"=>9,
		"campo" => "fin", 
		"descripcion" => "Turno Fin", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 17,
		"tabla"=>10,
		"campo" => "descripcion", 
		"descripcion" => "Turno Tipo", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 18,
		"tabla"=>11,
		"campo" => "descripcion", 
		"descripcion" => "Presentación", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 19,
		"tabla"=>11,
		"campo" => "cantidad", 
		"descripcion" => "Presentación Cantidad", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 20,
		"tabla"=>12,
		"campo" => "descripcion", 
		"descripcion" => "Medida", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 21,
		"tabla"=>13,
		"campo" => "descripcion", 
		"descripcion" => "Grupo", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 22,
		"tabla"=>15,
		"campo" => "nombre", 
		"descripcion" => "Sede", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 23,
		"tabla"=>8,
		"campo" => "comanda", 
		"descripcion" => "# Comanda", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	],
	[
		"tabla_campo"=> 24,
		"tabla"=>16,
		"campo" => "nombres", 
		"descripcion" => "Vendedor", 
		"ordenar_por" => 0, 
		"por_fecha" => 0, 
		"compuesto" => 0
	]
];

$config['tabla'] = [
	[
		"tabla"=> 1,
		"entidad" => "detalle_factura", 
		"orden" => 1, 
		"accion" => "", 
		"condicion" => ""
	],
	[
		"tabla"=> 2,
		"entidad" => "articulo", 
		"orden" => 2, 
		"accion" => "inner", 
		"condicion" => "articulo.articulo = detalle_factura.articulo"
	],
	[
		"tabla"=> 3,
		"entidad" => "factura", 
		"orden" => 3, 
		"accion" => "inner", 
		"condicion" => "factura.factura = detalle_factura.factura"
	],
	[
		"tabla"=> 4,
		"entidad" => "cliente", 
		"orden" => 4, 
		"accion" => "inner", 
		"condicion" => "cliente.cliente = factura.cliente"
	],
	[
		"tabla"=> 5,
		"entidad" => "detalle_factura_detalle_cuenta", 
		"orden" => 5, 
		"accion" => "left", 
		"condicion" => "detalle_factura_detalle_cuenta.detalle_factura = detalle_factura.detalle_factura"
	],
	[
		"tabla"=> 6,
		"entidad" => "detalle_cuenta", 
		"orden" => 6, 
		"accion" => "left", 
		"condicion" => "detalle_factura_detalle_cuenta.detalle_cuenta = detalle_cuenta.detalle_cuenta"
	],
	[
		"tabla"=> 7,
		"entidad" => "cuenta", 
		"orden" => 7, 
		"accion" => "left", 
		"condicion" => "detalle_cuenta.cuenta_cuenta = cuenta.cuenta"
	],
	[
		"tabla"=> 8,
		"entidad" => "comanda", 
		"orden" => 8, 
		"accion" => "left", 
		"condicion" => "cuenta.comanda = comanda.comanda"
	],
	[
		"tabla"=> 9,
		"entidad" => "turno", 
		"orden" => 9, 
		"accion" => "left", 
		"condicion" => "comanda.turno = turno.turno"
	],
	[
		"tabla"=> 10,
		"entidad" => "turno_tipo", 
		"orden" => 10, 
		"accion" => "left", 
		"condicion" => "turno.turno_tipo = turno_tipo.turno_tipo"
	],
	[
		"tabla"=> 11,
		"entidad" => "presentacion", 
		"orden" => 11, 
		"accion" => "left", 
		"condicion" => "articulo.presentacion = presentacion.presentacion"
	],
	[
		"tabla"=> 12,
		"entidad" => "medida", 
		"orden" => 12, 
		"accion" => "left", 
		"condicion" => "presentacion.medida = medida.medida"
	],
	[
		"tabla"=> 13,
		"entidad" => "categoria_grupo", 
		"orden" => 13, 
		"accion" => "left", 
		"condicion" => "articulo.categoria_grupo = categoria_grupo.categoria_grupo"
	],
	[
		"tabla"=> 14,
		"entidad" => "comanda_origen", 
		"orden" => 14, 
		"accion" => "left", 
		"condicion" => "comanda.comanda_origen = comanda_origen.comanda_origen"
	],
	[
		"tabla"=> 15,
		"entidad" => "sede", 
		"orden" => 15, 
		"accion" => "left", 
		"condicion" => "factura.sede = sede.sede"
	],
	[
		"tabla"=> 16,
		"entidad" => "usuario", 
		"orden" => 16, 
		"accion" => "left", 
		"condicion" => "usuario.usuario = factura.usuario"
	]
];