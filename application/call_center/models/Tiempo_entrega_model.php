<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tiempo_entrega_model extends General_model {

	public $tiempo_entrega;
	public $descripcion;
    public $orden = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tiempo_entrega');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
