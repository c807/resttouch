<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ranulacion extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model('Razon_anulacion_model');
	}

	public function guardar($id = '')
	{
		$razon = new Razon_anulacion_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$existe = (int)$req['anulado'] === 0 ? $this->Razon_anulacion_model->buscar(['anulado' => 0, 'TRIM(UPPER(descripcion))' => trim(strtoupper($req['descripcion']))]) : false;
			if (!$existe) {
				$datos['exito'] = $razon->guardar($req);
				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['razon_anulacion'] = $this->Razon_anulacion_model->buscar([
						'razon_anulacion' => $razon->getPK(),
						'_uno' => true
					]);
				} else {
					$datos['mensaje'] = $razon->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Ya existe esta razón de anulación.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$_GET['anulado'] = 0;
		$datos = $this->Razon_anulacion_model->buscar($_GET);
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}
}

/* End of file Ranulacion.php */
/* Location: ./application/admin/controllers/mante/Ranulacion.php */