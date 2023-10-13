<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Conocimiento extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
		set_database_server();
        $this->load->model('Conocimiento_model');
        $this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '') 
	{
		$knowledge = new Conocimiento_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {			
			
			$datos['exito'] = $knowledge->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['conocimiento'] = $knowledge;
			} else {
				$datos['mensaje'] = $knowledge->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{		
		$datos = $this->Conocimiento_model->buscar($_GET);
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

}

/* End of file Conocimiento.php */
/* Location: ./application/admin/controllers/mante/Conocimiento.php */