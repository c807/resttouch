<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Callcenter extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->add_package_path('application/facturacion');
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
			'Turno_model'
		]);

		$this->output
		->set_content_type('application/json', 'UTF-8');
	}

	public function guardar_pedido($comanda = '')
	{
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
							'estatus_callcenter' => 1
						]);
						
						$exito = $com->enviarDetalleSede();

						$opciones = array(
	                            'http' => array(
	                                'method'=>'POST',
	                                'header'=> "Authorization: {$headers["Authorization"]}\r\nContent-Type: application/json",
	                                'content' => json_encode($req->cobro)
	                            )
	                    );

						if ($exito) {
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
									$datos['exito'] = true;
									$datos['mensaje'] = 'Datos actualizados con exito';
									$datos['pedido'] = $com->getPK();
									$url_ws = get_url_websocket();
									$updlst = json_decode(get_request("{$url_ws}/api/updlstpedidos", []));
									$updmesas = json_decode(get_request("{$url_ws}/api/updlstareas", []));
									$updpedidos = json_decode(get_request("{$url_ws}/api/updseguimientocc", []));
									$datos['msgws'] = [$updlst, $updmesas, $updpedidos];
									$com->guardar(['estatus_callcenter' => 2]);
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
						$datos['mensaje'] = 'No existe ningun turno abierto en el restaurante seleccionado.';
						$com->guardar(['estatus_callcenter' => 9]);
					}
				}
			} else {
				$datos['mensaje'] = "No existe una comanda con el numero {$comanda}.";	
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