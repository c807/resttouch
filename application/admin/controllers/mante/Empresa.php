<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Empresa extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			"Empresa_model"
		]);
	}

	public function guardar($id = "")
	{
		$emp = new Empresa_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$datos['exito'] = $emp->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = "Datos actualizados con éxito.";
				$datos['empresa'] = $this->Empresa_model->buscar([
					"empresa" => $emp->getPK(), 
					"_uno" => true
				]);
			} else {
				$datos['mensaje'] = $emp->getMensaje();
			}	
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($this->Empresa_model->buscar($_GET)));
	}

}

/* End of file Empresa.php */
/* Location: ./application/admin/controllers/mante/Empresa.php */