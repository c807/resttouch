<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_movimiento_model extends General_model {

	public $tipo_movimiento;
	public $descripcion;
	public $ingreso = 0;
	public $egreso = 0;
	public $requisicion = 0;
	public $esajuste_cp = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('tipo_movimiento');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_lista_tipos_movimiento($fltr = [])
	{
		$lista = [];
		$campos = $this->getCampos(false, '', 'tipo_movimiento');

		if (isset($fltr['tipo_movimiento']) && (int)$fltr['tipo_movimiento'] > 0) {
			$this->db->where('tipo_movimiento', (int)$fltr['tipo_movimiento']);
		}

		if (isset($fltr['ingreso']) && (int)$fltr['ingreso'] > 0) {
			$this->db->where('ingreso', (int)$fltr['ingreso']);
		}

		if (isset($fltr['egreso']) && (int)$fltr['egreso'] > 0) {
			$this->db->where('egreso', (int)$fltr['egreso']);
		}

		if (isset($fltr['requisicion']) && (int)$fltr['requisicion'] > 0) {
			$this->db->where('requisicion', (int)$fltr['requisicion']);
		}

		if (isset($fltr['descripcion']) && is_string($fltr['descripcion'])) {
			$this->db->where('descripcion', $fltr['descripcion']);
		}

		$tmp = $this->db
			->select($campos)
			->order_by('tipo_movimiento')
			->get('tipo_movimiento')
			->result();

		foreach ($tmp as $tm) {
			$lista[(int)$tm->tipo_movimiento] = clone $tm;
		}

		return $lista;		
	}
}

/* End of file Tipo_movimiento_model.php */
/* Location: ./application/admin/models/Tipo_movimiento_model.php */