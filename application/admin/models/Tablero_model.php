<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tablero_model extends General_model
{


	public function getServiciosSinFactura($args = []) {
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('DATE(a.fhcreacion) >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('DATE(a.fhcreacion) <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('a.sede', $args['sede']);
			} else {
				$this->db->where('a.sede', $args['sede']);
			}
		}

		return $this->db
			->select("d.total, 'B' AS bien_servicio, DATE(a.fhcreacion) AS fecha_factura, monthname(a.fhcreacion) as mes, dayname(a.fhcreacion) as dia, 
			e.descripcion, f.descripcion as grupo, g.nombre as sede, 'Comanda' as operacion, IF(a.domicilio = 1, 'SI', 'NO') as domicilio, i.descripcion as turno")
			->from('comanda a')
			->join('cuenta b', 'a.comanda = b.cuenta')
			->join('cuenta_forma_pago c', 'b.cuenta = c.cuenta')
			->join('detalle_comanda d', 'a.comanda = d.comanda')
			->join('articulo e', 'e.articulo = d.articulo')
			->join('categoria_grupo f', 'f.categoria_grupo = e.categoria_grupo')
			->join('sede g', 'g.sede = a.sede')
			->join('turno h', 'h.turno = a.turno')
			->join('turno_tipo i', 'i.turno_tipo = h.turno_tipo')
			->join('forma_pago j', 'j.forma_pago = c.forma_pago')
			->where('d.detalle_comanda_id IS NULL')
			->where('j.sinfactura', 1)
			->get()
			->result();
	}

	public function getServiciosFacturados($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('b.fecha_factura >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('b.fecha_factura <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('b.sede', $args['sede']);
			} else {
				$this->db->where('b.sede', $args['sede']);
			}
		}

		$servFact = $this->db
			->select("
			(a.total-a.descuento) as total, 
		    a.bien_servicio,
		    b.fecha_factura,
		    monthname(b.fecha_factura) as mes,
		    dayname(b.fecha_factura) as dia,
		    c.descripcion,
		    d.descripcion as grupo,
		    e.nombre as sede,
		    if(f.detalle_factura is null, 'Manual','Comanda') as operacion,
		    if(i.domicilio=1,'SI','NO') as domicilio,
		    k.descripcion as turno")
			->from("detalle_factura a")
			->join("factura b", "b.factura = a.factura")
			->join("articulo c", "c.articulo = a.articulo")
			->join("categoria_grupo d", "d.categoria_grupo = c.categoria_grupo")
			->join("sede e", "e.sede = b.sede")
			->join("detalle_factura_detalle_cuenta f", "f.detalle_factura = a.detalle_factura", "left")
			->join("detalle_cuenta g", "g.detalle_cuenta = f.detalle_cuenta", "left")
			->join("detalle_comanda h", "h.detalle_comanda = g.detalle_comanda", "left")
			->join("comanda i", "i.comanda = h.comanda", "left")
			->join("turno j", "j.turno = i.turno", "left")
			->join("turno_tipo k", "k.turno_tipo = j.turno_tipo", "left")
			->where("b.fel_uuid is not null")
			->where("b.fel_uuid_anulacion is null")
			->get()
			->result();
		
		$q = $this->db->last_query();

		$servSinFact = $this->getServiciosSinFactura($args);

		return array_merge($servFact, $servSinFact);
	}

	private function getVentasPorDiaSinFactura($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('DATE(a.fhcreacion) >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('DATE(a.fhcreacion) <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('a.sede', $args['sede']);
			} else {
				$this->db->where('a.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('a.sede');
		}

		$vdsf = $this->db
			->select('DATE_FORMAT(DATE(a.fhcreacion), "%d/%m/%Y") AS fecha, SUM(d.monto) AS venta, a.sede')
			->from('comanda a')
			->join('turno b', 'b.turno = a.turno')
			->join('cuenta c', 'a.comanda = c.comanda')
			->join('cuenta_forma_pago d', 'c.cuenta = d.cuenta')
			->join('forma_pago e', 'e.forma_pago = d.forma_pago')
			->where('e.sinfactura', 1)
			->where('e.descuento', 0)
			->group_by('DATE(a.fhcreacion)')
			->order_by('DATE(a.fhcreacion)')
			->get()
			->result();

		$q = $this->db->last_query();

		return $vdsf;
	}

	public function getVentasPorDia($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('a.fecha_factura >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('a.fecha_factura <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('a.sede', $args['sede']);
			} else {
				$this->db->where('a.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('a.sede');
		}	

		$facturados = $this->db
			->select('
				DATE_FORMAT(a.fecha_factura, "%d/%m/%Y") AS fecha, 
				SUM(b.total - b.descuento) AS venta,
				a.sede')
			->from('factura a')
			->join('detalle_factura b', 'a.factura = b.factura')
			->where('a.fel_uuid IS NOT NULL')
			->where('a.fel_uuid_anulacion IS NULL')
			->group_by('a.fecha_factura')
			->order_by('a.fecha_factura')
			->get()
			->result();
		
		$q = $this->db->last_query();

		$sinFactura = $this->getVentasPorDiaSinFactura($args);	

		if (count($facturados) > 0 && count($sinFactura) > 0) {
			foreach($sinFactura as $sf) 
			{	
				$existente = false;
				foreach($facturados as $f)
				{
					if($f->fecha === $sf->fecha && (int)$f->sede === (int)$sf->sede)
					{
						$f->venta = (float)$f->venta + (float)$sf->venta;
						$existente = true;
					}
				}
				if (!$existente) 
				{
					$facturados[] = $sf;
				}
			}
			$facturados = ordenar_array_objetos($facturados, 'fecha');
		} else if (count($facturados) === 0 && count($sinFactura) > 0)
		{
			$facturados = $sinFactura;
		}

		return $facturados;
	}

	public function getVentasPorCategoria($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('a.fecha_factura >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('a.fecha_factura <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('a.sede', $args['sede']);
			} else {
				$this->db->where('a.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('a.sede');
		}

		return $this->db
			->select('
				CONCAT(f.nombre, "-", e.descripcion) AS categoria, 
				SUM(b.total - b.descuento) AS venta,
				a.sede')
			->from('factura a')
			->join('detalle_factura b', 'a.factura = b.factura')
			->join('articulo c', 'c.articulo = b.articulo')
			->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo')
			->join('categoria e', 'e.categoria = d.categoria')
			->join('sede f', 'f.sede = e.sede')
			->where('a.fel_uuid IS NOT NULL')
			->where('a.fel_uuid_anulacion IS NULL')
			->group_by('f.nombre, e.descripcion')
			->order_by('f.nombre, e.descripcion')
			->get()
			->result();
	}

	public function getVentasPorTurno($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('f.fecha_factura >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('f.fecha_factura <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('a.sede', $args['sede']);
			} else {
				$this->db->where('a.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('a.sede');
		}

		return $this->db
			->select('h.descripcion AS turno, SUM(e.total - e.descuento) AS venta, a.sede')
			->from('comanda a')
			->join('detalle_comanda b', 'a.comanda = b.comanda')
			->join('detalle_cuenta c', 'b.detalle_comanda = c.detalle_comanda')
			->join('detalle_factura_detalle_cuenta d', 'c.detalle_cuenta = d.detalle_cuenta')
			->join('detalle_factura e', 'e.detalle_factura = d.detalle_factura')
			->join('factura f', 'f.factura = e.factura')
			->join('turno g', 'g.turno = a.turno')
			->join('turno_tipo h', 'h.turno_tipo = g.turno_tipo')
			->where('f.fel_uuid IS NOT NULL')
			->where('f.fel_uuid_anulacion IS NULL')
			->group_by('h.descripcion')
			->order_by('h.descripcion')
			->get()
			->result();
	}

	public function getVentasPorMesero($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('f.fecha_factura >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('f.fecha_factura <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('a.sede', $args['sede']);
			} else {
				$this->db->where('a.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('a.sede');
		}

		return $this->db
			->select(
				'TRIM(CONCAT(IFNULL(g.nombres, ""), " ", IFNULL(g.apellidos, ""))) AS mesero, 
				SUM(e.total - e.descuento + ifnull(e.valor_impuesto_especial, 0)) AS venta,
				a.sede')
			->from('comanda a')
			->join('detalle_comanda b', 'a.comanda = b.comanda')
			->join('detalle_cuenta c', 'b.detalle_comanda = c.detalle_comanda')
			->join('detalle_factura_detalle_cuenta d', 'c.detalle_cuenta = d.detalle_cuenta')
			->join('detalle_factura e', 'e.detalle_factura = d.detalle_factura')
			->join('factura f', 'f.factura = e.factura')
			->join('usuario g', 'g.usuario = a.mesero')			
			->where('f.fel_uuid IS NOT NULL')
			->where('f.fel_uuid_anulacion IS NULL')
			->group_by('g.usuario')
			->order_by('venta', "desc")
			->get()
			->result();
	}

	public function agruparDatos($datos, $grupo=1)
	{
		$res = [];
		foreach ($datos as $row) {
			if ($grupo == 2) {
				if (isset($res[$row->sede])) {
					$res[$row->sede]["datos"][] = $row;
				} else {
					$tmp = $this->db
						 		->where("sede", $row->sede)
						 		->get("sede")
						 		->row();

					$res[$row->sede] = [
						"nombre" => $tmp->nombre,
						"datos" => [$row]
					];
				}
			} else {
				if (isset($res[1])) {
					$res[1]["datos"][] = $row;
				} else {

					$res[1] = [
						"nombre" => "Ventas",
						"datos" => [$row]
					];
				}
			}
		}

		return array_values($res);
	}
}

/* End of file Tipo_usuario_model.php */
/* Location: ./application/admin/models/Tipo_usuario_model.php */