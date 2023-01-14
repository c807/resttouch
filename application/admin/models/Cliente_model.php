<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_model extends General_model {

	public $cliente;
	public $nombre;
	public $direccion;
	public $nit = null;
	public $cui = null;
	public $pasaporte = null;
	public $telefono;
	public $correo;
	public $codigo_postal;
	public $municipio;
	public $departamento;
	public $pais_iso_dos;
	public $observaciones;
	public $tipo_cliente = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente");		

		if(!empty($id)) {
			$this->cargar($id);
		}
	}


    public function get_with_nit($args = []){
        //Query Builder
        $this->db->select('*');
        $this->db->from('cliente');
        // $this->db->where('nit', $args['nit']);
		$this->db->where("(TRIM(nit) = '{$args['nit']}' OR TRIM(cui) = '{$args['nit']}' OR TRIM(pasaporte) = '{$args['nit']}')");
        //Get the results
		$results = $this->db->get()->result();
        return $results;
    }

	public function get_lista($args = [], $rowno = 0, $rowperpage = 5, $search='')
	{
		$campos = $this->getCamposTabla(false);
		$this->db->select($campos);
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where($key, $row);
				}
			}
		}		
		$this->db->order_by('nombre');
		// $this->db->limit($rowperpage, $rowno);
		$query = $this->db->get('cliente');
		return $query->result();
	}	
}

/* End of file Cliente_model.php */
/* Location: ./application/admin/models/Cliente_model.php */
