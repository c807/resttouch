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

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("impresora");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

}

/* End of file Impresora_model.php */
/* Location: ./application/admin/models/Impresora_model.php */