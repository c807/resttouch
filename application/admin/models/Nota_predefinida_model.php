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

	public function getGrupos()
	{
		return $this->Categoria_grupo_nota_predefinida_model->buscar([
			'nota_predefinida' => $this->getPK()
		]);
	}

}

/* End of file Nota_model.php */
/* Location: ./application/admin/models/Nota_model.php */