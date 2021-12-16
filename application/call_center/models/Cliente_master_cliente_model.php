<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_cliente_model extends General_model
{

    public $cliente_master_cliente;
    public $cliente_master;
    public $cliente;
    public $debaja;

    public function __construct($id = "")
    {
        parent::__construct();
        $this->setTabla("cliente_master_cliente");
        if (!empty($id)) {
            $this->cargar($id);
        }
    }


    public function get_lista_cliente_master($args = [])
    {
        //Query Builder
        $this->db->select('*');
        $this->db->from('cliente_master_cliente');
        $this->db->where('cliente_master', $args['cliente_master']);
        $this->db->where('debaja', 0);

        //Get the results
        return $this->db->get()->result();

    }

    /**
     * Returns the first row
     * with condition
     *   debaja = 1
     *   cliente_master
     *   nit = number
     * @param array $args
     * @return mixed
     */
    public function get_join_nit_debaja($args = [])
    {
        //Check for any debaja.
        return  $this->db
            ->select('a.*, b.* , c.*')
            ->join('cliente_master b', 'b.cliente_master = a.cliente_master')
            ->join('cliente c', 'c.cliente = a.cliente')
            ->where('a.cliente_master', $args['cliente_master'])
            ->where('c.nit', $args['nit'])
            ->where('a.debaja', 1)
            ->get('cliente_master_cliente a')
            ->row();

    }


    /**
     * Returns the first row
     * with condition
     *   debaja = 0
     *   cliente_master
     *   nit = number
     * @param array $args
     * @return mixed
     */
    public function get_join_nit_no_debaja($args = [])
    {
        //Check for any debaja.
        return  $this->db
            ->select('a.*, b.* , c.*')
            ->join('cliente_master b', 'b.cliente_master = a.cliente_master')
            ->join('cliente c', 'c.cliente = a.cliente')
            ->where('a.cliente_master', $args['cliente_master'])
            ->where('c.nit', $args['nit'])
            ->where('a.debaja', 0)
            ->get('cliente_master_cliente a')
            ->row();

    }


}
