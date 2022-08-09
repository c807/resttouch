<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reporte_model extends CI_Model
{

	private $sqlIngreso;
	private $sqlEgreso;
	private $sqlComanda;
	private $sqlFactura;
	private $filtros = [];
	private $tipo = 1;

	public function __construct($args = [])
	{
		parent::__construct();
		if (!empty($args)) {
			$this->filtros = $args;
		}
	}

	public function setTipo($tipo)
	{
		$this->tipo = $tipo;
	}

	function consultaIngresos($args = [])
	{
		$where = 'where b.mostrar_inventario = 1 and e.estatus_movimiento = 2 and ';
		$group = " group by ";
		$select = "";

		if (isset($args['fecha']) && !empty($args['fecha'])) {
			$fecha = $args['fecha'];
			$where .= " date(e.fecha) <= '{$fecha}'";
			$group .= " b.articulo";
		}

		if ($this->tipo == 2) {
			$where .= " date(e.fecha) < '{$args['fdel']}'";
			$group .= " b.articulo";
		}

		if ($this->tipo == 3) {
			$where .= " date(e.fecha) between '{$args['fdel']}' and '{$args['fal']}'";
			$group .= " e.ingreso, e.fecha, b.articulo, f.bodega,g.descripcion,f.descripcion";
			$select .= " ,e.ingreso as id,
				1 as tipo,
				f.bodega,
				0 as tipo_salida,
				e.fecha,
				g.descripcion as tipo_movimiento,
				f.descripcion as nbodega";
		}

		if (isset($args['bodega']) && !empty($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$bod = implode(",", $args['bodega']);
				$where .= " and f.bodega in ({$bod})";
			} else {
				$where .= " and f.bodega = {$args['bodega']}";
			}
		}

		$this->sqlIngreso = <<<EOT
select
	sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as cantidad,
	b.articulo 
	{$select}
from ingreso_detalle a
join articulo b on a.articulo = b.articulo
join categoria_grupo c on c.categoria_grupo = b.categoria_grupo
join categoria d on d.categoria = c.categoria
join ingreso e on e.ingreso = a.ingreso
join bodega f on f.bodega = e.bodega and f.sede = d.sede
join tipo_movimiento g on e.tipo_movimiento = g.tipo_movimiento
join presentacion p on a.presentacion = p.presentacion
{$where} {$group}
EOT;
	}

	function consultaEgresos($args = [])
	{
		$where = 'where b.mostrar_inventario = 1 and e.estatus_movimiento = 2 and ';
		$group = 'group by ';
		$select = "";

		if (isset($args['fecha']) && !empty($args['fecha'])) {
			$fecha = $args['fecha'];
			$where .= " date(e.fecha) <= '{$fecha}'";
		}

		if (in_array($this->tipo, [1, 2])) {
			$group .= " b.articulo";
		}

		if ($this->tipo == 2) {
			$where .= " date(e.fecha) < '{$args['fdel']}'";
		}

		if ($this->tipo == 3) {
			$where .= " date(e.fecha) between '{$args['fdel']}' and '{$args['fal']}'";
			$group .= " e.egreso, e.fecha, b.articulo, f.bodega, g.descripcion, f.descripcion";
			$select .= " ,e.egreso as id,
				2 as tipo,
				f.bodega,
				1 as tipo_salida,
				e.fecha,
				g.descripcion as tipo_movimiento,
				f.descripcion as nbodega";
		}

		if (isset($args['bodega']) && !empty($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$bod = implode(",", $args['bodega']);
				$where .= " and f.bodega in ({$bod})";
			} else {
				$where .= " and f.bodega = {$args['bodega']}";
			}
		}

		$this->sqlEgreso = <<<EOT
select
	sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as cantidad,
	b.articulo 
	{$select}
from egreso_detalle a
join articulo b on a.articulo = b.articulo
join categoria_grupo c on c.categoria_grupo = b.categoria_grupo
join categoria d on d.categoria = c.categoria
join egreso e on e.egreso = a.egreso
join bodega f on f.bodega = e.bodega and f.sede = d.sede
join tipo_movimiento g on e.tipo_movimiento = g.tipo_movimiento
join presentacion p on a.presentacion = p.presentacion
{$where} {$group}
EOT;
	}

	function consultaComandas($args = [])
	{
		$where = 'where b.mostrar_inventario = 1 and';
		$group = 'group by ';
		$select = "";

		if (isset($args['fecha']) && !empty($args['fecha'])) {
			$fecha = $args['fecha'];
			$where .= " date(e.fhcreacion) <= '{$fecha}'";
		}

		if (in_array($this->tipo, [1, 2])) {
			$group .= " b.articulo";
		}

		if ($this->tipo == 2) {
			$where .= " date(e.fhcreacion) < '{$args['fdel']}'";
		}

		if ($this->tipo == 3) {
			$where .= " date(e.fhcreacion) between '{$args['fdel']}' and '{$args['fal']}'";
			$group .= " e.comanda, f.fecha, b.articulo";
			$select .= " ,e.comanda id,
				2 as tipo,
				1 as bodega,
				2 as tipo_salida,
				e.fhcreacion,
				'Comanda' tipo_movimiento,				
				'Comanda' nbodega";
		}

		if (isset($args['bodega']) && !empty($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$bod = implode(",", $args['bodega']);
				$where .= " and a.bodega in ({$bod})";
			} else {
				$where .= " and a.bodega = {$args['bodega']}";
			}
		}

		$this->sqlComanda = <<<EOT
select 
	sum(round(ifnull(a.cantidad_inventario, ifnull(a.cantidad, 0)) * p.cantidad, 2)) as cantidad,
	b.articulo
	{$select}
from detalle_comanda a
join articulo b on a.articulo = b.articulo
join categoria_grupo c on c.categoria_grupo = b.categoria_grupo
join categoria d on d.categoria = c.categoria
join comanda e on e.comanda = a.comanda
join turno f on e.turno = f.turno and f.sede = d.sede 
join presentacion p on a.presentacion = p.presentacion
{$where} {$group}
EOT;
	}

	function consultaFacturas($args = [])
	{
		$where = '';
		$group = ' group by';
		$select = "";

		if (isset($args['fecha']) && !empty($args['fecha'])) {
			$fecha = $args['fecha'];
			$where .= " and f.fecha_factura <= '{$fecha}'";
		}

		if (in_array($this->tipo, [1, 2])) {
			$group .= " b.articulo";
		}

		if ($this->tipo == 2) {
			$where .= " and date(f.fecha_factura) < '{$args['fdel']}'";
		}

		if ($this->tipo == 3) {
			$where .= " and date(f.fecha_factura) between '{$args['fdel']}' and '{$args['fal']}'";
			$group .= " f.factura, f.fecha_factura, b.articulo, numero_factura";
			$select .= " ,f.numero_factura id,
				2 as tipo,
				1 as bodega,
				3 as tipo_salida,
				f.fecha_factura as fecha,
				'Factura Directa' tipo_movimiento,
				'Factura Directa' nbodega";
		}

		if (isset($args['bodega']) && !empty($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$bod = implode(",", $args['bodega']);
				$where .= " and a.bodega in ({$bod})";
			} else {
				$where .= " and a.bodega = {$args['bodega']}";
			}
		}


		$this->sqlFactura = <<<EOT
select
	sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as cantidad,
	b.articulo  
	{$select}
from detalle_factura a
join articulo b on a.articulo = b.articulo
join categoria_grupo c on c.categoria_grupo = b.categoria_grupo
join categoria d on d.categoria = c.categoria
join factura f on a.factura = f.factura and f.sede = d.sede
join presentacion p on a.presentacion = p.presentacion
left join detalle_factura_detalle_cuenta e on a.detalle_factura = e.detalle_factura
where e.detalle_factura_detalle_cuenta is null and b.mostrar_inventario = 1 
{$where} {$group}
EOT;
	}

	function getExistencias($args = [])
	{
		$this->consultaIngresos($args);
		$this->consultaEgresos($args);
		$this->consultaComandas($args);
		$this->consultaFacturas($args);
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('d.sede', $args['sede']);
			} else {
				$this->db->where('d.sede', $args['sede']);
			}
		}

		if (isset($args['articulo'])) {
			$this->db->where("art.articulo", $args['articulo']);
		}

		if ($this->tipo == 1) {
			$this->db
				->select("
						art.*,
						ifnull(ing.cantidad, 0) as ingresos,
						ifnull(com.cantidad, 0) as comandas,
						ifnull(fac.cantidad, 0) as facturas,
						ifnull(egr.cantidad, 0) as egresos,
						ifnull(egr.cantidad, 0) + ifnull(com.cantidad, 0) + ifnull(fac.cantidad, 0)  as total_egresos,
						(ifnull(ing.cantidad, 0) - ifnull(egr.cantidad, 0) - ifnull(com.cantidad, 0) - ifnull(fac.cantidad, 0)) as existencia
					")
				->join("({$this->sqlIngreso}) ing", "ing.articulo = art.articulo", "left")
				->join("({$this->sqlEgreso}) egr", "egr.articulo = art.articulo", "left")
				->join("({$this->sqlComanda}) com", "com.articulo = art.articulo", "left")
				->join("({$this->sqlFactura}) fac", "fac.articulo = art.articulo", "left");
		} else if ($this->tipo == 2) {
			$this->db
				->select("
						art.articulo, art.descripcion, art.codigo,
						ifnull(ing.cantidad, 0) as ingresos,
						ifnull(egr.cantidad, 0) + ifnull(com.cantidad, 0) + ifnull(fac.cantidad, 0)  as total_egresos,
						(ifnull(ing.cantidad, 0) - ifnull(egr.cantidad, 0) - ifnull(com.cantidad, 0) - ifnull(fac.cantidad, 0)) as existencia
					")
				->join("({$this->sqlIngreso}) ing", "ing.articulo = art.articulo", "left")
				->join("({$this->sqlEgreso}) egr", "egr.articulo = art.articulo", "left")
				->join("({$this->sqlComanda}) com", "com.articulo = art.articulo", "left")
				->join("({$this->sqlFactura}) fac", "fac.articulo = art.articulo", "left");
		} else if ($this->tipo == 3) {
			$this->db
				->select("
						art.articulo, art.descripcion, art.codigo,
						x.*
					")
				->join("(({$this->sqlIngreso})
				 	union all 
				 	({$this->sqlEgreso})
				 	union all 
				 	({$this->sqlComanda})
				 	union all 
				 	({$this->sqlFactura})) x", "x.articulo = art.articulo");
		}

		$qry = $this->db

			->from("articulo art")
			->join("categoria_grupo b", "art.categoria_grupo = b.categoria_grupo")
			->join("categoria d", "d.categoria = b.categoria")
			->where("art.mostrar_inventario", 1)
			->order_by("art.articulo")
			->get();

		if ($qry) {
			return $qry->result();
		}

		return [];
	}

	public function getIngresoDetalle($args = [])
	{
		if (isset($args->fdel) && isset($args->fal)) {
			$this->db
				->where("b.fecha >=", $args->fdel)
				->where("b.fecha <=", $args->fal);
		}

		if (isset($args->sede) && $args->sede) {
			$this->db->where_in("c.sede", $args->sede);
		}

		if (isset($args->bodega) && $args->bodega) {
			$this->db->where_in("b.bodega", $args->bodega);
		}

		if (isset($args->articulo) && $args->articulo) {
			$this->db->where_in("d.codigo", $args->articulo);
		}

		if (isset($args->tipo_ingreso) && $args->tipo_ingreso) {
			$this->db->where_in("b.tipo_movimiento", $args->tipo_ingreso);
		}

		if (isset($args->proveedor) && $args->proveedor) {
			$this->db->where_in("e.proveedor", $args->proveedor);
		}

		if (verPropiedad($args, "estatus_movimiento")) {
			$this->db->where("b.estatus_movimiento", $args->estatus_movimiento);
		}

		if ($args->reporte == 1) {
			$this->db->order_by("e.razon_social", "asc");
		} else if ($args->reporte == 2) {
			$this->db->order_by("d.descripcion", "asc");
		}

		if ($args->reporte == 3) {
			$this->db
				->select("
				 	f.descripcion as subcategoria,
				 	g.descripcion as categoria,
				 	d.descripcion as producto,
				 	a.precio_unitario as ultimo_costo,
				 	avg(a.precio_unitario) as costo_promedio,
				 	ifnull(stddev_samp(a.precio_unitario),0) as desviacion
				 ")
				->order_by("g.descripcion, f.descripcion, a.articulo")
				->group_by("d.codigo");

			if (isset($args->variacion) && $args->variacion) {
				$this->db->having("ifnull(stddev_samp(a.precio_unitario),0) >= ", $args->variacion);
			}
		} else {
			$this->db->select("
				b.fecha, 
				b.ingreso as num_documento, 
				c.descripcion as bodega,
				d.descripcion as producto,
				a.cantidad, 
				a.precio_unitario as costo,
				e.razon_social as nproveedor,
				a.precio_total as costo_total,
				h.descripcion as ntipo_movimiento,
				i.descripcion as nestatus
			");
		}

		$this->db
			->from("ingreso_detalle a")
			->join("ingreso b", "b.ingreso = a.ingreso")
			->join("bodega c", "c.bodega = b.bodega")
			->join("articulo d", "d.articulo = a.articulo")
			->join("proveedor e", "e.proveedor = b.proveedor")
			->join("categoria_grupo f", "f.categoria_grupo = d.categoria_grupo")
			->join("categoria g", "g.categoria = f.categoria")
			->join("tipo_movimiento h", "h.tipo_movimiento = b.tipo_movimiento")
			->join("estatus_movimiento i", "i.estatus_movimiento = b.estatus_movimiento");

		$this->db->order_by("b.fecha", "asc")
			->order_by("b.ingreso", "desc");

		$tmp = $this->db->get();

		if ($tmp->num_rows() > 0) {
			return $tmp->result();
		}

		return [];
	}

	function get_info_articulos_inventario($args = [])
	{
		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('c.sede', $args['sede']);
		}

		if (isset($args['categoria']) && (int)$args['categoria'] > 0) {
			$this->db->where('c.categoria', $args['categoria']);
		}

		if (isset($args['categoria_grupo']) && (int)$args['categoria_grupo'] > 0) {
			$this->db->where('a.categoria_grupo', $args['categoria_grupo']);
		}

		return $this->db
			->select('c.sede as idsede, f.nombre as sede, c.categoria as idcategoria, c.descripcion as categoria, a.categoria_grupo as idsubcategoria, b.descripcion as subcategoria, a.articulo, a.descripcion, a.codigo, a.presentacion as idpresentacion, d.descripcion as presentacion, a.presentacion_reporte as idpresentacion_reporte, e.descripcion as presentacion_reporte')
			->join('categoria_grupo b', 'b.categoria_grupo = a.categoria_grupo')
			->join('categoria c', 'c.categoria = b.categoria')
			->join('presentacion d', 'd.presentacion = a.presentacion')
			->join('presentacion e', 'e.presentacion = a.presentacion_reporte')
			->join('sede f', 'f.sede = c.sede')
			->where('mostrar_inventario', 1)
			->order_by('f.nombre, c.descripcion, b.descripcion, a.descripcion')
			->get('articulo a')
			->result();
	}

	function get_dump_ingresos($args = [])
	{
		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('c.sede', $args['sede']);
		}

		if (isset($args['fdel'])) {
			$this->db->where('a.fecha >=', $args['fdel']);
		}

		if (isset($args['fal'])) {
			$this->db->where('a.fecha <=', $args['fal']);
		}

		if (isset($args['filtro']) && !empty(trim($args['filtro']))) {
			$filtro = str_replace(' ', '%', trim($args['filtro']));
			$this->db->where("(b.descripcion LIKE '%{$filtro}%' OR c.descripcion LIKE '%{$filtro}%' OR d.usrname LIKE '%{$filtro}%' OR f.descripcion LIKE '%{$filtro}%' OR a.comentario LIKE '%{$filtro}%' OR e.razon_social LIKE '%{$filtro}%')", NULL, FALSE);
		}

		$ingresos = $this->db
			->select('a.ingreso, b.descripcion as tipo_movimiento, DATE_FORMAT(a.fecha, "%d/%m/%Y") AS fecha, DATE_FORMAT(a.creacion, "%d/%m/%Y %H:%i:%s") AS creacion, c.descripcion AS bodega, d.usrname AS usuario, f.descripcion as bodega_origen, a.comentario, e.razon_social AS proveedor')
			->join('tipo_movimiento b', 'b.tipo_movimiento = a.tipo_movimiento')
			->join('bodega c', 'c.bodega = a.bodega')
			->join('usuario d', 'd.usuario = a.usuario')
			->join('proveedor e', 'e.proveedor = a.proveedor')
			->join('bodega f', 'f.bodega = a.bodega_origen', 'left')
			->order_by('a.ingreso')
			->get('ingreso a')
			->result();

		foreach ($ingresos as $ingreso) {
			$ingreso->detalle = $this->db
				->select('b.descripcion AS articulo, c.descripcion AS presentacion, a.cantidad, ROUND((a.precio_total + a.precio_costo_iva) / a.cantidad, 2) AS costo_unitario_con_iva, (a.precio_total + a.precio_costo_iva) AS costo_total_con_iva')
				->join('articulo b', 'b.articulo = a.articulo')
				->join('presentacion c', 'c.presentacion = a.presentacion')
				->where('a.ingreso', $ingreso->ingreso)
				->order_by('b.descripcion')
				->get('ingreso_detalle a')
				->result();
		}

		return $ingresos;
	}

	function get_dump_egresos($args = [])
	{
		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('c.sede', $args['sede']);
		}

		if (isset($args['fdel'])) {
			$this->db->where('a.fecha >=', $args['fdel']);
		}

		if (isset($args['fal'])) {
			$this->db->where('a.fecha <=', $args['fal']);
		}

		if (isset($args['filtro']) && !empty(trim($args['filtro']))) {
			$filtro = str_replace(' ', '%', trim($args['filtro']));
			$this->db->where("(b.descripcion LIKE '%{$filtro}%' OR c.descripcion LIKE '%{$filtro}%' OR d.usrname LIKE '%{$filtro}%')", NULL, FALSE);
		}

		$egresos = $this->db
			->select('a.egreso, b.descripcion as tipo_movimiento, DATE_FORMAT(a.fecha, "%d/%m/%Y") AS fecha, DATE_FORMAT(a.creacion, "%d/%m/%Y %H:%i:%s") AS creacion, c.descripcion AS bodega, d.usrname AS usuario')
			->join('tipo_movimiento b', 'b.tipo_movimiento = a.tipo_movimiento')
			->join('bodega c', 'c.bodega = a.bodega')
			->join('usuario d', 'd.usuario = a.usuario')
			->order_by('a.egreso')
			->get('egreso a')
			->result();

		foreach ($egresos as $egreso) {
			$egreso->detalle = $this->db
				->select('b.descripcion AS articulo, c.descripcion AS presentacion, a.cantidad, a.precio_unitario AS costo_unitario, a.precio_total AS costo_total')
				->join('articulo b', 'b.articulo = a.articulo')
				->join('presentacion c', 'c.presentacion = a.presentacion')
				->where('a.egreso', $egreso->egreso)
				->order_by('b.descripcion')
				->get('egreso_detalle a')
				->result();
		}

		return $egresos;
	}

	function get_ingreso($idIngreso)
	{
		$campos = "a.ingreso, b.descripcion AS tipo_movimiento, DATE_FORMAT(a.fecha, '%d/%m/%Y') AS fecha, DATE_FORMAT(a.creacion, '%d/%m/%Y %H:%i:%s') AS creacion, c.descripcion AS bodega, ";
		$campos.= "c.merma, d.usrname AS usuario, h.descripcion as bodega_origen, a.comentario, e.razon_social as proveedor, IF(a.ajuste = 0, 'No', 'Sí') AS ajuste, f.nombre AS sede, ";
		$campos.= "f.alias AS alias_sede, g.nombre AS empresa, i.descripcion as nestatus";
		$ingreso = $this->db		
			->select($campos)
			->join('tipo_movimiento b', 'b.tipo_movimiento = a.tipo_movimiento')
			->join('bodega c', 'c.bodega = a.bodega')
			->join('usuario d', 'd.usuario = a.usuario')
			->join('proveedor e', 'e.proveedor = a.proveedor')
			->join('sede f', 'f.sede = c.sede')
			->join('empresa g', 'g.empresa = f.empresa')
			->join('estatus_movimiento i', 'i.estatus_movimiento = a.estatus_movimiento')
			->join('bodega h', 'h.bodega = a.bodega_origen', 'left')
			->where('a.ingreso', $idIngreso)
			->get('ingreso a')
			->row();

		if ($ingreso) {
			$ingreso->documento = $this->db
				->select('a.documento, b.descripcion AS tipo, a.serie, a.numero, a.fecha, c.descripcion AS tipo_compra')
				->join('documento_tipo b', 'b.documento_tipo = a.documento_tipo')
				->join('tipo_compra_venta c', 'c.tipo_compra_venta = a.tipo_compra_venta')
				->where('a.ingreso', $idIngreso)
				->get('documento a')
				->row();

			$ingreso->detalle = $this->db
				->select('a.ingreso_detalle, a.ingreso, b.descripcion AS articulo, c.descripcion AS presentacion, a.cantidad, round((a.precio_total + a.precio_costo_iva) / a.cantidad, 4) as costo_unitario_con_iva, (a.precio_total + a.precio_costo_iva) AS costo_total_con_iva, b.codigo')
				->join('articulo b', 'b.articulo = a.articulo')
				->join('presentacion c', 'c.presentacion = a.presentacion')
				->where('a.ingreso', $idIngreso)
				->order_by('b.descripcion')
				->get('ingreso_detalle a')
				->result();
		}
		return $ingreso;
	}

	function get_egreso($idEgreso)
	{
		$campos = "a.egreso, b.descripcion AS tipo_movimiento, c.descripcion AS bodega, DATE_FORMAT(a.fecha, '%d/%m/%Y') AS fecha, DATE_FORMAT(a.creacion, '%d/%m/%Y %H:%i:%s') AS creacion, ";
		$campos.= "d.usrname AS usuario, IF(a.estatus_movimiento = 1, 'NO CONFIRMADO', 'CONFIRMADO') AS estatus_movimiento, IF(a.traslado = 0, 'No', 'Sí') AS traslado, ";
		$campos.= "IF(a.ajuste = 0, 'No', 'Sí') AS ajuste, e.nombre AS sede, e.alias AS alias_sede, f.nombre AS empresa, g.descripcion AS bodega_destino, a.comentario";

		$egreso = $this->db
			->select($campos)
			->join('tipo_movimiento b', 'b.tipo_movimiento = a.tipo_movimiento')
			->join('bodega c', 'c.bodega = a.bodega')
			->join('usuario d', 'd.usuario = a.usuario')
			->join('sede e', 'e.sede = c.sede')
			->join('empresa f', 'f.empresa = e.empresa')
			->join('bodega g', 'g.bodega = a.bodega_destino', 'left')
			->where('a.egreso', $idEgreso)
			->get('egreso a')
			->row();
		
		if ($egreso) {
			$egreso->detalle = $this->db
				->select('a.egreso_detalle, a.egreso, b.codigo, b.descripcion AS articulo, c.descripcion AS presentacion, a.cantidad, a.precio_unitario AS costo_unitario, a.precio_total AS costo_total')
				->join('articulo b', 'b.articulo = a.articulo')
				->join('presentacion c', 'c.presentacion = a.presentacion')
				->where('a.egreso', $idEgreso)
				->order_by('b.descripcion')
				->get('egreso_detalle a')
				->result();
		}

		return $egreso;
	}

	function get_lista_pedido_productos($args = [])
	{
		$queryCompras = 'SELECT a.articulo, a.descripcion AS descripcion_articulo, a.presentacion, b.descripcion AS descripcion_presentacion, ';
		$queryCompras.= 'IF(a.presentacion = e.presentacion, a.stock_minimo, IF(g.cantidad <> 0, ROUND(a.stock_minimo * b.cantidad / g.cantidad, 2), a.stock_minimo)) AS minimo, ';
		$queryCompras.= 'IF(a.presentacion = e.presentacion, a.stock_maximo, IF(g.cantidad <> 0, ROUND(a.stock_maximo * b.cantidad / g.cantidad, 2), a.stock_maximo)) AS maximo, ';
		$queryCompras.= 'IFNULL(e.ultimo_proveedor, 0) AS ultimo_proveedor, IFNULL(f.razon_social, "SIN PROVEEDOR") AS proveedor, IFNULL(e.presentacion, 0) AS ultima_presentacion, ';
		$queryCompras.= 'g.descripcion AS descripcion_ultima_presentacion, e.ultimo_costo, b.cantidad AS cantidad_presentacion_reporte, ';
		$queryCompras.= 'IFNULL(g.cantidad, 0) AS cantidad_presentacion_ultima_compra, NULL AS existencia, NULL AS a_pedir, 1 AS mostrar ';
		$queryCompras.= 'FROM articulo a INNER JOIN presentacion b ON b.presentacion = a.presentacion_reporte INNER JOIN categoria_grupo c ON c.categoria_grupo = a.categoria_grupo ';
		$queryCompras.= 'INNER JOIN categoria d ON d.categoria = c.categoria LEFT JOIN articulo_ultima_compra e ON a.articulo = e.articulo LEFT JOIN proveedor f ON f.proveedor = e.ultimo_proveedor ';
		$queryCompras.= 'LEFT JOIN presentacion g ON g.presentacion = e.presentacion ';
		$queryCompras.= "WHERE a.mostrar_inventario = 1 AND d.sede = {$args['sede']} ";
		$queryCompras.= 'ORDER BY f.razon_social, a.descripcion';

		$query = "SELECT z.ultimo_proveedor, z.proveedor FROM ({$queryCompras}) z WHERE z.ultimo_proveedor <> 0 GROUP BY z.ultimo_proveedor ";
		$query.= 'ORDER BY z.proveedor, z.descripcion_articulo, z.descripcion_presentacion, z.descripcion_ultima_presentacion';
		$conProveedor = $this->db->query($query)->result();

		$query = "SELECT z.ultimo_proveedor, z.proveedor FROM ({$queryCompras}) z WHERE z.ultimo_proveedor = 0 GROUP BY z.ultimo_proveedor ";
		$query.= 'ORDER BY z.descripcion_articulo, z.descripcion_presentacion';
		$sinProveedor = $this->db->query($query)->result();

		$proveedores = [];
		if(count($conProveedor) > 0 && count($sinProveedor) > 0) {
			$proveedores = array_merge($conProveedor, $sinProveedor);
		} else if(count($conProveedor) > 0) {
			$proveedores = $conProveedor;
		} else if(count($sinProveedor) > 0) {
			$proveedores = $sinProveedor;
		}

		foreach($proveedores as $prov) {
			$query = "SELECT z.* FROM({$queryCompras}) z WHERE z.ultimo_proveedor = $prov->ultimo_proveedor ORDER BY z.descripcion_articulo";
			$prov->productos = $this->db->query($query)->result();
		}

		return $proveedores;
	}

	function get_compra($idCompra)
	{
		$campos = 'a.orden_compra, c.nombre AS empresa, b.nombre AS sede, d.razon_social AS proveedor, DATE_FORMAT(a.fecha_orden, "%d/%m/%Y") AS fecha_orden, ';
		$campos.= 'DATE_FORMAT(a.fecha, "%d/%m/%Y %H:%i:%s") AS fhcreacion, e.usrname AS usuario, a.notas, f.descripcion AS estatus, g.ingreso, b.alias AS alias_sede';
		$oc = $this->db
			->select($campos)
			->join('sede b', 'b.sede = a.sede')
			->join('empresa c', 'c.empresa = b.empresa')
			->join('proveedor d', 'd.proveedor = a.proveedor')
			->join('usuario e', 'e.usuario = a.usuario')
			->join('estatus_movimiento f', 'f.estatus_movimiento = a.estatus_movimiento')
			->join('ingreso_has_orden_compra g', 'a.orden_compra = g.orden_compra', 'left')
			->where('a.orden_compra', $idCompra)
			->get('orden_compra a')
			->row();

		if($oc) {
			$campos = 'b.codigo, b.descripcion AS articulo, c.descripcion AS presentacion, a.cantidad, a.monto, a.total';
			$oc->detalle = $this->db
				->select($campos)
				->join('articulo b', 'b.articulo = a.articulo')
				->join('presentacion c', 'c.presentacion = a.presentacion')
				->where('a.orden_compra', $idCompra)
				->get('orden_compra_detalle a')
				->result();
		}
		return $oc;
	}

	public function get_lista_compra($args = [])
	{
		if (verDato($args, "fdel")) {
			$this->db->where("date(fecha) >= ", $args["fdel"]);
		}

		if (verDato($args, "fal")) {
			$this->db->where("date(fecha) <= ", $args["fal"]);
		}

		if (verDato($args, "sede")) {
			$this->db->where("sede", $args["sede"]);
		}

		if (isset($args["_select"])) {
			$this->db->select($args["_select"]);
		}

		return $this->db
		->from("orden_compra")
		->order_by("fecha")
		->get()
		->result();
	}

	public function getResumenEgreso($args = [])
	{
		if (verDato($args, "fdel")) {
			$this->db->where("date(d.fecha) >=", $args["fdel"]);
		}

		if (verDato($args, "fal")) {
			$this->db->where("date(d.fecha) <=", $args["fal"]);
		}

		if (verDato($args, "bodega")) {
			$this->db->where("d.bodega", $args["bodega"]);
		}

		if (verDato($args, "tipo_egreso")) {
			$this->db->where("d.tipo_movimiento", $args["tipo_egreso"]);
		}

		if (verDato($args, "estatus_movimiento")) {
			$this->db->where("d.estatus_movimiento", $args["estatus_movimiento"]);
		}

		return $this->db
		->select("
			d.fecha,
			d.egreso,
			e.descripcion as nmovimiento,
			c.descripcion as npresentacion,
			ifnull(l.descripcion, m.descripcion) as nbodega,
			b.codigo as carticulo,
			b.descripcion as narticulo,
			a.cantidad,
			a.precio_total,
			d.comentario,
			g.descripcion as nestatus
		")
		->from("egreso_detalle a")
		->join("articulo b", "b.articulo = a.articulo")
		->join("presentacion c", "c.presentacion = a.presentacion")
		->join("egreso d", "d.egreso = a.egreso")
		->join("tipo_movimiento e", "e.tipo_movimiento = d.tipo_movimiento")
		->join("bodega f", "f.bodega = d.bodega")
		->join("estatus_movimiento g", "g.estatus_movimiento = d.estatus_movimiento")
		->join("usuario h", "h.usuario = d.usuario")
		->join("traslado_detalle i", "i.egreso_detalle = a.egreso_detalle", "left")
		->join("ingreso_detalle j", "j.ingreso_detalle = i.ingreso_detalle", "left")
		->join("ingreso k", "k.ingreso = j.ingreso", "left")
		->join("bodega l", "l.bodega = k.bodega", "left")
		->join("bodega m", "m.bodega = d.bodega_destino", "left")
		->order_by("d.fecha, d.egreso")
		->get()
		->result();
	}

	public function get_lista_ingreso($args = [])
	{
		if (verDato($args, "fdel")) {
			$this->db->where("date(a.fecha) >= ", $args["fdel"]);
		}

		if (verDato($args, "fal")) {
			$this->db->where("date(a.fecha) <= ", $args["fal"]);
		}

		if (verDato($args, "tipo_ingreso")) {
			$this->db->where("a.tipo_movimiento", $args["tipo_ingreso"]);
		}

		if (verDato($args, "bodega")) {
			$this->db->where("a.bodega", $args["bodega"]);
		}

		if (verDato($args, "estatus_movimiento")) {
			$this->db->where("a.estatus_movimiento", $args["estatus_movimiento"]);
		}

		if (verDato($args, "sede")) {
			if (is_array($args["sede"])) {
				$this->db->where_in("b.sede", $args["sede"]);
			} else {
				$this->db->where("b.sede", $args["sede"]);
			}
		}

		if (isset($args["_select"])) {
			$this->db->select($args["_select"]);
		}		

		return $this->db
		->from("ingreso a")
		->join("bodega b", "b.bodega = a.bodega")
		->order_by("fecha")
		->get()
		->result();
	}

	public function getCatalogoArticulo($args=[])
	{
		if (verDato($args, "categoria_grupo")) {
			$this->db->where("a.categoria_grupo", $args["categoria_grupo"]);
		}

		$this->db
		->select("
			f.nombre as sede,
			f.alias as sede_alias,
			c.categoria as IdCategoria,
			c.descripcion as Categoria,
			b.categoria_grupo as IdSubCategoria,
			b.descripcion as SubCategoria,
			a.articulo as IdArticulo,
			a.descripcion as Articulo,
			d.presentacion as IdPresentacion,
			d.descripcion as presentacion,
			e.presentacion as IdPresentacionReporte,
			e.descripcion as PresentacionReporte,
			IF(a.produccion = 0, 'No', 'Sí') as EsProduccion,
			a.codigo as Codigo,
			IF(a.mostrar_inventario = 0, 'No', 'Sí') as EsDeInventario,
			IF(a.mostrar_pos = 0, 'No', 'Sí') as EsDePOS,
			a.rendimiento,
			IF(a.esreceta = 0, 'No', 'Sí') as EsReceta,
			IF(a.esextra = 0, 'No', 'Sí') as EsExtra,
			a.stock_minimo as StockMinimo,
			a.stock_maximo as StockMaximo,
			g.descripcion_interna as DescripcionInternaImpuestoEspecial,
			g.descripcion as DescripcionImpuestoEspecialSAT,
			g.codigo_sat as CodigoSATImpuestoEspecial,
			g.porcentaje as PorcentajeImpuestoEspecial
		")
		->from("articulo a")
		->join("categoria_grupo b", "b.categoria_grupo = a.categoria_grupo")
		->join("categoria c", "c.categoria = b.categoria")
		->join("presentacion d", "d.presentacion = a.presentacion")
		->join("presentacion e", "e.presentacion = a.presentacion_reporte")
		->join("sede f", "f.sede = c.sede")
		->join("impuesto_especial g", "g.impuesto_especial = a.impuesto_especial", "left");
		

		if (verDato($args, "_ucompra") == 1) {
			$this->db->select("
				i.razon_social AS UltimoProveedorCompra, 
				j.descripcion AS UltimaPresentacionCompra, 
				h.ultimo_costo
			");

			$this->db
			->join("articulo_ultima_compra h", "h.articulo = a.articulo", "left")
			->join("proveedor i", "i.proveedor = h.ultimo_proveedor", "left")
			->join("presentacion j", "j.presentacion = h.presentacion", "left");

			$this->db->where("a.mostrar_inventario", 1);
		}


		return $this->db
		->order_by("f.nombre , f.alias , c.descripcion , b.descripcion , a.descripcion")
		->get()
		->result();
	}

	public function getUsoIngrediente($args=[])
	{
		if (verDato($args, "articulo")) {
			$this->db->where("a.articulo", $args["articulo"]);
		}

		return $this->db
		->select("
			b.codigo,
			b.descripcion as narticulo,
			a.cantidad as cantidad_uso,
			c.descripcion as nmedida
		")
		->from("articulo_detalle a")
		->join("articulo b", "b.articulo = a.receta")
		->join("medida c", "c.medida = a.medida")
		->where("a.anulado", 0)
		->order_by("b.descripcion")
		->get()
		->result();
	}

	public function getResumenConsumo($args=[])
	{
		if (verDato($args, "fdel")) {
			$this->db->where("date(b.fhcreacion) >=", $args["fdel"]);
		}

		if (verDato($args, "fal")) {
			$this->db->where("date(b.fhcreacion) <=", $args["fal"]);
		}

		if (verDato($args, "sede")) {
			$this->db->where("b.sede", $args["sede"]);
		}

		if (verDato($args, "categoria_grupo")) {
			$this->db->where("c.categoria_grupo", $args["categoria_grupo"]);
		}

		return $this->db
		->select("
			a.articulo,
			sum(ifnull(a.cantidad, 0)) as cantidad,
			c.codigo,c.descripcion as narticulo,
			d.descripcion as ndescripcion
		")
		->from("detalle_comanda a")
		->join("comanda b", "b.comanda = a.comanda")
		->join("articulo c", "c.articulo = a.articulo")
		->join("presentacion d", "d.presentacion = c.presentacion")
		->group_by("a.articulo")
		->order_by("c.descripcion")
		->get()
		->result();
	}
}

/* End of file Reporte_model.php */
/* Location: ./application/wms/models/Reporte_model.php */