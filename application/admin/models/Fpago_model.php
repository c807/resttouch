<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fpago_model extends General_model {

	public $forma_pago;
	public $descripcion;
	public $activo = 1;
	public $descuento = 0;
	public $comision_porcentaje = 0.00;
	public $retencion_porcentaje = 0.00;
	public $pedirdocumento = 0;
	public $adjuntararchivo = 0;
	public $pedirautorizacion = 0;

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