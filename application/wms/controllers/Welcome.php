<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
        	'Egreso_model', 
        	'EDetalle_model',
        	'Ingreso_model',
        	'IDetalle_Model',
        	'Receta_model',
        	'Articulo_model',
        	//'Catalogo_model',
        	'Configuracion_model'
        ]);
	}

	public function index()
	{
		$this->load->view('welcome_message');
	}


	public function set_egreso($egreso, $key = "", $id = "")
	{	
		//$this =& get_instance();
		
		$res = ["exito" => 0, "mensaje" => "Error"];
		if (!empty($key)) {
			$cat = new Catalogo_model();
			$datosDb = $cat->getCredenciales([
				"llave" => $key
			]);
		
			$req = simplexml_load_string($egreso);
            $conn = [
                'host' => $datosDb->db_hostname,
                'user' => $datosDb->db_username,
                'password' => $datosDb->db_password,
                'database' => $datosDb->db_database
            ];
			$db = conexion_db($conn);
			$this->db = $this->load->database($db, true);

			$sede = $cat->getSede([
				"admin_llave" => $key,
				"_uno" => true
			]);
			if ($sede) {
				$egr = new Egreso_model($id);
				if (empty($id) || $egr->estatus_movimiento == 1) {
					$bodega = $cat->getBodega([
						"sede" => $sede->sede,
						"_uno" => true
					]);
					$mov = $cat->getTipoMovimiento([
						"egreso" => 1,
						"_uno" => true
					]);
					$enca = [
						"tipo_movimiento" => $mov->tipo_movimiento,
						"bodega" => $bodega->bodega,
						"usuario" => $req->encabezado->usuario,
						"estatus_movimiento" => 2
					];

					$res['exito'] = $egr->guardar($enca);					
					if($res['exito']) {
						$res['mensaje'] = "Datos actualizados con éxito.";
						$res['egreso'] = $egr;
						if (isset($req->detalle) && isset($req->detalle->item)) {
							if (is_array($req->detalle->item)) {
								foreach ($req->detalle->item as $row) {
									$egr->guardarDetalleApi($row);
								}
							} else {
								$item = $req->detalle->item;
								$egr->guardarDetalleApi($item);
							}
						}
					} else {
						$res['mensaje'] = implode(",", $egr->getMensaje());
					}	
				} else {
					$res['mensaje'] = "Solo puede editar egresos en estatus Abierto";
				}
			} else {
				$res['mensaje'] = "Llave invalida";
			}
		} else {
			$res['mensaje'] = "Hacen falta datos obligatorios para poder continuar, apikey";
		}

		$xml = new DOMDocument('1.0');
		$xml->loadXML(arrayToXml($res, "<resultado/>"));

		return $xml->saveXML();
	}
}
