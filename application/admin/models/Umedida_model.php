<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Umedida_model extends General_model {

	public $medida;
	public $descripcion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('medida');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_medidas($args = [])
	{
		$campos = $this->getCampos(false, '', 'medida');		

		if (isset($args['medida']) && (int)$args['medida'] > 0) {
			$this->db->where('medida', (int)$args['medida']);
		}

		if (isset($args['descripcion']) && is_string($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}		
		
		$tmp = $this->db->select($campos)->get('medida');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}
		
		return $tmp->result();		
	}

	public function get_lista_medidas($args = [])
	{
		if (isset($args['_uno'])) {
			unset($args['_uno']);
		}
		
		$tmp = $this->buscar_medidas($args);
		
		$lista = [];
		foreach($tmp as $m) {
			$lista[(int)$m->medida] = clone $m;
		}

		return $lista;
	}

}

/* End of file Umedida_model.php */
/* Location: ./application/admin/models/Umedida_model.php */