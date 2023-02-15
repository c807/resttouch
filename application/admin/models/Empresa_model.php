<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Empresa_model extends General_model {
	public $corporacion;
    public $nombre;
    public $numero_acceso;
    public $afiliacion_iva;
    public $codigo_establecimiento;
    public $correo_emisor;
    public $nit;
    public $nombre_comercial;
    public $direccion;
    public $codigo_postal;
    public $municipio;
    public $departamento;
    public $pais_iso_dos;
    public $agente_retenedor = 0;
    public $porcentaje_iva = 0.00;
    public $visa_merchant_id;
    public $visa_transaction_key;
    public $codigo = null;
    public $metodo_costeo = 1;
    public $leyenda_isr;
    public $cuenta_contable_iva_venta = null;
    public $cuenta_contable_propina = null;
    public $cuenta_contable_iva_propina = null;
    public $concepto_mayor_venta = null;

	public function __construct($id = "")
	{
		parent::__construct();
        $this->setTabla("empresa");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}
}

/* End of file Empresa_model.php */
/* Location: ./application/admin/models/Empresa_model.php */