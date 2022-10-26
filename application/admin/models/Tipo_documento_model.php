<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_documento_model extends General_model {

    public $tipo_documento;
	public $descripcion;
	public $abreviatura;	

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tipo_documento');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}