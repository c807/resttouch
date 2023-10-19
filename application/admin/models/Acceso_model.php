<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Acceso_model extends General_model
{

	public $acceso;
	public $modulo;
	public $usuario;
	public $submodulo;
	public $opcion;
	public $activo = 1;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('acceso');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getUsuario()
	{
		return $this->db
			->select('usuario, nombres')
			->where('usuario', $this->usuario)
			->get('usuario')
			->row();
	}

	public function getModulo()
	{
		return $this->db
			->where('modulo', $this->modulo)
			->get('modulo')
			->row();
	}

	public function getSubModulo()
	{
		$menu = $this->config->item('menu');
		return [
			'nombre' => $menu[$this->modulo]['submodulo'][$this->submodulo]['nombre'],
			'submodulo' => $this->submodulo
		];
	}

	public function getOpcion()
	{
		$menu = $this->config->item('menu');
		return array_merge($menu[$this->modulo]['submodulo'][$this->submodulo]['opciones'][$this->opcion], [
			'opcion' => $this->opcion
		]);
	}

	public function buscar_acceso($args = [])
	{
		$campos = $this->getCampos(false, '', 'acceso');

		if (isset($args['acceso']) && (int)$args['acceso'] > 0) {
			$this->db->where('acceso', (int)$args['acceso']);
		}

		if (isset($args['usuario']) && (int)$args['usuario'] > 0) {
			$this->db->where('usuario', (int)$args['usuario']);
		}

		if (isset($args['modulo']) && (int)$args['modulo'] > 0) {
			$this->db->where('modulo', (int)$args['modulo']);
		}

		if (isset($args['submodulo']) && (int)$args['submodulo'] > 0) {
			$this->db->where('submodulo', (int)$args['submodulo']);
		}

		if (isset($args['opcion']) && (int)$args['opcion'] > 0) {
			$this->db->where('opcion', (int)$args['opcion']);
		}

		if (isset($args['activo']) && in_array((int)$args['activo'], [0, 1])) {
			$this->db->where('activo', (int)$args['activo']);
		}

		$tmp = $this->db->select($campos)->get('acceso');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}

/* End of file Acceso_model.php */
/* Location: ./application/admin/models/Acceso_model.php */