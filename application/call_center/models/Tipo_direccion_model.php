<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_direccion_model extends General_model {

	public $tipo_direccion;
	public $descripcion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tipo_direccion');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
