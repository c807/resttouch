<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Conocimiento_model extends General_model {

	public $conocimiento;
	public $fhcreacion;
    public $asunto;
    public $resumen;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('administracion.conocimiento');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}