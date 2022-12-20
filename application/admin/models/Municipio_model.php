<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Municipio_model extends General_model {

	public $municipio;
	public $codigo;	
    public $depto;	
    public $mupio;	

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('municipio');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}	

}

/* End of file Nota_model.php */
/* Location: ./application/admin/models/Nota_model.php */