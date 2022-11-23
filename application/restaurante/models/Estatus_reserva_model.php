<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Estatus_reserva_model extends General_model
{
	public $estatus_reserva;
	public $descripcion;
    public $color = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('estatus_reserva');

		if (!empty($id)) {
			$this->cargar($id);
		}		
	}
}
