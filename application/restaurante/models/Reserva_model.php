<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reserva_model extends General_model
{

	public $reserva;
	public $mesa;
	public $tarifa_reserva;
	public $cliente_master;
	public $estatus_reserva;
	public $fecha_del;
	public $hora_inicio = null;
	public $fecha_al;
	public $hora_fin = null;
	public $cantidad_adultos = 0;
	public $cantidad_menores = 0;
	public $cobradoencomanda = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('reserva');

		if (!empty($id)) {
			$this->cargar($id);
		}
		$this->load->model(['Dreserva_model']);
	}

	public function get_reservas($fecha, $vigentes = true)
	{
		$camposReserva = $this->getCampos(false, 'a.', 'reserva');
		$campos = "{$camposReserva}, b.descripcion AS descripcion_estatus_reserva, b.color, c.nombre AS nombre_cliente";

		if ($vigentes) {
			$this->db->where('a.estatus_reserva <> 4');
		}

		$reservas = $this->db
			->select($campos)
			->join('estatus_reserva b', 'b.estatus_reserva = a.estatus_reserva')
			->join('cliente_master c', 'c.cliente_master = a.cliente_master')
			->where("'{$fecha}' BETWEEN a.fecha_del AND a.fecha_al", NULL, FALSE)
			->get('reserva a')
			->result();

		$camposDetalleReserva = $this->getCampos(false, 'a.', 'detalle_reserva');
		foreach ($reservas as $reserva) {
			$reserva->detalle = $this->db
				->select($camposDetalleReserva)
				->where('a.reserva', $reserva->reserva)
				->get('detalle_reserva a')
				->result();
		}
		return $reservas;
	}

	public function generaDetalle()
	{
		$this->db->delete('detalle_reserva', array('reserva' => $this->getPK()));
		$fecha = DateTime::createFromFormat('Y-m-d', $this->fecha_del);
		$fecha_fin = DateTime::createFromFormat('Y-m-d', $this->fecha_al);
		do {
			$this->db->insert('detalle_reserva', array('reserva' => $this->getPK(), 'fecha' => $fecha->format('Y-m-d')));
			$fecha->modify('+1 day');
		} while ($fecha <= $fecha_fin);
	}

	public function hayCruceDeFechas($mesa, $fdel, $fal, $idReserva = 0)
	{
		if ((int)$idReserva > 0) {
			$this->db->where('a.reserva <>', $idReserva);
		}
		$cruce = $this->db
			->select('a.reserva')
			->where('a.mesa', $mesa)
			->where('a.estatus_reserva <> 4')
			->where("(a.fecha_al BETWEEN '{$fdel}' AND '{$fal}' OR a.fecha_del BETWEEN '{$fdel}' AND '{$fal}' OR '{$fdel}' BETWEEN a.fecha_del AND a.fecha_al OR '{$fal}' BETWEEN a.fecha_del AND a.fecha_al)", NULL, FALSE)
			->get('reserva a')
			->row();
		return $cruce && (int)$cruce->reserva > 0 ? true : false;
	}

	public function get_numero_comanda_reserva($idReserva = null, $abierta = false)
	{
		if (empty($idReserva)) {
			$idReserva = $this->reserva;
		}

		if ($abierta) {
			$this->db->where('estatus', 1);
		}

		$comanda = $this->db->select('comanda')->where('reserva', $idReserva)->get('comanda')->row();
		return $comanda && $comanda->comanda ? (int)$comanda->comanda : 0;
	}

	public function get_info_reserva($idReserva, $conDatosRelacionados = true)
	{
		$campos = 'a.reserva, c.nombre AS area, IFNULL(b.etiqueta, b.numero) AS reservable, d.descripcion AS tipo_habitacion, g.nombre AS cliente, h.abreviatura AS tipo_documento, g.numero_documento, ';
		$campos.= 'IF(g.enlistanegra = 0, "No", "Sí") AS enlistanegra,	a.fecha_del, a.fecha_al, a.cantidad_adultos, a.cantidad_menores, f.descripcion AS tipo_habitacion_reserva, ';
		$campos.= 'e.cantidad_adultos AS cantidad_adultos_reserva, e.cantidad_menores AS cantidad_menores_reserva, e.monto, e.monto_adicional_adulto, e.monto_adicional_menor, c.area AS idarea, b.mesa AS idmesa, ';
		$campos.= 'i.estatus_reserva AS idestatus_reserva, i.descripcion AS estatus_reserva, a.cliente_master AS idcliente';
		$reserva = $this->db
			->select($campos)
			->join('mesa b', 'b.mesa = a.mesa')
			->join('area c', 'c.area = b.area')
			->join('tipo_habitacion d', 'd.tipo_habitacion = b.tipo_habitacion')
			->join('tarifa_reserva e', 'e.tarifa_reserva = a.tarifa_reserva')
			->join('tipo_habitacion f', 'f.tipo_habitacion = e.tipo_habitacion')
			->join('cliente_master g', 'g.cliente_master = a.cliente_master')
			->join('tipo_documento h', 'h.tipo_documento = g.tipo_documento')
			->join('estatus_reserva i', 'i.estatus_reserva = a.estatus_reserva')
			->where('a.reserva', $idReserva)
			->get('reserva a')
			->row();

		if ($conDatosRelacionados) {
			$idComanda = $this->get_numero_comanda_reserva($idReserva);		
			$comanda = new stdClass();
	
			if ($idComanda > 0) {
				$comanda->comanda = $idComanda;
				$notasComanda = $this->db->select('notas_generales')->where('comanda', $idComanda)->get('comanda')->row();
				$comanda->notas = $notasComanda && $notasComanda->notas_generales ? trim($notasComanda->notas_generales) : '';
	
				$cuentasComanda = $this->db->select('cuenta, nombre')->where('comanda', $idComanda)->order_by('nombre')->get('cuenta')->result();
				$cuentas = [];
	
				if($cuentasComanda) {
					foreach($cuentasComanda as $cta) {
						$productos = $this->db
							->select('c.descripcion AS articulo, b.cantidad, d.descripcion AS presentacion, b.precio, b.total')
							->join('detalle_comanda b', 'a.detalle_comanda = b.detalle_comanda')
							->join('articulo c', 'c.articulo = b.articulo')
							->join('presentacion d', 'd.presentacion = b.presentacion')
							->where('a.cuenta_cuenta', $cta->cuenta)
							->where('b.cantidad <> 0')
							->where('b.total <> 0')
							->get('detalle_cuenta a')
							->result();
	
						if ($productos) {
							$sumas = $this->db
							->select('"TOTAL" AS articulo, SUM(b.cantidad) AS cantidad, NULL AS presentacion, NULL as precio, SUM(b.total) AS total', false)
							->join('detalle_comanda b', 'a.detalle_comanda = b.detalle_comanda')
							->join('articulo c', 'c.articulo = b.articulo')
							->join('presentacion d', 'd.presentacion = b.presentacion')
							->where('a.cuenta_cuenta', $cta->cuenta)
							->where('b.cantidad <> 0')
							->where('b.total <> 0')
							->get('detalle_cuenta a')
							->result();
	
							$productos = array_merge($productos, $sumas);
	
							$cuentas[] = (object)[
								'nombre' => $cta->nombre,
								'detalle' => $productos
							];
						}
					}
				}
	
				$comanda->cuentas = $cuentas;
				$reserva->comanda = $comanda;
	
				$campos = 'e.factura, e.fecha_factura, e.serie_factura, e.numero_factura, f.nombre, IFNULL(e.tipo_documento_receptor, "NIT") AS tipo_documento_receptor, IFNULL(e.documento_receptor, f.nit) AS documento_receptor, ';
				$campos.= 'IF(e.fel_uuid_anulacion IS NULL, IF(e.fel_uuid IS NULL, "SIN FIRMA", "VIGENTE"), "ANULADA") AS estatus';
				$facturas = $this->db
					->select($campos, false)
					->join('detalle_cuenta b', 'a.detalle_comanda = b.detalle_comanda')
					->join('detalle_factura_detalle_cuenta c', 'b.detalle_cuenta = c.detalle_cuenta')
					->join('detalle_factura d', 'd.detalle_factura = c.detalle_factura')
					->join('factura e', 'e.factura = d.factura')
					->join('cliente f', 'f.cliente = e.cliente')
					->where('a.comanda', $idComanda)
					->group_by('e.factura')
					->get('detalle_comanda a')
					->result();
	
				foreach($facturas as $factura) {
					$detalle = $this->db
						->select('b.descripcion AS articulo, a.cantidad, c.descripcion AS presentacion, a.precio_unitario, a.total, a.descuento, a.valor_impuesto_especial')
						->join('articulo b', 'b.articulo = a.articulo')
						->join('presentacion c', 'c.presentacion = a.presentacion')
						->where('a.factura', $factura->factura)
						->get('detalle_factura a')
						->result();
	
					if ($detalle) {
						$sumas = $this->db
						->select('"TOTAL" AS articulo, SUM(a.cantidad) AS cantidad, NULL AS presentacion, NULL AS precio_unitario, SUM(a.total) AS total, SUM(a.descuento) AS descuento, SUM(a.valor_impuesto_especial) AS valor_impuesto_especial', false)
						->join('articulo b', 'b.articulo = a.articulo')
						->join('presentacion c', 'c.presentacion = a.presentacion')
						->where('a.factura', $factura->factura)
						->get('detalle_factura a')
						->result();
	
						$detalle = array_merge($detalle, $sumas);
					}
					$factura->detalle = $detalle;
				}
				
				$reserva->facturas = $facturas;
			}
		}

		return $reserva;
	}

	public function get_historial_reservas($args) {
		if(isset($args['area']) && (int)$args['area'] > 0) {
			$this->db->where('c.area', (int)$args['area']);
		}

		$idsReservas = $this->db
			->select('a.reserva')
			->join('mesa b', 'b.mesa = a.mesa')
			->join('area c', 'c.area = b.area')
			->where('c.sede', $args['sede'])
			->where("(a.fecha_al BETWEEN '{$args['fdel']}' AND '{$args['fal']}' OR a.fecha_del BETWEEN '{$args['fdel']}' AND '{$args['fal']}' OR '{$args['fdel']}' BETWEEN a.fecha_del AND a.fecha_al OR '{$args['fal']}' BETWEEN a.fecha_del AND a.fecha_al)", NULL, FALSE)
			->order_by('a.fecha_del')
			->get('reserva a')
			->result();

		$reservas = [];
		foreach($idsReservas as $id) {
			$reservas[] = $this->get_info_reserva($id->reserva, false);
		}

		return $reservas;
	}
}
