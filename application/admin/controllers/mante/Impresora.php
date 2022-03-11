<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Impresora extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model('Impresora_model');
        $this->output
		->set_content_type("application/json", "UTF-8");
	}

	public function guardar($id = "") 
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$imp = new Impresora_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$req['sede'] = $data->sede;

			if (isset($req['pordefecto']) && (int)$req['pordefecto'] === 1) {
				$imp->quitar_por_defecto($req['sede']);
			}

			$datos['exito'] = $imp->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = "Datos Actualizados con Exito";
				$datos['impresora'] = $imp;
			} else {
				$datos['mensaje'] = $imp->getMensaje();
			}	
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{	
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$_GET['sede'] = $data->sede;
		$datos = $this->Impresora_model->buscar($_GET);

		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($datos));
	}

}

/* End of file Impresora.php */
/* Location: ./application/admin/controllers/mante/Impresora.php */