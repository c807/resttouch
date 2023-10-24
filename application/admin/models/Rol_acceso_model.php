<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Rol_acceso_model extends General_model
{
	public $rol_acceso;
	public $rol;
	public $modulo;
	public $submodulo;
	public $opcion;
	public $incluido = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('rol_acceso');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_rol_acceso($args = [])
	{
		$campos = $this->getCampos(false, '', 'rol_acceso');

		if (isset($args['rol_acceso']) && (int)$args['rol_acceso'] > 0) {
			$this->db->where('rol_acceso', (int)$args['rol_acceso']);
		}

		if (isset($args['rol']) && (int)$args['rol'] > 0) {
			$this->db->where('rol', (int)$args['rol']);
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

		if (isset($args['incluido']) && in_array((int)$args['incluido'], [0, 1])) {
			$this->db->where('incluido', (int)$args['incluido']);
		}

		$tmp = $this->db->select($campos)->get('rol_acceso');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}

	public function actualiza_permisos_usuario_rol($args)
	{
		$usuarios = $this->db->select('usuario')->where('rol', (int)$args['rol'])->get('usuario')->result();
		foreach ($usuarios as $usr) {
			$acceso = $this->db
				->select('acceso')
				->where('usuario', (int)$usr->usuario)
				->where('modulo', (int)$args['modulo'])
				->where('submodulo', (int)$args['submodulo'])
				->where('opcion', (int)$args['opcion'])
				->get('acceso')
				->row();

			if ($acceso) {
				$this->db->where('acceso', $acceso->acceso)->update('acceso', ['activo' => (int)$args['incluido']]);
			} else if ((int)$args['incluido'] === 1) {
				$nvoAcceso = [
					'usuario' => (int)$usr->usuario,
					'modulo' => (int)$args['modulo'],
					'submodulo' => (int)$args['submodulo'],
					'opcion' => (int)$args['opcion'],
					'activo' => 1
				];
				$this->db->insert('acceso', $nvoAcceso);
			}
		}
	}
}
