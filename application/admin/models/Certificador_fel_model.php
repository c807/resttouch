<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Certificador_fel_model extends General_model {

	public $certificador_fel;
	public $nombre;
	public $vinculo_factura = null;
	public $vinculo_firma = null;
	public $llave = null;
	public $usuario = null;
	public $metodo_factura = null;
	public $vinculo_anulacion = null;
	public $metodo_anulacion = null;
	public $firma_llave = null;
	public $firma_codigo = null;
	public $firma_alias = null;
	public $nit = null;
	public $correo_emisor = null;
	public $frase_retencion_isr = null;
	public $frase_retencion_iva = null;
	public $vinculo_grafo = null;
	public $metodo_grafo = null;
	public $certificador_configuracion;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("certificador_fel");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function cargarConfiguracion()
	{
		
	}

}

/* End of file Certificador_fel_model.php */
/* Location: ./application/admin/models/Certificador_fel_model.php */