<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_model extends General_model {

	public $cliente_master;
	public $nombre;
    public $correo = null;
    public $fecha_nacimiento = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('cliente_master');
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
	public function get_historico($args = [], $soloDetalle = false)
	{
		if (isset($args['cliente_master']))
		{
			$this->db->where('a.cliente_master', $args['cliente_master']);
		}

		if (isset($args['comanda']))
		{
			$this->db->where('a.comanda', $args['comanda']);
		}

		if ($soloDetalle) {
			$this->db->select('b.cantidad, b.articulo, c.descripcion, b.notas, b.detalle_comanda_id, c.multiple');
		} else {
			$this->db->select('a.comanda, a.fhcreacion, a.detalle_comanda_original');
			$this->db->group_by('a.comanda');
			$this->db->order_by('a.fhcreacion', 'DESC');
			$this->db->limit(5);
		}

		$data = $this->db
			->join('detalle_comanda b', 'a.comanda = b.comanda')
			->join('articulo c', 'c.articulo = b.articulo')
			->where('b.cantidad >', 0)
			->get('comanda a')
			->result();

		if (!$soloDetalle) {
			foreach($data as $cmd) {
				$args['comanda'] = $cmd->comanda;
				$cmd->detalle = $this->get_historico($args, true);
			}
		}
		
		return $data;
	}
}
