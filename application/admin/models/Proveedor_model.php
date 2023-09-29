<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Proveedor_model extends General_model {

	public $razon_social;
	public $nit;
	public $corporacion;
	public $codigo = null;
	public $cuenta_contable_gasto = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('proveedor');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_lista_proveedores($fltr = [])
	{
		$lista = [];
		$campos = $this->getCampos(false, '', 'proveedor');

		if (isset($fltr['proveedor']) && (int)$fltr['proveedor'] > 0) {
			$this->db->where('proveedor', (int)$fltr['proveedor']);
		}

		if (isset($fltr['corporacion']) && (int)$fltr['corporacion'] > 0) {
			$this->db->where('corporacion', (int)$fltr['corporacion']);
		}		

		if (isset($fltr['razon_social']) && is_string($fltr['razon_social'])) {
			$this->db->where('razon_social', $fltr['razon_social']);
		}

		if (isset($fltr['nit']) && is_string($fltr['nit'])) {
			$this->db->where('nit', $fltr['nit']);
		}

		if (isset($fltr['codigo']) && is_string($fltr['codigo'])) {
			$this->db->where('codigo', $fltr['codigo']);
		}

		if (isset($fltr['cuenta_contable_gasto']) && is_string($fltr['cuenta_contable_gasto'])) {
			$this->db->where('cuenta_contable_gasto', $fltr['cuenta_contable_gasto']);
		}

		$tmp = $this->db
			->select($campos)
			->order_by('proveedor')
			->get('proveedor')
			->result();

		foreach ($tmp as $prov) {
			$lista[(int)$prov->proveedor] = clone $prov;
		}

		return $lista;		
	}	
}

/* End of file Proveedor_model.php */
/* Location: ./application/admin/models/Proveedor_model.php */