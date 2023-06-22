<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fpago_model extends General_model {

	public $forma_pago;
	public $descripcion;
	public $activo = 1;
	public $descuento = 0;
	public $aumento_porcentaje = 0.00;
	public $comision_porcentaje = 0.00;
	public $retencion_porcentaje = 0.00;
	public $pedirdocumento = 0;
	public $adjuntararchivo = 0;
	public $pedirautorizacion = 0;
	public $sinfactura = 0;
	public $esefectivo = 0;
	public $escobrohabitacion = 0;
	public $esabono = 0;
	public $porcentaje_maximo_descuento = 0.00;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("forma_pago");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

}

/* End of file Fpago_model.php */
/* Location: ./application/admin/models/Fpago_model.php */