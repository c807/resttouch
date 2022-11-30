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
		$campos = "{$camposReserva}, b.descripcion AS descripcion_estatus_reserva, b.color";

		if ($vigentes) {
			$this->db->where('a.estatus_reserva <> 4');
		}

		$reservas = $this->db
			->select($campos)
			->join('estatus_reserva b', 'b.estatus_reserva = a.estatus_reserva')
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
}
