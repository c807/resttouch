<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Area_model extends General_Model {

	public $area;
	public $sede;
	public $area_padre;
	public $nombre;
	public $impresora;
	public $impresora_factura = 0;
	public $escallcenter = 0;
	public $mesas_fila_area = 3;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("area");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_mesas($verDeBaja = false) {
		if (!$verDeBaja) {
			$this->db->where('debaja', 0);
		}

		return $this->db
					->where("area", $this->area)
					->get("mesa")
					->result();
	}
}

/* End of file Area_model.php */
/* Location: ./application/admin/models/Area_model.php */