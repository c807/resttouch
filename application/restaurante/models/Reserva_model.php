<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reserva_model extends General_model {

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
	}

}