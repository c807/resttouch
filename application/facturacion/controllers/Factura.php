<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Factura extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->add_package_path('application/admin');
		$this->load->add_package_path('application/restaurante');
		$this->load->add_package_path('application/wms');
		$this->load->helper(['api', 'jwt', 'authorization']);
		$this->load->model([
			'Dfactura_model',
			'Usuario_model',
			'Catalogo_model',
			'Cuenta_model',
			'Dcomanda_model',
			'Dcuenta_model',
			'Factura_model',
			'Articulo_model',
			'Comanda_model',
			'Cliente_model',
			'Receta_model',
			'ImpuestoEspecial_model',
			'Razon_anulacion_model',
			'Presentacion_model',
			'Configuracion_model',
			'BodegaArticuloCosto_model',
			'Webhook_model'
		]);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$fac = new Factura_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			if (empty($id) || empty($fac->numero_factura)) {
				$sede = $this->Catalogo_model->getSede(['sede' => $data->sede, '_uno' => true]);
				$clt = new Cliente_model($req['cliente']);

				$req['usuario'] = $data->idusuario;
				$req['certificador_fel'] = $sede->certificador_fel;
				$req['sede'] = $data->sede;
				$req['correo_receptor'] = $clt->correo;

				$datos['exito'] = $fac->guardar($req);

				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['factura'] = $fac;
				} else {
					$datos['mensaje'] = implode('<br>', $fac->getMensaje());
				}
			} else {
				$datos['mensaje'] = 'La factura ya fue firmada por la SAT, no se puede modificar';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}


		$this->output
			->set_output(json_encode($datos));
	}

	public function guardar_detalle($factura, $id = '')
	{
		$fac = new Factura_model($factura);
		$req = json_decode(file_get_contents('php://input'), true);
		$req['descuento'] = (float)0;
		$req['descuento_ext'] = (float)0;
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			if (empty($fac->numero_factura)) {
				$fac->cargarEmpresa();
				$pimpuesto = $fac->empresa->porcentaje_iva + 1;
				$art = new Articulo_model($req['articulo']);
				$req['precio_unitario_ext'] = $req['precio_unitario'];
				$req['total_ext'] = $req['total'];

				if ($fac->exenta) {
					$req['monto_base'] = $req['total'];
					$req['monto_base_ext'] = $req['total_ext'];
				} else {
					$req['monto_base'] = $req['total'] / $pimpuesto;
					$req['monto_base_ext'] = $req['total_ext'] / $pimpuesto;
				}

				$impuesto_especial = $art->getImpuestoEspecial();
				if ($impuesto_especial) {
					$req['impuesto_especial'] = $impuesto_especial->impuesto_especial;
					$req['porcentaje_impuesto_especial'] = $impuesto_especial->porcentaje;

					if ((float)$art->cantidad_gravable > 0 && (float)$art->precio_sugerido > 0) {
						$req['cantidad_gravable'] = (float)$art->cantidad_gravable * (float)$req['cantidad'];
						$req['precio_sugerido'] = $art->precio_sugerido;
						$req['precio_sugerido_ext'] = $art->precio_sugerido;
						$req['valor_impuesto_especial'] = $req['cantidad_gravable'] * (float)$art->precio_sugerido * ((float)$impuesto_especial->porcentaje / 100);
						$req['valor_impuesto_especial_ext'] = $req['cantidad_gravable'] * (float)$art->precio_sugerido * ((float)$impuesto_especial->porcentaje / 100);

						$req['precio_unitario'] = (float)$req['cantidad'] !== (float)0 ? ((float)$req['precio_unitario'] - (float)$req['valor_impuesto_especial'] / (float)$req['cantidad']) : 0;
						$req['precio_unitario_ext'] = $req['precio_unitario'];

						$req['total'] = $req['precio_unitario'] * (float)$req['cantidad'];
						$req['total_ext'] = $req['precio_unitario_ext'] * (float)$req['cantidad'];

						$req['monto_base'] = $req['total'] / $pimpuesto;
						$req['monto_base_ext'] = $req['total_ext'] / $pimpuesto;
					} else {
						// Agregado el 19/09/2023 para extraer del monto el impuesto especial de turismo
						$req['total'] = $req['precio_unitario'] * (float)$req['cantidad'];
						$req['total_ext'] = $req['precio_unitario_ext'] * (float)$req['cantidad'];

						$req['monto_base'] = $req['total'] / ($pimpuesto + ((float)$impuesto_especial->porcentaje / 100));
						$req['monto_base_ext'] = $req['total_ext'] / ($pimpuesto + ((float)$impuesto_especial->porcentaje / 100));
						// Fin de lo agregado el 19/09/2023 para extraer del monto el impuesto especial de turismo

						$req['valor_impuesto_especial'] = $req['monto_base'] * ((float)$impuesto_especial->porcentaje / 100);
						$req['valor_impuesto_especial_ext'] = $req['monto_base_ext'] * ((float)$impuesto_especial->porcentaje / 100);

						$req['precio_unitario'] = (float)$req['cantidad'] !== (float)0 ? ((float)$req['precio_unitario'] - (float)$req['valor_impuesto_especial'] / (float)$req['cantidad']) : 0;
						$req['precio_unitario_ext'] = $req['precio_unitario'];

						// $req['total'] = $req['precio_unitario'] * (float)$req['cantidad'];
						// $req['total_ext'] = $req['precio_unitario_ext'] * (float)$req['cantidad'];

						$req['total'] -= $req['valor_impuesto_especial'];
						$req['total_ext'] -= $req['valor_impuesto_especial_ext'];
					}
				}

				$req['presentacion'] = $art->presentacion;
				$req['monto_iva'] = $req['total'] - $req['monto_base'];
				$req['monto_iva_ext'] = $req['total_ext'] - $req['monto_base_ext'];
				$req['bien_servicio'] = $art->bien_servicio;
				$req['bodega'] = $art->getCategoriaGrupo()->bodega;

				// if ((int)$art->mostrar_inventario === 1) {
				// 	$bac = new BodegaArticuloCosto_model();
				// 	$pu = $bac->get_costo($req['bodega'], $art->articulo, $req['presentacion']);
				// 	$req['costo_unitario'] = (float)$pu ?? (float)0;
				// 	$req['costo_total'] = $req['costo_unitario'] * (float)$req['cantidad_inventario'];
				// }

				$det = $fac->setDetalle($req, $id);

				if ($det) {
					$datos['exito'] = true;
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['detalle'] = $det;
				} else {
					$datos['mensaje'] = implode('<br>', $fac->getMensaje());
				}
			} else {
				$datos['mensaje'] = 'La factura ya fue firmada por la SAT, no se puede modificar';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar_factura()
	{
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$_GET['sede'] = $data->sede;

		// $facturas = $this->Factura_model->buscar($_GET);
		$facturas = $this->Factura_model->filtrar_facturas($_GET);
		$datos = [];
		if (is_array($facturas)) {
			foreach ($facturas as $row) {
				$tmp = new Factura_model($row->factura);
				$tmp->cargarReceptor();
				$tmp->cargarMoneda();
				$tmp->cargarCertificadorFel();
				$row->cliente = $tmp->receptor;
				$row->factura_serie = $this->Catalogo_model->getFacturaSerie(['factura_serie' => $tmp->factura_serie, '_uno' => true]);
				$row->certificador_fel = $tmp->certificador_fel;
				$row->moneda = $tmp->moneda;
				$row->usuario = $this->Usuario_model->find([
					'usuario' => $tmp->usuario, '_uno' => true
				]);
				$row->comanda = $tmp->getComanda(false);
				$row->orden = $tmp->getNoOrden();
				$datos[] = $row;
			}
		} else if ($facturas) {
			$tmp = new Factura_model($facturas->factura);
			$tmp->cargarReceptor();
			$tmp->cargarMoneda();
			$tmp->cargarCertificadorFel();
			$facturas->cliente = $tmp->receptor;
			$facturas->factura_serie = $this->Catalogo_model->getFacturaSerie(['factura_serie' => $tmp->factura_serie, '_uno' => true]);
			$facturas->certificador_fel = $tmp->certificador_fel;
			$facturas->moneda = $tmp->moneda;
			$facturas->usuario = $this->Usuario_model->find([
				'usuario' => $tmp->usuario, '_uno' => true
			]);
			$facturas->comanda = $tmp->getComanda(false);
			$facturas->orden = $tmp->getNoOrden();
			$datos[] = $facturas;
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function buscar_detalle($factura)
	{
		$fac = new Factura_model($factura);
		$this->output->set_content_type('application/json')->set_output(json_encode($fac->getDetalle($_GET)));
	}

	public function facturar($factura)
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$fac = new Factura_model($factura);

			if (empty($fac->numero_factura)) {
				// $facturaRedondeaMontos = $this->Configuracion_model->buscar(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
				$facturaRedondeaMontos = $this->Configuracion_model->buscar_configuraciones(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
				$fac->cargarFacturaSerie();
				$fac->cargarEmpresa();
				$fac->cargarMoneda();
				$fac->cargarReceptor();
				$fac->cargarSede();
				$fac->cargarCertificadorFel();
				$fac->procesar_factura($facturaRedondeaMontos && (int)$facturaRedondeaMontos->valor === 0 ? false : true);

				$cer = $fac->getCertificador();

				$funcion = $cer->metodo_factura;
				$resp = $fac->$funcion();
				$fac->setBitacoraFel(['resultado' => json_encode($resp)]);

				if (!empty($fac->numero_factura)) {
					$fac->actualiza_costo_existencia();
					$fac->certificador_fel = $cer;
					$fac->detalle = $fac->getDetalle();
					$fac->fecha_autorizacion = isset($resp->fecha) ? $resp->fecha : (isset($resp->Fecha_DTE) ? $resp->Fecha_DTE : $fac->fecha_factura);

					$comanda = $fac->getComanda();
					$fac->origen_datos = ($comanda) ? $comanda->getOrigenDatos() : null;

					$laDireccion = $fac->empresa->direccion;

					if (!empty($fac->sedeFactura->direccion)) {
						$laDireccion = trim($fac->sedeFactura->direccion);
						if (!empty($fac->sedeFactura->municipio)) {
							$laDireccion .= ', ' . trim($fac->sedeFactura->municipio);
						}
						if (!empty($fac->sedeFactura->departamento)) {
							$laDireccion .= ', ' . trim($fac->sedeFactura->departamento);
						}
					}

					$fac->empresa->direccion = $laDireccion;
					$fac->datos_comanda = $fac->get_datos_comanda();

					if (!empty($fac->documento_receptor) && !is_null($fac->documento_receptor)) {
						$fac->receptor->nit = $fac->documento_receptor;
					}
					$datos['exito'] = true;
					$datos['factura'] = $fac;
					$datos['mensaje'] = 'Datos actualizados con éxito.';
				} else {
					$datos['mensaje'] = implode('. ', $fac->getMensaje());
				}
			} else {
				$datos['mensaje'] = 'Ya cuenta con factura.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($datos));
	}

	public function get_grafo_factura($factura)
	{
		$datos = ['exito' => false, 'mensaje' => 'No se pudo recuperar la factura.'];
		$fac = new Factura_model($factura);
		//var_dump($fac);
		if (!empty($fac->numero_factura)) {
			$fac->cargarEmpresa();
			$fac->cargarCertificadorFel();
			$cer = $fac->getCertificador();
			$funcion = $cer->metodo_grafo;
			$resp = $fac->$funcion();
			if ($resp['tipo'] && $resp['documento']) {
				$datos['exito'] = true;
				$datos['mensaje'] = 'Documento recuperado con éxito.';
				$datos['tipo'] = $resp['tipo'];
				$datos['documento'] = $resp['documento'];
			}
		} else {
			$datos['mensaje'] = 'Factura sin firmar.';
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function refacturar($factura)
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$fac = new Factura_model($factura);
			$req = json_decode(file_get_contents('php://input'), true);
			if (!empty($fac->fel_uuid_anulacion)) {
				$refac = new Factura_model();
				$headers = $this->input->request_headers();
				$data = AUTHORIZATION::validateToken($headers['Authorization']);

				$sede = $this->Catalogo_model->getSede(['sede' => $data->sede, '_uno' => true]);
				$clt = new Cliente_model($req['cliente']);

				$req['usuario'] = $data->idusuario;
				$req['certificador_fel'] = $sede->certificador_fel;
				$req['sede'] = $data->sede;
				$req['correo_receptor'] = $clt->correo;
				unset($req['factura']);
				if ($refac->guardar($req)) {
					$fac->copiarDetalle($refac->getPK());
					$datos = facturar($refac);
					$this->rebaja_inventario_refacturacion($refac);
				} else {
					$datos['mensaje'] = 'Ocurrió un error al guardar la factura';
				}
			} else {
				$datos['mensaje'] = 'La factura debe estar anulada';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($datos));
	}

	public function anular($factura)
	{
		$datos = ['exito' => false];
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);

		if ($this->input->method() == 'post') {
			$fac = new Factura_model($factura);
			$req = json_decode(file_get_contents('php://input'), true);

			$usu = new Usuario_model($data->idusuario);
			if (empty($fac->fel_uuid_anulacion)) {
				if (verDato($req, 'razon_anulacion')) {
					$motivo = new Razon_anulacion_model($req['razon_anulacion']);
					$fac->cargarFacturaSerie();
					$fac->cargarMoneda();
					$fac->cargarReceptor();
					$fac->cargarSede();
					$fac->cargarEmpresa();
					$fac->cargarCertificadorFel();
					$cer = $fac->getCertificador();
					$funcion = $cer->metodo_anulacion;

					if (!in_array($funcion, ['anularInfilePan', 'enviarGuatefacAnula', 'anularInfileSv'])) {
						$fac->procesarAnulacion($_POST);
					}

					$resp = $fac->$funcion($motivo->descripcion);

					$fac->setBitacoraFel(['resultado' => json_encode($resp)]);
					if (!empty($fac->fel_uuid_anulacion)) {

						$fac->guardar($req);
						$this->reversa_articulo_sellado($fac);
						$bit = new Bitacora_model();
						$acc = $this->Accion_model->buscar([
							'descripcion' => 'Modificacion',
							'_uno' => true
						]);

						$comentario = "Anulación: El usuario {$usu->nombres} {$usu->apellidos} anuló la factura {$fac->numero_factura} Serie {$fac->serie_factura} Motivo: {$motivo->descripcion}";

						$bit->guardar([
							'accion' => $acc->accion,
							'usuario' => $data->idusuario,
							'tabla' => 'factura',
							'registro' => $fac->getPK(),
							'comentario' => $comentario
						]);

						$webhook = $this->Webhook_model->buscar_webhook([
							'evento' => 'RTEV_FIRMA_FACTURA',
							'_uno' => true
						]);

						if ($webhook) {
							$this->load->library('Webhook');
							if (strtolower(trim($webhook->tipo_llamada)) == 'soap') {
								$req = $fac->getXmlWebhook();
							} else if (strtolower(trim($webhook->tipo_llamada)) == 'json') {
								$this->load->helper('api');
								$req = $fac->getXmlWebhook(true);
							}

							$web = new Webhook($webhook);
							$web->setRequest($req);
							$web->setEvento();
						}

						$datos['exito'] = true;
						$datos['factura'] = $fac;
						$datos['mensaje'] = 'Datos actualizados con éxito.';
						$datos['anulacion'] = (object)[
							'cliente' => $this->Cliente_model->buscar(['cliente' => $fac->cliente, '_uno' => true]),
							'comentario' => $comentario,
							'fecha' => date('d/m/Y H:i:s')
						];
					} else {
						$datos['mensaje'] = implode('. ', $fac->getMensaje());
					}
				} else {
					$datos['mensaje'] = 'Debe seleccionar un motivo de anulación';
				}
			} else {
				$datos['mensaje'] = 'Documento ya se encuentra anulado.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function imprimir($factura)
	{
		$datos = [];
		$fac = new Factura_model($factura);
		$fac->cargarFacturaSerie();
		$fac->cargarEmpresa();
		$fac->cargarSede();
		$fac->cargarMoneda();
		$fac->cargarReceptor();
		$fac->cargarCertificadorFel();
		$fac->serie->xmldte = '';
		$fac->serie->xmldte_anulacion = '';
		$fac->detalle = $fac->getDetalle(['_imprimir' => true]);
		$fac->certificador_fel = $fac->getCertificador();
		$fac->impuestos_adicionales = $fac->getDetalleImpuestos();

		$resp = $fac->getFelRespuesta();

		if ($resp) {
			$fac->fecha_autorizacion = isset($resp->fecha) ? $resp->fecha : (isset($resp->Fecha_DTE) ? $resp->Fecha_DTE : $resp->FechaHoraCertificacion);
		} else {
			$fac->fecha_autorizacion = '';
		}

		$comanda = $fac->getComanda();

		$fac->origen_datos = ($comanda) ? $comanda->getOrigenDatos() : null;

		$laDireccion = $fac->empresa->direccion;

		if (!empty($fac->sedeFactura->direccion)) {
			$laDireccion = trim($fac->sedeFactura->direccion);
			if (!empty($fac->sedeFactura->municipio)) {
				$laDireccion .= ', ' . trim($fac->sedeFactura->municipio);
			}
			if (!empty($fac->sedeFactura->departamento)) {
				$laDireccion .= ', ' . trim($fac->sedeFactura->departamento);
			}
		}

		$fac->empresa->direccion = $laDireccion;
		$fac->datos_comanda = $fac->get_datos_comanda();

		if (!empty($fac->documento_receptor) && !is_null($fac->documento_receptor)) {
			$fac->receptor->nit = $fac->documento_receptor;
		}

		$datos['factura'] = $fac;
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function xml($factura)
	{
		// $facturaRedondeaMontos = $this->Configuracion_model->buscar(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
		$facturaRedondeaMontos = $this->Configuracion_model->buscar_configuraciones(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
		$this->output->set_content_type('application/xml', 'UTF-8');

		$fac = new Factura_model($factura);
		$fac->cargarFacturaSerie();
		$fac->cargarEmpresa();
		$fac->cargarMoneda();
		$fac->cargarReceptor();
		$fac->cargarSede();
		$fac->cargarCertificadorFel();
		$fac->procesar_factura($facturaRedondeaMontos && (int)$facturaRedondeaMontos->valor === 0 ? false : true);

		echo $fac->getXml();
	}

	public function fix_facturas_id_duplicado()
	{
		set_time_limit(0);
		$datos = ['exito' => false];
		$headers = $this->input->request_headers();
		$tokenData = AUTHORIZATION::validateToken($headers['Authorization']);

		$errores = [];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			if (isset($req['lista']) && !empty($req['lista'])) {
				$lista = explode(',', $req['lista']);
				$campos = $this->Factura_model->getCampos(true, '', 'factura');
				// $facturaRedondeaMontos = $this->Configuracion_model->buscar(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
				$facturaRedondeaMontos = $this->Configuracion_model->buscar_configuraciones(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
				foreach ($lista as $idFactura) {
					$headerOrigen = new Factura_model($idFactura);
					if (!is_null($headerOrigen->fel_uuid) && is_null($headerOrigen->fel_uuid_anulacion)) {
						$headerDestino = new Factura_model();
						foreach ($campos as $campo) {
							$headerDestino->{$campo->campo} = $headerOrigen->{$campo->campo};
						}

						$headerDestino->factura = null;
						if (dias_transcurridos($headerDestino->fecha_factura) > 5) {
							$headerDestino->fecha_factura = date('Y-m-d', strtotime(' - 5 days'));
						}
						$headerDestino->serie_factura = null;
						$headerDestino->numero_factura = null;
						$headerDestino->fel_uuid = null;
						$exito = $headerDestino->guardar();
						if ($exito) {
							$headerOrigen->copiarDetalle($headerDestino->getPK());
							try {
								$resp = facturar($headerDestino, $facturaRedondeaMontos && (int)$facturaRedondeaMontos->valor === 0 ? false : true);
							} catch (Exception $e) {
								$resp = [
									'exito' => false,
									'mensaje' => $e->getMessage()
								];
							}
							if (!$resp['exito']) {
								$errores[] = "{$resp['mensaje']}. Origen: {$headerOrigen->factura}. Destino: {$headerDestino->factura}.";
							} else {
								$headerOrigen->fel_uuid_anulacion = '*** ANULACIÓN INTERNA ***';
								$headerOrigen->comentario_anulacion = 'Por corrección en la firma del DTE.';
								$headerOrigen->razon_anulacion = isset($req['razon_anulacion']) && (int)$req['razon_anulacion'] > 0 ? (int)$req['razon_anulacion'] : null;
								$headerOrigen->guardar();

								$bit = new Bitacora_model();
								$acc = $this->Accion_model->buscar([
									'descripcion' => 'Modificacion',
									'_uno' => true
								]);

								$comentario = "Anulación interna de la factura {$headerOrigen->numero_factura} Serie {$headerOrigen->serie_factura} Motivo: {$headerOrigen->comentario_anulacion}";

								$bit->guardar([
									'accion' => $acc->accion,
									'usuario' => $tokenData->idusuario,
									'tabla' => 'factura',
									'registro' => $headerOrigen->getPK(),
									'comentario' => $comentario
								]);
							}
						} else {
							$fail = $headerDestino->getMensaje();
							$errores[] = implode('. ', $fail);
						}
						sleep(10);
					} else {
						$errores[] = "La factura {$idFactura} no está firmada o ya está anulada.";
					}
				}
				if (count($errores) > 0) {
					$datos['mensaje'] = implode('. ', $errores);
				} else {
					$datos['exito'] = true;
					$datos['mensaje'] = 'Se corrigieron las facturas solicitadas.';
				}
			} else {
				$datos['mensaje'] = 'Favor enviar una lista separada por coma de los ids de las facturas a corregir.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function firmar_dte_batch()
	{
		set_time_limit(0);
		$datos = ['exito' => false];
		$errores = [];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			if (isset($req['lista']) && !empty($req['lista'])) {
				// $facturaRedondeaMontos = $this->Configuracion_model->buscar(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
				$facturaRedondeaMontos = $this->Configuracion_model->buscar_configuraciones(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);
				$lista = explode(',', $req['lista']);
				foreach ($lista as $idFactura) {
					$fact = new Factura_model($idFactura);
					if (empty($fact->fel_uuid) && empty($fact->fel_uuid_anulacion)) {
						try {
							$resp = facturar($fact, $facturaRedondeaMontos && (int)$facturaRedondeaMontos->valor === 0 ? false : true);
						} catch (Exception $e) {
							$resp = [
								'exito' => false,
								'mensaje' => $e->getMessage()
							];
						}
						if (!$resp['exito']) {
							$errores[] = "{$resp['mensaje']}. Factura: {$fact->factura}";
						}
						sleep(15);
					} else {
						$errores[] = "La factura {$idFactura} ya está firmada o ya está anulada.";
					}
				}

				if (count($errores) > 0) {
					$datos['mensaje'] = implode('. ', $errores);
				} else {
					$datos['exito'] = true;
					$datos['mensaje'] = 'Se firmaron las facturas solicitadas.';
				}
			} else {
				$datos['mensaje'] = 'Favor enviar una lista separada por coma de los ids de las facturas a firmar.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function get_resultado_factura($xid)
	{

		$fac   = new Factura_model($xid);
		$tmp   = $fac->getFacturaFel();
		$lista = [];

		if ($tmp && is_array($tmp) && isset($tmp) > 0) {
			foreach ($tmp as $row) {

				$json = json_decode($row->resultado);
				$data = [
					'fecha'       => formatoFecha($row->fecha, 1),
					'descripcion' => 'N/A',
					'resultado'   => $json
				];

				if (verPropiedad($json, 'descripcion')) {
					$data['descripcion'] = $json->descripcion;
				}

				$lista[] = $data;
			}
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($lista));
	}

	public function test_guatefacturas($idfactura)
	{
		$this->load->library('Guatefacturas');
		$fac = new Factura_model($idfactura);
		$fac->cargarFacturaSerie();
		$fac->cargarEmpresa();
		$fac->cargarMoneda();
		$fac->cargarReceptor();
		$fac->cargarSede();
		$fac->cargarCertificadorFel();
		$fac->procesar_factura(false);

		$guatefacturas = new Guatefacturas();
		$guatefacturas->generaXML($fac);
		$respuesta = $guatefacturas->getXml();
		// $respuesta = $guatefacturas->enviar();

		// if (isset($respuesta['serie_factura']) && isset($respuesta['numero_factura']) && isset($respuesta['fel_uuid']) && isset($respuesta['factura'])) {
		// 	$fac->serie_factura = $respuesta['serie_factura'];
		// 	$fac->numero_factura = $respuesta['numero_factura'];
		// 	$fac->fel_uuid = $respuesta['fel_uuid'];
		// 	$respuesta['exito'] = $fac->guardar();
		// 	if ($respuesta['exito']) {
		// 		$respuesta['mensaje'] = 'Factura firmada con éxito.';
		// 	} else {
		// 		$respuesta['mensaje'] = implode('; ', $fac->getMensaje());
		// 	}
		// } else {
		// 	$respuesta['exito'] = false;			
		// 	if (isset($respuesta['errores'])) {
		// 		$respuesta['mensaje'] = $respuesta['errores'];
		// 		unset($respuesta['errores']);
		// 	} else {
		// 		$respuesta['mensaje'] = 'No se pudo firmar la factura.';				
		// 	}
		// }

		// $this->output->set_content_type('application/json')->set_output(json_encode($respuesta));
		$this->output->set_content_type('text/xml')->set_output($respuesta);
	}

	private function reversa_articulo_sellado($factura)
	{
		$detalle = $factura->get_detalle_anulacion();
		foreach ($detalle as $det) {
			$noLoReverse = true;
			$articulo = new Articulo_model($det->articulo);
			// if ((int)$articulo->essellado === 1) { }
			if ((int)$det->detalle_factura > 0) {
				$df = new Dfactura_model($det->detalle_factura);
				$df->cantidad_inventario_backup = (float)$df->cantidad_inventario;
				if ((int)$articulo->essellado === 1) {
					$df->cantidad_inventario = 0;
				}
				$df->guardar();
				if ((int)$df->bodega > 0 && (int)$articulo->essellado === 1 && $noLoReverse) {
					// 24/06/2024: Aquí hacer cambio de cálculo de existencias. JA.
					$datos_costo_df = $this->BodegaArticuloCosto_model->get_datos_costo($df->bodega, $df->articulo, true);
					if ($datos_costo_df) {
						$pres = new Presentacion_model($df->presentacion);
						$cantidad_presentacion = (float)$pres->cantidad;
						$existencia_anterior = (float)$datos_costo_df->existencia;
						$cp_unitario_anterior = (float)$datos_costo_df->costo_promedio;
						$costo_total_anterior = $existencia_anterior * $cp_unitario_anterior;
						$existencia_nueva = $existencia_anterior + ((float)$df->cantidad_inventario_backup * $cantidad_presentacion);
						$precio_total = ((float)$df->cantidad_inventario_backup * $cantidad_presentacion) * $cp_unitario_anterior;
						$costo_total_nuevo = $costo_total_anterior + $precio_total;

						$nvaData = [
							'bodega' => (int)$df->bodega,
							'articulo' => (int)$df->articulo,
							'cuc_ingresado' => 0,
							'costo_ultima_compra' => (float)$datos_costo_df->costo_ultima_compra,
							'cp_ingresado' => 0,
							'costo_promedio' => $costo_total_nuevo / $existencia_nueva,
							'existencia_ingresada' => 0,
							'existencia' => $existencia_nueva,
							'fecha' => date('Y-m-d H:i:s')
						];

						$nvoBac = new BodegaArticuloCosto_model();
						if($nvoBac->guardar($nvaData)) {
							$noLoReverse = false;
						}
					}
				}
			}

			if ((int)$det->detalle_comanda > 0) {
				$dc = new Dcomanda_model($det->detalle_comanda);
				$dc->cantidad_inventario_backup = (float)$dc->cantidad_inventario;
				if ((int)$articulo->essellado === 1) {
					$dc->cantidad_inventario = 0;
				}
				$dc->guardar();
				if ((int)$dc->bodega > 0 && (int)$articulo->essellado === 1 && $noLoReverse) {
					// 24/06/2024: Aquí hacer cambio de cálculo de existencias. JA.
					$datos_costo_dc = $this->BodegaArticuloCosto_model->get_datos_costo($dc->bodega, $dc->articulo, true);
					if ($datos_costo_dc) {
						$pres = new Presentacion_model($dc->presentacion);
						$cantidad_presentacion = (float)$pres->cantidad;
						$existencia_anterior = (float)$datos_costo_dc->existencia;
						$cp_unitario_anterior = (float)$datos_costo_dc->costo_promedio;
						$costo_total_anterior = $existencia_anterior * $cp_unitario_anterior;
						$existencia_nueva = $existencia_anterior + ((float)$dc->cantidad_inventario_backup * $cantidad_presentacion);
						$precio_total = ((float)$dc->cantidad_inventario_backup * $cantidad_presentacion) * $cp_unitario_anterior;
						$costo_total_nuevo = $costo_total_anterior + $precio_total;

						$nvaData = [
							'bodega' => (int)$dc->bodega,
							'articulo' => (int)$dc->articulo,
							'cuc_ingresado' => 0,
							'costo_ultima_compra' => (float)$datos_costo_dc->costo_ultima_compra,
							'cp_ingresado' => 0,
							'costo_promedio' => $costo_total_nuevo / $existencia_nueva,
							'existencia_ingresada' => 0,
							'existencia' => $existencia_nueva,
							'fecha' => date('Y-m-d H:i:s')
						];

						$nvoBac = new BodegaArticuloCosto_model();
						if($nvoBac->guardar($nvaData)) {
							$noLoReverse = false;
						}
					}
				}
			}
		}
	}

	public function test_detalle_anulacion($idfactura)
	{
		$factura = new Factura_model($idfactura);
		$detalle = $factura->get_detalle_anulacion();

		$this->output->set_content_type('application/json')->set_output(json_encode($detalle));
	}

	private function rebaja_inventario_refacturacion($factura)
	{
		$detalle = $factura->get_detalle_anulacion();
		foreach ($detalle as $det) {
			$sinDescargar = true;
			// $articulo = new Articulo_model($det->articulo);
			// if ((int)$articulo->essellado === 1) {} // Se quita esta validación para que saque sea sellado o no en la refacturación. 20/02/2024 19:40.
			if ((int)$det->detalle_factura > 0) {
				$df = new Dfactura_model($det->detalle_factura);
				$df->cantidad_inventario = !is_null($df->cantidad_inventario_backup) ? $df->cantidad_inventario_backup : 0;
				$df->cantidad_inventario_backup = null;
				$df->guardar();
				if ((int)$df->bodega > 0 && $sinDescargar) {
					$datos_costo_df = $this->BodegaArticuloCosto_model->get_datos_costo($df->bodega, $df->articulo);
					if ($datos_costo_df) {
						$pres = new Presentacion_model($df->presentacion);
						$nvaData = [
							'bodega' => (int)$df->bodega,
							'articulo' => (int)$df->articulo,
							'cuc_ingresado' => 0,
							'costo_ultima_compra' => (float)$datos_costo_df->costo_ultima_compra,
							'cp_ingresado' => 0,
							'costo_promedio' => (float)$datos_costo_df->costo_promedio,
							'existencia_ingresada' => 0,
							'existencia' => (float)$datos_costo_df->existencia,
							'fecha' => date('Y-m-d H:i:s')
						];

						$nvoBac = new BodegaArticuloCosto_model();
						if($nvoBac->guardar($nvaData)) {
							$sinDescargar = false;
						}
					}
				}
			}

			if ((int)$det->detalle_comanda > 0) {
				$dc = new Dcomanda_model($det->detalle_comanda);
				$dc->cantidad_inventario = !is_null($dc->cantidad_inventario_backup) ? $dc->cantidad_inventario_backup : 0;
				$dc->cantidad_inventario_backup = null;
				$dc->guardar();
				if ((int)$dc->bodega > 0 && $sinDescargar) {
					$datos_costo_dc = $this->BodegaArticuloCosto_model->get_datos_costo($dc->bodega, $dc->articulo);
					if ($datos_costo_dc) {
						$pres = new Presentacion_model($dc->presentacion);
						$nvaData = [
							'bodega' => (int)$dc->bodega,
							'articulo' => (int)$dc->articulo,
							'cuc_ingresado' => 0,
							'costo_ultima_compra' => (float)$datos_costo_dc->costo_ultima_compra,
							'cp_ingresado' => 0,
							'costo_promedio' => (float)$datos_costo_dc->costo_promedio,
							'existencia_ingresada' => 0,
							'existencia' => (float)$datos_costo_dc->existencia,
							'fecha' => date('Y-m-d H:i:s')
						];

						$nvoBac = new BodegaArticuloCosto_model();
						if($nvoBac->guardar($nvaData)) {
							$sinDescargar = false;
						}
					}
				}
			}
		}
	}
}

/* End of file Factura.php */
/* Location: ./application/facturacion/controllers/Factura.php */