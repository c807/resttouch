<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Rol_model extends General_model {

	public $rol;
	public $descripcion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('rol');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}	
}
