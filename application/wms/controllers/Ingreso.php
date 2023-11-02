<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ingreso extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model([
			'Ingreso_model',
			'IDetalle_Model',
			'Articulo_model',
			'Receta_model',
			'Presentacion_model',
			'BodegaArticuloCosto_model',
			'Bodega_model',
			'Articulo_ultima_compra_model',
			'Tipo_movimiento_model',
			'Proveedor_model',
			'Bodega_model',
			'Usuario_model'
		]);
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
		$this->output->set_content_type('application/json', 'UTF-8');
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
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['ingreso'] = $ing;
				} else {
					$datos['mensaje'] = implode('<br>', $ing->getMensaje());
				}
			} else {
				$datos['mensaje'] = 'Solo puede editar ingresos en estatus Abierto';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
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
						'bodega' => $ing->bodega,
						'sede' => $bod->sede
					]);
					$det = $ing->setDetalle($req, $id);
					if ($det) {
						if ((int)$ing->ajuste === 0) {
							$this->actualiza_ultima_compra($ing, $det, $precioUnitarioIngresado);
						}
						$datos['exito'] = true;
						$datos['mensaje'] = 'Datos actualizados con éxito.';
						$datos['detalle'] = $det;
					} else {
						$datos['mensaje'] = implode('<br>', $ing->getMensaje());
					}
				} else {
					$datos['mensaje'] = 'Las unidades de medida no coinciden';
				}
			} else {
				$datos['mensaje'] = 'Solo puede editar ingresos en estatus Abierto';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar_ingreso()
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$dataToken = AUTHORIZATION::validateToken($headers['Authorization']);

		$listaTiposMovimiento = $this->Tipo_movimiento_model->get_lista_tipos_movimiento();
		$listaProveedores = $this->Proveedor_model->get_lista_proveedores();
		$listaBodegas = $this->Bodega_model->get_lista_bodegas();
		$listaUsuarios = $this->Usuario_model->get_lista_usuarios();
		$listaEgresosOrigen = $this->Ingreso_model->get_lista_egresos_origen($_GET);

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
					$row->tipo_movimiento = $listaTiposMovimiento[(int)$row->tipo_movimiento];
					$row->proveedor = $listaProveedores[(int)$row->proveedor];
					$row->bodega_origen = is_null($row->bodega_origen) ? null : ((int)$row->bodega_origen > 0 ? $listaBodegas[(int)$row->bodega_origen] : null);
					$row->usuario = $listaUsuarios[(int)$row->usuario];
					$row->egreso_origen = array_key_exists((int)$row->ingreso, $listaEgresosOrigen) ? $listaEgresosOrigen[(int)$row->ingreso] : null;
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
				$ingresos->tipo_movimiento = $listaTiposMovimiento[(int)$ingresos->tipo_movimiento];
				$ingresos->proveedor = $listaProveedores[(int)$ingresos->proveedor];
				$ingresos->bodega_origen = is_null($ingresos->bodega_origen) ? null : ((int)$ingresos->bodega_origen > 0 ? $listaBodegas[(int)$ingresos->bodega_origen] : null);
				$ingresos->usuario = $listaUsuarios[(int)$ingresos->usuario];
				$ingresos->egreso_origen = array_key_exists((int)$ingresos->ingreso, $listaEgresosOrigen) ? $listaEgresosOrigen[(int)$ingresos->ingreso] : null;
				$datos[] = $ingresos;
			}
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function buscar_detalle($ingreso)
	{
		$this->load->model('IDetalle_Model');
		$ingreso = new Ingreso_model($ingreso);
		$_GET['_costo'] = true;
		$this->output
			->set_content_type('application/json')
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
		$datos['mensaje'] = 'Datos actualizados con éxito.';
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
					$art->guardar(['costo' => $costo]);
				}
			}
		}

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($datos));
	}

	public function actualiza_costo_bodega_articulo()
	{
		$ingresos = $this->Ingreso_model->buscar();
		$bac = new BodegaArticuloCosto_model();
		$datos = [];
		$datos['exito'] = true;
		$datos['mensaje'] = 'Datos actualizados con éxito.';
		foreach ($ingresos as $row) {
			$ing = new Ingreso_model($row->ingreso);
			foreach ($ing->getDetalle() as $val) {
				$det = new IDetalle_Model($val->ingreso_detalle);
				$bac->guardar_costos($ing->bodega, $det->articulo);
			}
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	private function actualiza_ultima_compra($ingreso, $detalle, $ultimo_costo_ingresado)
	{
		$this->Ingreso_model->actualiza_ultima_compra($ingreso, $detalle, $ultimo_costo_ingresado);
	}

	public function eliminar_detalle($id)
	{
		$detalle = new IDetalle_Model($id);
		$ingreso = new Ingreso_model($detalle->ingreso);
		$datos = ['exito' => false];

		if ((int)$ingreso->estatus_movimiento === 1) {
			$datos['exito'] = $detalle->eliminar();
			if ($datos['exito']) {
				$datos['mensaje'] = 'Detalle eliminado con éxito.';
			} else {
				$datos['mensaje'] = 'Error al eliminar el detalle.';
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

				if ($pres->medida == $presArt->medida) {
					$idArticulo = $det->articulo->articulo;
					$datos_costo = $this->BodegaArticuloCosto_model->get_datos_costo($ing->bodega, $idArticulo);
					if ($datos_costo) {						
						$cantidad_presentacion = round((float)$pres->cantidad, 2);
						$precio_unitario = round((float)$det->precio_unitario, 5);
						$existencia_anterior = round((float)$datos_costo->existencia, 2);
						$cp_unitario_anterior = round((float)$datos_costo->costo_promedio, 5);
						$costo_total_anterior = round($existencia_anterior * $cp_unitario_anterior, 5);
						$existencia_nueva = $existencia_anterior + ((float)$det->cantidad * $cantidad_presentacion);
						// $costo_total_nuevo = $costo_total_anterior + round((float)$det->precio_total / $cantidad_presentacion, 5);
						$costo_total_nuevo = $costo_total_anterior + (float)$det->precio_total;

						$nvaData = [
							'bodega' => (int)$ing->bodega,
							'articulo' => (int)$idArticulo,
							'cuc_ingresado' => 0,
							'costo_ultima_compra' => round($precio_unitario / $cantidad_presentacion, 5),
							'cp_ingresado' => 0,
							'costo_promedio' => round($costo_total_nuevo / $existencia_nueva, 5),
							'existencia_ingresada' => 0,
							'existencia' => $existencia_nueva,
							'fecha' => date('Y-m-d H:i:s')
						];

						$nvoBac = new BodegaArticuloCosto_model();
						$nvoBac->guardar($nvaData);
					} else {
						$art->actualizarExistencia(['bodega' => $ing->bodega, 'sede' => $bod->sede]);
						$bcosto = $this->BodegaArticuloCosto_model->buscar(['bodega' => $ing->bodega, 'articulo' => $idArticulo, '_uno' => true]);
						$costo = $art->getCosto(['bodega' => $ing->bodega]);

						if ($bcosto) {
							$bac->cargar($bcosto->bodega_articulo_costo);
							/*Ultima compra*/
							$costo_uc = $art->getCosto(['bodega' => $ing->bodega, 'metodo_costeo' => 1]);
							$bac->costo_ultima_compra = $costo_uc;

							/*Costo promedio*/
							$costo_prom = $art->getCosto(['bodega' => $ing->bodega, 'metodo_costeo' => 2]);
							$bac->costo_promedio = $costo_prom;
						} else {
							$bac->bodega = $ing->bodega;
							$bac->articulo = $idArticulo;
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
}

/* End of file Ingreso.php */
/* Location: ./application/wms/controllers/Ingreso.php */