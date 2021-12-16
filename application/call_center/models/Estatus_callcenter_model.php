<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Estatus_callcenter_model extends General_model {

	public $estatus_callcenter;
	public $descripcion;
    public $color;
    public $orden;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('estatus_callcenter');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
