<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Rol_acceso_model extends General_model {

	public $rol_acceso;
    public $rol;
	public $modulo;
    public $submodulo;
    public $opcion;
    public $incluido = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('rol_acceso');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}	
}
