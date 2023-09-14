<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Impuesto_especial extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model('ImpuestoEspecial_model');
        $this->output
		->set_content_type("application/json", "UTF-8");
	}

	public function guardar($id = "") 
	{
		$impuesto = new ImpuestoEspecial_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $impuesto->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = "Datos actualizados con éxito.";
				$datos['impuesto_especial'] = $impuesto;
			} else {
				$datos['mensaje'] = $impuesto->getMensaje();
			}	
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->ImpuestoEspecial_model->buscar($_GET);

		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($datos));
	}

}