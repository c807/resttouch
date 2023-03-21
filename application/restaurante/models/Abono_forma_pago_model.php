<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Abono_forma_pago_model extends General_model {

	public $abono_forma_pago;
    public $abono;
    public $forma_pago;
    public $monto = 0;
    public $documento = null;
    public $observaciones = null;
    public $propina = 0;
    public $comision_monto = 0;
    public $retencion_monto = 0;
    public $vuelto_para = 0;
    public $vuelto = 0;
    public $tarjeta_respuesta = null;

	public function __construct($id = null)
	{
		parent::__construct();
		$this->setTabla('abono_forma_pago');

		if($id !== null) {
			$this->cargar($id);
		}
	}
}