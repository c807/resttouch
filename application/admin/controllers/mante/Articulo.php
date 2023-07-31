<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Articulo extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Articulo_model',
			'Receta_model',
			'Presentacion_model',
			'Usuario_model',
			'Articulo_tipo_cliente_model',
			'Umedida_model',
			'Categoria_model',
			'Cgrupo_model',
			'Bitacora_model',
			'Accion_model'
		]);

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		$this->output->set_content_type("application/json", "UTF-8");
	}

	public function chkCodigoExistente($codigo = '')
	{
		// $art = $this->Articulo_model->buscar(['codigo' => $codigo, '_uno' => true]);
		$art = $this->Articulo_model->buscarArticulo(['codigo' => $codigo, 'sede' => $this->data->sede]);
		return $art ? true : false;
	}

	public function guardar($id = "")
	{
		$art = new Articulo_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$existeCodigo = false;

			if (empty($id)) {
				$req['existencias'] = 0;
				$existeCodigo = $this->chkCodigoExistente($req['codigo']);
			} else {
				$req['existencias'] = $art->existencias;
				$tmpArt = $this->Articulo_model->buscar(['articulo' => $id, '_uno' => true]);
				if ($tmpArt) {
					if ($req['codigo'] !== $tmpArt->codigo) {
						$existeCodigo = $this->chkCodigoExistente($req['codigo']);
					}
				}
			}

			if (!$existeCodigo) {
				$continuar = true;
				if ((int)$req['produccion'] === 1 && !((float)$req['rendimiento'] >= (float)0.01)) {
					$continuar = false;
				}

				if ($continuar) {
					if ((int)$req['mostrar_inventario'] === 1 && (int)$req['esreceta'] === 1) {
						$datos['mensaje'] = 'El artículo no puede ser receta y ser de inventario.';
					} else {
						$pre = new Presentacion_model($req['presentacion']);
						$preRep = new Presentacion_model($req['presentacion_reporte']);
						if ($pre->medida == $preRep->medida) {
							if ((int)$req['produccion'] === 0 && (int)$req['esreceta'] === 1 && (int)$req['mostrar_inventario'] === 1 && ((float)$preRep->cantidad !== (float)1 || (float)$pre->cantidad !== (float)1)) {
								$datos['mensaje'] = 'La configuración de este artículo solo permite presentaciones que su cantidad sea igual a uno (1).';
							} else {
								$usr = $this->Usuario_model->buscar(['usuario' => $this->data->idusuario, '_uno' => true]);
								$comentario = "El usuario {$usr->usrname} modificó el artículo '{$art->descripcion}' desde el mantenimiento de artículos. Registro original: " . json_encode($art);
								$datos['exito'] = $art->guardar($req);
								if ($datos['exito']) {
									$this->add_to_bitacora($art->getPK(), $comentario);
									$datos['mensaje'] = "Datos Actualizados con Exito";
									$datos['articulo'] = $art;
								} else {
									$datos['mensaje'] = $art->getMensaje();
								}
							}
						} else {
							$datos['mensaje'] = 'Las unidades de medida no coinciden';
						}
					}
				} else {
					$datos['mensaje'] = 'El rendimiento de la producción debe ser mayor o igual a 0.01.';
				}
			} else {
				$datos['mensaje'] = 'El código ' . $req['codigo'] . ' ya existe. Intente otro, por favor.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	private function search_product($args = [])
	{
		$datos = [];
		$tmp = $this->Articulo_model->buscar($args);

		if (is_array($tmp)) {
			foreach ($tmp as $row) {
				$art = new Articulo_model($row->articulo);
				$row->categoria_grupo = $art->getCategoriaGrupo();
				$row->presentacion = $art->getPresentacion();
				$row->presentacion_reporte = $art->getPresentacionReporte();
				$row->usuariobaja = !empty($row->usuariobaja) ? $this->Usuario_model->buscar(['usuario' => $row->usuariobaja, '_uno' => true]) : $row->usuariobaja;

				if ($row->usuariobaja && isset($row->usuariobaja->contrasenia)) {
					unset($row->usuariobaja->contrasenia);
				}

				if (!isset($args['_sede'])) {
					$datos[] = $row;
				} else {
					if ((int)$this->data->sede === (int)$row->categoria_grupo->sede) {
						$datos[] = $row;
					}
				}
			}
		} else if (is_object($tmp)) {
			$art = new Articulo_model($tmp->articulo);
			$tmp->categoria_grupo = $art->getCategoriaGrupo();
			$tmp->presentacion = $art->getPresentacion();
			$tmp->presentacion_reporte = $art->getPresentacionReporte();
			$tmp->usuariobaja = !empty($tmp->usuariobaja) ? $this->Usuario_model->buscar(['usuario' => $tmp->usuariobaja, '_uno' => true]) : $tmp->usuariobaja;

			if ($tmp->usuariobaja && isset($tmp->usuariobaja->contrasenia)) {
				unset($tmp->usuariobaja->contrasenia);
			}

			if (!isset($args['_sede'])) {
				$datos = $tmp;
			} else {
				if ((int)$this->data->sede === (int)$tmp->categoria_grupo->sede) {
					$datos = $tmp;
				}
			}
		}

		usort($datos, function ($a, $b) {
			return strcmp($a->descripcion, $b->descripcion);
		});

		return $datos;
	}

	public function buscar()
	{
		$datos = $this->search_product($_GET);
		$datos = ordenar_array_objetos($datos, 'descripcion');
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function guardar_receta($articulo, $id = '')
	{
		$art = new Articulo_model($articulo);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			if ($req['cantidad'] > 0) {
				if ((int)$articulo !== (int)$req['articulo']) {
					$rec = new Articulo_model($req['articulo']);
					if ($art->combo == 1 && $rec->combo == 1) {
						$datos['mensaje'] = "No es posible agregar un combo a un combo como detalle.";
					} else {
						$continuar = true;
						if ((int)$art->multiple === 1 || (int)$art->combo === 1) {
							$presArtRec = $rec->getPresentacionReporte();
							if ((float)$presArtRec->cantidad !== (float)1) {
								$continuar = false;
								$datos['mensaje'] = 'Este artículo no aplica para opción múltiple/combo.';
							}
						}
						if ($continuar) {
							$det = $art->guardarReceta($req, $id);
							if ($det) {
								$datos['exito'] = true;
								$datos['mensaje'] = "Datos Actualizados con Exito";
								$datos['detalle'] = $det;
							} else {
								$datos['mensaje'] = implode("<br>", $art->getMensaje());
							}
						}
					}
				} else {
					$datos['mensaje'] = "No se puede agregar un producto a si mismo como parte de una receta/detalle.";
				}
			} else {
				$datos['mensaje'] = "La cantidad debe ser mayor a cero.";
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}

		$this->output->set_output(json_encode($datos));
	}

	public function imprimir_receta($articulo)
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$art = new Articulo_model($articulo);
		$datos = [];

		$sede = $this->Catalogo_model->getSede(['sede' => $data->sede, '_uno' => true]);

		$emp = null;
		if ($sede) {
			$emp = $this->Catalogo_model->getEmpresa(['empresa' => $sede->empresa, '_uno' => true]);
			if ($emp) {
				$datos['empresa'] = $emp;
				$datos['nsede'] = $sede->nombre;
			}
		}

		$porIva = 1.0;
		if (isset($_GET['_coniva']) && (int)$_GET['_coniva'] === 1) {
			$porIva +=  ($emp ? (float)$emp->porcentaje_iva : 0);
		}

		$datos['articulo']       = $art;
		$datos['articulo_grupo'] = $art->getCategoriaGrupo();
		$datos['presentacion_reporte'] = $art->getPresentacionReporte();
		$tmpCosto                = $art->_getCosto_2();
		$datos['costo']          = (float)$tmpCosto * $porIva;
		$datos['advertir'] = '';

		foreach ($art->getReceta() as $row) {
			$rec = new Articulo_model($row->articulo->articulo);

			if ((int)$rec->produccion === 0 && (int)$rec->mostrar_inventario === 0 && in_array((int)$rec->esreceta, [0, 1])) {
				$datos['advertir'] = 'REVISAR';
			}

			$costo = $rec->_getCosto_2();

			if ((int)$rec->produccion === 1 && (float)$rec->rendimiento !== (float)0) {
				$presR = $rec->getPresentacionReporte();
				$costo = (float)$costo / ((float)$rec->rendimiento * (float)$presR->cantidad);
			}

			$costo *= $porIva;
			$tmpCosto = $costo * $row->cantidad;
			$row->costo = round($tmpCosto, 5);
			$row->articulo->costo = $costo;
			$datos['receta'][] = $row;
		}



		$vista = $this->load->view('reporte/receta', $datos, true);

		$mpdf = new \Mpdf\Mpdf([
			'tempDir' => sys_get_temp_dir(),
			'format' => 'Letter'
		]);
		$mpdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
		$mpdf->WriteHTML($vista);
		$mpdf->Output("Receta.pdf", "D");
	}

	public function buscar_receta($id)
	{
		$art = new Articulo_model($id);

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($art->getReceta($_GET)));
	}

	public function copiar()
	{
		ini_set('memory_limit', -1);
		set_time_limit(0);
		$this->load->model(["Categoria_model", "Cgrupo_model"]);
		$datos = ["exito" => false, "mensaje" => "Error"];
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);

		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);

			if (verDato($req, "sedes")) {
				if (verDato($req, "articulo")) {
					$tmp = $this->Articulo_model->buscar([
						"articulo" => $req['articulo'],
						'debaja' => 0,
						"_uno" => true
					]);
					$articulos[] = $tmp;
				} else {
					$articulos = $this->Catalogo_model->getArticulo(["sede" => $data->sede]);
				}

				$usr = $this->Usuario_model->buscar(['usuario' => $this->data->idusuario, '_uno' => true]);
				$sedeOrigen = $this->Sede_model->buscar(['sede' => $this->data->sede, '_uno' => true]);
				foreach ($req["sedes"] as $sede) {
					foreach ($articulos as $row) {
						$art = new Articulo_model($row->articulo);

						if (!empty($art->codigo)) {
							$art->copiar($sede['sede']);
							$sedeDestino = $this->Sede_model->buscar(['sede' => $sede['sede'], '_uno' => true]);
							$comentario = "El usuario {$usr->usrname} replicó el artículo {$art->descripcion} de la sede '{$sedeOrigen->nombre} ($sedeOrigen->alias)' a la sede '{$sedeDestino->nombre} ($sedeDestino->alias)'";
							$this->add_to_bitacora($art->getPK(), $comentario);
						}
					}

					foreach ($articulos as $row) {
						$art = new Articulo_model($row->articulo);
						if (!empty($art->codigo)) {
							$art->copiarDetalle($sede['sede']);
						}
					}
				}

				$datos['exito'] = true;
				$datos['mensaje'] = 'Datos actualizados con éxito.';
			} else {
				$datos['mensaje'] = 'Hacen falta datos obligatorios para poder continuar.';
			}
		} else {
			$datos['mensaje'] = 'Parametros inválidos';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function actualizar_costos()
	{
		$arts = $this->Articulo_model->buscar();
		$datos = [];
		$datos['exito'] = true;
		$datos['mensaje'] = "Datos Actualizados con Exito";
		foreach ($arts as $row) {
			$art = new Articulo_model($row->articulo);
			$costo = $art->getCosto();
			$art->guardar(["costo" => $costo]);
		}

		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function articulos_de_pos()
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);

		$datos = $this->Articulo_model->articulosParaPOS(['sede' => $data->sede]);

		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function tiene_movimientos($id = 0)
	{
		$datos = new stdClass();
		$datos->exito = false;
		if ((int)$id > 0) {
			$art = new Articulo_model($id);
			$datos->tiene_movimientos = $art->tiene_movimientos();
			$datos->exito = true;
			$datos->mensaje = 'El artículo ' . ($datos->tiene_movimientos ? 'SÍ' : 'NO') . ' tiene movimientos.';
		} else {
			$datos->tiene_movimientos = null;
			$datos->mensaje = 'Parámetros inválidos.';
		}
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function get_articulos_sedes_codigo()
	{
		if (!isset($_GET['sede'])) {
			$_GET['sede'] = [];
		}
		$datos = $this->Articulo_model->get_lista_articulos_sede_codigo($_GET['sede']);
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function articulo_fast_edit()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = new stdClass();
		$datos->exito = false;
		$articulo = new Articulo_model($req['articulo']);
		$usr = $this->Usuario_model->buscar(['usuario' => $this->data->idusuario, '_uno' => true]);
		$comentario = "El usuario {$usr->usrname} modificó el artículo '{$articulo->descripcion}' desde la edición rápida de artículos. Registro original: " . json_encode($articulo);
		$datos->exito = $articulo->guardar($req);
		if ($datos->exito) {
			$this->add_to_bitacora($articulo->getPK(), $comentario);
			$datos->mensaje = 'Artículo actualizado con éxito.';
		} else {
			$datos->mensaje = $articulo->getMensaje();
		}
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function dar_de_baja($id)
	{
		$datos = new stdClass();
		$datos->exito = false;

		$articulo = new Articulo_model($id);
		$noHayExistencias = true;
		if ((int)$articulo->mostrar_inventario === 1) {
			$articulo->actualizarExistencia(['sede' => $this->data->sede, 'fecha' => date('Y-m-d')]);
			if ((float)$articulo->existencias !== (float)0) {
				$noHayExistencias = false;
			}
		}

		if ($noHayExistencias) {
			$usadoEnTarifario = $articulo->usado_en_tarifario();
			if (!$usadoEnTarifario) {
				$datos = $articulo->dar_de_baja($this->data->idusuario);
			} else {
				$datos->mensaje = 'Este artículo está siendo usado en el tarifario de reservas. No se puede dar de baja.';
			}
		} else {
			$datos->mensaje = 'Las existencias del artículo no están a cero (0). No se puede dar de baja.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function calcula_existencias()
	{
		$inicia = time();
		set_time_limit(0);
		ini_set('memory_limit', '1536M');
		$this->load->model(['Sede_model', 'Bodega_model']);

		$fltrSedes = [];
		if (isset($_GET['sede']) && !empty((int)$_GET['sede'])) {
			$fltrSedes['sede'] = $_GET['sede'];
		}

		$fltrBodegas = [];
		if (isset($_GET['bodega']) && !empty((int)$_GET['bodega'])) {
			$fltrBodegas['bodega'] = $_GET['bodega'];
		}

		$fltrArticulo = [];
		$fltrArticulo['_todos'] = true;
		if (isset($_GET['articulo']) && !empty((int)$_GET['articulo'])) {
			$fltrArticulo['articulo'] = $_GET['articulo'];
		}
		if (isset($_GET['codigo']) && !empty(trim($_GET['codigo']))) {
			$fltrArticulo['codigo'] = trim($_GET['codigo']);
		}
		if (isset($_GET['categoria']) && !empty((int)$_GET['categoria'])) {
			$fltrArticulo['categoria'] = $_GET['categoria'];
		}
		if (isset($_GET['categoria_grupo']) && !empty((int)$_GET['categoria_grupo'])) {
			$fltrArticulo['categoria_grupo'] = $_GET['categoria_grupo'];
		}

		$sedes = $this->Sede_model->buscar($fltrSedes);
		$errores = [];
		foreach ($sedes as $sede) {
			$fltrBodegas['sede'] = $sede->sede;
			$bodegas = $this->Bodega_model->buscar($fltrBodegas);
			if (count($bodegas) > 0) {
				$fltrArticulo['sede'] = $sede->sede;
				$articulos = $this->Articulo_model->buscarArticulo($fltrArticulo);
				foreach ($articulos as $articulo) {
					$art = new Articulo_model($articulo->articulo);
					if ((int)$art->getPK() > 0) {
						foreach ($bodegas as $bodega) {
							$art->actualizarExistencia(['bodega' => $bodega->bodega]);
							$seActualizo = $art->actualiza_existencia_bodega_articulo_costo($bodega->bodega);
							if (!$seActualizo) {
								$errores[] = $art->getMensaje();
							}
						}
					}
				}
			}
		}
		$finaliza = time();

		$transcurrido = ($finaliza - $inicia) / 60;

		$datos = new stdClass();
		$datos->exito = true;
		$datos->mensaje = 'Existencias calculadas con éxito.';
		$datos->minutos_transcurridos = $transcurrido;
		if (count($errores) > 0) {
			$datos->exito = false;
			$datos->mensaje = $errores;
		}


		$this->output->set_output(json_encode($datos));
	}

	public function test_get_existencia_bodega($idArticulo = null)
	{
		$existencia = new stdClass();
		if ((int)$idArticulo > 0) {
			$articulo = new Articulo_model($idArticulo);
			$existencia = $articulo->get_existencia_bodega($_GET);
		} else {
			$existencia = $this->Articulo_model->get_existencia_bodega($_GET);
		}
		$this->output->set_output(json_encode($existencia));
	}

	public function actualiza_existencia_articulo($idArticulo)
	{
		$articulo = new Articulo_model($idArticulo);
		$articulo->actualizarExistencia();
		if (isset($_GET['async'])) {
			$fp = fopen("actualiza_existencias_{$idArticulo}.rtt", 'a');
			fwrite($fp, (date('d/m/Y H:i:s:') . " Se actualizaron las existencias de {$articulo->descripcion}.\r\n"));
			fclose($fp);
		}
		$this->output->set_output(json_encode([
			'exito' => true,
			'mensaje' => "Existencias de {$articulo->descripcion} actualizadas con éxito.",
			'HTTP_HOST' => $_SERVER['HTTP_HOST']
		]));
	}

	// Inicia endpoints para variación de precio de artículo por tipo de cliente
	public function get_lista_precios()
	{
		$data = $this->Articulo_tipo_cliente_model->get_articulo_tipo_cliente($_GET);
		$this->output->set_output(json_encode($data));
	}

	public function guardar_articulo_tipo_cliente($id = "")
	{
		$atc = new Articulo_tipo_cliente_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$fltr = [
				'articulo' => $req['articulo'],
				'tipo_cliente' => $req['tipo_cliente']
			];

			if (!empty($id)) {
				$fltr['articulo_tipo_cliente <>'] = $id;
			}

			$existe = $this->Articulo_tipo_cliente_model->buscar($fltr);
			if (!$existe) {

				$datos['exito'] = $atc->guardar($req);

				if ($datos['exito']) {
					$datos['mensaje'] = "Datos actualizados con éxito.";
					$datos['articulo_tipo_cliente'] = $atc;
				} else {
					$datos['mensaje'] = $atc->getMensaje();
				}
			} else {
				$datos['mensaje'] = "Ya existe un precio para este tipo de cliente.";
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}

		$this->output->set_output(json_encode($datos));
	}
	// Finaliza endpoints para variación de precio de artículo por tipo de cliente

	public function get_costo()
	{
		$datos = ['exito' => false, 'costo' => (float)0, 'articulo' => 0];
		if (isset($_GET['articulo']) && (int)$_GET['articulo'] > 0) {
			$this->load->model(['Sede_model']);
			$datos['articulo'] = (int)$_GET['articulo'];
			$art = new Articulo_model($_GET['articulo']);
			$costo = $art->getCosto($_GET);
			if ((float)$costo === (float)0) {
				$costo = $art->getCosto();
			}

			$conIva = isset($_GET['_coniva']) && (int)$_GET['_coniva'] === 1;

			$porIva = $conIva ? 0.12 : 0;
			if ($conIva) {
				$sedeArt = $art->get_sede_articulo(['articulo' => $art->getPK()]);
				$sede = new Sede_model($sedeArt->sede);
				$emp = $sede->getEmpresa();
				if ($emp && isset($emp->porcentaje_iva)) {
					$porIva = (float)$emp->porcentaje_iva;
				}
			}

			$datos['costo'] = round((float)$costo * ((float)1 + (float)$porIva), 5);
			$datos['exito'] = true;
			$datos['mensaje'] = 'Costo calculado con éxito.';
		} else {
			$datos['mensaje'] = 'Debe enviar un artículo para calcular el costo.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function recalcular_costos($sede = null)
	{
		if (!$sede) {
			$sede = $this->data->sede;
		}

		set_time_limit(0);
		$datos = ['exito' => true, 'mensaje' => 'Se calcularon los costos con éxito.'];
		$this->Articulo_model->recalcular_costos($sede);
		$this->output->set_output(json_encode($datos));
	}

	private function upload_config($path)
	{
		if (!is_dir($path))
			mkdir($path, 0777, TRUE);
		$config['upload_path'] 		= $path;
		$config['allowed_types'] 	= 'csv|CSV|xlsx|XLSX|xls|XLS';
		$config['max_filename']	 	= '255';
		$config['encrypt_name'] 	= TRUE;
		$config['max_size'] 		= 4096;
		$this->load->library('upload', $config);
	}

	private function procesa_medidas($sheet_data = [])
	{
		$entidad = [];
		foreach ($sheet_data as $row => $col) {
			if ($row != 0) {
				if (!empty(trim($col[0]))) {
					$entidad['descripcion'] = trim($col[0]);
					$result = $this->Umedida_model->buscar(['TRIM(LOWER(descripcion))' => strtolower($entidad['descripcion']), '_uno' => true]);
					if (!$result) {
						$umedida = new Umedida_model();
						$umedida->guardar($entidad);
					}
				}
			}
		}
	}

	private function procesa_presentaciones($sheet_data = [])
	{
		$medidas = $this->Umedida_model->buscar();
		$entidad = [];
		foreach ($sheet_data as $row => $col) {
			if ($row != 0) {
				$medida = null;
				foreach ($medidas as $um) {
					if (strcasecmp(trim($um->descripcion), trim($col[0])) == 0) {
						$medida = $um;
						break;
					}
				}
				if ($medida && !empty(trim($col[1])) && (float)$col[2] !== (float)0) {
					$entidad['medida'] = $medida->medida;
					$entidad['descripcion'] = trim($col[1]);
					$entidad['cantidad'] = (float)$col[2];
					$result = $this->Presentacion_model->buscar(['medida' => $entidad['medida'], 'TRIM(LOWER(descripcion))' => strtolower($entidad['descripcion']), '_uno' => true]);
					if (!$result) {
						$presentacion = new Presentacion_model();
						$presentacion->guardar($entidad);
					}
				}
			}
		}
	}

	private function procesa_categorias($sheet_data = [])
	{
		$sede = $this->data->sede;
		if ($sede) {
			$entidad = ['sede' => (int)$sede];
			foreach ($sheet_data as $row => $col) {
				if ($row != 0) {
					if (!empty(trim($col[0]))) {
						$entidad['descripcion'] = trim($col[0]);
						$result = $this->Categoria_model->buscar(['sede' => $entidad['sede'],'TRIM(LOWER(descripcion))' => strtolower($entidad['descripcion']), '_uno' => true]);
						if (!$result) {
							$categoria = new Categoria_model();
							$categoria->guardar($entidad);
						}
					}
				}
			}
		}
	}

	private function procesa_subcategorias($sheet_data = [])
	{
		$sede = $this->data->sede;
		if ($sede) {
			$this->load->model(['Impresora_model', 'Bodega_model']);
			$impresoraDefecto = $this->Impresora_model->buscar(['sede' => $sede, 'pordefecto' => 1, '_uno' => true]);
			$bodegaDefecto = $this->Bodega_model->buscar(['sede' => $sede, 'pordefecto' => 1, '_uno' => true]);
			$categorias = $this->Categoria_model->buscar(['sede' => $sede]);
			$entidad = [];
			foreach ($sheet_data as $row => $col) {
				if ($row != 0) {
					$categoria = null;
					foreach ($categorias as $cat) {
						if (strcasecmp(trim($cat->descripcion), trim($col[0])) == 0) {
							$categoria = $cat;
							break;
						}
					}
					if ($categoria && !empty(trim($col[1]))) {
						$entidad['categoria'] = $categoria->categoria;
						$entidad['descripcion'] = trim($col[1]);
						$entidad['impresora'] = $impresoraDefecto ? $impresoraDefecto->impresora : null;
						$entidad['bodega'] = $bodegaDefecto ? $bodegaDefecto->bodega : null;
						$result = $this->Cgrupo_model->buscar(['categoria' => $entidad['categoria'], 'TRIM(LOWER(descripcion))' => strtolower($entidad['descripcion']), '_uno' => true]);
						if (!$result) {
							$subcategoria = new Cgrupo_model();
							$subcategoria->guardar($entidad);
						}
					}
				}
			}
		}
	}

	private function procesa_articulos($sheet_data = [])
	{
		$sede = $this->data->sede;
		if ($sede) {
			$cgrupo = new Cgrupo_model();
			$art = new Articulo_model();
			$presentaciones = $this->Presentacion_model->buscar(['debaja' => 0]);
			$subcategorias = $cgrupo->get_simple_list(['sede' => $sede, '_todos' => true, 'debaja' => 0]);
			$entidad = [];
			foreach ($sheet_data as $row => $col) {
				if ($row != 0) {
					$subcategoria = null;
					foreach ($subcategorias as $subcat) {
						if (strcasecmp(trim($subcat->descripcion), trim($col[0])) == 0) {
							$subcategoria = $subcat;
							break;
						}
					}
					$presentacion = null;
					foreach ($presentaciones as $pres) {
						if (strcasecmp(trim($pres->descripcion), trim($col[5])) == 0) {
							$presentacion = $pres;
							break;
						}
					}

					if ($subcategoria && $presentacion && !empty(trim($col[1])) && !empty(trim($col[4]))) {
						$entidad['categoria_grupo'] = $subcategoria->categoria_grupo;
						$entidad['presentacion'] = $presentacion->presentacion;
						$entidad['descripcion'] = trim($col[1]);
						$entidad['precio'] = (float)$col[2];
						$entidad['bien_servicio'] = trim($col[3]);
						$entidad['codigo'] = trim($col[4]);
						$entidad['presentacion_reporte'] = $presentacion->presentacion;
						$entidad['mostrar_pos'] = (int)$col[6];
						$entidad['combo'] = (int)$col[7];
						$entidad['multiple'] = (int)$col[8];
						$entidad['cantidad_minima'] = (float)$col[9];
						$entidad['cantidad_maxima'] = (float)$col[10];
						$entidad['produccion'] = (int)$col[11];
						$entidad['rendimiento'] = (float)$col[12];
						$entidad['esreceta'] = (int)$col[13];
						$entidad['mostrar_inventario'] = (int)$col[14];
						$entidad['stock_minimo'] = (float)$col[15];
						$entidad['stock_maximo'] = (float)$col[16];
						$entidad['esextra'] = (int)$col[17];

						$result = $art->buscar([
							'categoria_grupo' => $entidad['categoria_grupo'],
							'TRIM(LOWER(descripcion))' => strtolower($entidad['descripcion']),
							'TRIM(LOWER(codigo))' => strtolower($entidad['codigo']),
							'_uno' => true
						]);
						if (!$result) {
							$articulo = new Articulo_model();
							$articulo->guardar($entidad);
						}
					}
				}
			}
		}
	}

	private function procesa_recetas($sheet_data = [])
	{
		$sede = (int)$this->data->sede;
		$art = new Articulo_model();
		foreach ($sheet_data as $row => $col) {
			if ($row != 0) {
				$receta = $art->buscarArticulo(['sede' => $sede, 'descripcion' => $col[0], '_tolower' => true]);
				if ($receta) {
					$articulo = $art->buscarArticulo(['sede' => $sede, 'descripcion' => $col[1], '_tolower' => true]);
					if ($articulo) {
						$medida = $this->Umedida_model->buscar(['TRIM(LOWER(descripcion))' => strtolower($col[3]), '_uno' => true]);
						if ($medida) {
							$entidad = [
								'receta' => (int)$receta->articulo,
								'articulo' => (int)$articulo->articulo,
								'cantidad' => (float)$col[2],
								'medida' => (int)$medida->medida,
								'anulado' => (int)$col[4],
								'precio_extra' => (int)$col[5],
								'precio' => (int)$col[6],
							];
							$existente = $this->Receta_model->buscar(['receta' => $entidad['receta'], 'articulo' => $entidad['articulo'], '_uno' => true]);
							$nuevaReceta = null;
							if ($existente) {
								$nuevaReceta = new Receta_model($existente->articulo_detalle);
							} else {
								$nuevaReceta = new Receta_model();
							}
							$nuevaReceta->guardar($entidad);
						}
					}
				}
			}
		}
	}

	public function load_from_file()
	{
		set_time_limit(0);
		ini_set('memory_limit', -1);
		$path = APPPATH . 'documentos/';
		$json = ['exito' => false];
		$this->upload_config($path);
		if (!$this->upload->do_upload('file')) {
			$json['mensaje'] = $this->upload->display_errors();
		} else {
			$file_data = $this->upload->data();
			$file_name = $path . $file_data['file_name'];
			$arr_file = explode('.', $file_name);
			$extension = end($arr_file);
			if ('csv' == $extension) {
				$reader = new \PhpOffice\PhpSpreadsheet\Reader\Csv();
			} else {
				$reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
			}
			try {
				$spreadsheet = $reader->load($file_name);

				$sheet_names = ['MEDIDAS', 'PRESENTACIONES', 'CATEGORIAS', 'SUBCATEGORIAS', 'ARTICULOS', 'RECETAS'];
				$sheet_data = [];
				foreach ($sheet_names as $sheetName) {
					$sheet = $spreadsheet->getSheetByName($sheetName);
					if ($sheet) {
						$sheet_data = $sheet->toArray();
						switch ($sheetName) {
							case $sheet_names[0]:
								$this->procesa_medidas($sheet_data);
								break;
							case $sheet_names[1]:
								$this->procesa_presentaciones($sheet_data);
								break;
							case $sheet_names[2]:
								$this->procesa_categorias($sheet_data);
								break;
							case $sheet_names[3]:
								$this->procesa_subcategorias($sheet_data);
								break;
							case $sheet_names[4]:
								$this->procesa_articulos($sheet_data);
								break;
							case $sheet_names[5]:
								$this->procesa_recetas($sheet_data);
								break;
						}
					}
				}

				if (file_exists($file_name)) {
					unlink($file_name);
				}
				$json['exito'] = true;
				$json['mensaje'] = 'El archivo fue procesado. Por favor revise los cambios.';
			} catch (Exception $e) {
				$json['mensaje'] = $e->getMessage();
			}
		}
		$this->output->set_output(json_encode($json));
	}

	public function simple_search()
	{
		$datos = $this->Articulo_model->buscarArticulo($_GET);
		if ($datos) {
			$datos = ordenar_array_objetos($datos, 'descripcion');
		}
		$this->output->set_content_type("application/json")->set_output(json_encode($datos ? $datos : []));
	}

	private function add_to_bitacora($idRegistro, $comentario)
	{
		$bit = new Bitacora_model();
		$acc = $this->Accion_model->buscar(['descripcion' => 'Modificacion', '_uno' => true]);

		$bit->guardar([
			'accion' => $acc->accion,
			'usuario' => $this->data->idusuario,
			'tabla' => 'articulo',
			'registro' => $idRegistro,
			'comentario' => $comentario
		]);
	}

	public function test_costo_promedio()
	{
		$articulos = [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 43, 44, 45, 46, 48, 51, 54, 57, 58, 67, 68, 69, 72, 77, 82, 86, 116, 213, 214, 221, 222, 223, 224, 240, 246, 248, 255, 256, 258, 260, 261, 262, 268, 269, 270, 272, 275, 276, 277, 278, 280, 281, 284, 285, 286, 287, 293, 294, 295, 296, 298, 299, 300, 301, 304, 306, 307, 308, 309, 327, 328, 330, 331, 332, 334, 335, 336, 338, 348, 349, 350, 351, 352, 353, 354, 356, 357, 358, 359, 362, 366, 367, 368, 369, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 388, 389, 390, 391, 392, 393, 396, 397, 398, 399, 401, 402, 403, 404, 405, 407, 408, 410, 411, 412, 413, 414, 415, 416, 419, 423, 425, 434, 435, 436, 437, 438, 439, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 456, 457, 458, 459, 468, 470, 477, 478, 482, 483, 489, 490, 491, 492, 495, 498, 499, 501, 502, 510, 511, 513, 514, 515, 516, 517, 518, 519, 520, 521, 524, 525, 526, 528, 530, 531, 532, 533, 534, 535, 536, 538, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 562, 563, 564, 567, 569, 570, 571, 572, 573, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 589, 590, 592, 593, 594, 595, 596, 597, 598, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 612, 613, 614, 615, 620, 621, 623, 624, 625, 626, 627, 628, 629, 633, 634, 635, 636, 638, 640, 641, 642, 643, 644, 645, 647, 648, 649, 650, 651, 652, 653, 656, 657, 658, 659, 660, 661, 667, 668, 669, 670, 671, 675, 676, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 695, 696, 697, 698, 699, 700, 702, 704, 706, 711, 717, 719, 720, 729, 866, 867, 869, 870, 872, 875, 876, 877, 878, 892, 900, 901, 909, 912, 913, 914, 915, 916, 917, 918, 919, 920, 4304, 4305, 4323, 4343, 4344, 4349, 4350, 4351, 4352, 4368, 4369, 4370, 4372, 4375, 4376, 4377, 4378, 4379, 4380, 4381, 4386, 4387, 4388, 4390, 11681, 11690, 11692, 11860, 11869, 11993, 12056, 12143, 12204, 12338, 12473, 12526, 12535, 12647, 12674, 12675, 12713, 12758, 12767, 12776, 12785, 12794, 12830, 12839, 15761, 15788, 15813, 15840, 15876, 16621, 16629, 16637, 16649, 17884, 19644, 19953, 19954, 19958, 19965, 20030, 22077, 23887, 25655, 28454, 28931, 31374, 34900, 34908, 40744, 40769, 40899, 40908, 40917, 40926, 40935, 40954, 40975, 41007, 41017, 41047, 41091, 41101, 41111, 41133, 41142, 41191, 41203, 41213, 41258, 41268, 41278, 41279, 41289, 41299, 41314, 41334, 41335, 41354, 41420, 41430, 41460, 41470, 41481, 41491, 41501, 41511, 41521, 41531, 41550
		];

		// $articulos = [1, 12674];
		// $articulos = [1, 7];
		// $articulos = [1];
		// $articulos = [12674];
		// $articulos = [12675];

		$datos = [];
		foreach ($articulos as $articulo) {
			$art = new Articulo_model($articulo);
			$datos[] = [
				'articulo' => $articulo,
				'descripcion' => $art->descripcion,
				// 'costo_promedio' => $art->getCostoPromedio(['bodega' => 1]),
				'costo_promedio' => $art->getCosto(['bodega' => 1, 'metodo_costeo' => 2])
			];			
		}

		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}
}

/* End of file Articulo.php */
/* Location: ./application/admin/controllers/mante/Articulo.php */