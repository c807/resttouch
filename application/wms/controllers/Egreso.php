<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Egreso extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model([
			'Egreso_model',
			'EDetalle_model',
			'Ingreso_model',
			'IDetalle_Model',
			'Receta_model',
			'Articulo_model',
			'Catalogo_model',
			'Configuracion_model',
			'Presentacion_model',
			'BodegaArticuloCosto_model',
			'Proveedor_model',
			'Bodega_model'
		]);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$egr = new Egreso_model($id);
			if (empty($id) || $egr->estatus_movimiento == 1) {
				$datos['exito'] = $egr->guardar($req);
				if ((int)$egr->estatus_movimiento === 2 && (int)$egr->traslado === 1) {
					$bodegaOrigen = $this->Bodega_model->buscar(['bodega' => $egr->bodega, '_uno' => true]);
					$bodegaDestino = $this->Bodega_model->buscar(['bodega' => $egr->bodega_destino, '_uno' => true]);
					if ((int)$bodegaOrigen->sede === (int)$bodegaDestino->sede) {
						$ing = $egr->trasladar($req);
					} else {
						$req['sede_origen'] = (int)$bodegaOrigen->sede;
						$req['sede_destino'] = (int)$bodegaDestino->sede;
						$ing = $egr->traslado_externo($req);
					}
					if ($ing) {
						$ing->detalle = $ing->getDetalle();
						$datos['ingreso'] = $ing;
					} else {
						$datos['exito'] = false;
					}
				}
				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['egreso'] = $egr;
				} else {
					$datos['mensaje'] = implode('<br>', $egr->getMensaje());
				}
			} else {
				$datos['mensaje'] = 'Solo puede editar egresos en estatus Abierto';
			}
		} else {
			$datos['mensaje'] = 'Parametros inválidos';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function guardar_detalle($egreso, $id = '')
	{
		$egr = new Egreso_model($egreso);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			if ($egr->estatus_movimiento == 1) {
				$art = new Articulo_model($req['articulo']);
				$bac = new BodegaArticuloCosto_model();
				$pu = $bac->get_costo($egr->bodega, $art->articulo, $req['presentacion']);
				if ($pu && (float)$pu > (float)0) {
					$req['precio_unitario']	= $pu;
					$pres = new Presentacion_model($req['presentacion']);
					$presArt = $art->getPresentacionReporte();

					if ($pres->medida == $presArt->medida) {
						$det = $egr->setDetalle($req, $id);

						if ($det) {
							$art->actualizarExistencia();
							$datos['exito'] = true;
							$datos['mensaje'] = 'Datos actualizados con éxito.';
							$datos['detalle'] = $det;
						} else {
							$datos['mensaje'] = implode('<br>', $egr->getMensaje());
						}
					} else {
						$datos['mensaje'] = 'Las unidades de medida no coinciden';
					}
				} else {
					$datos['mensaje'] = 'Este producto no puede darle egreso porque el costo es 0. Debe hacer un ingreso primero para poder sacarlo.';
				}
			} else {
				$datos['mensaje'] = 'Solo puede editar egresos en estatus Abierto.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function buscar_egreso()
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$dataToken = AUTHORIZATION::validateToken($headers['Authorization']);

		$fltr = $_GET;
		if (isset($fltr['_fdel'])) {
			$fltr['_fdel'] = ['fecha' => $fltr['_fdel']];
		}
		if (isset($fltr['_fal'])) {
			$fltr['_fal'] = ['fecha' => $fltr['_fal']];
		}

		$soloRequisiciones = isset($fltr['_solo_requisiciones']) && (int)$fltr['_solo_requisiciones'] === 1;

		$egresos = $this->Egreso_model->buscar($fltr);
		$datos = [];
		if (is_array($egresos)) {
			foreach ($egresos as $row) {
				$tmp = new Egreso_model($row->egreso);
				$row->tipo_movimiento = $tmp->getTipoMovimiento();
				$row->bodega = $tmp->getBodega();
				$row->usuario = $tmp->getUsuario();
				$row->bodega_solicita = $tmp->getBodegaDestino();
				$idSedeBodegaSolicita = $row->bodega_solicita ? (int)$row->bodega_solicita->sede : 0;
				if ((int)$row->bodega->sede === (int)$dataToken->sede || ($soloRequisiciones && (int)$row->bodega->sede !== (int)$dataToken->sede && $idSedeBodegaSolicita === (int)$dataToken->sede)) {
					$agregar = true;
					if ($soloRequisiciones) {
						if ((int)$row->tipo_movimiento->requisicion === 0) {
							$agregar = false;
						}
					}
					if ($agregar) {
						$datos[] = $row;
					}
				}
			}
			$datos = ordenar_array_objetos($datos, 'egreso', 1, 'desc');
		} else if ($egresos) {
			$tmp = new Egreso_model($egresos->egreso);
			$egresos->tipo_movimiento = $tmp->getTipoMovimiento();
			$egresos->bodega = $tmp->getBodega();
			$egresos->usuario = $tmp->getUsuario();
			$egresos->bodega_solicita = $tmp->getBodegaDestino();
			$idSedeBodegaSolicita = $egresos->bodega_solicita ? (int)$egresos->bodega_solicita->sede : 0;
			if ((int)$egresos->bodega->sede === (int)$dataToken->sede || ($soloRequisiciones && (int)$egresos->bodega->sede !== (int)$dataToken->sede && (int)$egresos->bodega_solicita->sede === (int)$dataToken->sede)) {
				$agregar = true;
				if ($soloRequisiciones) {
					if ((int)$egresos->tipo_movimiento->requisicion === 0) {
						$agregar = false;
					}
				}
				if ($agregar) {
					$datos[] = $egresos;
				}
			}
		}

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($datos));
	}

	public function buscar_detalle($egreso)
	{
		$egreso = new Egreso_model($egreso);

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($egreso->getDetalle($_GET)));
	}

	public function eliminar_detalle($id)
	{
		$detalle = new EDetalle_Model($id);
		$egreso = new Egreso_model($detalle->egreso);
		$datos = ['exito' => false];

		if ((int)$egreso->estatus_movimiento === 1) {
			$datos['exito'] = $detalle->eliminar();
			if ($datos['exito']) {
				$datos['mensaje'] = 'Detalle eliminado con éxito.';
			} else {
				$datos['mensaje'] = 'Error al eliminar el detalle.';
			}
		} else {
			$datos['mensaje'] = "La salida {$egreso->ingreso} ya fue confirmada. No se puede modificar.";
		}

		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Egreso.php */
/* Location: ./application/wms/controllers/Egreso.php */