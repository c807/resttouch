<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Configuracion extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model('Configuracion_model');
        $this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '') 
	{
		$config = new Configuracion_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			if (isset($req['campo'])) {
				$req['campo'] = strtoupper($req['campo']);
			}
			
			$datos['exito'] = $config->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['configuracion'] = $config;
			} else {
				$datos['mensaje'] = $config->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{		
		// $datos = $this->Configuracion_model->buscar($_GET);
		$datos = $this->Configuracion_model->buscar_configuraciones($_GET);
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

}

/* End of file Configuracion.php */
/* Location: ./application/admin/controllers/mante/Configuracion.php */