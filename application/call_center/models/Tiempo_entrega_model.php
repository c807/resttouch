<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tiempo_entrega_model extends General_model
{

	public $tiempo_entrega;
	public $descripcion;
	public $orden = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tiempo_entrega');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_tiempos_entrega($fltr = [])
	{
		$campos = $this->getCampos(false, '', 'tiempo_entrega');

		if (isset($fltr['tiempo_entrega']) && (int)$fltr['tiempo_entrega'] > 0) {
			$this->db->where('tiempo_entrega', (int)$fltr['tiempo_entrega']);
		}

		if (isset($fltr['descripcion']) && is_string($fltr['descripcion'])) {
			$this->db->where('descripcion', $fltr['descripcion']);
		}

		if (isset($fltr['orden']) && (int)$fltr['orden'] > 0) {
			$this->db->where('orden', (int)$fltr['orden']);
		}

		$tmp = $this->db->select($campos)->get('tiempo_entrega');

		if (isset($fltr['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}

	public function get_lista_tiempos_entrega($fltr = [])
	{
		$lista = [];
		$campos = $this->getCampos(false, '', 'tiempo_entrega');

		if (isset($fltr['tiempo_entrega']) && (int)$fltr['tiempo_entrega'] > 0) {
			$this->db->where('tiempo_entrega', (int)$fltr['tiempo_entrega']);
		}

		if (isset($fltr['descripcion']) && is_string($fltr['descripcion'])) {
			$this->db->where('descripcion', $fltr['descripcion']);
		}

		if (isset($fltr['orden']) && (int)$fltr['orden'] > 0) {
			$this->db->where('orden', (int)$fltr['orden']);
		}

		$tmp = $this->db
			->select($campos)
			->order_by('tiempo_entrega')
			->get('tiempo_entrega')
			->result();

		foreach ($tmp as $te) {
			$lista[(int)$te->tiempo_entrega] = clone $te;
		}

		return $lista;
	}
}
