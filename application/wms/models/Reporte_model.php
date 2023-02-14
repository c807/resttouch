<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reporte_model extends CI_Model {

	private $sqlIngreso;	
	private $sqlEgreso;
	private $sqlComanda;
	private $sqlFactura;
	private $filtros = [];
	private $tipo = 1;

	public function __construct($args=[])
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
		$where = 'where b.mostrar_inventario = 1 and e.estatus_movimiento = 2 ';
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
	sum(ifnull(a.cantidad, 0) * p.cantidad) as cantidad,
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
		$where = 'where b.mostrar_inventario = 1 and e.estatus_movimiento = 2 ';
		$group = 'group by ';
		$select = "";

		if (isset($args['fecha']) && !empty($args['fecha'])) {
			$fecha = $args['fecha'];
			$where .= " date(e.fecha) <= '{$fecha}'";
		}

		if (in_array($this->tipo, [1,2])) {
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
	sum(ifnull(a.cantidad, 0) * p.cantidad) as cantidad,
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
			$where .= " date(f.inicio) <= '{$fecha}'";
		}

		if (in_array($this->tipo, [1,2])) {
			$group .= " b.articulo";
		}

		if ($this->tipo == 2) {
			$where .= " date(f.fecha) < '{$args['fdel']}'";
		}

		if ($this->tipo == 3) {
			$where .= " date(f.fecha) between '{$args['fdel']}' and '{$args['fal']}'";
			$group .= " e.comanda, f.fecha, b.articulo";
			$select .= " ,e.comanda id,
				2 as tipo,
				1 as bodega,
				f.fecha,
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
	sum(ifnull(a.cantidad_inventario, ifnull(a.cantidad, 0)) * p.cantidad) as cantidad,
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
		$select= "";

		if (isset($args['fecha']) && !empty($args['fecha'])) {
			$fecha = $args['fecha'];
			$where .= " and f.fecha_factura <= '{$fecha}'";
		}

		if (in_array($this->tipo, [1,2])) {
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
	sum(ifnull(a.cantidad_inventario, ifnull(a.cantidad, 0)) * p.cantidad) as cantidad,
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

		} else if($this->tipo == 2){
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
		} else if($this->tipo == 3) {
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
}

/* End of file Reporte_model.php */
/* Location: ./application/wms/models/Reporte_model.php */