<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cajacorte extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model([
			'Cajacorte_model',
			'Dcajacorte_model',
			'Dcajacortefpago_model',
			'Turno_model',
			'Catalogo_model',
			'Fpago_model',
			'Cajacorte_nominacion_model',
			'Usuario_model'
		]);

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);

		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$data = ['exito' => false];
		$mensajes = [];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'));

			$cc = new Cajacorte_model($id);
			$cc->usuario = $this->data->idusuario;
			$cc->turno = $req->turno;
			$cc->caja_corte_tipo = $req->tipo->caja_corte_tipo;
			$cc->total = (float)$req->total;

			if ((int)$req->tipo->pedirdocumento === 1) {
				$cc->serie = $req->documento->serie;
				$cc->numero = $req->documento->numero;
				$cc->fecha = $req->documento->fecha;
				$cc->descripcion_documento = $req->documento->descripcion_documento;
			}

			$ccGuardado = $cc->guardar();

			if ($ccGuardado) {
				$this->Dcajacorte_model->eliminaDetalle($cc->getPK());
				foreach ($req->efectivo as $efectivo) {
					$ccd = new Dcajacorte_model();
					$ccd->caja_corte = $cc->getPK();
					$ccd->cantidad = !empty($efectivo->cantidad) ? (int)$efectivo->cantidad : 0;
					$ccd->total = (float)$efectivo->total;
					$ccd->caja_corte_nominacion = (int)$efectivo->caja_corte_nominacion;
					if (!$ccd->guardar()) {
						$mensajes[] = $ccd->getMensaje();
					}
				}

				if ((int)$req->tipo->conformaspago === 1) {
					$this->Dcajacortefpago_model->eliminaDetalleFPago($cc->getPK());
					foreach ($req->formas_pago as $fp) {
						$ccdfp = new Dcajacortefpago_model();
						$ccdfp->caja_corte = $cc->getPK();
						$ccdfp->forma_pago = $fp->forma_pago;
						$ccdfp->total = !empty($fp->montocc) ? (float)$fp->montocc : 0.00;
						if (!$ccdfp->guardar()) {
							$mensajes[] = $ccdfp->getMensaje();
						}
					}
				}

				if (count($mensajes) === 0) {
					$data['exito'] = true;
					$data['mensaje'] = "{$req->tipo->descripcion} guardado con éxito.";
				} else {
					$data['mensaje'] = implode('. ', $mensajes);
				}
			} else {
				$data['mensaje'] = $cc->getMensaje();
			}
		} else {
			$data['mensaje'] = 'Método de envío incorrecto.';
		}

		$this->output->set_output(json_encode($data));
	}

	public function buscar()
	{
		$cajas = $this->Cajacorte_model->getCajaCorte($_GET);
		$usr = new Usuario_model();
		foreach ($cajas as $caja) {
			$caja->caja_corte_tipo = $this->Catalogo_model->getCajaCorteTipo(['caja_corte_tipo' =>$caja->caja_corte_tipo, '_uno' => true]);
			$usuario = $usr->find(['usuario' => $caja->usuario, '_uno' => true]);
			$caja->usrname = $usuario ? trim($usuario->usrname) : null;
		}
		$this->output->set_output(json_encode($cajas));
	}

	public function anular_caja()
	{
		$datos = json_decode(file_get_contents('php://input'), true);
		$data  = ['exito' => 0];

		if (isset($datos['caja_corte']) && !empty($datos['caja_corte'])) {
			$cc = new Cajacorte_model($datos['caja_corte']);
			if ($cc->guardar(['anulado' => 1])) {
				foreach ($cc->getDetalleCajaCorte() as $key => $value) {
					$dcc = new Dcajacorte_model($value->caja_corte_detalle);
					$dcc->guardar(['anulado' => 1]);
				}
				$data['mensaje'] = 'Proceso correctamente.';
				$data['exito'] = 1;
			} else {
				$data['mensaje'] = $cc->getMensaje();
			}
		} else {
			$data['mensaje'] = 'Debe seleccionar un corte de caja';
		}

		$this->output->set_output(json_encode($data));
	}

	public function anular_caja_detalle()
	{
		$datos = json_decode(file_get_contents('php://input'), true);
		$data  = ['exito' => 0];

		if (isset($datos['caja_corte_detalle']) && !empty($datos['caja_corte_detalle'])) {
			$dcc = new Dcajacorte_model($datos['caja_corte_detalle']);
			if ($dcc->guardar(['anulado' => 1])) {
				$data['mensaje'] = 'Proceso correctamente.';
				$data['exito'] = 1;
			} else {
				$data['mensaje'] = $dcc->getMensaje();
			}
		} else {
			$data['mensaje'] = 'Debe seleccionar un corte de caja';
		}

		$this->output->set_output(json_encode($data));
	}

	public function get_detalle_caja($id = '')
	{
		$data = new stdClass();
		$data->efectivo = (object)['total' => 0.00, 'detalle' => $this->Dcajacorte_model->buscar(['caja_corte' => $id, 'anulado' => 0])];
		$data->formas_pago = (object)['total' => 0.00, 'detalle' => $this->Dcajacortefpago_model->buscar(['caja_corte' => $id])];
		$formasPago = $this->Fpago_model->get_lista();

		foreach($data->efectivo->detalle as $det)
		{
			$data->efectivo->total += (float)$det->total;
			$det->caja_corte_nominacion = $this->Cajacorte_nominacion_model->buscar(['caja_corte_nominacion' => $det->caja_corte_nominacion, '_uno' => true]);
		}

		foreach($data->formas_pago->detalle as $det)
		{
			$data->formas_pago->total += (float)$det->total;
			// $det->forma_pago = $this->Fpago_model->buscar(['forma_pago' => $det->forma_pago, '_uno' => true]);
			$det->forma_pago = $formasPago[(int)$det->forma_pago];
		}

		// $fp_efectivo = $this->Fpago_model->buscar(['esefectivo' => 1, '_uno' => true]);
		$fp_efectivo = $this->Fpago_model->buscar_formaspago(['esefectivo' => 1, '_uno' => true]);
		if ($fp_efectivo) {
			array_unshift($data->formas_pago->detalle, (object)['caja_corte_detalle_forma_pago' => 0, 'caja_corte' => $id, 'forma_pago' => $fp_efectivo, 'total' => $data->efectivo->total]);			
		}

		$this->output->set_output(json_encode($data));
	}


}

/* End of file Cajacorte.php */
/* Location: ./application/restaurante/controllers/Cajacorte.php */