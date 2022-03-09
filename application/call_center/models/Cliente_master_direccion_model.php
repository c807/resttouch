<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cliente_master_direccion_model extends General_model
{

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
	public $debaja = null;
	public $sede;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente_master_direccion");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_full_address($dir = null)
	{
		if (empty($dir) && (int)$this->getPK() > 0) {
			$dir = $this;
		}

		$dc = trim($dir->direccion1);
		if (!empty(trim($dir->direccion2))) {
			$dc .= ', ' . trim($dir->direccion2);
		}
		if ((int)$dir->zona > 0) {
			$dc .= ", zona {$dir->zona}";
		}
		if (!empty(trim($dir->codigo_postal))) {
			$dc .= ', código postal ' . trim($dir->codigo_postal);
		}
		if (!empty(trim($dir->municipio))) {
			$dc .= ', ' . trim($dir->municipio);
		}
		if (!empty(trim($dir->departamento))) {
			$dc .= ', ' . trim($dir->departamento);
		}
		if (!empty(trim($dir->pais))) {
			$dc .= ', ' . trim($dir->pais);
		}
		return "{$dc}.";
	}
}
