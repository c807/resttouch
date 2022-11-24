<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Comanda extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		//$this->datos = [];
		$this->load->add_package_path('application/facturacion');

		$this->load->model([
			'Comanda_model',
			'Dcomanda_model',
			'Cuenta_model',
			'Dcuenta_model',
			'Usuario_model',
			'Mesa_model',
			'Area_model',
			'Articulo_model',
			'Catalogo_model',
			'Turno_model',
			'Factura_model',
			'Receta_model',
			'Impresora_model',
			'Presentacion_model',
			'Configuracion_model',
			'Tipo_usuario_cgrupo_model',
			'Accion_model'
		]);

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);

		$this->output->set_content_type('application/json', 'UTF-8');
	}


	function guardar()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		if ($this->input->method() == 'post') {
			if (isset($req['mesa']) && isset($req['comanda']) && isset($req['cuentas'])) {
				$req['data'] = $data;
				$datos = guardar_comanda($req);
			} else {
				$datos['mensaje'] = 'Hacen falta datos obligatorios para poder continuar';
			}
		} else {
			$datos['mensaje'] = 'Parametros Invalidos';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function guardar_notas_generales($comanda)
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			if (isset($req['notas_generales'])) {
				if (trim($req['notas_generales']) !== '') {
					$req['notas_generales'] = trim($req['notas_generales']);
				} else {
					$req['notas_generales'] = null;
				}
				$com = new Comanda_model($comanda);
				$datos['exito'] = $com->guardar($req);
				if ($datos['exito']) {
					$datos['mensaje'] = 'Notas generales actualizadas con éxito.';
				} else {
					$datos['mensaje'] = implode('<br>', $com->getMensaje());;
				}
			}
		}
		$this->output->set_output(json_encode($datos));
	}

	public function cerrar_estacion($comanda)
	{
		$datos = ['exito' => false];
		$com = new Comanda_model($comanda);
		if ($com->cierra_estacion($comanda)) {
			$datos['exito'] = true;
			$datos['mensaje'] = 'Datos actualizados con exito';
		} else {
			$datos['mensaje'] = "No se pudo habilitar la comanda $comanda. Por favor comuníquese con el administrador del sistema.";
		}

		$this->output->set_output(json_encode($datos));
	}

	private function join_accounts($cuentaDe, $cuentaA) {
		$deCuenta = new Cuenta_model($cuentaDe);
		$aCuenta = new Cuenta_model($cuentaA);
		$datos = ['exito' => false];
		if ($deCuenta->cerrada == 0) {
			if ($aCuenta->cerrada == 0) {				
				$detOrigen = $deCuenta->get_plain_detalle_cuenta();
				if (count($detOrigen) > 0) {
					foreach ($detOrigen as $do) {
						$deCuenta->guardarDetalle(['cuenta_cuenta' => $cuentaA], $do->detalle_cuenta, true);
					}
					$datos['cuenta_origen'] = $deCuenta->guardarCuenta(['cerrada' => 1]);
					$datos['exito'] = true;
					$datos['mensaje'] = 'Unificación de cuentas con éxito.';
				} else {
					$datos['mensaje'] = 'No existe ningún producto para unificar en la cuenta de origen.';
				}
			} else {
				$datos['mensaje'] = 'La cuenta de destino ya está cerrada.';
			}
		} else {
			$datos['mensaje'] = 'La cuenta de origen ya está cerrada.';
		}
		return $datos;
	}

	public function unir_cuentas($cuentaDe, $cuentaA)
	{
		$datos = $this->join_accounts($cuentaDe, $cuentaA);
		$this->output->set_output(json_encode($datos));
	}

	public function trasladar_mesa($comanda, $origen, $destino, $cuentaATrasladar = null)
	{
		$cmd = new Comanda_model($comanda);
		$mesaOrigen = new Mesa_model($origen);
		$mesaDestino = new Mesa_model($destino);

		$datos = ['exito' => true, 'mensaje' => 'Mesa trasladada con éxito.'];
		if ((int)$mesaDestino->estatus === 1) {
			$continuar = true;
			if ((int)$cmd->domicilio === 1 && $cmd->tipo_domicilio && (int)$cmd->tipo_domicilio > 0) {
				$cmd->traslado_comanda_domicilio($_GET);
			}

			if ($continuar) {
				$mesaDestino->guardar(['estatus' => 2]);
				$cmd->trasladar_mesa($destino, $comanda);
				$mesaOrigen->guardar(['estatus' => 1]);
			}
		} else {
			$cmdDestino = $mesaDestino->get_comanda(['estatus' => 1, 'sede' => $this->data->sede]);
			if ($cmdDestino) {
				$datos['exito'] = $cmd->trasladar_cuentas_a_comanda($cmdDestino->comanda, $cuentaATrasladar);
				if ($datos['exito']) {
					if ((int)$cuentaATrasladar > 0 && (int)$mesaDestino->eshabitacion === 1) {
						$cuentaDestino = $this->Cuenta_model->buscar(['comanda' => $cmdDestino->comanda, 'numero' => 1, 'cerrada' => 0, '_uno' => true]);
						if ($cuentaDestino) {
							$this->join_accounts($cuentaATrasladar, $cuentaDestino->cuenta);
						}
					}

					if ($cmd->check_cuentas_cerradas()) {
						$cmd->guardar(['estatus' => 2]); // Cierra la comanda
						$mesaOrigen->guardar(['estatus' => 1]); // Libera la mesa de origen
					}
				} else {
					$datos['mensaje'] = $cmd->getMensaje();
				}
			} else {
				$datos['exito'] = false;
				$datos['mensaje'] = 'La comanda de la mesa destino ya fue cerrada, no puede realizarse el traslado de cuentas.';
			}
		}
		$this->output->set_output(json_encode($datos));
	}

	public function guardar_detalle_combo($com, $cuenta)
	{
		// set_time_limit(600);
		$comanda = new Comanda_model($com);
		$mesa = $comanda->getMesas();
		$cuenta = new Cuenta_model($cuenta);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			if ($mesa->estatus == 2) {
				if ($cuenta->cerrada == 0) {
					$val = validarCantidades($req);
					if ($val['exito']) {
						$det = $comanda->guardarDetalleCombo($req, $cuenta->getPK());
						if ($det) {
							$datos['exito'] = true;
							$datos['comanda'] = $comanda->getComanda([
								'_cuenta' => $cuenta->cuenta, 'articulo' => $det->articulo, 'detalle_comanda' => $det->detalle_comanda
							]);
						} else {
							$datos['exito'] = false;
							$datos['mensaje'] = $comanda->getMensaje();
						}
					} else {
						$datos['mensaje'] = $val['mensaje'];
					}
				} else {
					$datos['mensaje'] = 'La cuenta ya esta cerrada';
				}
			} else {
				$datos['mensaje'] = 'La mesa debe estar en estatus abierto';
			}
		} else {
			$datos['mensaje'] = 'Parametros Invalidos';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function guardar_receta_en_comanda($id_comanda, $detalle_comanda_id, $id_articulo, $regresa_inventario)
	{
		$art = new Articulo_model($id_articulo);
		$receta = $art->getReceta();
		foreach ($receta as $rec) {
			$presR = $this->Presentacion_model->buscar([
				'medida' => $rec->medida->medida,
				'cantidad' => 1,
				'_uno' => true
			]);

			if (!$presR) {
				$presR = new Presentacion_model();
				$presR->guardar([
					'medida' => $rec->medida->medida,
					'descripcion' => $rec->medida->descripcion,
					'cantidad' => 1
				]);

				$presR->presentacion = $presR->getPK();
			}

			$artR = new Articulo_model($rec->articulo->articulo);
			$bodegaR = $artR->getBodega();

			$detr = new Dcomanda_model();
			$dato = [
				'comanda' => $id_comanda,
				'articulo' => $rec->articulo->articulo,
				'cantidad' => $rec->cantidad,
				'precio' => 0,
				'total' => 0,
				'impreso' => 0,
				'presentacion' => $presR->presentacion,
				'detalle_comanda_id' => $detalle_comanda_id,
				'bodega' => $bodegaR ? $bodegaR->bodega : null,
				'cantidad_inventario' => $rec->cantidad
			];
			$detr->guardar($dato);
		}

		$det = new Dcomanda_model($detalle_comanda_id);
		$det->actualizarCantidadHijos((int)$regresa_inventario === 1);
	}

	public function actualiza_cantidad_hijos($id_detalle_comanda, $regresa_inventario)
	{
		$det = new Dcomanda_model($id_detalle_comanda);
		$det->actualizarCantidadHijos((int)$regresa_inventario === 1);
	}

	private function add_bitacora_elimina_detalle_comanda($dcom, $req)
	{
		$articuloAEliminar = new Articulo_model($dcom->articulo);
		$usuarioElimino = new Usuario_model($this->data->idusuario);
		$usuarioAutoriza = new Usuario_model($req['gerente']);
		$comentarioBitacora = "{$usuarioElimino->apellidos}, {$usuarioElimino->nombres} eliminó el artículo {$articuloAEliminar->descripcion} después de comandar, autorizado por {$usuarioAutoriza->apellidos}, {$usuarioAutoriza->nombres}.";
		$bitComanda = new Bitacora_model();
		$acc = $this->Accion_model->buscar(['descripcion' => 'Modificacion', '_uno' => true]);
		$bitComanda->guardar([
			'accion' => $acc->accion,
			'usuario' => $this->data->idusuario,
			'tabla' => 'detalle_comanda',
			'registro' => $dcom->detalle_comanda,
			'comentario' => "{$comentarioBitacora} Quedaron " . number_format((float)$req['cantidad'], 2) . " y originalmente habían " . number_format((float)$dcom->cantidad, 2) . ". Precio unitario: " . number_format((float)$dcom->precio, 2) . "." . (isset($req['regresa_inventario']) && $req['regresa_inventario'] ? ' Se reversó el inventario.' : '')
		]);
	}

	public function guardar_detalle($com, $cuenta)
	{
		$comanda = new Comanda_model($com);
		$mesa = $comanda->getMesas();
		$cuenta = new Cuenta_model($cuenta);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			if ((int)$mesa->estatus === 2) {
				if ((int)$cuenta->cerrada === 0) {
					$datos['exito'] = true;
					$dcom = null;
					if (isset($req['detalle_comanda'])) {
						$dcom = new Dcomanda_model($req['detalle_comanda']);
						$datos['exito'] = $dcom->impreso == 0;

						if ($dcom->impreso == 1) {
							if (isset($req['autorizado']) && $req['autorizado'] == true) {
								$datos['exito'] = true;
								$this->add_bitacora_elimina_detalle_comanda($dcom, $req);
							} else {
								$datos['mensaje'] = 'El producto ya ha sido impreso, por favor cierre el panel y vuelva a entrar.';
							}

							unset($req['autorizado']);
						}
					}

					if ($datos['exito']) {
						$det = $comanda->guardarDetalleMejorado($req);

						$id = isset($req['detalle_cuenta']) ? $req['detalle_cuenta'] : '';
						if ($det) {
							$cuenta->guardarDetalle([
								'detalle_comanda' => $det->detalle_comanda
							], $id);
							$datos['exito'] = true;
						} else {
							$datos['exito'] = false;
						}

						if ($datos['exito']) {
							if ($dcom && (int)$dcom->impreso === 1) {
								$dcomupd = new Dcomanda_model($dcom->detalle_comanda);
								if ((float)$dcomupd->cantidad < (float)$dcom->cantidad) {
									$articulo = new Articulo_model($dcomupd->articulo);
									$datos['anulacion'] = (object)[
										'articulo' => $articulo->descripcion,
										'cantidad' => round((float)$dcom->cantidad - (float)$dcomupd->cantidad, 2),
										'impresora' => $articulo->getImpresora(),
									];
								}
							}
							$datos['comanda'] = $comanda->getComanda([
								'_cuenta' => $cuenta->cuenta, 'articulo' => $det->articulo, 'detalle_comanda' => $det->detalle_comanda
							]);
						} else {
							$datos['mensaje'] = implode('<br>', $comanda->getMensaje());
						}
					}
				} else {
					$datos['mensaje'] = 'La cuenta ya esta cerrada';
				}
			} else {
				$datos['mensaje'] = 'La mesa debe estar en estatus abierto';
			}
		} else {
			$datos['mensaje'] = 'Parametros Invalidos';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function distribuir_cuentas()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {


			foreach ($req as $row) {
				$det = new Dcomanda_model($row['detalle_comanda']);

				$datos['exito'] = $det->distribuir_cuenta($row);

				if (!$datos['exito']) {
					$datos['mensaje'] = implode('<br>', $det->getMensaje());
				}
			}

			if ($datos['exito']) {
				$datos['mensaje'] = 'Datos Actualizados con exito';
			}

			$datos['exito'] = true;
		} else {
			$datos['mensaje'] = 'Parametros Invalidos';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function guardar_notas_producto($dcomanda)
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			if (isset($req['notas'])) {
				$dcom = new Dcomanda_model($dcomanda);
				$req['notas'] = trim($req['notas']) !== '' ? trim($req['notas']) : null;
				$datos['exito'] = $dcom->guardar($req);
				if ($datos['exito']) {
					$datos['mensaje'] = 'Notas de producto actualizadas con éxito.';
				} else {
					$datos['mensaje'] = implode('<br>', $dcom->getMensaje());
				}
			}
		}
		$this->output->set_output(json_encode($datos));
	}

	public function set_detalle_comanda($com, $cuenta)
	{
		$comanda = new Comanda_model($com);
		$cuenta = new Cuenta_model($cuenta);
		$data = json_decode(file_get_contents('php://input'), true);
		$menu = $this->Catalogo_model->getModulo(['modulo' => 4, '_uno' => true]);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			if ($cuenta->cerrada == 0) {
				foreach ($data['articulos'] as $key => $req) {
					$art = $this->Articulo_model->buscarArticulo([
						'codigo' => $req['codigo'],
						'sede' => $comanda->sede,
						'_uno' => true
					]);

					if ($art) {
						$req['articulo'] = $art->articulo;

						unset($req['codigo']);

						$det = $comanda->guardarDetalle($req);
						$id = isset($req['detalle_cuenta']) ? $req['detalle_cuenta'] : '';
						if ($det) {
							$cuenta->guardarDetalle([
								'detalle_comanda' => $det->detalle_comanda
							], $id);
							$datos['exito'] = true;
						} else {
							$datos['exito'] = false;
						}
					} else {
						$datos['mensaje'] = 'Producto no encontrado en restaurante, por favor comuníquese con el mesero de turno.';
					}
				}

				if ($datos['exito']) {
					$datos['mensaje'] = 'Productos agregados con éxito.';
					$datos['comanda'] = $comanda->getComanda();
					$datos['mensaje'] = 'Detalle cuenta cargada correctamente.';
				} else {
					$datos['mensaje'] = implode('<br>', $comanda->getMensaje());
				}
			} else {
				$datos['mensaje'] = 'La cuenta ya esta cerrada';
			}
		} else {
			$datos['mensaje'] = 'Error en comunicación, por favor comuníquese con el mesero de turno.';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	function get_comanda($mesa = '')
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);

		$datos = [];

		if (empty($mesa)) {
			ini_set('memory_limit', '512M');
			$params = ['domicilio' => 1, 'sede' => $data->sede];

			if (isset($_GET['callcenter'])) {
				$params['callcenter'] = 1;
			}

			$tmp = $this->Comanda_model->getComandas($params);
			foreach ($tmp as $row) {
				$comanda = new Comanda_model($row->comanda);
				$datos[] = $comanda->getComanda(['_usuario' => $data->idusuario]);
			}
		} else {
			$mesa = new Mesa_model($mesa);
			$tmp = $mesa->get_comanda(['estatus' => 1, 'sede' => $data->sede]);

			if ($tmp) {
				$comanda = new Comanda_model($tmp->comanda);
				$comanda->comandaenuso = 0;

				$_GET['_usuario'] = $data->idusuario;

				// $datos = $comanda->getComanda(['_usuario' => $data->idusuario]);
				$datos = $comanda->getComanda($_GET);
				$datos->exito = true;
			} else if ($this->input->get('qr')) {
				$com = new Comanda_model();
				$config = $this->Configuracion_model->buscar();
				$mesero = get_configuracion($config, 'RT_MESERO_POR_DEFECTO', 1);

				$res = guardar_comanda([
					'comanda' => '',
					'estatus' => 1,
					'data' => $data,
					'mesero' => $mesero,
					'cuentas' => [['nombre' => 'Unica']],
					'mesa' => $mesa->getPK()
				]);
				if ($res['exito']) {
					$this->load->helper('api');
					$tmp = $mesa->get_comanda(['estatus' => 1, 'sede' => $data->sede]);
					$comanda = new Comanda_model($tmp->comanda);
					$comanda->comandaenuso = 0;

					$datos = $comanda->getComanda(['_usuario' => $data->idusuario]);
					$datos->exito = true;
					$urlBaseWs = get_url_websocket();					
					$updlst = json_decode(get_request("{$urlBaseWs}/api/updlstareas", []));
					$datos->msgws = $updlst;
				}
			}
		}

		$this->output->set_output(json_encode($datos));
	}

	public function get_comanda_cocina()
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$datos = [
			'pendientes' => [],
			'enproceso' => []
		];

		$turno = $this->Turno_model->getTurno([
			'sede' => $data->sede,
			'abierto' => true,
			'_uno' => true
		]);

		if ($turno) {

			$tur = new Turno_model($turno->turno);
			$usu = $tur->getUsuarios(['usuario' => $data->idusuario]);
			if ($usu) {
				$cgrupo = [];
				foreach ($usu as $row) {
					$grupos = $this->Tipo_usuario_cgrupo_model->buscar([
						'usuario_tipo' => $row->usuario_tipo->usuario_tipo,
						'debaja' => 0
					]);

					$tmp = array_result($grupos, 'categoria_grupo');

					$cgrupo = array_merge($cgrupo, $tmp);
				}

				$filtro = [
					'sede' => $data->sede,
					'cocinado' => 0,
					'categoria_grupo' => $cgrupo,
					'order_by' => 'fecha_impresion'
				];

				if (isset($_GET['comanda'])) {
					$filtro['comanda'] = $_GET['comanda'];
				}

				$tmp = $this->Comanda_model->getComandas($filtro);

				$filtro['cocinado'] = 1;
				$filtro['order_by'] = 'fecha_proceso';

				$enProceso = $this->Comanda_model->getComandas($filtro);

				foreach ($tmp as $row) {
					$comanda = new Comanda_model($row->comanda);
					$datos['pendientes'][] = $comanda->getComanda([
						'_usuario' => $data->idusuario,
						'cocinado' => 0,
						'_numero' => $row->numero,
						'_categoria_grupo' => count($cgrupo) > 0 ? $cgrupo : null,
						'_for_prnt_recibo' => true
					]);
				}

				foreach ($enProceso as $row) {
					$comanda = new Comanda_model($row->comanda);
					$datos['enproceso'][] = $comanda->getComanda([
						'_usuario' => $data->idusuario,
						'cocinado' => 1,
						'_numero' => $row->numero,
						'_categoria_grupo' => count($cgrupo) > 0 ? $cgrupo : null,
						'_for_prnt_recibo' => true
					]);
				}
			}
		}

		$this->output->set_output(json_encode($datos));
	}

	public function set_cocinado($idcomanda)
	{
		$datos = ['exito' => true];
		$errores = '';
		$data = json_decode(file_get_contents('php://input'), true);
		if (isset($data['tiempo'])) {
			if ((int)$data['tiempo'] >= 0 && (int)$data['tiempo'] < 60) {
				$com = new Comanda_model($idcomanda);
				$detalle = $com->getDetalleComandaSimplified([
					'cocinado' => ((int)$data['estatus'] === 1 ? 0 : 1),
					'numero' => $data['numero']
				]);

				foreach ($detalle as $det) {
					$ld = new Dcomanda_model($det->detalle_comanda);
					$args = ['cocinado' => $data['estatus']];

					if ((int)$data['estatus'] === 1) {
						// if ((int)$data['tiempo'] < 10) {
						// 	$data['tiempo'] = "0" . $data['tiempo'];
						// }
						// if (isset($data['tiempo'])) {
						// 	$args['tiempo_preparacion'] = "00:{$data['tiempo']}";
						// }
						$args['tiempo_preparacion'] = "00:00";
						$args['fecha_proceso'] = isset($data['fecha_proceso']) ? $data['fecha_proceso'] : Hoy(3);
					}

					$exito = $ld->guardar($args);
					if (!$exito) {
						$datos['exito'] = false;
						if ($errores !== '') {
							$errores .= '; ';
						}
						$errores .= implode('; ', $ld->getMensaje());
					}
				}
				$datos['mensaje'] = $datos['exito'] ? 'Datos actualizados con éxito.' : $errores;
			} else {
				$datos['mensaje'] = 'El tiempo debe estar entre 0 y 59 minutos.';
			}
		} else {
			$datos['mensaje'] = 'Hacen falta datos obligatorios para poder continuar.';
		}


		$this->output->set_output(json_encode($datos));
	}

	public function imprimir($idCta, $pdf = 0, $no_get_comanda = 0)
	{
		$cta = new Cuenta_model($idCta);
		$com = new Comanda_model($cta->comanda);
		$req = json_decode(file_get_contents('php://input'), true);

		$datos = [
			'exito' => true,
			'mensaje' => 'Datos Actualizados con exito'
		];

		if ((int)$pdf === 0) {
			if ($pdf != 2) {
				$cta->imprimirDetalle();
			}
			$datos['comanda'] = (int)$no_get_comanda === 0 ? $com->getComanda() : (object)[];
		} else {
			$datos['comanda'] = $com->getComanda([
				'impreso' => '0',
				'_cuenta' => $cta->getPK()
			]);
			$cta->imprimirDetalle();
			$det = 0;
			foreach ($datos['comanda']->cuentas as $cta) {
				foreach ($cta->productos as $prod) {
					$det += 1;
					if (isset($prod->detalle)) {
						$det += count($prod->detalle);
					}
					if (!empty($prod->notas)) {
						$det += 1;
					}
				}
			}
		}

		if ((int)$pdf === 1) {

			$mpdf = new \Mpdf\Mpdf([
				'mode' => 'utf-8',
				'tempDir' => sys_get_temp_dir(), //produccion
				'format' => [80, 100 + $det * 2]
			]);

			$mpdf->WriteHTML($this->load->view('impresion/comanda', $datos, true));
			$mpdf->Output('Detalle de Comandas.pdf', 'D');
		} else {
			$this->output
				->set_output(json_encode($datos));
		}
	}

	public function cerrar_mesa($mesa = null)
	{
		$res = ["exito" => false];
		if ($this->input->method() == 'post') {
			$this->load->helper(['jwt', 'authorization']);
			$headers = $this->input->request_headers();
			$data = AUTHORIZATION::validateToken($headers['Authorization']);
			if ($mesa !== null) {
				$_mesa = new Mesa_model($mesa);
				if ($_mesa->estatus == 2) {
					$comanda = $_mesa->get_comanda(["estatus" => 1, 'sede' => $data->sede]);
					if ($comanda) {
						$com = new Comanda_model($comanda->comanda);
						$det = $com->get_articulos_pendientes();
						$cntConCantidad = 0;
						if ($det) {
							$cntConCantidad = count($det);
						}

						if ($cntConCantidad == 0) {
							$_mesa->guardar(["estatus" => 1]);
							$com->guardar(["estatus" => 2]);
							$res['exito'] = true;
							$res['mensaje'] = "Datos actualizados con exito";
						} else {
							$res['mensaje'] = "La comanda no debe tener productos";
						}
					} else {
						$res['mensaje'] = "La mesa debe tener una comanda activa";
					}
				} else {
					$res['mensaje'] = "La mesa debe estar en estatus Abierto";
				}
			} else {
				$res['mensaje'] = "Debe seleccionar una mesa";
			}
		} else {
			$res['mensaje'] = "Metodo de envío invalido";
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($res));
	}

	public function validapwdgerenteturno()
	{
		$res = ["exito" => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			$gerente = $this->Usuario_model->validaPwdGerenteTurno($req['pwd'], $this->data->sede);
			$res['esgerente'] = $gerente->esgerente;
			$res['gerente_turno'] = $gerente->usuario;
			$res['exito'] = true;
			$res['mensaje'] = 'Datos validados con éxito.';
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($res));
	}

	public function anular_pedido($comanda = null)
	{
		$datos = ["exito" => false];

		if ($this->input->method() == 'post') {
			if ($comanda !== null) {
				$com = new Comanda_model($comanda);
				$bitComanda = new Bitacora_model();
				$usu = new Usuario_model($this->data->idusuario);
				if ($com->getPK()) {
					$req = json_decode(file_get_contents('php://input'), true);

					$params = ["estatus" => 2];

					if ($com->estatus_callcenter) {
						$params['estatus_callcenter'] = 10;
					}

					$com->guardar($params);

					$reversaInventario = isset($req['reversa_inventario']) && (int)$req['reversa_inventario'] === 1;
					if ($reversaInventario) {
						$detalle = $this->Dcomanda_model->get_detalle_comanda_and_childs(['comanda' => $com->getPK()]);
						foreach ($detalle as $det) {
							$dc = new Dcomanda_model($det->detalle_comanda);
							$dc->cantidad = 0;
							$dc->total = 0;
							$dc->cantidad_inventario = 0;
							$dc->guardar();
						}
					}

					$fac = $com->getFactura();
					$acc = $this->Accion_model->buscar([
						"descripcion" => "Modificacion",
						"_uno" => true
					]);

					$comentario = "Anulación: El usuario {$usu->nombres} {$usu->apellidos} anuló la comanda {$comanda} Motivo: {$req['comentario']}.";
					if ($reversaInventario) {
						$comentario .= " Se reversó el inventario.";
					}

					$bitComanda->guardar([
						"accion" => $acc->accion,
						"usuario" => $this->data->idusuario,
						"tabla" => "comanda",
						"registro" => $com->getPK(),
						"comentario" => $comentario
					]);
					if ($fac) {
						unset($fac->total);
						$bitFac = new Bitacora_model();
						$fac->guardar([
							"serie_factura" => "***PEDIDO CANCELADO***",
							"numero_factura" => $fac->getPK(),
							"fel_uuid" => "***PEDIDO CANCELADO***",
							"fel_uuid_anulacion" => "***PEDIDO CANCELADO***"
						]);

						$comentario = "Anulación: El usuario {$usu->nombres} {$usu->apellidos} anuló la factura {$fac->numero_factura} Serie {$fac->serie_factura} Motivo: {$req['comentario']}";

						$bitFac->guardar([
							"accion" => $acc->accion,
							"usuario" => $this->data->idusuario,
							"tabla" => "factura",
							"registro" => $fac->getPK(),
							"comentario" => $comentario
						]);

						$datos['exito'] = true;
						$datos['mensaje'] = "Datos actualizados con exito";
					}
				} else {
					$datos['mensaje'] = "No existe ninguna comanda con este numero {$comanda}";
				}
			} else {
				$datos['mensaje'] = "Hacen falta datos obligatorios para poder continuar";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function lista_comandas()
	{
		if (!isset($_GET['sede'])) {
			$_GET['sede'] = $this->data->sede;
		}
		$datos = $this->Comanda_model->getComandas($_GET);

		$datos = ordenar_array_objetos($datos, 'comanda', 1);

		foreach ($datos as $comanda) {
			unset($comanda->origen_datos);
			$cmd = new Comanda_model($comanda->comanda);
			$mesero = $this->Usuario_model->buscar(['usuario' => $comanda->mesero, '_uno' => true]);
			$comanda->mesero = (object)[
				'usuario' => $mesero->usuario,
				'nombre' => $mesero->nombres,
				'apellidos' => $mesero->apellidos,
				'usrname' => $mesero->usrname
			];
			$comanda->detalle = $cmd->getDetalle();
			$comanda->total = 0;
			foreach ($comanda->detalle as $det) {
				$comanda->total += (float)$det->total;
			}
		}

		$this->output->set_output(json_encode($datos));
	}

	public function anular_comanda($comanda)
	{
		$datos = new stdClass();
		$datos->exito = false;
		if ($comanda) {
			$req = json_decode(file_get_contents('php://input'));
			if (isset($req->razon_anulacion) && (int)$req->razon_anulacion > 0) {
				$cmd = new Comanda_model($comanda);
				$factura = $cmd->getFactura();
				$tieneFactura = $factura && !empty($factura->fel_uuid) && empty($factura->fel_uuid_anulacion);
				if (!$tieneFactura) {
					$detComanda = $cmd->getDetalle();
					foreach ($detComanda as $det) {
						$dc = new Dcomanda_model($det->detalle_comanda);
						$dc->cantidad = 0;
						$dc->total = 0;
						$dc->guardar();
					}
					$cmd->notas_generales = "Comanda anulada el " . date('d/m/Y') . " por el usuario {$this->data->usuario}.";
					$cmd->notas_generales .= isset($req->comentario_anulacion) && !empty($req->comentario_anulacion) ? (' ' . trim($req->comentario_anulacion)) : '';
					$cmd->estatus = 3;
					$cmd->razon_anulacion = $req->razon_anulacion;

					$bitComanda = new Bitacora_model();
					$acc = $this->Accion_model->buscar([
						"descripcion" => "Modificacion",
						"_uno" => true
					]);
					$bitComanda->guardar([
						"accion" => $acc->accion,
						"usuario" => $this->data->idusuario,
						"tabla" => "comanda",
						"registro" => $cmd->getPK(),
						"comentario" => $cmd->notas_generales
					]);

					$datos->exito = $cmd->guardar();
					$datos->mensaje = $datos->exito ? "La comanda {$comanda} fue anulada con éxito." : $cmd->getMensaje();
				} else {
					$datos->mensaje = "La comanda {$comanda} tiene la factura '{$factura->serie_factura}-{$factura->numero_factura}' vigente. Debe anular primero la factura.";
				}
			} else {
				$datos->mensaje = 'Por favor seleccione una razón de anulación.';
			}
		} else {
			$datos->mensaje = 'Debe mandar el número de comanda para que sea anulada.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function ver_comanda($idcomanda)
	{
		$com = new Comanda_model($idcomanda);
		$datos = new stdClass();
		$datos->comanda = $com->getComanda($_GET);
		$this->output->set_output(json_encode($datos->comanda->cuentas));
	}

	public function eliminar_detalle()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$detalle = $this->Dcomanda_model->get_detalle_comanda_and_childs(['detalle_comanda' => $req['detalle_comanda']]);
		$datos = ['exito' => false];
		$errores = [];

		if (count($detalle) > 0) {
			$pasa = true;
			if ((int)$detalle[0]->impreso === 1) {
				if (isset($req['autorizado']) && $req['autorizado'] == true) {
					$this->add_bitacora_elimina_detalle_comanda((object)$detalle[0], $req);
				} else {
					$pasa = false;
					$errores[] = 'El producto ya ha sido impreso, por favor cierre el panel y vuelva a entrar.';
				}
			} else {
				$req['regresa_inventario'] = true;
			}

			if ($pasa) {
				foreach ($detalle as $det) {
					$dc = new Dcomanda_model($det->detalle_comanda);
					$dc->cantidad = (float)$req['cantidad'];
					$dc->total = (float)$req['total'];
					if ($req['regresa_inventario'] || (int)$det->mostrar_inventario === 0) {
						$dc->cantidad_inventario = (float)$req['cantidad'];
					}
					$exito = $dc->guardar();
					if (!$exito) {
						$errores[] = implode('; ', $dc->getMensaje());
					}
				}
			}
		} else {
			$errores[] = 'No se encontró ningún detalle con esos parámetros.';
		}

		if (count($errores) === 0) {
			$articulo = new Articulo_model($detalle[0]->articulo);
			if ((int)$detalle[0]->impreso === 1) {
				$datos['anulacion'] = (object)[
					'articulo' => $articulo->descripcion,
					'cantidad' => round((float)$detalle[0]->cantidad, 2),
					'impresora' => $articulo->getImpresora()
				];
			}
			$comanda = new Comanda_model($detalle[0]->comanda);
			$datos['comanda'] = $comanda->getComanda([
				'_cuenta' => $req['cuenta'], 'articulo' => $detalle[0]->articulo, 'detalle_comanda' => $detalle[0]->detalle_comanda
			]);
			$datos['exito'] = true;
			$datos['mensaje'] = 'Producto eliminado con éxito.';
		} else {
			$datos['mensaje'] = implode(',', $errores);
		}

		$this->output->set_output(json_encode($datos));
	}

	public function test()
	{
		$detalle = $this->Cuenta_model->obtener_detalle($_GET);
		$this->output->set_output(json_encode($detalle));
	}

	private function copia_detalle_comanda($comanda_destino, $cuenta_destino, $detalle_original, $detalle_comanda_id = null, $articulo_padre = null)
	{
		$resultado = ['exito' => true, 'mensaje' => ''];
		foreach ($detalle_original as $detOrigen) {
			$det = new Dcomanda_model();
			$det->comanda = $comanda_destino;
			$det->articulo = $detOrigen->articulo;
			$det->cantidad = $detOrigen->cantidad;
			$det->precio = 0;
			$det->fecha = date('Y-m-d H:i:s');

			if (empty($detalle_comanda_id)) {
				$articulo = $this->Articulo_model->buscar(['articulo' => $detOrigen->articulo, '_uno' => true]);
				$det->precio = $articulo->precio;
			} else {
				if ((int)$detOrigen->esextra === 0) {
					$receta = $this->Receta_model->buscar(['receta' => $articulo_padre, 'articulo' => $detOrigen->articulo, '_uno' => true]);
					$det->precio = $receta->precio;
				}
				if ((int)$detOrigen->esextra === 1) {
					$articulo = $this->Articulo_model->buscar(['articulo' => $detOrigen->articulo, '_uno' => true]);
					$det->precio = $articulo->precio;
				}
			}

			$det->total = (float)$det->cantidad * (float)$det->precio;
			$det->presentacion = isset($detOrigen->presentacion) ? $detOrigen->presentacion : 1;
			$det->cantidad_inventario = $detOrigen->cantidad;
			$det->detalle_comanda_id = $detalle_comanda_id;

			$resultado['exito'] = $det->guardar();

			if (!$resultado['exito']) {
				if ($resultado['mensaje'] !== '') {
					$resultado['mensaje'] .= '; ';
				}
				$resultado['mensaje'] .= implode('; ', $det->getMensaje());
			} else {
				$detCta = new Dcuenta_model();
				$detCta->cuenta_cuenta = $cuenta_destino;
				$detCta->detalle_comanda = $det->getPK();
				$detCta->guardar();
			}

			if (count($detOrigen->detalle) > 0) {
				$this->copia_detalle_comanda($comanda_destino, $cuenta_destino, $detOrigen->detalle, $det->getPK(), $detOrigen->articulo);
			}
		}
		return $resultado;
	}

	public function duplicar_detalle_comanda()
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'));
			$comanda_original = new Comanda_model($req->comanda_origen);
			$cuenta_destino = $this->Cuenta_model->buscar(['comanda' => $req->comanda_destino, '_uno' => true]);
			$detalle_original = json_decode($comanda_original->detalle_comanda_original);
			$resultado = $this->copia_detalle_comanda($req->comanda_destino, $cuenta_destino->cuenta, $detalle_original);
			if (trim($resultado['mensaje']) === '') {
				$datos['exito'] = true;
				$datos['mensaje'] = 'Detalle duplicado con éxito.';
			} else {
				$datos['mensaje'] = $resultado['mensaje'];
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function cambia_estatus_pedido_call_center()
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$this->load->helper(['jwt', 'authorization']);
			$headers = $this->input->request_headers();
			$data = AUTHORIZATION::validateToken($headers['Authorization']);

			$req = json_decode(file_get_contents('php://input'));
			$cmd = new Comanda_model($req->comanda);

			$params = ['estatus_callcenter' => $req->estatus_callcenter];

			if (isset($req->repartidor) && !empty($req->repartidor) && (int)$req->repartidor > 0) {
				$params['repartidor'] = $req->repartidor;
			}

			$datos['exito'] = $cmd->guardar($params);
			if ($datos['exito']) {
				$cmd->cerrar_comanda_domicilio();
				$this->load->helper('api');
				$datos['mensaje'] = 'Estatus de comanda actualizado con éxito.';
				$datos['comanda'] = $cmd->getComanda(['_usuario' => $data->idusuario]);

				$url_ws = get_url_websocket();
				$idPedido = (int)$datos['comanda']->comanda;
				$idEstatusCC = (int)$datos['comanda']->estatus_callcenter->estatus_callcenter;
				get_request("{$url_ws}/api/updpedidocc/{$idPedido}/{$idEstatusCC}" . (!isset($params['repartidor']) ? '' : "/{$params['repartidor']}"), []);
			} else {
				$datos['mensaje'] = implode('; ', $cmd->getMensaje());
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function fix_presentacion_pasado_opcion_multiple()
	{
		set_time_limit(0);
		$datos = $this->Comanda_model->fix_detcom_presentacion_pasado_opcion_multiple();
		$this->output->set_output(json_encode($datos));
	}

	public function fix_comandas_abiertas_domicilio()
	{
		set_time_limit(0);
		ini_set('memory_limit', '512M');
		$this->Comanda_model->fix_comandas_abiertas_domicilio($_GET);
		$this->output->set_output(json_encode(['exito' => true, 'mensaje' => 'Proceso ejecutado con éxito, por favor revise.']));
	}
}

/* End of file Comanda.php */
/* Location: ./application/restaurante/controllers/Comanda.php */