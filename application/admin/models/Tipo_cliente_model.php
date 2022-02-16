<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_cliente_model extends General_model {

	public $tipo_cliente;
	public $descripcion;

	public function __construct($id="")
	{
		parent::__construct();
		$this->setTabla("tipo_cliente");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}
}