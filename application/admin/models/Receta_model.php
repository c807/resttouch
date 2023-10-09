<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Receta_model extends General_model
{

	public $articulo_detalle;
	public $receta;
	public $racionable = 0;
	public $articulo;
	public $cantidad;
	public $medida;
	public $anulado;
	public $precio_extra = 0;
	public $precio = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('articulo_detalle');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getArticulo()
	{
		$campos = $this->getCampos(false, '', 'articulo');
		return $this->db
			->select($campos)
			->where('articulo', $this->articulo)
			->get('articulo')
			->row();
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

	public function buscar_recetas($args = [])
	{
		$campos = $this->getCampos(false, '', 'articulo_detalle');

		if (isset($args['articulo_detalle']) && (int)$args['articulo_detalle'] > 0) {
			$this->db->where('articulo_detalle', (int)$args['articulo_detalle']);
		}

		if (isset($args['receta']) && (int)$args['receta'] > 0) {
			$this->db->where('receta', (int)$args['receta']);
		}

		if (isset($args['racionable']) && (int)$args['racionable'] > 0) {
			$this->db->where('racionable', (int)$args['racionable']);
		}

		if (isset($args['articulo']) && (int)$args['articulo'] > 0) {
			$this->db->where('articulo', (int)$args['articulo']);
		}

		if (isset($args['cantidad']) && is_numeric($args['cantidad'])) {
			$this->db->where('cantidad', (float)$args['cantidad']);
		}

		if (isset($args['medida']) && (int)$args['medida'] > 0) {
			$this->db->where('medida', (int)$args['medida']);
		}

		if (isset($args['anulado']) && in_array((int)$args['anulado'], [0, 1])) {
			$this->db->where('anulado', (int)$args['anulado']);
		}
		
		if (isset($args['precio_extra']) && in_array((int)$args['precio_extra'], [0, 1])) {
			$this->db->where('precio_extra', (int)$args['precio_extra']);
		}
		
		$tmp = $this->db->select($campos)->get('articulo_detalle');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}
		
		return $tmp->result();		
	}
}

/* End of file Receta_model.php */
/* Location: ./application/admin/models/Receta_model.php */