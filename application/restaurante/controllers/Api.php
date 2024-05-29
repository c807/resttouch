<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Api extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->add_package_path('application/facturacion');
		$this->load->model([
			'Configuracion_model',
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
			'Dfactura_model',
			'Cliente_model',
			'Receta_model',
			'Sede_model',
			'Sede_vendor_tercero_model',
			'Vendor_tercero_model',
		]);

		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function set_comanda()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$obj = json_decode(file_get_contents('php://input'));
		$datos = ['exito' => false, 'mensaje' => ''];

		if (isset($_GET['key'])) {
			if ($this->input->method() == 'post') {

				$datosDb = $this->Catalogo_model->getCredenciales([
					'llave' => $_GET['key']
				]);
				$conn = [
					'host' => $datosDb->db_hostname,
					'user' => $datosDb->db_username,
					'password' => $datosDb->db_password,
					'database' => $datosDb->db_database
				];
				$db = conexion_db($conn);
				$this->db = $this->load->database($db, true);

				// $config = $this->Configuracion_model->buscar();
				$config = $this->Configuracion_model->buscar_configuraciones();

				$paso = true;
				$mustCheckFinancialStatus = get_configuracion($config, 'RT_SHOPIFY_CHECK_FINANCIAL_STATUS', 3);
				$aplicaDescuentosAEnvio = (int)get_configuracion($config, 'RT_SHOPIFY_APLICA_DESCUENTO_A_ENVIO', 3) === 1;

				if ((int)$mustCheckFinancialStatus === 1) {
					if (isset($req['financial_status']) && strtolower(trim($req['financial_status'])) === 'paid') {
						$paso = true;
					} else {
						$paso = false;
					}
				}

				if ($paso) {
					$sede = $this->Catalogo_model->getSedeForAPI([
						'admin_llave' => $_GET['key'],
						'_uno' => true
					]);

					$datosCliente = false;
					$idCliente = false;

					$rutas = get_configuracion($config, 'RT_CAMPO_NIT', 2);
					if ($rutas) {
						foreach (explode('|', $rutas) as $row) {
							$dato = buscar_propiedad($obj, $row);
							if ($dato) {
								break;
							}
						}
					}

					if (isset($req['billing_address'])) {
						$datosCliente = $req['billing_address'];
					} else if ($req['source_name'] == 'pos') {
						$datosCliente = $req['customer']['default_address'];
					}

					if ($datosCliente) {

						if ($rutas) {
							if ($dato) {
								$nit = $dato;
							} else {
								$nit = 'CF';
							}
						} else {
							// if (validar_nit($datosCliente['zip'])) {
							// 	$nit = $datosCliente['zip']; //Para cambios.	
							// } else {
							// 	$nit = 'CF';
							// }
							$nit = 'CF';
						}

						$nit = strtoupper(preg_replace('/[^0-9Kk?!]/', '', $nit));

						if (empty($nit)) {
							$nit = 'CF';
						}

						$cliente = $this->Cliente_model->buscar([
							'nit' => $nit,
							'_uno' => true
						]);

						$origen = $this->Catalogo_model->getComandaOrigen([
							'_uno' => true,
							'descripcion' => 'Shopify'
						]);

						$clt = new Cliente_model();
						$guardar = [
							'direccion' => $datosCliente['address1'],
							'correo' => $req['email']
						];
						if (!$cliente) {
							$guardar['nombre'] = $datosCliente['name'];
							$guardar['nit'] = $nit;
						} else {
							$clt->cargar($cliente->cliente);
						}

						if (strtolower(trim($clt->nit)) != 'cf' || get_configuracion($config, 'RT_ACTUALIZA_CORREO_CF', 3)) {
							$clt->guardar($guardar);
						}
						$idCliente = $clt->getPK();
					}

					$cuenta = ['nombre' => 'Unica'];
					if (isset($req['shipping_address'])) {
						$cuenta['nombre'] = $req['shipping_address']['name'];
					} else if (isset($req['customer'])) {
						$cuenta['nombre'] = "{$req['customer']['first_name']} {$req['customer']['last_name']}";
					}

					$datosCta = ['nombre' => $cuenta['nombre'], 'numero' => $req['order_number']];
					$usu = $this->Usuario_model->find([
						'usuario' => 1,
						'_uno' => true
					]);
					if ($sede) {
						if ($origen) {
							if ($usu) {

								$datosFac = [
									'usuario' => 1,
									'factura_serie' => 1,
									'sede' => $sede->sede,
									'certificador_fel' => $sede->certificador_fel,
									'cliente' => $idCliente,
									'fecha_factura' => date('Y-m-d'),
									'moneda' => 1,
									'correo_receptor' => $req['email']
								];

								$turno = $this->Turno_model->getTurno([
									'sede' => $sede->sede,
									'abierto' => true,
									'_uno' => true
								]);
								$comanda = new Comanda_model();
								$datosComanda = [
									'usuario' => $usu->usuario,
									'sede' => $sede->sede,
									'estatus' => 1,
									'domicilio' => 1,
									'comanda_origen' => $origen->comanda_origen,
									'comanda_origen_datos' => json_encode($req),
									'notas_generales' => isset($req['note']) && !empty(trim($req['note'])) ? trim($req['note']) : null,
									'comensales' => 1
								];

								$propina = false;
								$insert = false;
								$propinaMonto = 0;

								$lineItems = $req['line_items'];
								if (get_configuracion($config, 'RT_ORDER_ITEMS_FULLFILLED', 3)) {
									if (is_array($req['fulfillments'])) {
										if (count($req['fulfillments']) > 0) {
											$lineItems = $req['fulfillments'][0]['line_items'];
										}
									}
								}

								foreach ($lineItems as $row) {
									if (strtolower($row['title']) != 'tip') {
										$art = $this->Articulo_model->buscar([
											'shopify_id' => $row['variant_id'],
											'_uno' => true
										]);

										if ($art) {
											$insert = true;
										}
									}
								}
								if ($insert) {
									if ($turno) {
										$datosComanda['turno'] = $turno->turno;
										$datos['exito'] = $comanda->guardar($datosComanda);

										$cuenta = new Cuenta_model();

										if ($cuenta->cerrada == 0) {
											$datosCta['comanda'] = $comanda->comanda;
											$cuenta->guardar($datosCta);
										}
										$total = 0;
										$exito = true;
										$descuentoArticulo = [];
										foreach ($lineItems as $row) {
											$art = $this->Articulo_model->buscar([
												'shopify_id' => $row['variant_id'],
												'_uno' => true
											]);
											if (strtolower($row['title']) != 'tip') {
												if ($art) {
													$shop_money = $row['total_discount_set']['shop_money'];

													// JA: Extraccion de campo 'properties' para las notas. 08/02/2022
													$notas_producto = '';
													if (isset($row['properties']) && is_array($row['properties']) && count($row['properties']) > 0) {
														foreach ($row['properties'] as $property) {
															if ($notas_producto !== '') {
																$notas_producto .= '; ';
															}
															$pos = strpos($property['name'], ':');
															$notas_producto .= trim($property['name']) . ($pos === false ? ': ' : '') . trim($property['value']);
														}
													}
													// JA: Fin de Extraccion de campo 'properties' para las notas. 08/02/2022

													$datosDcomanda = [
														'articulo' => $art->articulo, 'cantidad' => $row['quantity'], 'precio' => $row['price'], 'impreso' => 0, 'total' => $row['price'] * $row['quantity'], 'notas' => $notas_producto
													];
													$total += ($row['price'] * $row['quantity']);
													$det = $comanda->guardarDetalle($datosDcomanda);
													$id = '';
													if ($det) {
														if ((float)$shop_money['amount'] > 0) {
															$descuentoArticulo[] = [
																'detalle' => $det->detalle_comanda,
																'descuento' => (float)$shop_money['amount']
															];
														}
														$cuenta->guardarDetalle([
															'detalle_comanda' => $det->detalle_comanda
														]);
													} else {
														$exito = false;
														$datos['mensaje'] .= implode('\n', $comanda->getMensaje());
													}
												} else {
													$exito = false;
													$datos['mensaje'] .= "\nOcurrio un error al guardar el articulo {$row['title']} Id {$row['variant_id']}";
												}
											} else {
												$propina = true;
												$propinaMonto = $row['price'];
												$cuenta->guardar([
													'propina_monto' => $row['price']
												]);
											}
										}

										if ($propina) {
											$art = $this->Articulo_model->buscar([
												'descripcion' => 'Propina',
												'_uno' => true
											]);
											$datosDcomanda = [
												'articulo' => $art->articulo, 'cantidad' => 1, 'precio' => $propinaMonto, 'impreso' => 0, 'total' => $propinaMonto, 'notas' => ''
											];
											$total += $propinaMonto;
											$det = $comanda->guardarDetalle($datosDcomanda);
											$id = '';
											if ($det) {
												$cuenta->guardarDetalle([
													'detalle_comanda' => $det->detalle_comanda
												]);
											} else {
												$exito = false;
												$datos['mensaje'] .= '\nOcurrio un error al guardar la propina';
											}
										}

										$totalSinEntrega = (float)$total;
										if (isset($req['total_shipping_price_set']) && isset($req['total_shipping_price_set']['shop_money']) && $req['source_name'] != 'pos') {
											$row = $req['total_shipping_price_set']['shop_money'];
											$art = $this->Articulo_model->buscar([
												'descripcion' => 'Entrega',
												'_uno' => true
											]);

											$datosDcomanda = [
												'articulo' => $art->articulo, 'cantidad' => 1, 'precio' => $row['amount'], 'impreso' => 0, 'total' => $row['amount'], 'notas' => ''
											];
											$total += ($row['amount']);
											$det = $comanda->guardarDetalle($datosDcomanda);
											$id = '';
											if ($det) {
												$cuenta->guardarDetalle([
													'detalle_comanda' => $det->detalle_comanda
												]);
												$datos['exito'] = true;
											} else {
												$datos['exito'] = false;
											}
										}

										$datos['exito'] = $exito;
										if ($datos['exito']) {
											$pagos = [];
											$descuento = 0;
											$pdescuento = 0;

											if (count($descuentoArticulo) == 0) {
												if (isset($req['discount_applications']) && is_array($req['discount_applications'])) {
													if($aplicaDescuentosAEnvio) {
														$totalProd = $total - $propinaMonto;
													} else {
														$totalProd = $totalSinEntrega - $propinaMonto;
													}
													if (count($req['discount_applications']) > 0) {
														foreach ($req['discount_applications'] as $descDA) {
															$targetType = isset($descDA['target_type']) ? strtolower($descDA['target_type']) : '';
															if (strtolower($descDA['value_type']) == 'percentage' && $targetType !== 'shipping_line') {
																$descuento += ($totalProd * $descDA['value'] / 100);
																$pdescuento += $descDA['value'];
															}
														}

														//Inicia fix para los descuentos que son por monto fijo. JA 20/08/2020.
														if (isset($req['discount_codes']) && is_array($req['discount_codes'])) {
															foreach ($req['discount_codes'] as $descDC) {
																// $tipos = ['fixed_amount', 'shipping', 'percentage'];
																$tipos = ['fixed_amount', 'shipping'];
																if (in_array(strtolower($descDC['type']), $tipos)) {
																	$descuento += $descDC['amount'];
																	//$pdescuento += $desc['amount'];
																}
															}
														}

														if($aplicaDescuentosAEnvio) {
															$pdescuento = (float)$totalProd !== 0 ? ($descuento / $totalProd) : 0.00;
														} else {
															$pdescuento = (float)$totalSinEntrega !== 0 ? ($descuento / $totalSinEntrega) : 0.00;
														}
														//Fin del fix para los descuentos que son por monto fijo. JA 20/08/2020.
													}
												}
											} else {
												$shop_money = $req['total_discounts_set']['shop_money'];
												$descuento = (float) $shop_money['amount'];
											}

											if ((float) $descuento > 0) {
												$pagos[] = [
													'forma_pago' => 3,
													'monto' => $descuento
												];
											}


											array_push($pagos, [
												'forma_pago' => 1,
												'monto' => $total - $descuento
											]);

											foreach ($pagos as $pago) {
												$exito = $cuenta->cobrar((object) $pago);
											}

											if ($exito) {
												$cuenta->guardar(['cerrada' => 1]);
												if ($idCliente) {
													$fac = new Factura_model();
													$fac->guardar($datosFac);
													$fac->cargarEmpresa();
													$pimpuesto = $fac->empresa->porcentaje_iva + 1;
													foreach ($cuenta->getDetalle() as $det) {
														$det->descuento = (float)0;
														$det->descuento_ext = (float)0;
														$det->bien_servicio = $det->articulo->bien_servicio;
														$det->articulo = $det->articulo->articulo;
														$artTmp = new Articulo_model($det->articulo);
														$det->total_ext = $det->total;

														if (strcasecmp(trim($artTmp->descripcion), 'Entrega') != 0 || (strcasecmp(trim($artTmp->descripcion), 'Entrega') == 0 && $aplicaDescuentosAEnvio)) {
															if (count($descuentoArticulo) == 0) {
																$det->descuento = $det->total * $pdescuento;
																$det->descuento_ext = $det->total_ext * $pdescuento;
															} else {
																$det->descuento = 0;
																foreach ($descuentoArticulo as $desc) {
																	if ($det->detalle_comanda == $desc['detalle']) {
																		$det->descuento += $desc['descuento'];
																		$det->descuento_ext += $desc['descuento'];
																	}
																}
															}
														}

														$det->precio_unitario = $det->precio;
														$det->precio_unitario_ext = $det->precio;
														$total = $det->total - $det->descuento;
														$total_ext = $det->total_ext - $det->descuento_ext;
														if ($fac->exenta) {
															$det->monto_base = $total;
															$det->monto_base_ext = $total_ext;
														} else {
															$det->monto_base = $total / $pimpuesto;
															$det->monto_base_ext = $total_ext / $pimpuesto;
														}

														$impuesto_especial = $artTmp->getImpuestoEspecial();
														$desctEspecial = 0;
														$desctEspecial_ext = 0; // Chapuz para no afectar tanto el código. JA 28/01/2022.
														if ($impuesto_especial) {
															$det->impuesto_especial = $impuesto_especial->impuesto_especial;
															$det->porcentaje_impuesto_especial = $impuesto_especial->porcentaje;

															if ((float)$artTmp->cantidad_gravable > 0 && (float)$artTmp->precio_sugerido > 0) {
																$det->cantidad_gravable = (float)$artTmp->cantidad_gravable * (float)$det->cantidad;
																$det->precio_sugerido = $artTmp->precio_sugerido;
																$det->precio_sugerido_ext = $artTmp->precio_sugerido;
																$det->valor_impuesto_especial = $det->cantidad_gravable * (float)$artTmp->precio_sugerido * ((float)$impuesto_especial->porcentaje / 100);
																$det->valor_impuesto_especial_ext = $det->cantidad_gravable * (float)$artTmp->precio_sugerido * ((float)$impuesto_especial->porcentaje / 100);

																$det->precio_unitario = (float)$det->precio_unitario - ((float)$det->valor_impuesto_especial / (float)$det->cantidad);
																$det->precio_unitario_ext = $det->precio_unitario;

																$det->total = $det->precio_unitario * (float)$det->cantidad;
																$det->total_ext = $det->total;
																$total = $det->total;
																$total_ext = $det->total_ext;

																$desctEspecial = $det->descuento;
																$desctEspecial_ext = $det->descuento_ext;

																$det->monto_base = ($total - $desctEspecial) / $pimpuesto;
																$det->monto_base_ext = ($total_ext - $desctEspecial_ext) / $pimpuesto;
															} else {
																// Agregado el 19/09/2023 para extraer del monto el impuesto especial de turismo
																$det->total = $det->precio_unitario * (float)$det->cantidad;
																$det->total_ext = $det->total;
																$total = $det->total;
																$total_ext = $det->total_ext;

																$desctEspecial = $det->descuento;
																$desctEspecial_ext = $det->descuento_ext;

																$det->monto_base = ($total - $desctEspecial) / ($pimpuesto + ((float)$impuesto_especial->porcentaje / 100));
																$det->monto_base_ext = ($total_ext - $desctEspecial_ext) / ($pimpuesto + ((float)$impuesto_especial->porcentaje / 100));
																// Fin de lo agregado el 19/09/2023 para extraer del monto el impuesto especial de turismo

																$det->valor_impuesto_especial = $det->monto_base * ((float)$impuesto_especial->porcentaje / 100);
																$det->valor_impuesto_especial_ext = $det->monto_base_ext * ((float)$impuesto_especial->porcentaje / 100);

																$det->precio_unitario = (float)$det->precio_unitario - ((float)$det->valor_impuesto_especial / (float)$det->cantidad);
																$det->precio_unitario_ext = $det->precio_unitario;

																$det->total = $det->precio_unitario * (float)$det->cantidad;
																$det->total_ext = $det->precio_unitario_ext * (float)$det->cantidad;

																$total -= $det->valor_impuesto_especial;
																$total_ext -= $det->valor_impuesto_especial_ext;
															}
														}

														$det->monto_iva = ($total - $desctEspecial) - $det->monto_base;
														$det->monto_iva_ext = ($total_ext - $desctEspecial_ext) - $det->monto_base_ext;
														$fac->setDetalle((array) $det);
													}
													if (get_configuracion($config, 'RT_FIRMA_DTE_AUTOMATICA', 3)) {
														$facturaRedondeaMontos = get_configuracion($config, 'RT_FACTURA_REDONDEA_MONTOS', 3);
														$fac->firmar($facturaRedondeaMontos);
														if (!empty($fac->numero_factura)) {
															$fact = new Factura_model($fac->factura);
															$fact->guardar([
																'numero_factura' => $fac->numero_factura,
																'serie_factura' => $fac->serie_factura,
																'fel_uuid' => $fac->fel_uuid
															]);
														}
													}
												} else {
													$datos['exito'] = false;
													$datos['mensaje'] .= '\nHacen falta datos para facturacion';
												}
											}
											$datos['comanda'] = $comanda->getComanda();
										}

										if ($datos['exito']) {
											$datos['mensaje'] = 'Datos actualizados con éxito.';
											$datos['comanda'] = $comanda->getComanda();
											$comanda->envioMail();
										}
									} else {
										$datos['mensaje'] = 'No existe ningun turno abierto';
									}
								} else {
									$datos['mensaje'] = 'No existen productos';
								}
							} else {
								$datos['mensaje'] = 'Mesero Invalido';
							}
						} else {
							$datos['mensaje'] = 'Origen desconocido';
						}
					} else {
						$datos['mensaje'] = 'Llave inválida.';
					}
				} else {
					$datos['mensaje'] = 'La orden no ha sido pagada.';
				}
			} else {
				$datos['mensaje'] = 'Parámetros inválidos.';
			}
		} else {
			$datos['mensaje'] = 'Hacen falta datos obligatorios para continuar.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function guardar_comanda()
	{
		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);

		$req = json_decode(file_get_contents('php://input'), true);

		$datos = ['exito' => false, 'mensaje' => ''];

		if (isset($_GET['key'])) {
			if ($this->input->method() == 'post') {

				$datosDb = $this->Catalogo_model->getCredenciales([
					'llave' => $_GET['key']
				]);
				$conn = [
					'host' => $datosDb->db_hostname,
					'user' => $datosDb->db_username,
					'password' => $datosDb->db_password,
					'database' => $datosDb->db_database
				];
				$db = conexion_db($conn);
				$this->db = $this->load->database($db, true);

				if (isset($req['sede'])) {
					$sede = $this->Catalogo_model->getSede([
						'sede' => $req['sede'],
						'_uno' => true
					]);
				} else {
					$sede = $this->Catalogo_model->getSede([
						'admin_llave' => $_GET['key'],
						'_uno' => true
					]);
				}

				$moneda = $this->Catalogo_model->getMoneda([
					'codigo' => $req['moneda'],
					'_uno' => true
				]);

				$datosCliente = $req['cliente'];

				if ($datosCliente) {
					$nit = preg_replace('/[^0-9?!]/', '', $datosCliente['nit']);

					if (empty($nit)) {
						$nit = strtoupper(preg_replace('/[^A-Za-z?!]/', '', $datosCliente['nit']));
					}

					$datosCliente['nit'] = $nit;

					$cliente = $this->Cliente_model->buscar([
						'nit' => $nit,
						'_uno' => true
					]);

					$origen = $this->Catalogo_model->getComandaOrigen([
						'_uno' => true,
						'descripcion' => 'API'
					]);

					if (!$cliente) {
						$cliente = new Cliente_model();
						$cliente->guardar([
							'nombre' => $datosCliente['nombre'] . ' ' . $datosCliente['apellidos'],
							'direccion' => ($datosCliente['direccion'] ?? 'CIUDAD'),
							'correo' => $datosCliente['correo'],
							'telefono' => $datosCliente['telefono'],
							'nit' => $nit
						]);
						$idCliente = $cliente->getPK();
						$correoReceptor = $datosCliente['correo'];
					} else {
						$idCliente = $cliente->cliente;
						$correoReceptor = $cliente->correo;
					}
				}

				$datosCta = [
					'nombre' => $datosCliente['nombre'],
					'numero' => $req['numero_orden']
				];

				$datosFac = [
					'usuario' => 1,
					'factura_serie' => 1,
					'sede' => $sede->sede,
					'certificador_fel' => 1,
					'cliente' => $idCliente,
					'fecha_factura' => date('Y-m-d'),
					'moneda' => $moneda->moneda,
					'correo_receptor' => $correoReceptor
				];
				$usu = $this->Usuario_model->find([
					'usuario' => 1,
					'_uno' => true
				]);

				if ($sede) {
					if ($origen) {
						if ($usu) {
							$turno = $this->Turno_model->getTurno([
								'sede' => $sede->sede,
								'abierto' => true,
								'_uno' => true
							]);

							$comanda = new Comanda_model();
							$tmpTarjeta = $req['tarjeta'];

							if (isset($req['tarjeta']['codigo_seguridad'])) {
								unset($req['tarjeta']['codigo_seguridad']);
							}

							if (isset($req['tarjeta']['anio'])) {
								unset($req['tarjeta']['anio']);
							}

							if (isset($req['tarjeta']['mes'])) {
								unset($req['tarjeta']['mes']);
							}

							$datosComanda = [
								'usuario' => $usu->usuario,
								'sede' => $sede->sede,
								'estatus' => 1,
								'domicilio' => 1,
								'comanda_origen' => $origen->comanda_origen,
								'comanda_origen_datos' => json_encode($req),
								'comensales' => 1
							];

							$propina = false;
							$insert = false;
							$propinaMonto = 0;
							$menu = $this->Catalogo_model->getModulo([
								'modulo' => 4,
								'_uno' => true
							]);

							$existencia = true;
							foreach ($req['detalle'] as $row) {

								$art = $this->Articulo_model->buscarArticulo([
									'codigo' => $row['codigo'],
									'sede' => $sede->sede,
									'_uno' => true
								]);

								if ($art) {
									$insert = true;
									$articulo = new Articulo_model($art->articulo);
									$articulo->actualizarExistencia();
									if (!empty($menu)) {
										if ($existencia) {
											$existencia = $articulo->existencias >= $row['cantidad'];
										}
									}
								}
							}
							if ($insert) {
								if ($existencia) {
									if ($turno) {
										$datosComanda['turno'] = $turno->turno;
										$datos['exito'] = $comanda->guardar($datosComanda);
										if (isset($req['mesa'])) {
											$mesa = new Mesa_model($req['mesa']);
											$comanda->setMesa($req['mesa']);
											$mesa->guardar(['estatus' => 2]);
										}
										$cuenta = new Cuenta_model();
										if ($cuenta->cerrada == 0) {
											$datosCta['comanda'] = $comanda->comanda;
											$cuenta->guardar($datosCta);
										}

										$total = 0;
										$total_ext = 0;
										$exito = true;
										foreach ($req['detalle'] as $row) {
											$art = $this->Articulo_model->buscarArticulo([
												'codigo' => $row['codigo'],
												'sede' => $sede->sede,
												'_uno' => true
											]);

											if ($art) {
												$datosDcomanda = [
													'articulo' => $art->articulo, 'cantidad' => $row['cantidad'], 'precio' => $row['precio'], 'impreso' => 0, 'total' => $row['total'], 'notas' => ($row['nota'] ?? '')
												];

												$total += $row['total'];
												$total_ext += $row['total'];

												$det = $comanda->guardarDetalle($datosDcomanda);
												$id = '';
												if ($det) {
													$cuenta->guardarDetalle([
														'detalle_comanda' => $det->detalle_comanda
													]);
												} else {
													$exito = false;
													$datos['mensaje'] .= implode('\n', $comanda->getMensaje());
												}
											} else {
												$exito = false;
												$datos['mensaje'] .= '\nArtículo no entrado.';
											}
										}

										$datos['exito'] = $exito;
										if ($datos['exito']) {
											$pagos = [];
											$descuento = 0;
											$descuento_ext = 0;
											if (isset($req['descuento']) && is_array($req['descuento'])) {

												foreach ($req['descuento'] as $desc) {
													$descuento += ($total * $desc['valor'] / 100);
													$descuento_ext += ($total_ext * $desc['valor'] / 100);
												}
												$pagos[] = [
													'forma_pago' => 3,
													'monto' => $descuento
												];
											}

											$tmpCobro = [
												'forma_pago' => $req['metodo_pago']['codigo'],
												'monto' => $total - $descuento
											];

											if (isset($req['transferencia']) && !empty($req['transferencia'])) {
												$tmpCobro['documento'] = $req['transferencia']['documento'];

												if (isset($req['transferencia']['observaciones'])) {
													$tmpCobro['observaciones'] = $req['transferencia']['observaciones'];
												}
											}

											array_push($pagos, $tmpCobro);

											if (isset($tmpTarjeta['numero']) && !empty($tmpTarjeta['numero'])) {
												$this->load->library('Cobro');

												$cobro = new Cobro($cuenta->getEmpresa());
												$cobro->setTarjeta($tmpTarjeta);
												$cobro->setCliente($datosCliente);

												if (isset($req['fingerprint'])) {
													$cobro->setFingerprint($req['fingerprint']);
												}

												$cuenta->setCobro($cobro);
											}

											$pagosContador = 0;

											foreach ($pagos as $pago) {
												if ($cuenta->cobrar((object) $pago)) {
													$pagosContador++;
												} else {
													break;
												}
											}

											$datos['exito'] = count($pagos) == $pagosContador;

											if ($datos['exito']) {
												$cuenta->guardar(['cerrada' => 1]);
												$datos['pagos'] = [];

												foreach ($cuenta->get_forma_pago() as $fpago) {
													$tmpPago = [
														'monto' => $fpago->monto,
														'documento' => $fpago->documento,
														'forma_pago' => $fpago->forma_pago,
														'observaciones' => $fpago->observaciones
													];

													if (!empty($fpago->tarjeta_respuesta)) {
														$tmpPago['tarjeta_respuesta'] = json_decode($fpago->tarjeta_respuesta);
													}

													$datos['pagos'][] = $tmpPago;
												}

												$fac = new Factura_model();
												$fac->guardar($datosFac);
												$fac->cargarEmpresa();
												$pimpuesto = $fac->empresa->porcentaje_iva + 1;
												$detalle = $cuenta->getDetalle([
													'descuento' => 1
												]);

												foreach ($cuenta->getDetalle() as $det) {
													$det->bien_servicio = $det->articulo->bien_servicio;
													$det->articulo = $det->articulo->articulo;
													$det->precio_unitario = $det->precio;
													$det->precio_unitario_ext = $det->precio;
													if ($det->descuento == 1) {
														$det->descuento = 0; // $det->total * $pdescuento/100;	
														$det->descuento_ext = 0; // $det->total * $pdescuento/100;	
													} else {
														$det->descuento = 0;
														$det->descuento_ext = 0;
													}
													$det->total_ext = $det->total;
													$total = $det->total - $det->descuento;
													$total_ext = $det->total_ext - $det->descuento_ext;
													if ($fac->exenta) {
														$det->monto_base = $total;
														$det->monto_base_ext = $total_ext;
													} else {
														$det->monto_base = $total / $pimpuesto;
														$det->monto_base_ext = $total_ext / $pimpuesto;
													}
													$det->monto_iva = $total - $det->monto_base;
													$det->monto_iva_ext = $total_ext - $det->monto_base_ext;
													$fac->setDetalle((array) $det);
												}
											} else {
												$datos['mensaje'] = implode('\n', $cuenta->getMensaje());
											}
										}

										if ($datos['exito']) {
											$datos['mensaje'] = 'Datos actualizados con éxito.';
											$datos['comanda'] = $comanda->getComanda();

											$sed = $comanda->getSede();
											$emp = $sed->getEmpresa();

											$datos['sede'] = [
												'nombre' => $sed->nombre,
												'direccion' => $sed->direccion,
												'telefono' => $sed->telefono,
												'correo' => $sed->correo,
												'empresa' => [
													'nombre' => $emp->nombre_comercial,
													'nit' => $emp->nit
												]
											];
										}
									} else {
										$datos['mensaje'] = 'No existe ningun turno abierto';
									}
								} else {
									$datos['mensaje'] = 'No hay existencia suficiente';
								}
							} else {
								$datos['mensaje'] = 'No existen productos';
							}
						} else {
							$datos['mensaje'] = 'Mesero Invalido';
						}
					} else {
						$datos['mensaje'] = 'Origen desconocido';
					}
				} else {
					$datos['mensaje'] = 'Llave invalida';
				}
			} else {
				$datos['mensaje'] = 'Parámetros inválidos.';
			}
		} else {
			$datos['mensaje'] = 'Hacen falta datos obligatorios para continuar';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function comanda()
	{
		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);

		$req = json_decode(file_get_contents('php://input'), true);

		$datos = ['exito' => false, 'mensaje' => ''];

		if (isset($req['key'], $req['sede'], $req['cliente'], $req['metodo_pago'], $req['detalle'])) {
			if ($this->input->method() == 'post') {

				$datosDb = $this->Catalogo_model->getCredenciales([
					'llave' => $req['key']
				]);
				$conn = [
					'host' => $datosDb->db_hostname,
					'user' => $datosDb->db_username,
					'password' => $datosDb->db_password,
					'database' => $datosDb->db_database
				];
				$db = conexion_db($conn);
				$this->db = $this->load->database($db, true);


				$sede = $this->Catalogo_model->getSede([
					'sede' => $req['sede'],
					'_uno' => true
				]);


				$moneda = $this->Catalogo_model->getMoneda([
					'codigo' => $req['moneda'],
					'_uno' => true
				]);

				$datosCliente = $req['cliente'];

				if ($datosCliente) {
					$nit = preg_replace('/[^0-9?!]/', '', $datosCliente['nit']);

					if (empty($nit)) {
						$nit = strtoupper(preg_replace('/[^A-Za-z?!]/', '', $datosCliente['nit']));
					}

					$datosCliente['nit'] = $nit;

					$cliente = $this->Cliente_model->buscar([
						'nit' => $nit,
						'_uno' => true
					]);

					$origen = $this->Catalogo_model->getComandaOrigen([
						'_uno' => true,
						'descripcion' => 'API'
					]);

					if (!$cliente) {
						$cliente = new Cliente_model();
						$cliente->guardar([
							'nombre' => $datosCliente['nombre'] . ' ' . $datosCliente['apellidos'],
							'direccion' => ($datosCliente['direccion'] ?? 'CIUDAD'),
							'correo' => $datosCliente['correo'],
							'telefono' => $datosCliente['telefono'],
							'nit' => $nit
						]);
						$idCliente = $cliente->getPK();
						$correoReceptor = $datosCliente['correo'];
					} else {
						$idCliente = $cliente->cliente;
						$correoReceptor = $cliente->correo;
					}
				}

				$datosCta = [
					'nombre' => $datosCliente['nombre'],
					'numero' => $req['numero_orden']
				];

				$datosFac = [
					'usuario' => 1,
					'factura_serie' => 1,
					'sede' => $sede->sede,
					'certificador_fel' => 1,
					'cliente' => $idCliente,
					'fecha_factura' => date('Y-m-d'),
					'moneda' => $moneda->moneda,
					'correo_receptor' => $correoReceptor
				];
				$usu = $this->Usuario_model->find([
					'usuario' => 1,
					'_uno' => true
				]);

				if ($sede) {
					if ($origen) {
						if ($usu) {
							$turno = $this->Turno_model->getTurno([
								'sede' => $sede->sede,
								'abierto' => true,
								'_uno' => true
							]);

							$comanda = new Comanda_model();

							$datosComanda = [
								'usuario' => $usu->usuario,
								'sede' => $sede->sede,
								'estatus' => 1,
								'domicilio' => 1,
								'comanda_origen' => $origen->comanda_origen,
								'comanda_origen_datos' => json_encode($req),
								'notas_generales' => isset($req['notas_generales']) ? $req['notas_generales'] : null,
								'comensales' => 1
							];

							$propina = false;
							$insert = false;
							$propinaMonto = 0;
							$menu = $this->Catalogo_model->getModulo([
								'modulo' => 4,
								'_uno' => true
							]);

							$existencia = true;
							foreach ($req['detalle'] as $row) {

								$art = $this->Articulo_model->buscarArticulo([
									'codigo' => $row['codigo'],
									'sede' => $sede->sede,
									'_uno' => true
								]);

								if ($art) {
									$insert = true;
									$articulo = new Articulo_model($art->articulo);
									$articulo->actualizarExistencia();
									if (!empty($menu)) {
										if ($existencia) {
											$existencia = $articulo->existencias >= $row['cantidad'];
										}
									}
								}
							}
							if ($insert) {
								if ($existencia) {
									if ($turno) {
										$datosComanda['turno'] = $turno->turno;
										$datos['exito'] = $comanda->guardar($datosComanda);
										if (isset($req['mesa'])) {
											$mesa = new Mesa_model($req['mesa']);
											$comanda->setMesa($req['mesa']);
											$mesa->guardar(['estatus' => 2]);
										}
										$cuenta = new Cuenta_model();
										if ($cuenta->cerrada == 0) {
											$datosCta['comanda'] = $comanda->comanda;
											$cuenta->guardar($datosCta);
										}

										$total = 0;
										$exito = true;
										foreach ($req['detalle'] as $row) {
											$art = $this->Articulo_model->buscarArticulo([
												'codigo' => $row['codigo'],
												'sede' => $sede->sede,
												'_uno' => true
											]);

											if ($art) {
												$datosDcomanda = [
													'articulo' => $art->articulo, 'cantidad' => $row['cantidad'], 'precio' => $row['precio'], 'impreso' => 0, 'total' => $row['total'], 'notas' => ($row['nota'] ?? ''), 'receta' => verDato($row, 'receta')
												];

												$total += $row['total'];
												if (verDato($row, 'combo')) {
													$det = $comanda->guardarDetalleCombo($datosDcomanda, $cuenta->getPK());
												} else {
													$det = $comanda->guardarDetalle($datosDcomanda);
													$id = '';
													if ($det) {
														$cuenta->guardarDetalle([
															'detalle_comanda' => $det->detalle_comanda
														]);
													} else {
														$exito = false;
														$datos['mensaje'] .= implode('\n', $comanda->getMensaje());
													}
												}
											} else {
												$exito = false;
												$datos['mensaje'] .= '\nArtículo no entrado.';
											}
										}

										$datos['exito'] = $exito;
										if ($datos['exito']) {
											$pagos = [];
											$descuento = 0;
											if (isset($req['descuento']) && is_array($req['descuento'])) {

												foreach ($req['descuento'] as $desc) {
													$descuento += ($total * $desc['valor'] / 100);
												}
												$pagos[] = [
													'forma_pago' => 3,
													'monto' => $descuento
												];
											}
											$tmpCobro = [];
											foreach ($req['metodo_pago'] as $mpago) {
												$tmpCobro[] = (object) [
													'forma_pago' => $mpago['codigo'],
													'monto' => $mpago['monto']
												];
											}

											$pagos = array_merge($pagos, $tmpCobro);

											$pagosContador = 0;

											foreach ($pagos as $pago) {
												if ($cuenta->cobrar((object) $pago)) {
													$pagosContador++;
												} else {
													break;
												}
											}

											$datos['exito'] = count($pagos) == $pagosContador;

											if ($datos['exito']) {
												$cuenta->guardar(['cerrada' => 1]);

												$fac = new Factura_model();
												$fac->guardar($datosFac);
												$fac->cargarEmpresa();
												$pimpuesto = $fac->empresa->porcentaje_iva + 1;
												$detalle = $cuenta->getDetalle([
													'descuento' => 1
												]);

												foreach ($cuenta->getDetalle() as $det) {
													$det->bien_servicio = $det->articulo->bien_servicio;
													$det->articulo = $det->articulo->articulo;
													$det->precio_unitario = $det->precio;
													$det->precio_unitario_ext = $det->precio;
													if ($det->descuento == 1) {
														$det->descuento = 0; // $det->total * $pdescuento/100;	
														$det->descuento_ext = 0; // $det->total * $pdescuento/100;	
													} else {
														$det->descuento = 0;
														$det->descuento_ext = 0;
													}
													$det->total_ext = $det->total;
													$total = $det->total - $det->descuento;
													$total_ext = $det->total_ext - $det->descuento_ext;
													if ($fac->exenta) {
														$det->monto_base = $total;
														$det->monto_base_ext = $total_ext;
													} else {
														$det->monto_base = $total / $pimpuesto;
														$det->monto_base_ext = $total_ext / $pimpuesto;
													}
													$det->monto_iva = $total - $det->monto_base;
													$det->monto_iva_ext = $total_ext - $det->monto_base_ext;
													$fac->setDetalle((array) $det);
												}
											} else {
												$datos['mensaje'] = implode('\n', $cuenta->getMensaje());
											}
										}

										if ($datos['exito']) {
											$datos['mensaje'] = 'Datos actualizados con éxito.';
											$datos['comanda'] = $comanda->getComanda();
										}
									} else {
										$datos['mensaje'] = 'No existe ningun turno abierto';
									}
								} else {
									$datos['mensaje'] = 'No hay existencia suficiente';
								}
							} else {
								$datos['mensaje'] = 'No existen productos';
							}
						} else {
							$datos['mensaje'] = 'Mesero Invalido';
						}
					} else {
						$datos['mensaje'] = 'Origen desconocido';
					}
				} else {
					$datos['mensaje'] = 'Llave invalida';
				}
			} else {
				$datos['mensaje'] = 'Parámetros inválidos.';
			}
		} else {
			$datos['mensaje'] = 'Hacen falta datos obligatorios para continuar';
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function set_producto()
	{
		$this->load->model(['Categoria_model', 'Cgrupo_model', 'Impresora_model', 'Bodega_model']);

		$datos = ['exito' => false, 'mensaje' => ''];

		if (isset($_GET['key'])) {
			if ($this->input->method() == 'post') {
				$esGK = isset($_GET['gk']) && (int)$_GET['gk'] === 1;

				$req = json_decode(file_get_contents('php://input'), true);
				$cat = new Categoria_model();
				$cgrupo = new Cgrupo_model();

				$datosDb = $this->Catalogo_model->getCredenciales([
					'llave' => $_GET['key']
				]);

				$conn = [
					'host' => $datosDb->db_hostname,
					'user' => $datosDb->db_username,
					'password' => $datosDb->db_password,
					'database' => $datosDb->db_database
				];

				$db = conexion_db($conn);
				$this->db = $this->load->database($db, true);

				$sede = $this->Catalogo_model->getSede([
					'admin_llave' => $_GET['key'],
					'_uno' => true
				]);

				if ($esGK) {
					$vt = $this->Vendor_tercero_model->buscar(['TRIM(nombre)' => trim($req['vendor']), '_uno' => true]);
					if ($vt) {
						$svt = $this->Sede_vendor_tercero_model->buscar(['vendor_tercero' => $vt->vendor_tercero, '_uno' => true]);
						$sede = $this->Catalogo_model->getSede(['sede' => $svt->sede, '_uno' => true]);
					}
				}

				$descripcionCategoria = $esGK ? $req['product_type'] : $req['vendor'];
				$descripcionCategoria = !empty(trim($descripcionCategoria)) ? trim($descripcionCategoria) : 'Otros';

				$tmpcat = $this->Categoria_model->buscar([
					'descripcion' => $descripcionCategoria,
					'sede' => $sede->sede,
					'_uno' => true
				]);

				if ($tmpcat) {
					$cat->cargar($tmpcat->categoria);
				} else {
					$cat->guardar([
						'descripcion' => $descripcionCategoria,
						'sede' => $sede->sede,
					]);
				}

				$descripcionGrupo = $req['tags'];
				$descripcionGrupo = !empty(trim($descripcionGrupo)) ? trim($descripcionGrupo) : 'Otros';

				$grupo = $this->Cgrupo_model->buscar([
					'categoria' => $cat->getPK(),
					'descripcion' => $descripcionGrupo,
					'_uno' => true
				]);

				if ($grupo) {
					$cgrupo->cargar($grupo->categoria_grupo);
				} else {
					$impresora = $this->Impresora_model->buscar(['sede' => $sede->sede, 'pordefecto' => 1, '_uno' => true]);
					$bodega = $this->Bodega_model->buscar(['sede' => $sede->sede, 'pordefecto' => 1, '_uno' => true]);
					$cgrupo->guardar([
						'categoria' => $cat->getPK(),
						'descripcion' => $descripcionGrupo,
						'impresora' => $impresora ? $impresora->impresora : null,
						'bodega' => $bodega ? $bodega->bodega : null,
					]);
				}

				if (isset($req['variants'])) {
					foreach ($req['variants'] as $row) {
						$desc = $req['title'];
						if (count($req['variants']) > 1) {
							$desc .= " {$row['title']}";
						}

						$args = [
							'categoria_grupo' => $cgrupo->getPK(),
							'presentacion' => 1,
							'descripcion' => $desc,
							'precio' => $row['price'],
							'bien_servicio' => 'B',
							'existencias' => 0,
							'shopify_id' => $row['id']
						];

						$tmpArt = $this->Articulo_model->buscar([
							'shopify_id' => $row['id'],
							'_uno' => true
						]);

						$art = new Articulo_model();
						if ($tmpArt) {
							$art->cargar($tmpArt->articulo);
						}

						$datos['exito'] = $art->guardar($args);
					}
				}

				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
				} else {
					$datos['mensaje'] = 'Ocurrió un error al guardar el producto.';
				}
			} else {
				$datos['mensaje'] = 'Parámetros inválidos.';
			}
		} else {
			$datos['mensaje'] = 'Hacen falta datos obligatorios para continuar';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function test()
	{
		$nit = 'CF';
		$nit = strtoupper(preg_replace('/[CF]!|[^0-9Kk?!]/', '', $nit));
		echo '<pre>';
		print_r($nit);
		echo '</pre>';
	}

	public function lista_comandas()
	{
		$datos = new stdClass();
		$html = '<html><header><style> th, td { border: solid 1px black; }</style></header><body>';

		if (isset($_GET['key'])) {
			$llave = $_GET['key'];
			unset($_GET['key']);
			$datosDb = $this->Catalogo_model->getCredenciales(['llave' => $llave]);
			$conn = [
				'host' => $datosDb->db_hostname,
				'user' => $datosDb->db_username,
				'password' => $datosDb->db_password,
				'database' => $datosDb->db_database
			];
			$db = conexion_db($conn);
			$this->db = $this->load->database($db, true);

			if (isset($_GET['_fdel'])) {
				$_GET['_fdel'] = ['DATE(fhcreacion)' => $_GET['_fdel']];
			}

			if (isset($_GET['_fal'])) {
				$_GET['_fal'] = ['DATE(fhcreacion)' => $_GET['_fal']];
			}

			$argsDetalle = [];

			$cuenta = null;
			$detalle_cuenta = [];
			if (isset($_GET['_cuenta'])) {
				$cuenta = new Cuenta_model($_GET['_cuenta']);
				$detC = $cuenta->getDetalle(['impreso' => 1, '_for_print' => true]);
				foreach ($detC as $row) {
					$detalle_cuenta[] = (int)$row->detalle_comanda;
				}
			}

			$datos->comandas = $this->Comanda_model->buscar($_GET);
			foreach ($datos->comandas as $comanda) {
				$cmd = new Comanda_model($comanda->comanda);
				$comanda->sede = $this->Sede_model->buscar(['sede' => $comanda->sede, '_uno' => true]);
				$usuario = $this->Usuario_model->buscar(['usuario' => $comanda->usuario, '_uno' => true]);
				$comanda->usuario = (object)[
					'usuario' => $usuario->usuario,
					'nombres' => $usuario->nombres,
					'apellidos' => $usuario->apellidos,
					'usrname' => $usuario->usrname
				];
				$mesero = $this->Usuario_model->buscar(['usuario' => $comanda->mesero, '_uno' => true]);
				$comanda->mesero = (object)[
					'usuario' => $mesero->usuario,
					'nombres' => $mesero->nombres,
					'apellidos' => $mesero->apellidos,
					'usrname' => $mesero->usrname
				];
				$detalle = $cmd->getDetalle($argsDetalle);
				$comanda->detalle = [];
				foreach ($detalle as $det) {
					if (isset($_GET['_cuenta'])) {
						if (in_array((int)$det->detalle_comanda, $detalle_cuenta)) {
							$comanda->detalle[] = $det;
						}
					} else {
						$comanda->detalle[] = $det;
					}
				}

				$html .= "<h3>Sede: {$comanda->sede->nombre}</h3>";
				$html .= "<h4>Comanda #{$comanda->comanda}<br/>";
				$html .= "Mesero: {$comanda->mesero->nombres} {$comanda->mesero->apellidos} ({$comanda->mesero->usrname})</h4>";
				$html .= "<table style='border: solid 1px black; border-collapse: collapse; width: 50%;'>";
				$html .= '<caption><b>Detalle</b></caption>';
				$html .= '<thead><tr>';
				$html .= "<th>Cantidad</th><th style='text-align: left;'>Artículo</th><th style='text-align: right;'>Precio</th><th style='text-align: right;'>Total</th>";
				$html .= '</tr></thead>';
				$html .= '<tbody>';
				$totComanda = 0;
				foreach ($comanda->detalle as $det) {
					$html .= '<tr>';
					$html .= "<td style='text-align: center;'>{$det->cantidad}</td>";
					$html .= '<td>';

					if (empty($det->detalle_comanda_id)) {
						$html .= '';
					} else {
						$html .= '&nbsp;&nbsp;&nbsp;';
						if ((int)$det->articulo->multiple === 0) {
							$html .= '&nbsp;&nbsp;&nbsp;';
						}
					}

					$html .= "{$det->articulo->descripcion}</td>";
					$html .= "<td style='text-align: right;'>" . number_format((float)$det->precio, 2) . '</td>';
					$html .= "<td style='text-align: right;'>" . number_format((float)$det->total, 2) . '</td>';
					$html .= '</tr>';
					$totComanda += (float)$det->total;
				}
				$html .= '<tfoot><tr>';
				$html .= "<td colspan='3' style='text-align: right;'><b>Total:</b></td>";
				$html .= "<td style='text-align: right;'><b>" . number_format($totComanda, 2) . '</b></td>';
				$html .= '</tr></tfoot>';
				$html .= '</tbody></table>';
			}
		} else {
			$html .= '<h3>Por favor incluya el UUID (key) del cliente.</h3>';
		}
		$html .= '</body></html>';
		$this->output->set_content_type('text/html', 'UTF-8')->set_output($html);
	}
}

/* End of file Api.php */
/* Location: ./application/restaurante/controllers/Api.php */