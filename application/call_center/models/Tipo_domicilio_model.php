<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_domicilio_model extends General_model {

	public $tipo_domicilio;
	public $descripcion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tipo_domicilio');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}
