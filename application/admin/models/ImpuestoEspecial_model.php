<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ImpuestoEspecial_model extends General_model {
	public $impuesto_especial;
	public $descripcion;
	public $porcentaje;
	public $descripcion_interna;
	public $codigo_sat = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("impuesto_especial");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_lista_impuestos_especiales()
	{
		$lista = [];
		$campos = $this->getCampos(false, '', 'impuesto_especial');
		$tmpImpEsp = $this->db->select($campos)->order_by('impuesto_especial')->get('impuesto_especial')->result();
		foreach($tmpImpEsp as $ie) {
			$lista[(int)$ie->impuesto_especial] = clone $ie;
		}
		return $lista;
	}
}
