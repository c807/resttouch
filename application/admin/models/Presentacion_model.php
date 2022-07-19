<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Presentacion_model extends General_model {

	public $presentacion;
	public $medida;
	public $descripcion;
	public $cantidad;
	public $debaja = 0;
	public $fechabaja = null;
	public $usuariobaja = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("presentacion");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getMedida()
	{
		return $this->db
					->where("medida", $this->medida)
					->get("medida")
					->row();
	}

}

/* End of file Presentacion_model.php */
/* Location: ./application/admin/models/Presentacion_model.php */