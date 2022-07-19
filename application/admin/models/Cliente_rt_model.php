<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_rt_model extends General_model {

	public $id;
	public $nombre;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('administracion.cliente');        
        $this->setLlave('id');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}