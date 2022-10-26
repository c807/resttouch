<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tarifa_reserva_model extends General_model {

    public $tarifa_reserva;
	public $tipo_habitacion;
	public $cantidad_adultos = 0;	
    public $cantidad_menores = 0;
    public $monto = 0.0;
    public $monto_adicional_adulto = 0.0;
    public $monto_adicional_menor = 0.0;    

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('tarifa_reserva');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

}