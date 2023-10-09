<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Presentacion_model extends General_model
{

	public $presentacion;
	public $medida;
	public $descripcion;
	public $cantidad;
	public $debaja = 0;
	public $fechabaja = null;
	public $usuariobaja = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('presentacion');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getMedida()
	{
		$campos = $this->getCampos(false, '', 'medida');
		return $this->db
			->select($campos)
			->where('medida', $this->medida)
			->get('medida')
			->row();
	}

	public function buscar_presentaciones($args = [])
	{
		$campos = $this->getCampos(false, '', 'presentacion');

		if (isset($args['presentacion']) && (int)$args['presentacion'] > 0) {
			$this->db->where('presentacion', (int)$args['presentacion']);
		}

		if (isset($args['medida']) && (int)$args['medida'] > 0) {
			$this->db->where('medida', (int)$args['medida']);
		}

		if (isset($args['descripcion']) && is_string($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}

		if (isset($args['cantidad']) && is_numeric($args['cantidad'])) {
			$this->db->where('cantidad', (float)$args['cantidad']);
		}

		if (isset($args['debaja']) && in_array((int)$args['debaja'], [0, 1])) {
			$this->db->where('debaja', (int)$args['debaja']);
		}
		
		$tmp = $this->db->select($campos)->get('presentacion');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}
		
		return $tmp->result();		
	}

	public function get_lista_presentaciones($args = [])
	{
		if (isset($args['_uno'])) {
			unset($args['_uno']);
		}
		
		$tmp = $this->buscar_presentaciones($args);
		
		$lista = [];
		foreach($tmp as $pres) {
			$lista[(int)$pres->presentacion] = clone $pres;
		}

		return $lista;
	}
}

/* End of file Presentacion_model.php */
/* Location: ./application/admin/models/Presentacion_model.php */