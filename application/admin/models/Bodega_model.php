<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Bodega_model extends General_model {

	public $bodega;
	public $descripcion;
	public $sede;
	public $merma = 0;
	public $pordefecto = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("bodega");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}

/* End of file Bodega_model.php */
/* Location: ./application/admin/models/Bodega_model.php */