<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Telefono_model extends General_model {

	public $telefono;
	public $numero;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('telefono');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}
}
