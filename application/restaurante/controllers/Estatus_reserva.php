<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Estatus_reserva extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Estatus_reserva_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	public function guardar($id = null)
	{
		$est_rsrv = new Estatus_reserva_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$datos['exito'] = $est_rsrv->guardar($req);
			if ($datos['exito']) {
				$datos['estatus_reserva'] = $est_rsrv;
				$datos['mensaje'] = 'Datos actualizados con éxito.';
			} else {
				$datos['mensaje'] = $est_rsrv->getMensaje();
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Estatus_reserva_model->buscar($_GET);
		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Propina.php */
/* Location: ./application/admin/controllers/mante/Propina.php */