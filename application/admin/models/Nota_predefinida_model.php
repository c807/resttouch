<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Nota_predefinida_model extends General_model {

	public $nota_predefinida;
	public $nota;	

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("nota_predefinida");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}	

}

/* End of file Nota_model.php */
/* Location: ./application/admin/models/Nota_model.php */