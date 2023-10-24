<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Rol_model extends General_model
{
	public $rol;
	public $descripcion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('rol');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_rol($args = [])
	{
		$campos = $this->getCampos(false, '', 'rol');

		if (isset($args['rol']) && (int)$args['rol'] > 0) {
			$this->db->where('rol', (int)$args['rol']);
		}

		if (isset($args['descripcion']) && is_string($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}

		$tmp = $this->db->select($campos)->get('rol');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}
