<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Repartidor_model extends General_model {

	public $repartidor;
	public $sede;
	public $nombre;
    public $debaja = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('repartidor');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
