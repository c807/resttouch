<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tipo_compra_venta extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model('Tipo_compra_venta_model');
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$tcvm = new Tipo_compra_venta_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $tcvm->guardar($req);

			if ($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito';
				$datos['tipo_compra_venta'] = $tcvm;
			} else {
				$datos['mensaje'] = $tcvm->getMensaje();
			}
		} else {
			$datos['mensaje'] = 'Parametros inválidos';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Tipo_compra_venta_model->buscar($_GET);
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}
}
