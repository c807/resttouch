<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tarifa_reserva_model extends General_model {

    public $detalle_reserva;
	public $reserva;
	public $fecha;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('detalle_reserva');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}