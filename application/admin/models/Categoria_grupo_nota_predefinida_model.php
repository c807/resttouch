<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Categoria_grupo_nota_predefinida_model extends General_model {

	public $categoria_grupo;
	public $nota_predefinida;
  	
  	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("categoria_grupo_nota_predefinida");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function eliminarNota($nota)
	{
		if (!empty($nota)) {
			$this->db->where("nota_predefinida", $nota)
					->delete($this->_tabla);
		}
	}
  
}
