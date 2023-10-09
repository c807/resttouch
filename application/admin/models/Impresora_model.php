<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Impresora_model extends General_model {

	public $impresora;
	public $sede;
	public $nombre;
	public $direccion_ip;
	public $ubicacion;
	public $bluetooth = 0;
	public $bluetooth_mac_address;
	public $modelo;
	public $pordefecto = 0;
	public $pordefectocuenta = 0;
	public $pordefectofactura = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("impresora");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function quitar_por_defecto($sede, $campo = 'pordefecto')
	{
		$this->db->set($campo, 0);
		$this->db->where('sede', $sede);
		$this->db->update('impresora');
	}

	public function get_lista($args = [])
	{
		$campos = $this->getCampos(false, '', 'impresora');

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('sede', $args['sede']);
			} else if ((int)$args['sede'] > 0) {
				$this->db->where('sede', $args['sede']);
			}
		}

		return $this->db->select($campos)->get('impresora')->result();
	}

	public function get_lista_impresoras($args = [])
	{
		$lista = [];
		$tmp = $this->get_lista($args);
		foreach($tmp as $imp) {
			$lista[(int)$imp->impresora] = clone $imp;
		}
		return $lista;
	}
}

/* End of file Impresora_model.php */
/* Location: ./application/admin/models/Impresora_model.php */