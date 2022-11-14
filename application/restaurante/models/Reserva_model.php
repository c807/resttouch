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

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('reserva');

		if (!empty($id)) {
			$this->cargar($id);
		}
		$this->load->model(['Dreserva_model']);
	}

	public function get_reservas($fecha)
	{
		$camposReserva = $this->getCampos(false, 'a.', 'reserva');
		$campos = "{$camposReserva}, b.descripcion AS descripcion_estatus_reserva, b.color";
		$reservas = $this->db
			->select($campos)
			->join('estatus_reserva b', 'b.estatus_reserva = a.estatus_reserva')
			->where('a.fecha_del', $fecha)
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
}
