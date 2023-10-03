<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Area_model extends General_Model
{

	public $area;
	public $sede;
	public $area_padre;
	public $nombre;
	public $impresora;
	public $impresora_factura = 0;
	public $escallcenter = 0;
	public $mesas_fila_area = 3;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('area');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_mesas($verDeBaja = false)
	{
		$campos = $this->getCampos(false, '', 'mesa');

		if (!$verDeBaja) {
			$this->db->where('debaja', 0);
		}

		return $this->db
			->select($campos)
			->where('area', $this->area)
			->get('mesa')
			->result();
	}

	public function get_lista($fltr = [])
	{
		$campos = $this->getCampos(false, '', 'area');

		if (isset($fltr['area']) && (int)$fltr['area'] > 0) {
			$this->db->where('area', (int)$fltr['area']);
		}

		if (isset($fltr['sede']) && (int)$fltr['sede'] > 0) {
			$this->db->where('sede', (int)$fltr['sede']);
		}

		if (isset($fltr['nombre']) && is_string($fltr['nombre'])) {
			$this->db->where('nombre', $fltr['nombre']);
		}

		if (isset($fltr['impresora']) && (int)$fltr['impresora'] > 0) {
			$this->db->where('impresora', (int)$fltr['impresora']);
		}

		if (isset($fltr['impresora_factura']) && (int)$fltr['impresora_factura'] > 0) {
			$this->db->where('impresora_factura', (int)$fltr['impresora_factura']);
		}

		if (isset($fltr['escallcenter']) && (int)$fltr['escallcenter'] > 0) {
			$this->db->where('escallcenter', (int)$fltr['escallcenter']);
		}

		$tmp = $this->db->select($campos)->get('area');

		if (isset($fltr['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}

/* End of file Area_model.php */
/* Location: ./application/admin/models/Area_model.php */