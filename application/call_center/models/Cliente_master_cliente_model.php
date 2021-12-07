<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_cliente_model extends General_model {

	public $cliente_master_cliente;
	public $cliente_master;
    public $cliente;    

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente_master_cliente");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
