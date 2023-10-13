<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Solicitud_registro extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Solicitud_registro_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$solicitud = new Solicitud_registro_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$fltr = [
				'TRIM(UPPER(nit))' => trim(strtoupper($req['nit']))
			];

			$existe = $this->Solicitud_registro_model->buscar($fltr);
			if (!$existe) {
				$datos['exito'] = $solicitud->guardar($req);
				if ($datos['exito']) {
					$datos['mensaje'] = 'Solicitud enviada con éxito.';
					$datos['area'] = $solicitud;
				} else {
					$datos['mensaje'] = $solicitud->getMensaje();
				}
			} else {
				$datos['mensaje'] = "Ya hay una solicitud registrada con el NIT {$req['nit']}.";
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}
}
