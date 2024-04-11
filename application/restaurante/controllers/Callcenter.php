<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Callcenter extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->add_package_path('application/facturacion');
		$this->load->add_package_path('application/wms');
		$this->load->helper('api');
		$this->load->model([
			'Comanda_model', 
			'Dcomanda_model', 
			'Cuenta_model', 
			'Dcuenta_model',
			'Usuario_model',
			'Mesa_model',
			'Area_model',
			'Articulo_model',
			'Factura_model',
			'Configuracion_model',
			'Turno_model',
			'Catalogo_model',
			'BodegaArticuloCosto_model'
		]);

		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar_pedido($comanda = '')
	{		
		set_time_limit(300);
		ini_set('default_socket_timeout', 300);		
		$req = json_decode(file_get_contents('php://input'));
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			$com = new Comanda_model($comanda);
			$headers = $this->input->request_headers();
			if ($com->getPK()) {
				if (verDato($req, 'cobro') && verDato($req, 'factura') && verDato($req, 'pedido')) {
					$origen = $this->Catalogo_model->getComandaOrigen([
						'_uno' => true,
						'descripcion' => 'API'
					]);

					$turno = $this->Turno_model->getTurno([
						'sede' => $req->pedido->sede,
						'abierto' => true, 
						'_uno' => true
					]);

					if ($turno) {
						$siHayTodos = $com->enviarDetalleSede(false, (int)$req->pedido->sede);
						if ($siHayTodos->exito) {
							$detOriginal = $this->Cuenta_model->obtener_detalle(['comanda' => $com->getPK()]);						
							$com->guardar([
								'domicilio' => 1,
								'sede' => $req->pedido->sede,
								'turno' => $turno->turno,
								'comanda_origen' => $origen->comanda_origen,
								'comanda_origen_datos' => json_encode($req->pedido),
								'detalle_comanda_original' => json_encode($detOriginal),
								'tiempo_entrega' => isset($req->pedido->tiempo_entrega) ? $req->pedido->tiempo_entrega : null,
								'tipo_domicilio' => isset($req->pedido->tipo_domicilio) ? $req->pedido->tipo_domicilio : null,
								'estatus_callcenter' => 1,
								'fhtomapedido' => date('Y-m-d H:i:s')
							]);
							
							$exito = $com->enviarDetalleSede();
	
							$opciones = array(
									'http' => array(
										'method'=>'POST',
										'header'=> "Authorization: {$headers["Authorization"]}\r\nContent-Type: application/json",
										'content' => json_encode($req->cobro)
									)
							);
	
							if ($exito->exito) {
								$contexto = stream_context_create($opciones);
	
								$cobro = json_decode(file_get_contents(url_base("restaurante.php/cuenta/cobrar/{$req->cobro->cuenta}"), false, $contexto));
	
								if ($cobro->exito) {
									$req->factura->sinfirma = true;
									$opciones['http']['content'] = json_encode($req->factura);
									$contexto = stream_context_create($opciones);
									$facturar = json_decode(
										file_get_contents(
											url_base("restaurante.php/factura/guardar/{$req->cobro->cuenta}"),
											false, 
											$contexto
										)
									);
	
									if ($facturar->exito) {

										$sedeDest = $this->Catalogo_model->getSede(['sede' => $req->pedido->sede, '_uno' => true]);
										$empresa = $this->Catalogo_model->getEmpresa(['empresa' => $sedeDest->empresa, '_uno' => true]);
										$corporacion = $this->Catalogo_model->getCorporacion(['corporacion' => $empresa->corporacion, '_uno' => true]);
										$corporacionUUID = '';
										if ($corporacion) {
											$corporacionUUID = "/{$corporacion->admin_llave}-{$empresa->empresa}-{$sedeDest->sede}";
										}

										$datos['exito'] = true;
										$datos['mensaje'] = 'Datos actualizados con exito';
										$datos['pedido'] = $com->getPK();
										$com->db->simple_query("UPDATE detalle_comanda SET impreso = 0 WHERE impreso = 1 AND comanda = {$com->getPK()}");
										$url_ws = get_url_websocket();
										$updlst = json_decode(get_request("{$url_ws}/api/updlstpedidos{$corporacionUUID}", []));
										$updmesas = json_decode(get_request("{$url_ws}/api/updlstareas", []));
										$updpedidos = json_decode(get_request("{$url_ws}/api/updseguimientocc", []));
										$datos['msgws'] = [$updlst, $updmesas, $updpedidos];
										$com->guardar(['estatus_callcenter' => 2, 'fhtomapedido' => date('Y-m-d H:i:s')]);
									} else {
										$datos['mensaje'] = $facturar->mensaje;
										$com->guardar(['estatus_callcenter' => 9]);
									}
								} else {
									$datos['mensaje'] = $cobro->mensaje;	
									$com->guardar(['estatus_callcenter' => 9]);
								}
							} else {
								$datos['mensaje'] = 'No fue posible enviar el pedido al restaurante seleccionado.';	
								$com->guardar(['estatus_callcenter' => 9]);
							}
						} else {
							$datos['mensaje'] = "Los siguientes artículos no existen en la sede destino: {$siHayTodos->faltantes}.";
							$com->guardar(['estatus_callcenter' => 9]);
						}
					} else {
						$datos['mensaje'] = 'No existe ningún turno abierto en el restaurante seleccionado.';
						$com->guardar(['estatus_callcenter' => 9]);
					}
				}
			} else {
				$datos['mensaje'] = "No existe una comanda con el número {$comanda}.";	
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output
		->set_output(json_encode($datos));
	}

}

/* End of file Callcenter.php */
/* Location: ./application/restaurante/controllers/Callcenter.php */