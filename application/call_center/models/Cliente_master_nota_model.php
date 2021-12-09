<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_nota_model extends General_model {

	public $cliente_master_nota;
    public $cliente_master;
	public $fecha_hora;
    public $nota;
    public $debaja = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente_master_nota");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
