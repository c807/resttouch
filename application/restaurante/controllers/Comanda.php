<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Comanda extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		//$this->datos = [];
		$this->load->add_package_path('application/facturacion');		

		$this->load->model([
			"Comanda_model", 
			"Dcomanda_model", 
			"Cuenta_model", 
			"Dcuenta_model",
			"Usuario_model",
			"Mesa_model",
			"Area_model",
			"Articulo_model",
			"Catalogo_model",
			"Turno_model",
			"Factura_model",
			"Receta_model",
			"Impresora_model",
			"Presentacion_model",
			"Configuracion_model",
			"Tipo_usuario_cgrupo_model"
		]);

		$this->output
		->set_content_type("application/json", "UTF-8");
	}


	function guardar()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ["exito" => false];
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		if ($this->input->method() == 'post') {
			if (isset($req['mesa']) && isset($req['comanda']) && isset($req['cuentas'])) {
				$req['data'] = $data;
				$datos = guardar_comanda($req);
			} else {
				$datos['mensaje'] = "Hacen falta datos obligatorios para poder continuar";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output
		->set_output(json_encode($datos));
	}

	public function guardar_notas_generales($comanda) {
		$datos = ["exito" => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			if(isset($req['notas_generales'])) {
				if(trim($req['notas_generales']) !== '') {
					$com = new Comanda_model($comanda);
					$datos['exito'] = $com->guardar($req);
					if($datos['exito']) {
						$datos['mensaje'] = 'Notas generales actualizadas con éxito.';
					} else {
						$datos['mensaje'] = implode("<br>", $com->getMensaje());;
					}
				}
			}						
		}
		$this->output->set_output(json_encode($datos));
	}

	public function cerrar_estacion($comanda)
	{
		/*
		$datos = ["exito" => false];		
		$com = new Comanda_model($comanda);
		$com->comandaenuso = 0;
		if ($com->guardar()) {
			$datos['exito'] = true;
			$datos['mensaje'] = "Datos actualizados con exito";
		} else {			
			$datos['mensaje'] = $com->getMensaje();
		}
		*/

		$datos = ["exito" => false];
		$com = new Comanda_model($comanda);
		if($com->cierra_estacion($comanda)) {
			$datos['exito'] = true;
			$datos['mensaje'] = "Datos actualizados con exito";			
		} else {
			$datos['mensaje'] = "No se pudo habilitar la comanda $comanda. Por favor comuníquese con el administrador del sistema.";
		}

		$this->output
		->set_output(json_encode($datos));
	}

	public function unir_cuentas($cuentaDe, $cuentaA) {
		$deCuenta = new Cuenta_model($cuentaDe);
		$aCuenta = new Cuenta_model($cuentaA);
		$datos = ['exito' => false];
		if ($deCuenta->cerrada == 0) {			
			if ($aCuenta->cerrada == 0) {
				$detOrigen = $deCuenta->getDetalle();				
				if (count($detOrigen) > 0) {
					foreach($detOrigen as $do) {
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
		$this->output->set_output(json_encode($datos));
	}

	public function trasladar_mesa($comanda, $origen, $destino) {		
		$cmd = new Comanda_model($comanda);
		$mesaOrigen = new Mesa_model($origen);
		$mesaDestino = new Mesa_model($destino);
		$mesaDestino->guardar(['estatus' => 2]);
		$cmd->trasladar_mesa($destino, $comanda);
		$mesaOrigen->guardar(['estatus' => 1]);
		$datos = ['exito' => true, 'mensaje' => 'Mesa trasladada con éxito.'];
		$this->output->set_output(json_encode($datos));
	}

	public function guardar_detalle_combo($com, $cuenta)
	{
		$comanda = new Comanda_model($com);
		$mesa = $comanda->getMesas();
		$cuenta = new Cuenta_model($cuenta);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ["exito" => false];

		if ($this->input->method() == 'post') {
			if ($mesa->estatus == 2) {
				if ($cuenta->cerrada == 0) {
					$val = validarCantidades($req);
					if($val['exito']){
						$comanda->guardarDetalleCombo($req, $cuenta->getPK());

						$datos['exito'] = true;
						$datos['comanda'] = $comanda->getComanda();	
						
					} else {
						$datos['mensaje'] = $val['mensaje'];
					}
				} else {
					$datos['mensaje'] = "La cuenta ya esta cerrada";
				}
			} else {
				$datos['mensaje'] = "La mesa debe estar en estatus abierto";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output
		->set_output(json_encode($datos));
	}

	public function guardar_detalle($com, $cuenta)
	{
		$comanda = new Comanda_model($com);
		$mesa = $comanda->getMesas();
		$cuenta = new Cuenta_model($cuenta);
		$req = json_decode(file_get_contents('php://input'), true);
		$menu = $this->Catalogo_model->getModulo(["modulo" => 4, "_uno" => true]);
		$datos = ["exito" => false];

		if ($this->input->method() == 'post') {
			if ($mesa->estatus == 2) {
				if ($cuenta->cerrada == 0) {
					if (isset($req["detalle_comanda"])) {
						$dcom = new Dcomanda_model($req["detalle_comanda"]);
						$datos["exito"] = $dcom->impreso == 0;

						if ($dcom->impreso == 1) {
							if (isset($req["autorizado"]) && $req["autorizado"] == true) {
								$datos["exito"] = true;
							} else {
								$datos['mensaje'] = "El producto ya ha sido impreso, por favor cierre el panel y vuelva a entrar.";
							}

							unset($req["autorizado"]);
						}
					} else {
						$datos["exito"] = true;
					}

					if ($datos["exito"]) {
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

						if ($datos['exito']) {
							$datos['comanda'] = $comanda->getComanda();	
						} else {
							$datos['mensaje'] = implode("<br>", $comanda->getMensaje());
						}
					}
				} else {
					$datos['mensaje'] = "La cuenta ya esta cerrada";
				}
			} else {
				$datos['mensaje'] = "La mesa debe estar en estatus abierto";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output
		->set_output(json_encode($datos));
	}

	public function distribuir_cuentas()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ["exito" => false];

		if ($this->input->method() == 'post') {
			

			foreach ($req as $row) {
				$det = new Dcomanda_model($row['detalle_comanda']);

				$datos['exito'] = $det->distribuir_cuenta($row);

				if (!$datos['exito']) {
					$datos['mensaje'] = implode("<br>", $det->getMensaje());
				}	
			}				
			
			if ($datos['exito']) {
				$datos['mensaje'] = "Datos Actualizados con exito";
			}

			$datos['exito'] = true;

		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output
		->set_output(json_encode($datos));
	}

	public function guardar_notas_producto($dcomanda) {
		$datos = ["exito" => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			if(isset($req['notas'])) {
				$dcom = new Dcomanda_model($dcomanda);
				$req['notas'] = trim($req['notas']) !== '' ? trim($req['notas']) : null;
				$datos['exito'] = $dcom->guardar($req);
				if($datos['exito']) {
					$datos['mensaje'] = 'Notas de producto actualizadas con éxito.';
				} else {
					$datos['mensaje'] = implode("<br>", $dcom->getMensaje());
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
		$menu = $this->Catalogo_model->getModulo(["modulo" => 4, "_uno" => true]);
		$datos = ["exito" => false];

		if ($this->input->method() == 'post') {
			if ($cuenta->cerrada == 0) {
				foreach ($data['articulos'] as $key => $req) {
					$art = $this->Articulo_model->buscarArticulo([
						'codigo' => $req['codigo'],
						'sede' => $comanda->sede,
						'_uno' => true
					]);

					if ($art) {
						$req["articulo"] = $art->articulo;

						unset($req["codigo"]);

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
						$datos['mensaje'] = "Producto no encontrado en restaurante, por favor comuníquese con el mesero de turno.";
					}
				}

				if ($datos['exito']) {
					$datos['mensaje'] = "Productos agregados con éxito.";
					$datos['comanda'] = $comanda->getComanda();	
					$datos['mensaje'] = 'Detalle cuenta cargada correctamente.';	
				} else {
					$datos['mensaje'] = implode("<br>", $comanda->getMensaje());
				}

			} else {
				$datos['mensaje'] = "La cuenta ya esta cerrada";
			}
		} else {
			$datos['mensaje'] = "Error en comunicación, por favor comuníquese con el mesero de turno.";
		}

		$this->output
		->set_output(json_encode($datos));
	}

	function get_comanda($mesa=''){
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);

		$datos = [];

		if (empty($mesa)) {			
			$tmp = $this->Comanda_model->getComandas([
				'domicilio' => 1, 
				'sede' => $data->sede
			]);

			foreach ($tmp as $row) {
				$comanda = new Comanda_model($row->comanda);
				$datos[] = $comanda->getComanda(["_usuario" => $data->idusuario]);
			}
		} else {
			$mesa = new Mesa_model($mesa);
			$tmp = $mesa->get_comanda(["estatus" => 1, 'sede' => $data->sede]);

			if ($tmp) {
				$comanda = new Comanda_model($tmp->comanda);
				$comanda->comandaenuso = 0;

				$datos = $comanda->getComanda(["_usuario" => $data->idusuario]);
				$datos->exito = true;
			} else if($this->input->get('qr')) {
				$com = new Comanda_model();
				$config = $this->Configuracion_model->buscar();
				$mesero = get_configuracion($config, "RT_MESERO_POR_DEFECTO", 1);

				$res = guardar_comanda([
					"comanda" => "",
					"estatus" => 1,
					"data" => $data,
					"mesero" => $mesero,
					"cuentas" => [["nombre" => "Unica"]],
					"mesa" => $mesa->getPK()
				]);
				if ($res['exito']) {
					$this->load->helper('api');
					$tmp = $mesa->get_comanda(["estatus" => 1, 'sede' => $data->sede]);
					$comanda = new Comanda_model($tmp->comanda);
					$comanda->comandaenuso = 0;

					$datos = $comanda->getComanda(["_usuario" => $data->idusuario]);
					$datos->exito = true;
					$updlst = json_decode(get_request('https://restouch.c807.com:8988/api/updlstareas', []));
					$datos->msgws = $updlst;
				}
				
			}
		}

		$this->output
		->set_output(json_encode($datos));
	}	

	public function get_comanda_cocina() {
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$datos = [
			"pendientes" => [],
			"enproceso" => []
		];

		$turno = $this->Turno_model->getTurno([
			"sede" => $data->sede,
			'abierto' => true, 
			"_uno" => true
		]);

		if ($turno) {

			$tur = new Turno_model($turno->turno);
			$usu = $tur->getUsuarios(["usuario" => $data->idusuario]);
			if ($usu) {
				$cgrupo = [];
				foreach ($usu as $row) {
					$grupos = $this->Tipo_usuario_cgrupo_model->buscar([
						"usuario_tipo" => $row->usuario_tipo->usuario_tipo,
						"debaja" => 0
					]);	

					$tmp = array_result($grupos, "categoria_grupo");

					$cgrupo = array_merge($cgrupo, $tmp);
				}
				
				$tmp = $this->Comanda_model->getComandas([
					'sede' => $data->sede, 
					'cocinado' => 0,
					'categoria_grupo' => $cgrupo,
					'order_by' => "fecha_impresion"
				]);

				$enProceso = $this->Comanda_model->getComandas([
					'sede' => $data->sede, 
					'cocinado' => 1,
					'categoria_grupo' => $cgrupo,
					'order_by' => "fecha_proceso"
				]);

				foreach ($tmp as $row) {
					$comanda = new Comanda_model($row->comanda);
					$datos['pendientes'][] = $comanda->getComanda([
						"_usuario" => $data->idusuario, 
						'cocinado' => 0,
						'_numero' => $row->numero,
						'_categoria_grupo' => count($cgrupo) > 0 ? $cgrupo : null
					]);
				}

				foreach ($enProceso as $row) {
					$comanda = new Comanda_model($row->comanda);
					$datos['enproceso'][] = $comanda->getComanda([
						"_usuario" => $data->idusuario, 
						'cocinado' => 1,
						'_numero' => $row->numero,
						'_categoria_grupo' => count($cgrupo) > 0 ? $cgrupo : null
					]);
				}		
			}
		}

		$this->output->set_output(json_encode($datos));
	}

	public function set_cocinado($idcomanda) {
		$datos = ['exito' => true];
		$errores = '';
		$data = json_decode(file_get_contents('php://input'), true);
		if (isset($data['tiempo'])) {
			if ((int)$data['tiempo'] >= 0 && (int)$data['tiempo']<60) {
				$com = new Comanda_model($idcomanda);
				$detalle = $com->getDetalle([
					'cocinado' => ((int)$data['estatus'] === 1 ? 0 : 1),
					"numero" => $data['numero']
				]);		

				foreach($detalle as $det) {
					$ld = new Dcomanda_model($det->detalle_comanda);
					$args = [
						"cocinado" => $data['estatus']
					];

					if ($data['estatus'] == 1) {
						if ((int)$data['tiempo'] < 10) {
							$data['tiempo'] = "0".$data['tiempo'];
						}

						if (isset($data['tiempo'])) {
							$args["tiempo_preparacion"] = "00:{$data['tiempo']}";
						}

						$args['fecha_proceso'] = Hoy(3);
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
				$datos['mensaje'] = "El tiempo debe estar entre 1 y 59 minutos";	
			}

		} else {
			$datos['mensaje'] = "Hacen falta datos obligatorios para poder continuar";
		}
		
		
		$this->output->set_output(json_encode($datos));
	}

	public function imprimir($idCta, $pdf = 0)
	{
		$cta = new Cuenta_model($idCta);
		$com = new Comanda_model($cta->comanda);
		$req = json_decode(file_get_contents('php://input'), true);
		
		$datos = [
			'exito' => true, 
			'mensaje' => 'Datos Actualizados con exito'
		];

		if ($pdf === 0) {
			if ($pdf != 2) {
				$cta->imprimirDetalle();
			}
			$datos["comanda"] = $com->getComanda();
		} else {
			$datos["comanda"] = $com->getComanda([
				'impreso' => "0",
				"_cuenta" => $cta->getPK()
			]);
			$cta->imprimirDetalle();
			$det = 0;
			foreach ($datos['comanda']->cuentas as $cta) {
				foreach ($cta->productos as $prod) {
					$det+=1;
					if (isset($prod->detalle)) {
						$det+=count($prod->detalle);
					}
					if (!empty($prod->notas)) {
						$det+=1;
					}
				}
			}
		}

		if ($pdf == 1) {
				
			$mpdf = new \Mpdf\Mpdf([
				'mode' => 'utf-8',
				'tempDir' => sys_get_temp_dir(), //produccion
				'format' => [80,100+$det*2]
			]);

			$mpdf->WriteHTML($this->load->view('impresion/comanda', $datos, true));
			$mpdf->Output("Detalle de Comandas.pdf", "D");
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
						$det = $com->getDetalle();
						$cntConCantidad = 0;
						foreach($det as $d) {
							if ((float)$d->cantidad > 0) {
								$cntConCantidad++;
							}
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

		$this->output
			 ->set_content_type('application/json')
			 ->set_output(json_encode($res));
	}

	public function validapwdgerenteturno() {
		$res = ["exito" => false];
		if ($this->input->method() == 'post') {
			$data = json_decode(file_get_contents('php://input'), true);			
			$res['esgerente'] = $this->Usuario_model->validaPwdGerenteTurno($data['pwd']);
			$res['exito'] = true;
			$res['mensaje'] = 'Datos validados con éxito.';
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($res));
	}
}

/* End of file Comanda.php */
/* Location: ./application/restaurante/controllers/Comanda.php */