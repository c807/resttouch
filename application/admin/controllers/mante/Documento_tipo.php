<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Documento_tipo extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
		set_database_server();
        $this->load->model('Documento_tipo_model');
        $this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '') 
	{
		$doctipo = new Documento_tipo_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $doctipo->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['documento_tipo'] = $doctipo;
			} else {
				$datos['mensaje'] = $doctipo->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parametros inválidos.';
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Documento_tipo_model->buscar($_GET);
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}
}