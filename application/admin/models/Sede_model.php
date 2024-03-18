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
	public $alias = null;
	public $codigo_postal = null;
	public $municipio = null;
    public $departamento = null;
    public $pais_iso_dos = null;
	public $debaja_monitor = 0;
	public $fechabaja = null;
	public $enviar_factura_pagada = 1;

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

	public function get_sede_uuid($idSede = null)
	{
		if(empty($idSede))
		{
			$idSede = $this->getPK();
		}

		$valor = $this->db
			->select('CONCAT(c.admin_llave, "-",b.empresa, "-", a.sede) AS sede_uuid')
			->join('empresa b', 'b.empresa = a.empresa')
			->join('corporacion c', 'c.corporacion = b.corporacion')
			->where('a.sede', $idSede)
			->get('sede a')
			->row();

		return $valor && $valor->sede_uuid ? $valor->sede_uuid : '';
	}
}

/* End of file Sede_model.php */
/* Location: ./application/admin/models/Sede_model.php */