<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tablero_model extends General_model
{


	public function getServiciosSinFactura($args = [])
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
			foreach ($sinFactura as $sf) {
				$existente = false;
				foreach ($facturados as $f) {
					if ($f->fecha === $sf->fecha && (int)$f->sede === (int)$sf->sede) {
						$f->venta = (float)$f->venta + (float)$sf->venta;
						$existente = true;
					}
				}
				if (!$existente) {
					$facturados[] = $sf;
				}
			}
			$facturados = ordenar_array_objetos($facturados, 'fecha');
		} else if (count($facturados) === 0 && count($sinFactura) > 0) {
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
			foreach ($sinFactura as $sf) {
				$existente = false;
				foreach ($facturados as $f) {
					if ($f->categoria === $sf->categoria && (int)$f->sede === (int)$sf->sede) {
						$f->venta = (float)$f->venta + (float)$sf->venta;
						$existente = true;
					}
				}
				if (!$existente) {
					$facturados[] = $sf;
				}
			}
			$facturados = ordenar_array_objetos($facturados, 'categoria');
		} else if (count($facturados) === 0 && count($sinFactura) > 0) {
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
			foreach ($sinFactura as $sf) {
				$existente = false;
				foreach ($facturados as $f) {
					if ($f->turno === $sf->turno && (int)$f->sede === (int)$sf->sede) {
						$f->venta = (float)$f->venta + (float)$sf->venta;
						$existente = true;
					}
				}
				if (!$existente) {
					$facturados[] = $sf;
				}
			}
			$facturados = ordenar_array_objetos($facturados, 'turno');
		} else if (count($facturados) === 0 && count($sinFactura) > 0) {
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
				f.sede'
			)
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
				a.sede'
			)
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
			foreach ($sinFactura as $sf) {
				$existente = false;
				foreach ($facturados as $f) {
					if ($f->mesero === $sf->mesero && (int)$f->sede === (int)$sf->sede) {
						$f->venta = (float)$f->venta + (float)$sf->venta;
						$existente = true;
					}
				}
				if (!$existente) {
					$facturados[] = $sf;
				}
			}
			$facturados = ordenar_array_objetos($facturados, 'venta', 1, 'desc');
		} else if (count($facturados) === 0 && count($sinFactura) > 0) {
			$facturados = $sinFactura;
		}

		return $facturados;
	}

	public function agruparDatos($datos, $grupo = 1)
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

	public function get_movimientos_wms($args = [])
	{
		$this->db->query("SET @@lc_time_names = 'es_GT'");

		if (isset($args["fdel"])) {
			$this->db->where('a.fecha >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('a.fecha <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('d.sede', $args['sede']);
			} else {
				$this->db->where('d.sede', $args['sede']);
			}
		}

		$qryDetalleIngresos = 'SELECT z.ingreso, v.descripcion AS categoria, w.descripcion AS subcategoria, y.descripcion AS articulo, x.descripcion AS presentacion, ';
		$qryDetalleIngresos .= 'IFNULL(z.cantidad, 0.00) AS cantidad, IFNULL(ROUND((z.precio_total + z.precio_costo_iva) / z.cantidad, 4), 0.00) AS precio_unitario, IFNULL((z.precio_total + z.precio_costo_iva), 0.00) AS precio_total ';
		$qryDetalleIngresos .= 'FROM ingreso_detalle z INNER JOIN articulo y ON y.articulo = z.articulo INNER JOIN presentacion x ON x.presentacion = z.presentacion ';
		$qryDetalleIngresos .= 'INNER JOIN categoria_grupo w ON w.categoria_grupo = y.categoria_grupo INNER JOIN categoria v ON v.categoria = w.categoria';

		$campos = '"Ingreso" AS movimiento, a.ingreso AS idmovimiento, b.descripcion AS tipo_movimiento, a.fecha, a.creacion, CONCAT(d.nombre, IFNULL(CONCAT(" (", d.alias, ")"), "")) AS sede, c.descripcion AS bodega, ';
		$campos .= 'e.usrname AS usuario, IFNULL(CONCAT(i.nombre, IFNULL(CONCAT(" (", i.alias, ")"), "")), "") AS sede_origen, IFNULL(h.descripcion, "") AS bodega_origen, "" AS sede_destino, "" AS bodega_destino, ';
		$campos .= 'IFNULL(a.comentario, "") AS comentario, f.razon_social AS proveedor, g.descripcion AS estatus_movimiento, IF(a.ajuste = 0, "", "AJUSTE POR INVENTARIO FÍSICO") AS ajuste_automatico, ';
		$campos .= 'MONTHNAME(a.fecha) AS mes, CONCAT(YEAR(a.fecha), "-", WEEK(a.fecha)) AS semana, CONCAT(DAYOFWEEK(a.fecha), "-", DAYNAME(a.fecha)) as dia, ';
		$campos .= 'j.categoria, j.subcategoria, j.articulo, j.cantidad, j.presentacion, j.precio_unitario, j.precio_total';

		$ingresos = $this->db
			->select($campos, false)
			->join('tipo_movimiento b', 'b.tipo_movimiento = a.tipo_movimiento')
			->join('bodega c', 'c.bodega = a.bodega')
			->join('sede d', 'd.sede = c.sede')
			->join('usuario e', 'e.usuario = a.usuario')
			->join('proveedor f', 'f.proveedor = a.proveedor')
			->join('estatus_movimiento g', 'g.estatus_movimiento = a.estatus_movimiento')
			->join('bodega h', 'h.bodega = a.bodega_origen', 'left')
			->join('sede i', 'i.sede = h.sede', 'left')
			->join("({$qryDetalleIngresos}) j", 'a.ingreso = j.ingreso', 'inner', false)
			->get('ingreso a')
			->result();

		if (isset($args["fdel"])) {
			$this->db->where('a.fecha >= ', $args["fdel"]);
		}

		if (isset($args["fal"])) {
			$this->db->where('a.fecha <= ', $args["fal"]);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('d.sede', $args['sede']);
			} else {
				$this->db->where('d.sede', $args['sede']);
			}
		}

		$qryDetalleEgresos = 'SELECT z.egreso, v.descripcion AS categoria, w.descripcion AS subcategoria, y.descripcion AS articulo, x.descripcion AS presentacion, ';
		$qryDetalleEgresos .= 'IFNULL(z.cantidad, 0.00) AS cantidad, ROUND(IFNULL(z.precio_unitario, 0.00), 4) AS precio_unitario, IFNULL(z.precio_total, 0.00) AS precio_total ';
		$qryDetalleEgresos .= 'FROM egreso_detalle z INNER JOIN articulo y ON y.articulo = z.articulo INNER JOIN presentacion x ON x.presentacion = z.presentacion ';
		$qryDetalleEgresos .= 'INNER JOIN categoria_grupo w ON w.categoria_grupo = y.categoria_grupo INNER JOIN categoria v ON v.categoria = w.categoria';

		$campos = '"Egreso" AS movimiento, a.egreso AS idmovimiento, b.descripcion AS tipo_movimiento, a.fecha, a.creacion, CONCAT(d.nombre, IFNULL(CONCAT(" (", d.alias, ")"), "")) AS sede, c.descripcion AS bodega, ';
		$campos .= 'e.usrname AS usuario, "" AS sede_origen, "" AS bodega_origen, IFNULL(CONCAT(i.nombre, IFNULL(CONCAT(" (", i.alias, ")"), "")), "") AS sede_destino, IFNULL(h.descripcion, "") AS bodega_destino, ';
		$campos .= 'IFNULL(a.comentario, "") AS comentario, "" AS proveedor, g.descripcion AS estatus_movimiento, IF(a.ajuste = 0, "", "AJUSTE POR INVENTARIO FÍSICO") AS ajuste_automatico, MONTHNAME(a.fecha) AS mes, ';
		$campos .= 'CONCAT(YEAR(a.fecha), "-", WEEK(a.fecha)) AS semana, CONCAT(DAYOFWEEK(a.fecha), "-", DAYNAME(a.fecha)) as dia, ';
		$campos .= 'j.categoria, j.subcategoria, j.articulo, j.cantidad, j.presentacion, j.precio_unitario, j.precio_total';

		$egresos = $this->db
			->select($campos, false)
			->join('tipo_movimiento b', 'b.tipo_movimiento = a.tipo_movimiento')
			->join('bodega c', 'c.bodega = a.bodega')
			->join('sede d', 'd.sede = c.sede')
			->join('usuario e', 'e.usuario = a.usuario')
			->join('estatus_movimiento g', 'g.estatus_movimiento = a.estatus_movimiento')
			->join('bodega h', 'h.bodega = a.bodega_destino', 'left')
			->join('sede i', 'i.sede = h.sede', 'left')
			->join("({$qryDetalleEgresos}) j", 'a.egreso = j.egreso', 'inner', false)
			->get('egreso a')
			->result();

		return array_merge($ingresos, $egresos);
	}


	private function raw_ventas_facturadas($args = [])
	{
		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('b.sede', (int)$args['sede']);
		}

		if (isset($args['fdel']) && !empty($args['fdel'])) {
			$this->db->where('b.fecha_factura >=', $args['fdel']);
		}

		if (isset($args['fal']) && !empty($args['fal'])) {
			$this->db->where('b.fecha_factura <=', $args['fal']);
		}

		$campos = 'a.factura, a.detalle_factura, e.categoria AS idcategoria, e.descripcion AS categoria, d.categoria_grupo AS idsubcategoria, d.descripcion AS subcategoria, ';
		$campos .= 'c.articulo AS idarticulo, c.descripcion AS articulo, a.total, a.descuento, a.monto_iva AS iva, a.valor_impuesto_especial AS impuesto_especial, a.cantidad';
		$facturados = $this->db
			->select($campos)
			->join('factura b', 'b.factura = a.factura')
			->join('articulo c', 'c.articulo = a.articulo')
			->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo')
			->join('categoria e', 'e.categoria = d.categoria')
			->where('b.fel_uuid_anulacion IS NULL')
			->get('detalle_factura a')
			->result();

		return $facturados;
	}

	private function raw_ventas_sin_factura($args = [])
	{
		$subQuery = 'SELECT d.comanda ';
		$subQuery .= 'FROM cuenta_forma_pago a JOIN forma_pago b ON b.forma_pago = a.forma_pago JOIN cuenta c ON c.cuenta = a.cuenta JOIN comanda d ON d.comanda = c.comanda ';
		$subQuery .= 'WHERE b.sinfactura = 1';

		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$subQuery .= " AND d.sede = {$args['sede']}";
		}

		if (isset($args['fdel']) && !empty($args['fdel'])) {
			$subQuery .= " AND DATE(d.fhcreacion) >= '{$args['fdel']}' ";
		}

		if (isset($args['fal']) && !empty($args['fal'])) {
			$subQuery .= " AND DATE(d.fhcreacion) <= '{$args['fal']}' ";
		}

		$campos = 'a.comanda AS factura, a.detalle_comanda AS detalle_factura, e.categoria AS idcategoria, e.descripcion AS categoria, d.categoria_grupo AS idsubcategoria, d.descripcion AS subcategoria, ';
		$campos .= 'c.articulo AS idarticulo, c.descripcion AS articulo, a.total, 0 AS descuento, 0 AS iva, 0 AS impuesto_especial, a.cantidad';
		$sinFactura = $this->db
			->select($campos, FALSE)
			->join('articulo c', 'c.articulo = a.articulo')
			->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo')
			->join('categoria e', 'e.categoria = d.categoria')
			->where("a.comanda IN ({$subQuery})", NULL, FALSE)
			->where('a.cantidad <>', 0)
			->where('a.total <>', 0)
			->get('detalle_comanda a')
			->result();

		return $sinFactura;
	}

	private function get_articulos_no_vendidos($args, $siVendidos)
	{
		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('c.sede', (int)$args['sede']);
		}

		$sinVender = $this->db
			->select('a.articulo AS idarticulo, a.descripcion AS articulo, 0 AS cantidad, 0 AS monto', FALSE)
			->join('categoria_grupo b', 'b.categoria_grupo = a.categoria_grupo')
			->join('categoria c', 'c.categoria = b.categoria')
			->where('a.mostrar_pos', 1)
			->where('a.precio <>', 0)
			->where("a.articulo NOT IN({$siVendidos})")
			->get('articulo a')
			->result();

		return ordenar_array_objetos($sinVender, 'articulo') ;
	}
	
	public function get_datos_panorama($args)
	{
		$porIva = 0.12;
		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$tmp = $this->db->select('b.porcentaje_iva')->join('empresa b', 'b.empresa = a.empresa')->where('a.sede', (int)$args['sede'])->get('sede a')->row();
			if ($tmp) {
				$porIva = (float)$tmp->porcentaje_iva;
			}
		}


		$raw_facturados = $this->raw_ventas_facturadas($args);
		$raw_sin_factura = $this->raw_ventas_sin_factura($args);
		$raw_data = array_merge($raw_facturados, $raw_sin_factura);

		$totales = array();
		$totales['total'] = (float)0;
		$totales['descuento'] = (float)0;
		$totales['iva'] = (float)0;
		$totales['total_sin_iva'] = (float)0;
		$totales['impuesto_especial'] = (float)0;
		$totales['por_categoria'] = [];
		$totales['productos'] = [
			'mas_vendidos' => [],
			'menos_vendidos' => [],
			'no_vendidos' => []
		];

		$lstVentasPorProducto = [];

		$productosExcluidos = ['propina', 'tip'];
		foreach ($raw_data as $rf) {
			$totales['total'] += ((float)$rf->total - (float)$rf->descuento);
			$totales['descuento'] += (float)$rf->descuento;
			$totales['iva'] += (float)$rf->iva;
			$totales['impuesto_especial'] += (float)$rf->impuesto_especial;
			if (array_key_exists((int)$rf->idcategoria, $totales['por_categoria'])) {
				$totales['por_categoria'][(int)$rf->idcategoria]['total'] += round(((float)$rf->total - (float)$rf->descuento) / ((float)1 + $porIva), 2);
			} else {
				$totales['por_categoria'][(int)$rf->idcategoria] = [
					'idcategoria' => (int)$rf->idcategoria,
					'categoria' => $rf->categoria,
					'total' => round(((float)$rf->total - (float)$rf->descuento) / ((float)1 + $porIva), 2)
				];
			}

			if (!in_array(trim(strtolower($rf->articulo)), $productosExcluidos)) {
				if (array_key_exists((int)$rf->idarticulo, $lstVentasPorProducto)) {
					$lstVentasPorProducto[(int)$rf->idarticulo]['cantidad'] += (float)$rf->cantidad;
					$lstVentasPorProducto[(int)$rf->idarticulo]['monto'] += (float)$rf->total;
				} else {
					$lstVentasPorProducto[(int)$rf->idarticulo] = [
						'idarticulo' => (int)$rf->idarticulo,
						'articulo' => $rf->articulo,
						'cantidad' => (float)$rf->cantidad,
						'monto' => (float)$rf->total
					];
				}
			}
		}

		$totales['total_sin_iva'] = $totales['total'] - $totales['iva'];

		$totales['por_categoria'] = ordenar_array_objetos(array_values($totales['por_categoria']), 'total', 1, 'desc');

		//Extraer articulos no vendidos
		$siVendidos = array_keys($lstVentasPorProducto);
		$totales['productos']['no_vendidos'] = $this->get_articulos_no_vendidos($args, join(',', $siVendidos));

		//Extraer los 10 más vendidos
		$lstVentasPorProducto = ordenar_array_objetos(array_values($lstVentasPorProducto), 'cantidad', 1, 'desc');
		$totales['productos']['mas_vendidos'] = array_slice($lstVentasPorProducto, 0, 5);

		//Extraer los 10 menos vendidos
		$lstVentasPorProducto = ordenar_array_objetos($lstVentasPorProducto, 'cantidad', 1);
		$totales['productos']['menos_vendidos'] = array_slice($lstVentasPorProducto, 0, 5);

		return (object)[
			'totales' => $totales
		];
	}
}

/* End of file Tipo_usuario_model.php */
/* Location: ./application/admin/models/Tipo_usuario_model.php */