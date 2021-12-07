<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_direccion_model extends General_model {

	public $cliente_master_direccion;
	public $cliente_master;
	public $tipo_direccion;
    public $direccion1;
    public $direccion2 = null;
    public $zona = null;
    public $codigo_postal = null;
    public $municipio = null;
    public $departamento = null;
    public $pais = null;
    public $notas = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente_master_direccion");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
