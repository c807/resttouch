<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_habitacion_model extends General_model {

    public $tipo_habitacion;
	public $descripcion;
	public $icono = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tipo_habitacion');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}