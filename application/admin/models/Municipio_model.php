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

	public function buscar_municipios($fltr = [])
	{
		$campos = $this->getCampos(false, '', 'municipio');

		if (isset($fltr['municipio']) && (int)$fltr['municipio'] > 0) {
			$this->db->where('municipio', (int)$fltr['municipio']);
		}

		if (isset($fltr['codigo']) && is_string($fltr['codigo'])) {
			$this->db->where('codigo', $fltr['codigo']);
		}

		if (isset($fltr['depto']) && is_string($fltr['depto'])) {
			$this->db->where('depto', $fltr['depto']);
		}

		if (isset($fltr['mupio']) && is_string($fltr['mupio'])) {
			$this->db->where('mupio', $fltr['mupio']);
		}		

		$tmp = $this->db->select($campos)->get('municipio');

		if (isset($fltr['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}	

}

/* End of file Nota_model.php */
/* Location: ./application/admin/models/Nota_model.php */