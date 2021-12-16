<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_model extends General_model {

	public $cliente;
	public $nombre;
	public $direccion;
	public $nit;
	public $telefono;
	public $correo;
	public $codigo_postal;
	public $municipio;
	public $departamento;
	public $pais_iso_dos;
	public $observaciones;

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
        $this->db->where('nit', $args['nit']);
        //Get the results
        return $this->db->get()->result();
    }

}

/* End of file Cliente_model.php */
/* Location: ./application/admin/models/Cliente_model.php */
