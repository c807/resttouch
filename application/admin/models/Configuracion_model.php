<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Configuracion_model extends General_model
{

	public $campo;
	public $tipo;
	public $valor;
	public $fhcreacion;
	public $descripcion = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('configuracion');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_configuraciones($args = [])
	{
		$campos = $this->getCampos(false, '', 'configuracion');

		if (isset($args['configuracion']) && (int)$args['configuracion'] > 0) {
			$this->db->where('configuracion', $args['configuracion']);
		}

		if (isset($args['campo']) && is_string($args['campo'])) {
			$this->db->where('campo', $args['campo']);
		}

		$tmp = $this->db->select($campos)->get('configuracion');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}

/* End of file Configuracion_model.php */
/* Location: ./application/admin/models/Configuracion_model.php */