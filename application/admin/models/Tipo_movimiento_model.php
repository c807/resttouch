<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_movimiento_model extends General_model {

	public $tipo_movimiento;
	public $descripcion;
	public $ingreso = 0;
	public $egreso = 0;
	public $requisicion = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("tipo_movimiento");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}

/* End of file Tipo_movimiento_model.php */
/* Location: ./application/admin/models/Tipo_movimiento_model.php */