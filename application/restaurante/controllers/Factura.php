<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Factura extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->add_package_path('application/facturacion');
		$this->load->model([
			'Dfactura_model',
			'Usuario_model',
			'Catalogo_model',
			'Cuenta_model',
			'Dcomanda_model',
			'Dcuenta_model',
			'Factura_model',
			'Articulo_model',
			'Cliente_model',
			'Receta_model',
			'Configuracion_model',
			'Webhook_model',
			'ImpuestoEspecial_model'
		]);
        $this->output->set_content_type("application/json", "UTF-8");
	}	

	public function guardar()
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		$continuar = true;
		if ($this->input->method() == 'post') {
			if (isset($req['cliente']) && isset($req['moneda']) && isset($req['factura_serie'])) {
				// $sede = $this->Catalogo_model->getSede(['sede' => $data->sede, '_uno' => true]);
				$clt = new Cliente_model($req['cliente']);
				$config = $this->Configuracion_model->buscar([
					'campo' => 'RT_FACTURA_PROPINA',
					'_uno' => true
				]);

				foreach ($req['cuentas'] as $row) {
					$cta = new Cuenta_model($row['cuenta']);
					$empresa = $cta->getEmpresa();
					$fpago = $cta->get_forma_pago(['_sinFactura' => 1]);
					$data->sede = $empresa->sede;
					if (count($fpago) > 0) {
						$continuar = false;
					}
				}

				$sede = $this->Catalogo_model->getSede(['sede' => $data->sede, '_uno' => true]);
				
				$req['usuario'] = $data->idusuario;
				$req['sede'] = $data->sede;
				$req['certificador_fel'] = $sede->certificador_fel;
				$req['correo_receptor'] = $clt->correo;
				
				if($continuar){
					$fac = new Factura_model();
					$result = $fac->guardar($req);
					$fac->cargarEmpresa();
					$pimpuesto = $fac->empresa->porcentaje_iva +1;
					if($result) {
						foreach ($req['cuentas'] as $row) {
							$cta = new Cuenta_model($row['cuenta']);
							$pdesc = $cta->get_descuento();

							foreach ($cta->getDetalle(['impreso' => 1, '_for_prnt_recibo' => true]) as $det) {
								$det->bien_servicio = $det->articulo->bien_servicio;
								$det->articulo = $det->articulo->articulo;

								$factorAumento = 1 + (float)$det->aumento_porcentaje / 100;								
								
								$det->precio_unitario = (float)$det->precio * $factorAumento;
								$det->precio_unitario_ext = (float)$det->precio * $factorAumento;
								$det->total = (($det->precio_unitario * $det->cantidad) + (float)$det->monto_extra);
								$det->total_ext = (($det->precio_unitario * $det->cantidad) + (float)$det->monto_extra);
								// $det->total = ($det->precio_unitario * $det->cantidad);
								$det->precio_unitario = round($det->total / $det->cantidad, 2);
								$det->precio_unitario_ext = $det->total_ext / $det->cantidad;

								$det->descuento = $pdesc > 0 ? ($det->total * $pdesc) : 0;
								$det->descuento_ext = $pdesc > 0 ? ($det->total_ext * $pdesc) : 0;
								
								$total = $det->total - (float)$det->descuento;
								$total_ext = $det->total_ext - (float)$det->descuento_ext;

								if ($fac->exenta) {
									$det->monto_base = $total;
									$det->monto_base_ext = $total_ext;
								} else {
									$det->monto_base = $total / $pimpuesto;
									$det->monto_base_ext = $total_ext / $pimpuesto;
								}
								$art = new Articulo_model($det->articulo);
								$impuesto_especial = $art->getImpuestoEspecial();
								$desctEspecial = 0; $desctEspecial_ext = 0; // Chapuz para no afectar tanto el código. JA 28/01/2022.
								if ($impuesto_especial) {
									$det->impuesto_especial = $impuesto_especial->impuesto_especial;
									$det->porcentaje_impuesto_especial = $impuesto_especial->porcentaje;

									if ((float)$art->cantidad_gravable > 0 && (float)$art->precio_sugerido > 0)
									{
										$det->cantidad_gravable = (float)$art->cantidad_gravable * (float)$det->cantidad;
										$det->precio_sugerido = $art->precio_sugerido;
										$det->precio_sugerido_ext = $art->precio_sugerido;
										$det->valor_impuesto_especial = $det->cantidad_gravable * (float)$art->precio_sugerido * ((float)$impuesto_especial->porcentaje / 100);
										$det->valor_impuesto_especial_ext = $det->cantidad_gravable * (float)$art->precio_sugerido * ((float)$impuesto_especial->porcentaje / 100);

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
										$det->valor_impuesto_especial = $det->monto_base * ((float)$impuesto_especial->porcentaje / 100);
										$det->valor_impuesto_especial_ext = $det->monto_base_ext * ((float)$impuesto_especial->porcentaje / 100);
									}
								}
								$det->monto_iva = ($total - $desctEspecial) - $det->monto_base;	
								$det->monto_iva_ext = ($total_ext - $desctEspecial_ext) - $det->monto_base_ext;
								$fac->setDetalle((array) $det);
							}
						}
						if ($config && $config->valor == 1) {
							#Facturar Propina;
							// $art = $this->Articulo_model->buscar(["descripcion" => "Propina", "_uno" => true]);

							$art = $this->Articulo_model->buscarArticulo([
								'descripcion' => 'Propina',
								'sede' => $data->sede
							]);

							$prop = $fac->getPropina();

							if (!$art) {
								$art = new Articulo_model();
								$art->guardar([
									'categoria_grupo' => 1,
									'presentacion' => 1,
									'descripcion' => 'Propina',
									'mostrar_pos' => 0,
									'bien_servicio' => 'B',
									'precio' => 0,
									'existencias' => 0
								]);
							}

							$total = suma_field($prop, 'propina_monto');
							$total_ext = suma_field($prop, 'propina_monto');
							if ($total > 0) {
								if ($fac->exenta) {
									$monto_base = $total;
									$monto_base_ext = $total_ext;
								} else {
									$monto_base = $total / $pimpuesto;
									$monto_base_ext = $total_ext / $pimpuesto;
								}

								$fac->setDetalle([
									'articulo' => $art->articulo,
									'cantidad' => 1,
									'precio_unitario' => $total,
									'precio_unitario_ext' => $total_ext,
									'total' => $total,
									'total_ext' => $total_ext,
									'monto_base' => $monto_base,
									'monto_base_ext' => $monto_base_ext,
									'monto_iva' => $total - $monto_base,
									'monto_iva_ext' => $total_ext - $monto_base_ext,
									'bien_servicio' => $art->bien_servicio,
									'presentacion' => $art->presentacion
								]);
							}
						}

						if (!isset($req['sinfirma'])) {
							$facturaRedondeaMontos = $this->Configuracion_model->buscar(['campo' => 'RT_FACTURA_REDONDEA_MONTOS', '_uno' => true]);

							$fac->cargarFacturaSerie();
							$fac->cargarMoneda();
							$fac->cargarReceptor();
							$fac->cargarSede();
							$fac->cargarCertificadorFel();
							$fac->procesar_factura($facturaRedondeaMontos && (int)$facturaRedondeaMontos->valor === 0 ? false : true);
							
							$funcion = $fac->getCertificador()->metodo_factura;
							$resp = $fac->$funcion();
							$fac->setBitacoraFel(['resultado' => json_encode($resp)]);
							if (!empty($fac->numero_factura)) {
								$webhook = $this->Webhook_model->buscar([
									'evento' => 'RTEV_FIRMA_FACTURA',
									'_uno' => true
								]);

								$fact = new Factura_model($fac->factura);
								$fac->cargarSede();
								$fac->detalle = $fac->getDetalle();
								$fact->guardar([
									'numero_factura' => $fac->numero_factura,
									'serie_factura' => $fac->serie_factura,
									'fel_uuid' => $fac->fel_uuid
								]);
								if ($webhook) {
									$this->load->library('Webhook');
									if (strtolower(trim($webhook->tipo_llamada)) == 'soap') {
										$req = $fac->getXmlWebhook();

									} else if(strtolower(trim($webhook->tipo_llamada)) == 'json') {
										$this->load->helper('api');
										$req = $fac->getXmlWebhook(true);
									}

									$web = new Webhook($webhook);
									$web->setRequest($req);
									$web->setEvento();
								}


								$datos['exito'] = true;
								$datos['mensaje'] = 'Datos actualizados con exito';	
							} else {						
								$datos['mensaje'] = 'Ocurrio un error al enviar la factura, intente nuevamente';			
							}
							$fac->empresa->direccion = !empty($fac->sedeFactura->direccion) ? $fac->sedeFactura->direccion : $fac->empresa->direccion;
							$datos['factura'] = $fac;
						} else {
							$datos['exito'] = true;
							$datos['mensaje'] = 'Datos actualizados con exito';
						}
					} else {
						$datos['mensaje'] = 'Ocurrio un error al guardar la factura, intente nuevamente';	
					}
				} else {
					$datos['mensaje'] = 'La forma de pago de la cuenta no genera factura';	
				}

			} else {
				$datos['mensaje'] = 'Hacen falta datos obligatorios para poder continuar';	
			}
		} else {
			$datos['mensaje'] = 'Parametros Invalidos';
		}	

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));	
	}

	public function guardar_test()
	{
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$data = AUTHORIZATION::validateToken($headers['Authorization']);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		$continuar = true;
		if ($this->input->method() == 'post') {
			if (isset($req['cliente']) && isset($req['moneda']) && isset($req['factura_serie'])) {
				$sede = $this->Catalogo_model->getSede(['sede' => $data->sede, '_uno' => true]);
				$clt = new Cliente_model($req['cliente']);
				$config = $this->Configuracion_model->buscar([
					"campo" => "RT_FACTURA_PROPINA",
					"_uno" => true
				]);

				
				$req['usuario'] = $data->idusuario;
				$req['sede'] = $data->sede;
				$req['certificador_fel'] = $sede->certificador_fel;
				$req["correo_receptor"] = $clt->correo;

				foreach ($req['cuentas'] as $row) {
					$cta = new Cuenta_model($row['cuenta']);
					$fpago = $cta->get_forma_pago(["_sinFactura" => 1]);

					if (count($fpago) > 0) {
						$continuar = false;
					}

				}
				
				if($continuar){
					$fac = new Factura_model();
					$result = $fac->guardar($req);
					$fac->cargarEmpresa();
					$pimpuesto = $fac->empresa->porcentaje_iva +1;
					if($result) {
						foreach ($req['cuentas'] as $row) {
							$cta = new Cuenta_model($row['cuenta']);
							$pdesc = $cta->get_descuento();

							foreach ($cta->getDetalle(["impreso" => 1]) as $det) {
								$det->bien_servicio = $det->articulo->bien_servicio;
								$det->articulo = $det->articulo->articulo;
								
								$det->descuento = $pdesc > 0 ? ($det->total * $pdesc) : 0;
								
								$det->precio_unitario = $det->precio;
								$total = $det->total - $det->descuento;

								if ($fac->exenta) {
									$det->monto_base = $total;
								} else {
									$det->monto_base = $total / $pimpuesto;
								}
								$art = new Articulo_model($det->articulo);
								$impuesto_especial = $art->getImpuestoEspecial();
								if ($impuesto_especial) {
									$det->impuesto_especial = $impuesto_especial->impuesto_especial;
									$det->porcentaje_impuesto_especial = $impuesto_especial->porcentaje;
									$det->valor_impuesto_especial = $det->monto_base * ((float)$impuesto_especial->porcentaje / 100);
								}
								$det->monto_iva = $total - $det->monto_base;	
								$fac->setDetalle((array) $det);
							}
						}
						if ($config && $config->valor == 1) {
							#Facturar Propina;
							$art = $this->Articulo_model->buscar([
								"descripcion" => "Propina",
								"_uno" => true
							]);

							$prop = $fac->getPropina();

							if (!$art) {
								$art = new Articulo_model();
								$art->guardar([
									"categoria_grupo" => 1,
									"presentacion" => 1,
									"descripcion" => "Propina",
									"mostrar_pos" => 0,
									"bien_servicio" => "B",
									"precio" => 0,
									"existencias" => 0
								]);
							}

							$total = suma_field($prop, "propina_monto");
							if ($total > 0) {
								if ($fac->exenta) {
									$monto_base = $total;
								} else {
									$monto_base = $total / $pimpuesto;
								}

								$fac->setDetalle([
									"articulo" => $art->articulo,
									"cantidad" => 1,
									"precio_unitario" => $total,
									"total" => $total,
									"monto_base" => $monto_base,
									"monto_iva" => $total - $monto_base,
									"bien_servicio" => $art->bien_servicio,
									"presentacion" => $art->presentacion
								]);
							}
						}
						$fac->cargarFacturaSerie();
						$fac->cargarMoneda();
						$fac->cargarReceptor();
						$fac->cargarSede();
						$fac->cargarCertificadorFel();
						$fac->procesar_factura();
						
						$funcion = $fac->getCertificador()->metodo_factura;
						$resp = $fac->$funcion();
						$fac->setBitacoraFel(['resultado' => json_encode($resp)]);
						if (!empty($fac->numero_factura)) {
							$webhook = $this->Webhook_model->buscar([
								"evento" => "RTEV_FIRMA_FACTURA",
								"_uno" => true
							]);

							$fact = new Factura_model($fac->factura);
							$fac->cargarSede();
							$fac->detalle = $fac->getDetalle();
							$fact->guardar([
								"numero_factura" => $fac->numero_factura,
								"serie_factura" => $fac->serie_factura,
								"fel_uuid" => $fac->fel_uuid
							]);
							if ($webhook) {
								$this->load->library('Webhook');
								if (strtolower(trim($webhook->tipo_llamada)) == "soap") {
									$req = $fac->getXmlWebhook();

								} else if(strtolower(trim($webhook->tipo_llamada)) == "json") {
									$this->load->helper('api');
									$req = $fac->getXmlWebhook(true);
								}

								$web = new Webhook($webhook);
								$web->setRequest($req);
								$web->setEvento();
							}


							$datos['exito'] = true;
							$datos['mensaje'] = "Datos actualizados con exito";	
						} else {						
							$datos['mensaje'] = "Ocurrio un error al enviar la factura, intente nuevamente";			
						}
						$fac->empresa->direccion = !empty($fac->sedeFactura->direccion) ? $fac->sedeFactura->direccion : $fac->empresa->direccion;
						$datos['factura'] = $fac;
					} else {
						$datos['mensaje'] = "Ocurrio un error al guardar la factura, intente nuevamente";	
					}
				} else {
					$datos['mensaje'] = "La forma de pago de la cuenta no genera factura";	
				}

			} else {
				$datos['mensaje'] = "Hacen falta datos obligatorios para poder continuar";	
			}
		} else {
			$datos['mensaje'] = "Parametros Invalidos";
		}	

		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($datos));	
	}

	public function test($fact = null)
	{
		set_time_limit(0);
		$laFactura = $fact;
		$listaFacturas = [];

		$yaPasaron = [];

		$noPasaron = [];

		if(!isset($laFactura)) {
			$body = json_decode(file_get_contents('php://input'));
			if(isset($body->facturas)) {
				$listaFacturas = explode(',', $body->facturas);
			}
		} else {
			$listaFacturas[] = [$laFactura];
		}

		// $elxml = null;

		$webhook = $this->Webhook_model->buscar([
			"evento" => "RTEV_FIRMA_FACTURA",
			"_uno" => true
		]);
		$this->load->library('Webhook');
		$this->load->helper('api');

		foreach ($listaFacturas as $qFact) {
			//if(!in_array((int)$qFact, $yaPasaron)){
				try {
					$fac = new Factura_model($qFact);
					$fac->cargarFacturaSerie();
					$fac->cargarEmpresa();
					$fac->cargarMoneda();
					$fac->cargarReceptor();
					$fac->cargarSede();
					//$fac->procesar_factura();
					//$resp = $fac->enviarDigiFact();
			
					$req = $fac->getXmlWebhook(true);
					// $elxml = $req;
					// $client = new SoapClient("http://52.35.3.1/jk/php/ws/organization.wsdl");
			
					//$res = $client->setVenta($req);
					$web = new Webhook($webhook);
					$web->setRequest($req);
					$res = $web->setEvento();
					echo "<pre> $qFact - ";
					print_r ($res);
					echo "</pre>";				
					unset($web);
					unset($res);
					unset($fac);
				} catch(Exception $e) {
					// echo "<pre> $qFact - ".$e->getMessage()."</pre>";
					$noPasaron[] = $qFact;
				}
				// sleep(2);
			//}// IF
		}

		// $this->output->set_content_type("application/xlm")->set_output($elxml);

		// echo "<pre>NO PASARON: ";implode(", ", $noPasaron);echo "</pre>";
	}
}

/* End of file Factura.php */
/* Location: ./application/restaurante/controllers/Factura.php */