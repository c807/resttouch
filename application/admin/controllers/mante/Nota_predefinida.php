<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Nota_predefinida extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model('Nota_predefinida_model');
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$nota = new Nota_predefinida_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			$datos['exito'] = $nota->guardar($req);
			if ($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['nota_predefinida'] = $nota;
			} else {
				$datos['mensaje'] = $nota->getMensaje();
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Nota_predefinida_model->buscar($_GET);
		$datos = ordenar_array_objetos($datos, 'nota');
		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Nota.php */
/* Location: ./application/admin/controllers/mante/Nota.php */