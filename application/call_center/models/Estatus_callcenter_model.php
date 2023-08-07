<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Estatus_callcenter_model extends General_model {

	public $estatus_callcenter;
	public $descripcion;
    public $color;
    public $orden;
	public $esautomatico = 0;
	public $pedir_repartidor = 0;
	public $esultimo = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('estatus_callcenter');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_lista()
	{
		$campos = $this->getCampos(false, '', 'estatus_callcenter');
		return $this->db->select($campos)->get('estatus_callcenter')->result();
	}
}
