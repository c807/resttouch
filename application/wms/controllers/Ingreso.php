<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ingreso extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Ingreso_model',
			'IDetalle_Model',
			'Articulo_model',
			'Receta_model',
			'Presentacion_model',
			'BodegaArticuloCosto_model',
			'Bodega_model',
			'Articulo_ultima_compra_model'
		]);
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}

		$this->output
			->set_content_type("application/json", "UTF-8");
	}

	public function guardar($id = '')
	{
		$ing = new Ingreso_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			if (empty($id) || $ing->estatus_movimiento == 1) {
				$datos['exito'] = $ing->guardar($req);

				if ($datos['exito']) {
					if ((int)$req['estatus_movimiento'] === 2) {
						$this->actualiza_costo_ingreso_confirmado($ing->getPK());
					}
					$datos['mensaje'] = "Datos Actualizados con Exito";
					$datos['ingreso'] = $ing;
				} else {
					$datos['mensaje'] = implode("<br>", $ing->getMensaje());
				}
			} else {
				$datos['mensaje'] = "Solo puede editar ingresos en estatus Abierto";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}


		$this->output
			->set_output(json_encode($datos));
	}

	public function guardar_detalle($ingreso, $id = '')
	{
		$ing = new Ingreso_model($ingreso);
		$bac = new BodegaArticuloCosto_model();
		$bod = new Bodega_model($ing->bodega);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			if ($ing->estatus_movimiento == 1) {
				$sede = new Sede_model($this->data->sede);
				$emp = $sede->getEmpresa();
				$iva = 1 + $emp->porcentaje_iva;
				$art = new Articulo_model($req['articulo']);
				$presArt = $art->getPresentacion();
				$pres = new Presentacion_model($req['presentacion']);

				$precioUnitarioIngresado = $req['precio_unitario'];

				$costo = $req['precio_unitario'] / $iva;
				$req['precio_unitario'] = $costo;
				$req['precio_total'] = $costo * $req['cantidad'];
				$req['precio_costo_iva'] = $req['precio_total'] * $emp->porcentaje_iva;


				if ($pres->medida == $presArt->medida) {
					$art->actualizarExistencia([
						"bodega" => $ing->bodega,
						"sede" => $bod->sede
					]);
					$det = $ing->setDetalle($req, $id);
					if ($det) {
						// $bcosto = $this->BodegaArticuloCosto_model->buscar([
						// 	'bodega' => $ing->bodega, 
						// 	'articulo' => $art->getPK(), 
						// 	'_uno' => true
						// ]);

						// $costo = $art->getCosto(["bodega" => $ing->bodega]);

						// if ($bcosto) {
						// 	$bac->cargar($bcosto->bodega_articulo_costo);
						// 	/*Ultima compra*/
						// 	$costo_uc = $art->getCosto([
						// 		"bodega" => $ing->bodega, 
						// 		"metodo_costeo" => 1
						// 	]);
						// 	$bac->costo_ultima_compra = $costo_uc;

						// 	/*Costo promedio*/
						// 	$costo = $bcosto->costo_promedio * $art->existencias + $req['precio_total'];
						// 	$existencia = $art->existencias + $req['cantidad']*$pres->cantidad;
						// 	if ($existencia != 0) {
						// 		$costo = $costo / $existencia;
						// 	} 

						// 	$bac->costo_promedio = $costo;

						// } else {
						// 	$bac->bodega = $ing->bodega;
						// 	$bac->articulo = $art->getPK();
						// 	$bac->costo_ultima_compra = $costo;
						// 	$bac->costo_promedio = $costo;
						// }

						// $art->guardar(["costo" => $costo]);
						// $bac->guardar();

						if ((int)$ing->ajuste === 0) {
							$this->actualiza_ultima_compra($ing, $det, $precioUnitarioIngresado);
						}

						$datos['exito'] = true;
						$datos['mensaje'] = "Datos Actualizados con Exito";
						$datos['detalle'] = $det;
					} else {
						$datos['mensaje'] = implode("<br>", $ing->getMensaje());
					}
				} else {
					$datos['mensaje'] = "Las unidades de medida no coinciden";
				}
			} else {
				$datos['mensaje'] = "Solo puede editar ingresos en estatus Abierto";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar_ingreso()
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

		$ingresos = $this->Ingreso_model->buscar($fltr);
		$datos = [];
		if (is_array($ingresos)) {
			foreach ($ingresos as $row) {
				$tmp = new Ingreso_model($row->ingreso);
				$row->bodega = $tmp->getBodega();
				if ((int)$row->bodega->sede === (int)$dataToken->sede) {
					$row->tipo_movimiento = $tmp->getTipoMovimiento();
					$row->proveedor = $tmp->getProveedor();
					$row->bodega_origen = $tmp->getBodegaOrigen();
					$row->usuario = $tmp->getUsuario();
					$row->egreso_origen = $tmp->get_egreso_origen();
					$datos[] = $row;
				}
			}
			if (!empty($datos)) {
				$datos = ordenar_array_objetos($datos, 'ingreso', 1, 'desc');
			}
		} else if ($ingresos) {
			$tmp = new Ingreso_model($ingresos->ingreso);
			$ingresos->bodega = $tmp->getBodega();
			if ((int)$ingresos->bodega->sede === (int)$dataToken->sede) {
				$ingresos->tipo_movimiento = $tmp->getTipoMovimiento();
				$ingresos->proveedor = $tmp->getProveedor();
				$ingresos->bodega_origen = $tmp->getBodegaOrigen();
				$ingresos->usuario = $tmp->getUsuario();
				$ingresos->egreso_origen = $tmp->get_egreso_origen();
				$datos[] = $ingresos;
			}
		}

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($datos));
	}

	public function buscar_detalle($ingreso)
	{
		$this->load->model('IDetalle_Model');
		$ingreso = new Ingreso_model($ingreso);
		$_GET['_costo'] = true;
		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($ingreso->getDetalle($_GET)));
	}

	public function actualizar_costo_iva()
	{
		$ingresos = $this->Ingreso_model->buscar();
		$sede = new Sede_model($this->data->sede);
		$emp = $sede->getEmpresa();
		$iva = 1 + $emp->porcentaje_iva;
		$datos = [];
		$datos['exito'] = true;
		$datos['mensaje'] = "Datos Actualizados con Exito";
		foreach ($ingresos as $row) {
			$ing = new Ingreso_model($row->ingreso);
			foreach ($ing->getDetalle() as $val) {
				$det = new IDetalle_Model($val->ingreso_detalle);
				if ($det->precio_costo_iva == 0) {
					$costo = $det->precio_unitario / $iva;
					$det->precio_unitario = $costo;
					$det->precio_total = $costo * $det->cantidad;
					$det->precio_costo_iva = $det->precio_total * $emp->porcentaje_iva;
					$det->guardar();
					$art = new Articulo_model($det->articulo);
					$costo = $art->getCosto();
					$art->guardar(["costo" => $costo]);
				}
			}
		}

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($datos));
	}

	public function actualiza_costo_bodega_articulo()
	{
		$ingresos = $this->Ingreso_model->buscar();
		$bac = new BodegaArticuloCosto_model();
		$datos = [];
		$datos['exito'] = true;
		$datos['mensaje'] = "Datos Actualizados con Exito";
		foreach ($ingresos as $row) {
			$ing = new Ingreso_model($row->ingreso);
			foreach ($ing->getDetalle() as $val) {
				$det = new IDetalle_Model($val->ingreso_detalle);
				$bac->guardar_costos($ing->bodega, $det->articulo);
			}
		}

		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	private function actualiza_ultima_compra($ingreso, $detalle, $ultimo_costo_ingresado)
	{
		$this->Ingreso_model->actualiza_ultima_compra($ingreso, $detalle, $ultimo_costo_ingresado);
		// $aucSrch = $this->Articulo_ultima_compra_model->buscar([
		// 	'articulo' => $detalle->articulo,
		// 	'presentacion' => $detalle->presentacion,
		// 	'ultimo_proveedor' => $ingreso->proveedor,
		// 	'_uno' => true
		// ]);

		// $auc = null;
		// if ($aucSrch) {
		// 	$auc = new Articulo_ultima_compra_model($aucSrch->articulo_ultima_compra);
		// 	$auc->ultimo_proveedor = $ingreso->proveedor;
		// 	$auc->ultimo_costo = $ultimo_costo_ingresado;
		// } else {
		// 	$auc = new Articulo_ultima_compra_model();
		// 	$auc->articulo = $detalle->articulo;
		// 	$auc->presentacion = $detalle->presentacion;
		// 	$auc->ultimo_proveedor = $ingreso->proveedor;
		// 	$auc->ultimo_costo = $ultimo_costo_ingresado;
		// }
		// $auc->guardar();
	}

	public function eliminar_detalle($id)
	{
		$detalle = new IDetalle_Model($id);
		$ingreso = new Ingreso_model($detalle->ingreso);
		$datos = ['exito' => false];

		if ((int)$ingreso->estatus_movimiento === 1) {
			$datos['exito'] = $detalle->eliminar();
			if ($datos['exito']) {
				$datos['mensaje'] = "Detalle eliminado con éxito.";
			} else {
				$datos['mensaje'] = "Error al eliminar el detalle.";
			}
		} else {
			$datos['mensaje'] = "El ingreso {$ingreso->ingreso} ya fue confirmado. No se puede modificar.";
		}

		$this->output->set_output(json_encode($datos));
	}

	public function actualiza_costo_ingreso_confirmado($idIngreso)
	{
		$ing = new Ingreso_model($idIngreso);
		if ((int)$ing->estatus_movimiento === 2) {
			$bac = new BodegaArticuloCosto_model();
			$bod = new Bodega_model($ing->bodega);

			$detalle = $ing->getDetalle();
			foreach ($detalle as $det) {
				$art = new Articulo_model($det->articulo->articulo);
				$presArt = $art->getPresentacion();
				$pres = new Presentacion_model($det->presentacion->presentacion);

				$precio_total = $det->precio_unitario * $det->cantidad;

				if ($pres->medida == $presArt->medida) {
					$art->actualizarExistencia([
						'bodega' => $ing->bodega,
						'sede' => $bod->sede
					]);
					$bcosto = $this->BodegaArticuloCosto_model->buscar([
						'bodega' => $ing->bodega,
						'articulo' => $art->getPK(),
						'_uno' => true
					]);
					$costo = $art->getCosto(['bodega' => $ing->bodega]);

					if ($bcosto) {
						$bac->cargar($bcosto->bodega_articulo_costo);
						/*Ultima compra*/
						$costo_uc = $art->getCosto([
							'bodega' => $ing->bodega,
							'metodo_costeo' => 1
						]);
						$bac->costo_ultima_compra = $costo_uc;

						/*Costo promedio*/
						$costo = $bcosto->costo_promedio * $art->existencias + $precio_total;
						$existencia = $art->existencias + $det->cantidad * $pres->cantidad;
						if ($existencia != 0) {
							$costo = $costo / $existencia;
						}

						$bac->costo_promedio = $costo;
					} else {
						$bac->bodega = $ing->bodega;
						$bac->articulo = $art->getPK();
						$bac->costo_ultima_compra = $costo;
						$bac->costo_promedio = $costo;
					}

					$art->guardar(['costo' => $costo]);
					$bac->guardar();
				}
			}
		}
	}
}

/* End of file Ingreso.php */
/* Location: ./application/wms/controllers/Ingreso.php */