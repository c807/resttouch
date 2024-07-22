<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reporte_model extends CI_Model
{

	public function get_ingresos($args = [])
	{
		$group = "";
		if (isset($args['turno_tipo'])) {
			$this->db->where('i.turno_tipo', $args['turno_tipo']);
		}

		if (isset($args['descuento'])) {
			$this->db->where('f.descuento', $args['descuento']);
		}

		if (isset($args['facturadas']) || isset($args['_facturadas'])) {
			$this->db->where('e.numero_factura is not null');
			$this->db->where("e.fel_uuid_anulacion is null");
		}

		if (isset($args['detalle'])) {
			$group .= ", a.factura";
		} else {
			$this->db->where('h.estatus <>', 3);
		}

		if (isset($args['_grupo']) && $args['_grupo'] == 2) {
			$this->db->group_by("h.sede");
			$group .= ", a.sede";
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in("h.sede", $args['sede']);
			} else {
				$this->db->where("h.sede", $args['sede']);
			}
		}

		if (!isset($args['comandas'])) {
			$this->db->where("e.fel_uuid_anulacion is null");

			if (isset($args['_rango_turno']) && $args['_rango_turno']) {
				$this->db
					->where("f.sinfactura", 0)
					->where("date(i.fecha) >=", $args['fdel'])
					->where("date(i.fecha) <=", $args['fal']);

				if (isset($args['_fecha_caja'])) {
					$this->db->where("h.fhcreacion <=", $args['_fecha_caja']);
				}
			} else {
				$this->db
					->where("e.fecha_factura >=", $args['fdel'])
					->where("e.fecha_factura <=", $args['fal']);

				if (isset($args['_fecha_caja'])) {
					$this->db->where("h.fhcreacion <=", $args['_fecha_caja']);
				}
			}
		} else {
			$this->db->where("f.sinfactura", 1);

			if (isset($args['_rango_turno']) && $args['_rango_turno']) {
				$this->db
					->where("date(i.fecha) >=", $args['fdel'])
					->where("date(i.fecha) <=", $args['fal']);

				if (isset($args['_fecha_caja'])) {
					$this->db->where("h.fhcreacion <=", $args['_fecha_caja']);
				}
			} else {
				$this->db
					->where("date(h.fhcreacion) >=", $args['fdel']);

				if (!isset($args['_fecha_caja'])) {
					$this->db->where("date(h.fhcreacion) <=", $args['fal']);
				} else {
					$this->db->where("h.fhcreacion <=", $args['_fecha_caja']);
				}
			}
		}

		if (isset($args['domicilio'])) {
			$this->db->where('h.domicilio', $args['domicilio']);
		}

		if (isset($args['tipo_domicilio'])) {
			$this->db->where('h.tipo_domicilio', $args['tipo_domicilio']);
		}

		$campos = 'a.forma_pago, a.documento, f.descripcion, a.monto, a.propina, ifnull(e.factura, concat("Comanda ", h.comanda)) as factura, ifnull(e.numero_factura, concat("Comanda ", h.comanda)) as numero_factura, ';
		$campos.= 'ifnull(e.fecha_factura, date(h.fhcreacion)) as fecha_factura, h.sede, CONCAT(j.nombre, " (", IFNULL(j.alias, ""), ")") as nsede, ';
		$campos.= 'ifnull(e.serie_factura, "") as serie_factura, h.estatus as estatus_comanda, f.esefectivo, ';
		$campos.= 'group_concat(distinct h.comanda separator ",") as comanda, (SELECT IFNULL(SUM(valor_impuesto_especial), 0) FROM detalle_factura WHERE factura = e.factura) AS valor_impuesto_especial';
		$tmp = $this->db
			->select($campos)
			->from("cuenta_forma_pago a")
			->join("detalle_cuenta b", "a.cuenta = b.cuenta_cuenta")
			->join("detalle_factura_detalle_cuenta c", "b.detalle_cuenta = c.detalle_cuenta", "left")
			->join("detalle_factura d", "c.detalle_factura = d.detalle_factura", "left")
			->join("factura e", "d.factura = e.factura", "left")
			->join("forma_pago f", "a.forma_pago = f.forma_pago")
			->join("cuenta g", "g.cuenta = b.cuenta_cuenta")
			->join("comanda h", "h.comanda = g.comanda")
			->join("turno i", "i.turno = h.turno")
			->join("sede j", "j.sede = h.sede")
			->group_by("a.cuenta_forma_pago")
			->get_compiled_select();

		$resumen = $this->db->query("
			select 
				a.forma_pago,
				a.documento,
				a.descripcion, 
				sum(a.monto) as monto, 
				sum(a.propina) as propina,
				a.fecha_factura,
				a.numero_factura,
				a.sede,
				nsede,
				a.serie_factura, a.estatus_comanda, a.esefectivo, group_concat(distinct a.comanda separator ',') as comanda
			from ( {$tmp} ) a
			group by a.forma_pago {$group}")
			->result();

		if (isset($args['_saldo_actual']) && !isset($args['tipo_domicilio'])) {
			$saldo_actual = (float)$args['_saldo_actual'];
			foreach ($resumen as $res) {
				if ((int)$res->esefectivo === 1) {
					$res->monto += $saldo_actual;
					break;
				}
			}
		}

		return $resumen;
	}

	public function get_ingresos_sin_comanda($args = [])
	{
		$facturas = [];
		if (!isset($args['tipo_domicilio'])) {
			if (isset($args['fdel'])) {
				$this->db->where('a.fecha_factura >=', $args['fdel']);
			}

			if (!isset($args['_fecha_caja'])) {
				if (isset($args['fal'])) {
					$this->db->where('a.fecha_factura <=', $args['fal']);
				}
			} else {
				$this->db->where("a.fecha_factura <= DATE('{$args['_fecha_caja']}')", NULL, FALSE);
			}

			if (isset($args['factura'])) {
				$this->db->where('a.factura', $args['factura']);
			}

			if (!isset($args['propina'])) {
				$this->db->where("c.descripcion NOT LIKE '%propina%'");
			} else {
				$this->db->where("c.descripcion LIKE '%propina%'");
			}

			if (isset($args['sede'])) {
				if (is_array($args['sede'])) {
					$this->db->where_in("a.sede", $args['sede']);
				} else {
					$this->db->where("a.sede", $args['sede']);
				}
			}

			if (isset($args['turno_tipo'])) {
				$this->db->where("f.turno_tipo", $args['turno_tipo']);
			}

			$query = $this->db
				->select('a.factura, a.serie_factura, a.numero_factura, a.fecha_factura, SUM(b.total + IFNULL(b.valor_impuesto_especial, 0)) AS monto, 0.00 AS propina, NULL AS documento, 2 AS estatus_comanda', FALSE)
				// ->select('a.factura, a.serie_factura, a.numero_factura, a.fecha_factura, SUM(b.total) AS monto, 0.00 AS propina, NULL AS documento, 2 AS estatus_comanda', FALSE)
				->join('detalle_factura b', 'a.factura = b.factura')
				->join('articulo c', 'c.articulo = b.articulo')
				->join('detalle_factura_detalle_cuenta d', 'b.detalle_factura = d.detalle_factura', 'left')
				->join('factura_fel e', 'e.factura = a.factura')
				->join('turno f', 'e.fecha between f.inicio and f.fin and f.sede = a.sede', 'left', false)
				->where('a.fel_uuid IS NOT NULL')
				->where('a.fel_uuid_anulacion IS NULL')
				->where('d.detalle_factura_detalle_cuenta IS NULL')
				->group_by('a.factura')
				->get('factura a');

			if (!isset($args['propina'])) {
				$resultado = $query->result();
				foreach ($resultado as $fact) {
					if ((int)$fact->factura > 0) {
						$fact->propina = $this->get_ingresos_sin_comanda([
							'fdel' => $args['fdel'],
							'fal' => $args['fal'],
							'factura' => $fact->factura,
							'propina' => TRUE,
							'_fecha_caja' => !isset($args['_fecha_caja']) ? null : $args['_fecha_caja']
						]);
						$facturas[] = $fact;
					}
				}
			} else {
				$propina = $query->row();
				if ($propina) {
					return (float)$propina->monto;
				}
				return 0;
			}
		}

		return $facturas;
	}

	public function getRangoComandas($args)
	{
		if (isset($args['turno_tipo'])) {
			$this->db->where('b.turno_tipo', $args['turno_tipo']);
		}

		if (is_array($args['sede'])) {
			$this->db
				->where_in("b.sede", $args['sede'])
				->group_by("b.sede");
		} else {
			$this->db->where("b.sede", $args['sede']);
		}

		return $this->db
			->select("
						max(comanda) as maxComanda, 
						min(comanda) as minComanda")
			->join("turno b", "b.turno = a.turno")
			->where("b.inicio >=", $args['fdel'])
			->where("b.fin <=", $args['fal'])
			->get("comanda a")
			->row();
	}

	public function getTablas($args = [])
	{
		$tab = $this->config->item("tabla");
		$datos = [];
		$datos = [];
		if (empty($args)) {
			$datos = $tab;
		} else {
			foreach ($tab as $row) {
				if (isset($args['tabla']) && $row['tabla'] == $args['tabla']) {
					$datos = $row;
				}
			}
		}

		return $datos;
	}

	public function getCampos($args = [])
	{
		$campo = $this->config->item("campos");
		$datos = [];
		if (empty($args)) {
			$datos = $campo;
		} else {
			foreach ($campo as $row) {
				$tabla = $this->getTablas(["tabla" => $row['tabla']]);
				$row['columna'] = "{$tabla['entidad']}.{$row['campo']}";

				if (isset($args['campos']) && in_array($row['tabla_campo'], $args['campos'])) {
					$datos[] = $row;
				} else {
					if (isset($args['por_fecha']) && $row['por_fecha'] == 1) {
						$datos[] = $row;
					} else if (isset($args['ordenar_por']) && $row['ordenar_por'] == 1) {
						$datos[] = $row;
					}
				}
			}
		}

		return isset($args['uno']) ? $datos[0] : $datos;
	}

	public function autoconsulta($args = [])
	{
		$campos = $this->getCampos($args);
		$tablas = $this->getTablas();
		$temp   = $this->getCampos(["campos" => [$args["fecha"]], "uno" => true]);
		$xfecha = "{$temp['columna']}";

		$this->db
			->where("date({$xfecha}) between '{$args["fdel"]}' and '{$args["fal"]}'")
			->where("factura.sede", $args['sede']);

		if (isset($args["orden"])) {
			$temp = $this->getCampos(["campos" => [$args["orden"]], "uno" => true]);
			$xorden = "{$temp['columna']}";
		}

		foreach ($campos as $row) {
			if ($row['compuesto'] == 1) {
				$this->db->select("{$row['campo']} as {$row['descripcion']}");
			} else {
				$this->db->select("{$row['columna']} as {$row['descripcion']}");
			}
		}

		foreach ($tablas as $row) {
			$tbl = $row['entidad'];

			if ($row['orden'] == 1) {
				$this->db->from($tbl);
			} else {
				$this->db->join($tbl, $row['condicion'], $row['accion']);
			}
		}

		# $this->db->group_by("detalle_factura.detalle_factura");

		$tmp = $this->db->get();
		if ($tmp) {
			return $tmp->result();
		}

		return [];
	}

	public function get_lista_comandas($args = [])
	{
		if (isset($args['sede'])) {
			$this->db->where('a.sede', $args['sede']);
		}

		if (isset($args['turno_tipo']) && (int)$args['turno_tipo'] > 0) {
			$this->db->where('f.turno_tipo', $args['turno_tipo']);
		}

		if (isset($args['comandas']) && trim($args['comandas']) !== '') {
			$this->db->where("a.comanda IN({$args['comandas']})");
		}

		$tipoFecha = 'DATE(a.fhcreacion)'; // Fecha de la comanda
		if (isset($args['tipo_fecha'])) {
			switch ((int)$args['tipo_fecha']) {
				case 2:
					$tipoFecha = 'DATE(e.fecha)';
					break; // Fecha de turno
				case 3:
					$tipoFecha = 'DATE(e.inicio)';
					break; // Fecha de inicio de turno
				case 4:
					$tipoFecha = 'DATE(e.fin)';
					break; // Fecha de fin de turno
			}
		}

		if (isset($args['fdel'])) {
			$this->db->where("{$tipoFecha} >=", $args['fdel']);
		}

		if (isset($args['fal'])) {
			$this->db->where("{$tipoFecha} <=", $args['fal']);
		}

		if (isset($args['formas_pago']) && is_array($args['formas_pago']) && count($args['formas_pago']) > 0) {
			$fp = implode(',', $args['formas_pago']);
			$joinSelect = "(SELECT z.comanda FROM cuenta z INNER JOIN cuenta_forma_pago y ON z.cuenta = y.cuenta WHERE y.forma_pago IN({$fp}) GROUP BY z.comanda)";
			$this->db->join("{$joinSelect} h", 'a.comanda = h.comanda', 'inner', false);
		}

		$select = "a.comanda, TRIM(CONCAT(IFNULL(b.nombres, ''), ' ', IFNULL(b.apellidos, ''))) AS usuario, TRIM(CONCAT(TRIM(d.nombre), IFNULL(CONCAT(' (', d.alias, ')'), ''))) AS sede, a.turno, ";
		$select .= "DATE_FORMAT(e.fecha, '%d/%m/%Y %H:%i:%s') AS fecha_turno, ";
		$select .= "TRIM(f.descripcion) AS turno_tipo, DATE_FORMAT(e.inicio, '%d/%m/%Y %H:%i:%s') AS inicio_turno, DATE_FORMAT(e.fin, '%d/%m/%Y %H:%i:%s') AS fin_turno, ";
		$select .= "TRIM(CONCAT(IFNULL(c.nombres, ''), ' ', IFNULL(c.apellidos, ''))) AS mesero, DATE_FORMAT(a.fhcreacion, '%d/%m/%Y %H:%i:%s') AS fecha_comanda, TRIM(a.notas_generales) AS notas_generales, ";
		$select .= "a.orden_gk, TRIM(g.descripcion) AS razon_anulacion, a.comensales, a.comanda_origen_datos, a.reserva";

		return $this->db
			->select($select)
			->join('usuario b', 'b.usuario = a.usuario')
			->join('usuario c', 'c.usuario = a.mesero', 'left')
			->join('sede d', 'd.sede = a.sede')
			->join('turno e', 'e.turno = a.turno')
			->join('turno_tipo f', 'f.turno_tipo = e.turno_tipo')
			->join('razon_anulacion g', 'g.razon_anulacion = a.razon_anulacion', 'left')
			->get('comanda a')
			->result();
	}

	public function get_detalle_comanda($args = [])
	{
		if (isset($args['comanda'])) {
			$this->db->where('a.comanda', $args['comanda']);
		}

		if (isset($args['activos']) && (int)$args['activos'] === 1) {
			$this->db->where('a.cantidad >', 0);
		}

		$select = 'a.detalle_comanda, a.comanda, TRIM(b.descripcion) AS articulo, a.cantidad, a.precio, a.total, TRIM(a.notas) AS notas, TRIM(a.notas_predefinidas) AS notas_predefinidas, TRIM(c.descripcion) AS presentacion, ';
		$select .= 'TRIM(d.descripcion) AS bodega, IFNULL(a.cantidad_inventario, a.cantidad) AS cantidad_inventario, a.detalle_comanda_id, b.multiple, a.fecha, ';
		$select .= 'IF(a.detalle_comanda_id IS NULL, IFNULL(a.tiempo_preparacion, "00:00:00"), NULL) AS tiempo_preparacion, ';
    $select .= 'IF(a.detalle_comanda_id IS NULL, IFNULL(a.tiempo_pendiente, "00:00:00"), NULL) AS tiempo_pendiente, ';
    $select .= 'IF(a.detalle_comanda_id IS NULL, SEC_TO_TIME(TIME_TO_SEC(IFNULL(a.tiempo_preparacion, "00:00:00")) + TIME_TO_SEC(IFNULL(a.tiempo_pendiente, "00:00:00"))), NULL) AS tiempo_total';

		if (isset($args['suma'])) {
			$select = 'SUM(a.total) AS total';
		}

		$query = $this->db
			->select($select)
			->join('articulo b', 'b.articulo = a.articulo')
			->join('presentacion c', 'c.presentacion = a.presentacion')
			->join('bodega d', 'd.bodega = a.bodega')
			->get('detalle_comanda a');

		if (isset($args['suma'])) {
			$total = $query->row();
			return $total ? $total->total : 0;
		}
		return $query->result();
	}

	public function get_formas_pago_comanda($args = [])
	{
		if (isset($args['comanda'])) {
			$this->db->where('c.comanda', $args['comanda']);
		}

		if (isset($args['formas_pago']) && is_array($args['formas_pago']) && count($args['formas_pago']) > 0) {
			$this->db->where_in('a.forma_pago', $args['formas_pago']);
		}

		$select = 'a.cuenta_forma_pago, a.cuenta, TRIM(c.nombre) AS nombre_cuenta, c.numero AS numero_cuenta, TRIM(b.descripcion) AS forma_pago, a.monto, a.propina';
		if (isset($args['suma'])) {
			$select = 'SUM(a.monto) AS monto, SUM(a.propina) AS propina';
		}

		$query = $this->db
			->select($select)
			->join('forma_pago b', 'b.forma_pago = a.forma_pago')
			->join('cuenta c', 'c.cuenta = a.cuenta')
			->order_by('c.numero, b.descripcion')
			->get('cuenta_forma_pago a');

		if (isset($args['suma'])) {
			$totales = $query->row();
			return $totales ? $totales : (object)['monto' => 0, 'propina' => 0];
		}
		return $query->result();
	}

	public function get_facturas_comanda($args = [])
	{
		if (isset($args['comanda'])) {
			$this->db->where('a.comanda', $args['comanda']);
		}

		$select = 'f.factura, TRIM(g.nombre) AS cliente, TRIM(g.nit) AS nit, DATE_FORMAT(f.fecha_factura, "%d/%m/%Y") AS fecha_factura, TRIM(f.serie_factura) AS serie_factura, TRIM(f.numero_factura) AS numero_factura, ';
		$select .= '(SELECT SUM(total) FROM detalle_factura WHERE factura = f.factura) AS total_factura, IF(f.fel_uuid_anulacion IS NULL, "VIGENTE", "ANULADA") AS estatus_factura, TRIM(h.descripcion) AS razon_anulacion, ';
		$select .= 'TRIM(f.documento_receptor) AS documento_receptor';

		$facturas = $this->db
			->select($select, FALSE)
			->join('detalle_comanda b', 'a.comanda = b.comanda')
			->join('detalle_cuenta c', 'b.detalle_comanda = c.detalle_comanda')
			->join('detalle_factura_detalle_cuenta d', 'c.detalle_cuenta = d.detalle_cuenta')
			->join('detalle_factura e', 'e.detalle_factura = d.detalle_factura')
			->join('factura f', 'f.factura = e.factura')
			->join('cliente g', 'g.cliente = f.cliente')
			->join('razon_anulacion h', 'h.razon_anulacion = f.razon_anulacion', 'left')
			->group_by('f.factura')
			->get('comanda a')
			->result();

		foreach ($facturas as $factura) {
			$factura->detalle_factura = [];
			if (isset($args['ver_detalle_facturas']) && (int)$args['ver_detalle_facturas'] === 1) {
				$select = 'a.detalle_factura, TRIM(b.descripcion) AS articulo, a.cantidad, a.precio_unitario, a.total, a.monto_base, a.monto_iva, a.bien_servicio, a.descuento, TRIM(c.descripcion) AS impuesto_especial, ';
				$select .= 'a.porcentaje_impuesto_especial, a.valor_impuesto_especial, TRIM(d.descripcion) AS bodega, a.cantidad_gravable, a.precio_sugerido';
				$factura->detalle_factura = $this->db
					->select($select)
					->join('articulo b', 'b.articulo = a.articulo')
					->join('impuesto_especial c', 'c.impuesto_especial = a.impuesto_especial', 'left')
					->join('bodega d', 'd.bodega = a.bodega', 'left')
					->where('a.factura', $factura->factura)
					->get('detalle_factura a')
					->result();
			}
		}
		return $facturas;
	}

	public function get_suma_comensales($comandas = '')
	{
		if (trim($comandas) !== '') {
			$suma = $this->db->select_sum('comensales')->where("comanda IN({$comandas})")->get('comanda')->row();
			if ($suma) {
				return (int)$suma->comensales;
			}
		}
		return 0;
	}

	public function get_cantidad_mesas($comandas = '')
	{
		if (trim($comandas) !== '') {
			$conteo = $this->db->select('COUNT(comanda) AS cantidad')->where("comanda IN({$comandas})")->where('domicilio', 0)->get('comanda')->row();
			if ($conteo) {
				return (int)$conteo->cantidad;
			}
		}
		return 0;
	}

	public function get_ventas_administrativo($args = [])
	{
		if (isset($args['fdel'])) {
			$this->db->where('a.fecha_factura >=', $args['fdel']);
		}

		if (isset($args['fal'])) {
			$this->db->where('a.fecha_factura <=', $args['fal']);
		}

		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('a.sede =', $args['sede']);
		}

		$campos = 'a.factura, f.nombre AS empresa, e.nombre AS sede, e.alias AS alias_sede, a.serie_factura AS serie, a.numero_factura AS numero, DATE_FORMAT(a.fecha_factura, "%d/%m/%Y") AS fecha_factura, ';
		$campos .= 'TRIM(g.nit) AS nit, g.nombre AS cliente, d.cuenta_cuenta AS cuenta, IF(a.fel_uuid_anulacion IS NULL, "No", "Sí") AS anulada, TRIM(CONCAT(IFNULL(h.nombres, ""), " ", IFNULL(h.apellidos, ""))) AS usuario, ';
		$campos .= 'TRIM(CONCAT(IFNULL(k.nombres, ""), " ", IFNULL(k.apellidos, ""))) AS mesero, IFNULL(m.etiqueta, m.numero) AS mesa, IFNULL(n.descripcion, "Restaurante") AS tipo, ';
		$campos .= 'o.descripcion AS razon_anulacion, a.comentario_anulacion, TRIM(a.documento_receptor) AS documento_receptor';

		$facturas = $this->db
			->select($campos, FALSE)
			->join('detalle_factura b', 'a.factura = b.factura')
			->join('detalle_factura_detalle_cuenta c', 'b.detalle_factura = c.detalle_factura')
			->join('detalle_cuenta d', 'd.detalle_cuenta = c.detalle_cuenta')
			->join('sede e', 'e.sede = a.sede')
			->join('empresa f', 'f.empresa = e.empresa')
			->join('cliente g', 'g.cliente = a.cliente')
			->join('usuario h', 'h.usuario = a.usuario')
			->join('detalle_comanda i', 'i.detalle_comanda = d.detalle_comanda')
			->join('comanda j', 'j.comanda = i.comanda')
			->join('usuario k', 'k.usuario = j.mesero')
			->join('comanda_has_mesa l', 'j.comanda = l.comanda')
			->join('mesa m', 'm.mesa = l.mesa')
			->join('tipo_domicilio n', 'n.tipo_domicilio = j.tipo_domicilio', 'left')
			->join('razon_anulacion o', 'o.razon_anulacion = a.razon_anulacion', 'left')
			->not_like('a.serie_factura', 'cancela')
			->group_by('a.factura')
			->order_by('f.nombre, e.nombre, a.fecha_factura, a.factura, a.serie_factura, a.numero_factura')
			->get('factura a')
			->result();

		foreach ($facturas as $factura) {
			$factura->formas_pago = $this->db
				->select('b.forma_pago, b.descripcion AS descripcion_forma_pago, IF(b.descuento = 0, a.monto, a.monto * -1) AS monto, a.propina', FALSE)
				->join('forma_pago b', 'b.forma_pago = a.forma_pago')
				->where('a.cuenta', $factura->cuenta)
				->get('cuenta_forma_pago a')
				->result();
		}

		$formas_pago = $this->db->select('forma_pago, descripcion, descuento')->order_by('descripcion')->get('forma_pago')->result();

		return ['formas_pago' => $formas_pago, 'facturas' => $facturas];
	}

	public function get_articulos_eliminados($args = [])
	{
		if (isset($args['comandas']) && (int)$args['comandas'] > 0) {
			$this->db->where("a.comanda IN({$args['comandas']})");
		}

		if (isset($args['usuario']) && (int)$args['usuario'] > 0) {
			$this->db->where('a.usuario', $args['usuario']);
		}

		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('e.sede', $args['sede']);
		}

		if (isset($args['fdel']) && !empty($args['fdel'])) {
			$this->db->where('DATE(a.fechahora) >=', $args['fdel']);
		}

		if (isset($args['fal']) && !empty($args['fal'])) {
			$this->db->where('DATE(a.fechahora) <=', $args['fal']);
		}
		
		if (isset($args['articulo']) && (int)$args['articulo'] > 0) {
			$this->db->where('a.articulo', $args['articulo']);
		}

		$campos = 'CONCAT(e.nombre, IFNULL(CONCAT(" (", e.alias, ")"), "")) AS sede, d.usrname AS usuario, c.descripcion AS articulo, ';
		$campos.= 'DATE_FORMAT(a.fechahora, "%d/%m/%Y %H:%i:%s") AS fechahora, a.comanda';
		return $this->db
			->select($campos)
			->join('comanda b', 'b.comanda = a.comanda')
			->join('articulo c', 'c.articulo = a.articulo')
			->join('usuario d', 'd.usuario = a.usuario')
			->join('sede e', 'e.sede = b.sede')
			->get('articulo_eliminado_comanda a')
			->result();
	}


}

/* End of file Reporte_model.php */
/* Location: ./application/restaurante/models/Reporte_model.php */