<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Corporacion extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Corporacion_model']);
	}

	public function guardar($id = '')
	{
		$corp = new Corporacion_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$datos['exito'] = $corp->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['corporacion'] = $this->Corporacion_model->buscar([
					'corporacion' => $corp->getPK(), 
					'_uno' => true
				]);
			} else {
				$datos['mensaje'] = $corp->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$this->output->set_content_type('application/json')->set_output(json_encode($this->Corporacion_model->buscar($_GET)));
	}

}

/* End of file Corporacion.php */
/* Location: ./application/admin/controllers/mante/Corporacion.php */