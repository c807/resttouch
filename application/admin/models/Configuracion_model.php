<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Configuracion_model extends General_model {

	public $campo;
	public $tipo;
	public $valor;
	public $fhcreacion;
	public $descripcion = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("configuracion");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

}

/* End of file Configuracion_model.php */
/* Location: ./application/admin/models/Configuracion_model.php */