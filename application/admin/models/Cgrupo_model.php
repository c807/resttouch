<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cgrupo_model extends General_model {

	public $categoria_grupo;
	public $descripcion;
	public $categoria;
	public $categoria_grupo_grupo;
	public $receta = 0;
	public $impresora;
	public $descuento = 0;
	public $cuenta_contable = null;
	public $bodega = null;
	public $debaja = 0;
	public $fechabaja = null;
	public $usuariobaja = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("categoria_grupo");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function dar_de_baja_articulos($idUsuarioBaja)
	{
		$this->load->model('Articulo_model');
		$articulos = $this->Articulo_model->buscar(['categoria_grupo' => $this->getPK(), 'debaja' => 0]);
		foreach($articulos as $art)
		{
			$tmpArt = new Articulo_model($art->articulo);
			$tmpArt->dar_de_baja($idUsuarioBaja);
		}		
	}

	public function get_simple_list($args = [])
	{
		if (isset($args['sede'])) {
			$this->db->where('b.sede', $args['sede']);
		}

		if (isset($args['debaja'])) {
			$this->db->where('a.debaja', $args['debaja']);
		}

		if (!isset($args['_todos'])) {
			$this->db->where('c.mostrar_inventario', 1);
		}

		return $this->db
			->select('a.categoria_grupo, a.descripcion, b.descripcion as categoria')
			->join('categoria b', 'b.categoria = a.categoria')
			->join('articulo c', 'a.categoria_grupo = c.categoria_grupo')
			->group_by('a.categoria_grupo, a.descripcion, b.descripcion')
			->order_by('a.descripcion, b.descripcion')
			->get('categoria_grupo a')
			->result();
	}

}

/* End of file Cgrupo_model.php */
/* Location: ./application/admin/models/Cgrupo_model.php */