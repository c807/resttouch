<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_model extends General_model {

	public $cliente_master;
	public $nombre;
    public $correo = null;
    public $fecha_nacimiento = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente_master");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
