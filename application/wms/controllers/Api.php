<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Api extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model([
			'Egreso_model',
			'EDetalle_model',
			'Ingreso_model',
			'IDetalle_Model',
			'Receta_model',
			'Articulo_model',
			'Presentacion_model',
			'Configuracion_model',
			'BodegaArticuloCosto_model'
		]);
	}

	function test()
	{
		$registro = new Registro();
		echo 'string';
	}

	public function index()
	{
		//require FCPATH.'application/wms/controllers/Api.php';
		$server = new SOAPServer(
			FCPATH . 'application/wms/libraries/rtapi.wsdl',
			[
				'uri' => url_base('wms.php/api')
			]
		);
		//$server->addFunction('set_egreso');
		$server->setClass('Api');
		//$server->setObject($this);
		//start the SOAP requests handler
		$server->handle();
	}

	public function set_egreso($egreso, $key = '', $asXml = true)
	{
		$ci = &get_instance();
		$res = ['exito' => false, 'mensaje' => $key];
		$req = simplexml_load_string($egreso);
		if (!empty($key)) {
			$ci->load->library('Registro');
			$registro = new Registro($egreso);
			$registro->setCatalogo(new Catalogo_model());
			//$res['mensaje'] = $registro->setDB($key);
			if ($registro->setDB($key)) {
				$egr = new Egreso_model();

				$yaExiste = $egr->buscar(['idcomandafox' => $req->encabezado->idcomandafox, '_uno' => true]);

				if (!$yaExiste) {
					$egr->bodega = isset($req->encabezado->bodega) ? $req->encabezado->bodega : 1;
					$egr->idcomandafox = isset($req->encabezado->idcomandafox) ? $req->encabezado->idcomandafox : null;
					$egr->raw_egreso = $egreso;

					if (isset($req->encabezado->fecha) && !empty(trim((string)$req->encabezado->fecha))) {
						$egr->fecha = trim((string)$req->encabezado->fecha);
					}

					if (empty($id) || $egr->estatus_movimiento == 1) {

						$noExisten = [];
						if (isset($req->detalle) && isset($req->detalle->item)) {
							$cantDetalles = count($req->detalle->item);
							for ($i = 0; $i < $cantDetalles; $i++) {
								if (!$egr->checkDetalleApi($egr->bodega, $req->detalle->item[$i]->articulo)) {
									$noExisten[] = $req->detalle->item[$i]->articulo . (isset($req->detalle->item[$i]->descripcion) ? (': ' . $req->detalle->item[$i]->descripcion) : '');
								}
							}
						}

						if (count($noExisten) === 0) {
							$registro->setEgreso($egr);

							$res['exito'] = $registro->guardarEgreso();
							if ($res['exito']) {
								$egr = $registro->getEgreso();
								$res['mensaje'] = 'Datos actualizados con éxito.';
								$res['egreso'] = $egr;
								if (isset($req->detalle) && isset($req->detalle->item)) {

									for ($i = 0; $i < count($req->detalle->item); $i++) {
										$row = $req->detalle->item[$i];
										$egr->guardarDetalleApi($row);
									}
								}
							} else {
								$res['mensaje'] = implode(', ', $registro->getEgreso()->getMensaje());
							}
						} else {
							$res['mensaje'] = 'No existen los codigos: ' . implode(', ', $noExisten);
						}
					} else {
						$res['mensaje'] = 'Solo puede editar egresos en estatus Abierto.';
					}
				} else {
					$res['mensaje'] = 'Ya existe el egreso de la comanda ' . $req->encabezado->idcomandafox . '.';
				}
			} else {
				$res['mensaje'] = 'Llave invalida';
			}
		} else {
			$res['mensaje'] = 'Hacen falta datos obligatorios para poder continuar, apikey';
		}

		if ($asXml) {
			$xml = new DOMDocument('1.0');
			$xml->loadXML(arrayToXml($res, '<resultado/>'));
			return $xml->saveXML();
		} else {
			return $res;
		}
	}

	public function endpoint_set_egreso($key = '')
	{
		// $datos = new stdClass();
		// $datos->exito = true;
		// $datos->mensaje = 'La prueba fue exitosa';
		$resultado = [];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'));
			try {
				$resultado = $this->set_egreso($req->egreso, $key, false);
			} catch (Exception $ex) {
				$resultado[] = $ex->getMessage();
			}
		}
		$this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($resultado));
	}
}

/* End of file Api.php */
/* Location: ./application/wms/controllers/Api.php */