<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reserva extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model(['Reserva_model', 'Dreserva_model', 'Mesa_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	public function guardar($id = null)
	{
		$rsrv = new Reserva_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$hayCruceDeFechas = $this->Reserva_model->hayCruceDeFechas($req['mesa'], $req['fecha_del'], $req['fecha_al'], (int)$req['reserva']);
			if ($hayCruceDeFechas) {
				$datos['mensaje'] = 'Ya existe una reservación en estas fechas. Por favor cambie las fechas e intente de nuevo.';
			} else {
				$datos['exito'] = $rsrv->guardar($req);
				if ($datos['exito']) {
					$rsrv->generaDetalle();
					$habitacion = new Mesa_model($rsrv->mesa);
					$rsrv->area = $habitacion->area;
					$rsrv->numero_mesa = $habitacion->numero;
					$datos['reserva'] = $rsrv;
					$datos['mensaje'] = 'Datos actualizados con éxito.';
				} else {
					$datos['mensaje'] = $rsrv->getMensaje();
				}
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$dias = [1 => 'monDate', 2 => 'marDate', 3 => 'mierDate', 4 => 'jueDate', 5 => 'vierDate', 6 => 'sabdDate', 7 => 'domDate'];
			$fecha = DateTime::createFromFormat('Y-m-d', $req['fecha']);
			if (isset($req['fecha']) && $fecha && $fecha->format('Y-m-d') === $req['fecha'] && (int)$fecha->format('w') === 1) {
				$datos['reservas'] = [];
				for ($i = 0; $i <= 6; $i++) {
					$datos['reservas'][$dias[(int)$fecha->format('N')]] = $this->Reserva_model->get_reservas($fecha->format('Y-m-d'));
					$fecha->modify('+1 day');
				}
				$datos['exito'] = true;
				$datos['mensaje'] = 'Reservas recuperadas con éxito.';
			} else {
				$datos['mensaje'] = 'Por favor envíe una fecha válida que sea lunes.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function simple_search()
	{
		$datos = $this->Reserva_model->buscar($_GET);
		foreach ($datos as $rsrv) {
			$habitacion = new Mesa_model($rsrv->mesa);
			$rsrv->area = $habitacion->area;
			$rsrv->numero_mesa = $habitacion->numero;
		}
		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Propina.php */
/* Location: ./application/admin/controllers/mante/Propina.php */