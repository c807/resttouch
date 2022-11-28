<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reserva extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Reserva_model', 'Dreserva_model', 'Mesa_model', 'Tarifa_reserva_model',
			'Comanda_model', 'Cuenta_model', 'Dcomanda_model', 'Articulo_model',
			'Receta_model', 'Dcuenta_model'
		]);
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
				$continuar = true;
				$cmdAbierta = 0;
				if ((int)$req['estatus_reserva'] === 2) {
					$cmdAbierta = $rsrv->get_numero_comanda_reserva(null, true);
					$mesa = new Mesa_model($req['mesa']);
					$cmdAbiertaDeMesa = $mesa->get_comanda(['estatus' => 1]);
					$continuar = (int)$cmdAbierta === 0 && !$cmdAbiertaDeMesa && (int)$cmdAbiertaDeMesa->comanda === 0;
				}

				if ($continuar) {
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
				} else {
					$datos['mensaje'] = 'Esta habitación tiene una comanda abierta. Debe cerrarla primero para poder hacer check in.';
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

	public function agregar_cobro_habitacion()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post' && isset($req['reserva'])) {
			$rsvr = new Reserva_model($req['reserva']);
			$numero_comanda = $rsvr->get_numero_comanda_reserva();
			if ((int)$numero_comanda > 0) {
				$cta = $this->Cuenta_model->buscar(['comanda' => $numero_comanda, 'numero' => 1, 'cerrada' => 0, '_uno' => true]);
				if ($cta && (int)$cta->cuenta > 0) {
					$tarifa = new Tarifa_reserva_model($rsvr->tarifa_reserva);
					if ($tarifa && (int)$tarifa->articulo > 0) {
						$comanda = new Comanda_model($numero_comanda);
						$cuenta = new Cuenta_model($cta->cuenta);
						$monto = (float)$tarifa->monto;
						$adultos_extras = (int)$rsvr->cantidad_adultos - (int)$tarifa->cantidad_adultos;
						$monto_adulto_adicional = $adultos_extras > 0 ? ($adultos_extras * (float)$tarifa->monto_adicional_adulto) : 0.0;
						$menores_extras = (int)$rsvr->cantidad_menores - (int)$tarifa->cantidad_menores;
						$monto_menor_adicional = $menores_extras > 0 ? ($menores_extras * (float)$tarifa->monto_adicional_menor) : 0.0;
						$monto += $monto_adulto_adicional + $monto_menor_adicional;

						$detalle_comanda = [
							'articulo' => $tarifa->articulo, 'cantidad' => 1, 'precio' => $monto, 'impreso' => 1, 'total' => $monto
						];

						$det = $comanda->guardarDetalle($detalle_comanda);
						if ($det) {
							$cuenta->guardarDetalle(['detalle_comanda' => $det->detalle_comanda]);
							$rsvr->guardar(['cobradoencomanda' => 1]);
							$datos['exito'] = true;
							$datos['mensaje'] = 'Cobro agregado a la comanda de la reserva con éxito.';
						} else {
							$datos['mensaje'] = implode(',', $comanda->getMensaje());
						}
					} else {
						$datos['mensaje'] = 'No se ha asociado un artículo para la tarifa asignada a la reserva.';
					}
				} else {
					$datos['mensaje'] = 'Todavía no se ha generado una cuenta para la comanda de esta reserva.';
				}
			} else {
				$datos['mensaje'] = 'Todavía no se ha generado una comanda para esta reserva.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Propina.php */
/* Location: ./application/admin/controllers/mante/Propina.php */