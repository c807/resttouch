<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class TurnoTipo_model extends General_model {

	public $turno_tipo;
	public $descripcion;
	public $activo = 1;
	public $enviar_reporte = 0;
	public $correo_cierre = '';
	public $bodega = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('turno_tipo');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getBodega()
	{
		return $this->db
		->select('bodega, descripcion')
		->from('bodega')
		->where('bodega', $this->bodega)
		->get()
		->row();
	}

	public function buscar_turnostipo($args = [])
	{
		$campos = $this->getCampos(false, '', 'turno_tipo');

		if (isset($args['turno_tipo']) && (int)$args['turno_tipo'] > 0) {
			$this->db->where('turno_tipo', $args['turno_tipo']);
		}

		if (isset($args['descripcion']) && is_string($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}

		if (isset($args['activo']) && in_array((int)$args['activo'], [0, 1])) {
			$this->db->where('activo', $args['activo']);
		}

		if (isset($args['enviar_reporte']) && in_array((int)$args['enviar_reporte'], [0, 1])) {
			$this->db->where('enviar_reporte', $args['enviar_reporte']);
		}

		if (isset($args['correo_cierre']) && is_string($args['correo_cierre'])) {
			$this->db->where('correo_cierre', $args['correo_cierre']);
		}

		if (isset($args['bodega']) && (int)$args['bodega'] > 0) {
			$this->db->where('bodega', $args['bodega']);
		}

		$tmp = $this->db->select($campos)->get('turno_tipo');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}

/* End of file TurnoTipo_model.php */
/* Location: ./application/admin/models/TurnoTipo_model.php */