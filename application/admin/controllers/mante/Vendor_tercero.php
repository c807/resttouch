<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Vendor_tercero extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Vendor_tercero_model', 'Sede_vendor_tercero_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$vt = new Vendor_tercero_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$existe = $this->Vendor_tercero_model->buscar([
				'TRIM(UPPER(nombre))' => trim(strtoupper($req['nombre'])),
				'comanda_origen' => $req['comanda_origen'],
				'_uno' => true
			]);

			if (!$existe) {
				$datos['exito'] = $vt->guardar($req);

				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['vendor_tercero'] = $vt;
				} else {
					$datos['mensaje'] = $vt->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Ya existe este vendor con este origen.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Vendor_tercero_model->full_search($_GET);
		$datos = ordenar_array_objetos($datos, 'nombre');
		$this->output->set_output(json_encode($datos));
	}

	public function get_sede_vendor_tercero()
	{
		$datos = $this->Sede_vendor_tercero_model->buscar($_GET);
		$this->output->set_output(json_encode($datos));
	}

	public function guardar_sede_vendor_tercero($id = '')
	{
		$svt = new Sede_vendor_tercero_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$existe = $this->Sede_vendor_tercero_model->buscar([
				'sede' => $req['sede'],
				'vendor_tercero' => $req['vendor_tercero'],
				'_uno' => true
			]);

			if (!$existe) {
				$datos['exito'] = $svt->guardar($req);

				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['sede_vendor_tercero'] = $svt;
				} else {
					$datos['mensaje'] = $svt->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Ya existe esta sede para este vendor.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Umedida.php */
/* Location: ./application/admin/controllers/mante/Umedida.php */