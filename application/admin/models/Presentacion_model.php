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

	public function get_lista_presentaciones($args = [])
	{
		$campos = $this->getCampos(false, '', 'presentacion');

		$lista = [];
		$tmp = $this->db->select($campos)->get('presentacion')->result();
		foreach($tmp as $pres) {
			$lista[(int)$pres->presentacion] = clone $pres;
		}

		return $lista;
	}
}

/* End of file Presentacion_model.php */
/* Location: ./application/admin/models/Presentacion_model.php */