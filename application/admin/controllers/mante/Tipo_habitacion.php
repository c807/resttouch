<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tipo_habitacion extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model('Tipo_habitacion_model');
        $this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '') 
	{
		$tipohabitacion = new Tipo_habitacion_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $tipohabitacion->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito';
				$datos['tipo_habitacion'] = $tipohabitacion;
			} else {
				$datos['mensaje'] = $tipohabitacion->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parametros inválidos';
		}
		
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Tipo_habitacion_model->buscar($_GET);
		$this->output->set_output(json_encode($datos));
	}

}