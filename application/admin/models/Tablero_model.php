<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tablero_model extends General_model
{


	public function getServiciosSinFactura($args = []) {
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('DATE(f.fhcreacion) >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('DATE(f.fhcreacion) <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		return $this->db
			->select("e.total, 'B' AS bien_servicio, f.fhcreacion, HOUR(f.fhcreacion) AS hora, DATE(f.fhcreacion) AS fecha_factura, MONTHNAME(f.fhcreacion) AS mes, 
					  CONCAT(YEAR(f.fhcreacion), '-', WEEK(f.fhcreacion)) AS semana, CONCAT(DAYOFWEEK(f.fhcreacion), '-', DAYNAME(f.fhcreacion)) as dia, g.descripcion, 
					  h.descripcion AS grupo, i.nombre AS sede, 'Comanda' AS operacion, IF(f.domicilio = 1, 'SI', 'NO') AS domicilio, k.descripcion AS turno, 
					  CONCAT(mr.nombres, ' ', mr.apellidos) AS nombre_mesero, f.comanda")
			->from('cuenta a')
			->join('cuenta_forma_pago b', 'a.cuenta = b.cuenta')
			->join('forma_pago c', 'c.forma_pago = b.forma_pago')
			->join('detalle_cuenta d', 'a.cuenta = d.cuenta_cuenta')
			->join('detalle_comanda e', 'e.detalle_comanda = d.detalle_comanda')
			->join('comanda f', 'f.comanda = e.comanda')
			->join('articulo g', 'g.articulo = e.articulo')
			->join('categoria_grupo h', 'h.categoria_grupo = g.categoria_grupo')
			->join('sede i', 'i.sede = f.sede')
			->join('turno j', 'j.turno = f.turno')
			->join('turno_tipo k', 'k.turno_tipo = j.turno_tipo')
			/* Mesero */ 
			->join('usuario mr', 'mr.usuario = f.mesero', 'left')
			->where('e.detalle_comanda_id IS NULL')
			->where('c.sinfactura', 1)
			->not_like('g.descripcion', 'propi', 'after')
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

		return $this->db
			->select("
			(a.total-a.descuento) as total, 
		    a.bien_servicio,
		    i.fhcreacion,
		    hour(i.fhcreacion) as hora,
		    b.fecha_factura,
		    monthname(b.fecha_factura) as mes,
			concat(year(b.fecha_factura),'-',week(b.fecha_factura)) as semana,
		    concat(dayofweek(b.fecha_factura),'-',dayname(b.fecha_factura)) as dia,
		    c.descripcion,
		    d.descripcion as grupo,
		    e.nombre as sede,
		    if(f.detalle_factura is null, 'Manual','Comanda') as operacion,
		    if(i.domicilio=1,'SI','NO') as domicilio,
		    k.descripcion as turno,
		    concat(mr.nombres,' ',mr.apellidos) as nombre_mesero")
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
			/* Mesero */ 
			->join('usuario mr', 'mr.usuario = i.mesero', 'left')
			->where("b.fel_uuid is not null")
			->where("b.fel_uuid_anulacion is null")
			->not_like('c.descripcion', 'propi', 'after')
			->get()
			->result();
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

		// $q = $this->db->last_query();

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

	private function getVentasPorCategoriaSinFactura($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('DATE(f.fhcreacion) >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('DATE(f.fhcreacion) <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('f.sede');
		}

		$vdsf = $this->db
			->select('CONCAT(j.nombre, "-", i.descripcion) AS categoria, SUM(e.total) AS venta, j.sede')
			->from('cuenta a')
			->join('cuenta_forma_pago b', 'a.cuenta = b.cuenta')
			->join('forma_pago c', 'c.forma_pago = b.forma_pago')
			->join('detalle_cuenta d', 'a.cuenta = d.cuenta_cuenta')
			->join('detalle_comanda e', 'e.detalle_comanda = d.detalle_comanda')
			->join('comanda f', 'f.comanda = e.comanda')
			->join('articulo g', 'g.articulo = e.articulo')
			->join('categoria_grupo h', 'h.categoria_grupo = g.categoria_grupo')
			->join('categoria i', 'i.categoria = h.categoria')
			->join('sede j', 'j.sede = i.sede')
			->where('c.sinfactura', 1)
			->where('c.descuento', 0)
			->where('e.total <>', 0)
			->group_by('i.descripcion')
			->order_by('i.descripcion')
			->get()
			->result();

		// $q = $this->db->last_query();

		return $vdsf;
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

		$facturados = $this->db
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

		$sinFactura = $this->getVentasPorCategoriaSinFactura($args);	

		if (count($facturados) > 0 && count($sinFactura) > 0) {
			foreach($sinFactura as $sf) 
			{	
				$existente = false;
				foreach($facturados as $f)
				{
					if($f->categoria === $sf->categoria && (int)$f->sede === (int)$sf->sede)
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
			$facturados = ordenar_array_objetos($facturados, 'categoria');
		} else if (count($facturados) === 0 && count($sinFactura) > 0)
		{
			$facturados = $sinFactura;
		}

		return $facturados;		
	}

	public function getVentasPorTurnoSinFactura($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('DATE(f.fhcreacion) >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('DATE(f.fhcreacion) <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('f.sede');
		}

		return $this->db
			->select('h.descripcion AS turno, SUM(e.total) AS venta, f.sede')
			->from('cuenta a')
			->join('cuenta_forma_pago b', 'a.cuenta = b.cuenta')
			->join('forma_pago c', 'c.forma_pago = b.forma_pago')
			->join('detalle_cuenta d', 'a.cuenta = d.cuenta_cuenta')
			->join('detalle_comanda e', 'e.detalle_comanda = d.detalle_comanda')
			->join('comanda f', 'f.comanda = e.comanda')
			->join('turno g', 'g.turno = f.turno')
			->join('turno_tipo h', 'h.turno_tipo = g.turno_tipo')
			->where('c.sinfactura', 1)
			->where('c.descuento', 0)
			->where('e.total <>', 0)
			->group_by('h.descripcion')
			->order_by('h.descripcion')
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

		$facturados = $this->db
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

		$sinFactura = $this->getVentasPorTurnoSinFactura($args);

		if (count($facturados) > 0 && count($sinFactura) > 0) {
			foreach($sinFactura as $sf) 
			{	
				$existente = false;
				foreach($facturados as $f)
				{
					if($f->turno === $sf->turno && (int)$f->sede === (int)$sf->sede)
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
			$facturados = ordenar_array_objetos($facturados, 'turno');
		} else if (count($facturados) === 0 && count($sinFactura) > 0)
		{
			$facturados = $sinFactura;
		}

		return $facturados;		
	}

	public function getVentasPorMeseroSinFactura($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('DATE(f.fhcreacion) >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('DATE(f.fhcreacion) <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (verDato($args, "_grupo", 0) == 2) {
			$this->db->group_by('f.sede');
		}

		return $this->db
			->select(
				'TRIM(CONCAT(IFNULL(g.nombres, ""), " ", IFNULL(g.apellidos, ""))) AS mesero, 
				SUM(e.total) AS venta,
				f.sede')
			->from('cuenta a')
			->join('cuenta_forma_pago b', 'a.cuenta = b.cuenta')
			->join('forma_pago c', 'c.forma_pago = b.forma_pago')
			->join('detalle_cuenta d', 'a.cuenta = d.cuenta_cuenta')
			->join('detalle_comanda e', 'e.detalle_comanda = d.detalle_comanda')
			->join('comanda f', 'f.comanda = e.comanda')			
			->join('usuario g', 'g.usuario = f.mesero')
			->where('c.sinfactura', 1)
			->where('c.descuento', 0)
			->where('e.total <>', 0)
			->group_by('g.usuario')
			->order_by('venta', "desc")
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

		$facturados = $this->db
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

		$sinFactura = $this->getVentasPorMeseroSinFactura($args);

		if (count($facturados) > 0 && count($sinFactura) > 0) {
			foreach($sinFactura as $sf) 
			{	
				$existente = false;
				foreach($facturados as $f)
				{
					if($f->mesero === $sf->mesero && (int)$f->sede === (int)$sf->sede)
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
			$facturados = ordenar_array_objetos($facturados, 'venta', 1, 'desc');
		} else if (count($facturados) === 0 && count($sinFactura) > 0)
		{
			$facturados = $sinFactura;
		}

		return $facturados;
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

	public function sign_url_for_metabase($args = [])
	{
		$token = JWT::encode($args['payload'], $args['RT_METABASE_SECRET_KEY']);
		return "{$args['RT_METABASE_SITE_URL']}/embed/{$args['tipo']}/{$token}#bordered=true&titled=true";
	}
}

/* End of file Tipo_usuario_model.php */
/* Location: ./application/admin/models/Tipo_usuario_model.php */