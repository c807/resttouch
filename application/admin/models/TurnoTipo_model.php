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
}

/* End of file TurnoTipo_model.php */
/* Location: ./application/admin/models/TurnoTipo_model.php */