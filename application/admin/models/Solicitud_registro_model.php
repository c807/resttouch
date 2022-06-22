<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Solicitud_registro_model extends General_model {

	public $solicitud_registro;
	public $corporacion = null;
    public $empresa = null;
    public $nit = null;
    public $direccion = null;
    public $pais = null;
    public $departamento = null;
    public $municipio = null;
    public $codigo_postal = null;
    public $nombre = null;
    public $telefono = null;
	public $correo_electronico = null;
    public $fhcreacion;
    public $procesada = 0;
    public $fhprocesada = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('administracion.solicitud_registro');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}	
}

/* End of file Sede_model.php */
/* Location: ./application/admin/models/Sede_model.php */