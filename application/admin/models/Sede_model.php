<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Sede_model extends General_model {

	public $sede;
	public $empresa;
    public $sede_padre;
    public $nombre;
    public $certificador_fel;
    public $fel_establecimiento;
    public $direccion;
    public $telefono;
    public $correo;
    public $codigo;
    public $cuenta_contable;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("sede");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getEmpresa()
	{
		return new Empresa_model($this->empresa);
	}
}

/* End of file Sede_model.php */
/* Location: ./application/admin/models/Sede_model.php */