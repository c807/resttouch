<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tarifa_reserva extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model('Tarifa_reserva_model');
        $this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '') 
	{
		$tarifares = new Tarifa_reserva_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $tarifares->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito';
				$datos['tarifa_reserva'] = $tarifares;
			} else {
				$datos['mensaje'] = $tarifares->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parametros inválidos';
		}
		
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Tarifa_reserva_model->buscar($_GET);
		$this->output->set_output(json_encode($datos));
	}

}