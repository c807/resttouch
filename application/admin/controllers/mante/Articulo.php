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
			'Articulo_tipo_cliente_model'
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
					$pre = new Presentacion_model($req['presentacion']);
					$preRep = new Presentacion_model($req['presentacion_reporte']);
					if ($pre->medida == $preRep->medida) {					
						$datos['exito'] = $art->guardar($req);
	
						if ($datos['exito']) {
							$datos['mensaje'] = "Datos Actualizados con Exito";
							$datos['articulo'] = $art;
						} else {
							$datos['mensaje'] = $art->getMensaje();
						}
					} else {
						$datos['mensaje'] = "Las unidades de medida no coinciden";
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
								$datos['mensaje'] = 'Este artículo no aplica para opción múltiple.';
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

		$sede = $this->Catalogo_model->getSede([ 'sede' => $data->sede, '_uno' => true ]);

		$emp = null;
		if ($sede) {
			$emp = $this->Catalogo_model->getEmpresa([
				"empresa" => $sede->empresa,
				"_uno" => true
			]);
			if ($emp) {
				$datos['empresa'] = $emp;
				$datos['nsede'] = $sede->nombre;
			}
		}

		$porIva = 1.0;
		if(isset($_GET['_coniva']) && (int)$_GET['_coniva'] === 1) {			
			$porIva +=  ($emp ? (float)$emp->porcentaje_iva : 0);
		}

		$datos["articulo"]       = $art;
		$datos["articulo_grupo"] = $art->getCategoriaGrupo();
		// $tmpCosto                = $art->_getCosto();
		$tmpCosto                = $art->_getCosto_2();
		$datos["costo"]          = (float)$tmpCosto * $porIva;

		foreach ($art->getReceta() as $row) {
			$rec = new Articulo_model($row->articulo->articulo);
			// $costo = $rec->_getCosto();
			$costo = $rec->_getCosto_2();

			if ((int)$rec->produccion === 1 && (float)$rec->rendimiento !== (float)0) {
				$presR = $rec->getPresentacionReporte();
				$costo = (float)$costo / ((float)$rec->rendimiento * (float)$presR->cantidad);
			}

			$costo *= $porIva;
			$tmpCosto = $costo * $row->cantidad;
			$row->costo = round($tmpCosto, 2);
			$row->articulo->costo = $costo;
			$datos["receta"][] = $row;
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

				foreach ($req["sedes"] as $sede) {
					foreach ($articulos as $row) {
						$art = new Articulo_model($row->articulo);
						if (!empty($art->codigo)) {
							$art->copiar($sede['sede']);
						}
					}

					foreach ($articulos as $row) {
						$art = new Articulo_model($row->articulo);
						if (!empty($art->codigo)) {
							$art->copiarDetalle($sede['sede']);
						}
					}
				}

				$datos["exito"] = true;
				$datos['mensaje'] = "Datos actualizados con exito";
			} else {
				$datos['mensaje'] = "Hacen falta datos obligatorios para poder continuar";
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}

		$this->output
			->set_output(json_encode($datos));
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

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($datos));
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
		$datos->exito = $articulo->guardar($req);
		$datos->mensaje = $datos->exito ? 'Artículo actualizado con éxito.' : $articulo->getMensaje();
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

		if($noHayExistencias) {
			$datos = $articulo->dar_de_baja($this->data->idusuario);
		} else {
			$datos->mensaje = 'Las existencias del artículo no están a cero (0). No se puede dar de baja.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function calcula_existencias() {		
		$inicia = time();
		set_time_limit(0);
		ini_set('memory_limit', '1536M');
		$this->load->model(['Sede_model', 'Bodega_model']);

		$fltrSedes = [];
		if (isset($_GET['sede']) && !empty((int)$_GET['sede'])) { $fltrSedes['sede'] = $_GET['sede']; }
		
		$fltrBodegas = [];
		if (isset($_GET['bodega']) && !empty((int)$_GET['bodega'])) { $fltrBodegas['bodega'] = $_GET['bodega']; }
		
		$fltrArticulo = [];
		$fltrArticulo['_todos'] = true;
		if (isset($_GET['articulo']) && !empty((int)$_GET['articulo'])) { $fltrArticulo['articulo'] = $_GET['articulo']; }
		if (isset($_GET['codigo']) && !empty(trim($_GET['codigo']))) { $fltrArticulo['codigo'] = trim($_GET['codigo']); }
		if (isset($_GET['categoria']) && !empty((int)$_GET['categoria'])) { $fltrArticulo['categoria'] = $_GET['categoria']; }
		if (isset($_GET['categoria_grupo']) && !empty((int)$_GET['categoria_grupo'])) { $fltrArticulo['categoria_grupo'] = $_GET['categoria_grupo']; }		
		
		$sedes = $this->Sede_model->buscar($fltrSedes);
		$errores = [];
		foreach($sedes as $sede) {
			$fltrBodegas['sede'] = $sede->sede;
			$bodegas = $this->Bodega_model->buscar($fltrBodegas);
			if(count($bodegas) > 0) {
				$fltrArticulo['sede'] = $sede->sede;
				$articulos = $this->Articulo_model->buscarArticulo($fltrArticulo);
				foreach($articulos as $articulo) {
					$art = new Articulo_model($articulo->articulo);
					if ((int)$art->getPK() > 0) {
						foreach($bodegas as $bodega) {
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
			fwrite($fp, (date('d/m/Y H:i:s:')." Se actualizaron las existencias de {$articulo->descripcion}.\r\n"));
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
}

/* End of file Articulo.php */
/* Location: ./application/admin/controllers/mante/Articulo.php */