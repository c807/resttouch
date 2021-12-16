<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_model extends General_model {

	public $cliente_master;
	public $nombre;
    public $correo = null;
    public $fecha_nacimiento = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("cliente_master");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

    public function get_lista_telefonos($args = [])
    {
        if(isset($args['cliente_master'])) {
            $this->db->where('a.cliente_master', $args['cliente_master']);
        }

//        if(isset($args['telefono'])) {
//            $this->db->where('a.telefono', $args['telefono']);
//        }
//
//        if(isset($args['numero'])) {
//            if(isset($args['_parecido'])) {
//                $this->db->like('c.numero', $args['numero'], 'both', false);
//            } else {
//                $this->db->where('c.numero', $args['numero']);
//            }
//        }

        return $this->db
            ->select('a.cliente_master_telefono')
            //->select('a.cliente_master_telefono, b.*, c.*')
            //->join('cliente_master b', 'b.cliente_master = a.cliente_master')
            //->join('telefono c', 'c.telefono = a.telefono')
            ->where('a.debaja', 0)
            //->get('cliente_master_telefono a')
            ->result();
    }
}
