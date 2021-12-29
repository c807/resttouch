<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cajacorte_nominacion_model extends General_model {

	public $caja_corte_nominacion;
	public $nombre;
	public $valor;
	public $calcula;
	public $orden;

	public function __construct($id = null)
	{
		parent::__construct();
		$this->setTabla("caja_corte_nominacion");

		if($id !== null) {
			$this->cargar($id);
		}
	}
}