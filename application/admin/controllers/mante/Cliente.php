<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cliente extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model('Cliente_model');
		$this->output
			->set_content_type("application/json", "UTF-8");
	}

	public function guardar($id = "")
	{
		$clt = new Cliente_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			// $req['nit'] = str_replace("-", "", $req['nit']);
			$req['nit'] = strtoupper(preg_replace("/[^0-9KkcCfF?!]/", '', $req['nit']));
			$continuar = true;
			if (empty($id) && $req['nit'] !== 'CF') {
				$tmpClt = $this->Cliente_model->buscar([
					"nit" => $req['nit'],
					"_uno" => true
				]);

				if ($tmpClt) {
					$continuar = false;
				}
			}
			if ($continuar) {
				$datos['exito'] = $clt->guardar($req);

				if ($datos['exito']) {
					$datos['mensaje'] = "Datos actualizados con éxito.";
					$datos['cliente'] = $clt;
				} else {
					$datos['mensaje'] = $clt->getMensaje();
				}
			} else {
				$datos['mensaje'] = "Ya existe un cliente con este N.I.T.";
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Cliente_model->buscar($_GET);

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($datos));
	}

	public function prettyNombreContribuyente($fullname)
	{
		$nombreCompleto = explode(',,', $fullname);
		$cntNombreCompleto = count($nombreCompleto);
		for ($i = 0; $i < $cntNombreCompleto; $i++) {
			$nombreCompleto[$i] = trim(str_replace(',', ' ', $nombreCompleto[$i]));
		}
		$tmp = '';
		for ($i = $cntNombreCompleto - 1; $i >= 0; $i--) {
			if ($tmp !== '') {
				$tmp .= ' ';
			}
			$tmp .= $nombreCompleto[$i];
		}
		return $tmp;
	}

	public function get_info_contribuyente($nit = 'CF')
	{
		$nit = strtoupper(trim($nit));
		$datos = ['exito' => false];
		if ($nit !== 'CF') {
			$this->load
				->add_package_path('application/facturacion')
				->model('Factura_model')
				->helper(['jwt', 'authorization', 'api']);

			$headers = $this->input->request_headers();
			$data = AUTHORIZATION::validateToken($headers['Authorization']);
			$sede = $this->Catalogo_model->getSede([
				'sede' => $data->sede,
				'_uno' => true
			]);

			$tmp = new Factura_model();
			$tmp->certificador_fel = $sede->certificador_fel;
			$tmp->cargarCertificadorFel();
			$cer = $tmp->getCertificador();

			if ($cer->metodo_factura === "enviarInfile") {
				$dnit = [
					"emisor_codigo" => $cer->firma_alias,
					"emisor_clave" => $cer->llave,
					"nit_consulta" => $nit
				];

				$ch = curl_init("https://consultareceptores.feel.com.gt/rest/action");
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dnit));
				$res = curl_exec($ch);
				$json = json_decode($res);
				$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
				curl_close($ch);

				if (is_object($json)) {
					if (empty($json->mensaje)) {
						$datos['contribuyente'] = [
							'nombre' => $this->prettyNombreContribuyente($json->nombre),
							'direccion' => 'Ciudad'
						];
						$datos['exito'] = true;
						$datos['mensaje'] = 'Contribuyente encontrado.';
					} else {
						$datos['mensaje'] = $json->mensaje;
					}
				} else {
					$datos['mensaje'] = 'Unexpected HTTP code: ' . $http_code . "\n";
				}
			} else if ($cer->metodo_factura === "enviarCofidi") {
				$tmp->sede = $sede->sede;
				$tmp->cargarEmpresa();
				$nitEmisor = str_repeat("0", 12 - strlen($tmp->empresa->nit)) . $tmp->empresa->nit;

				$url = "https://portal.cofidiguatemala.com/NITFEL/ConsultaNIT.asmx/getNIT?vNIT={$nit}&Entity={$nitEmisor}&Requestor={$cer->llave}";

				$ch = curl_init($url);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt($ch, CURLOPT_POST, false);
				$str = curl_exec($ch);
				$req = simplexml_load_string($str);
				$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
				curl_close($ch);

				if (isset($req->Response)) {
					if ($req->Response->Result) {
						$datos['contribuyente'] = [
							'nombre' => $this->prettyNombreContribuyente((string)$req->Response->nombre),
							'direccion' => 'Ciudad'
						];
						$datos['exito'] = true;
						$datos['mensaje'] = 'Contribuyente encontrado.';
					} else {
						$datos['mensaje'] = (string)$req->Response->error;
					}
				} else {
					$datos['mensaje'] = 'Unexpected HTTP code: ' . $http_code . "\n";
				}
			} else if ($cer->metodo_factura === "enviarDigiFact") {
				$link = $cer->vinculo_factura;
				$tmp->sede = $sede->sede;
				$tmp->cargarEmpresa();				
				$nitEmisor = str_repeat("0", 12 - strlen($tmp->empresa->nit)) . $tmp->empresa->nit;
				$datosDF = array(
					"Username" => "{$tmp->empresa->pais_iso_dos}.{$nitEmisor}.{$cer->usuario}",
					"Password" => $cer->llave
				);

				$jsonToken = json_decode(post_request($link, json_encode($datosDF)));

				if (isset($jsonToken->Token)) {
					$link = "https://felgtaws.digifact.com.gt/gt.com.fel.api.v3/api/sharedInfo?NIT={$nitEmisor}&DATA1=SHARED_GETINFONITcom&DATA2=NIT|{$nit}&USERNAME={$cer->usuario}";
					$header = ["Authorization: {$jsonToken->Token}"];
					$res = json_decode(get_request($link, $header));
					if (isset($res->RESPONSE) && is_array($res->RESPONSE) && count($res->RESPONSE) > 0) {
						if (trim((string)$res->RESPONSE[0]->NOMBRE) !== '') {
							$datos['contribuyente'] = [
								'nombre' => $this->prettyNombreContribuyente(trim((string)$res->RESPONSE[0]->NOMBRE)),
								'direccion' => 'Ciudad'
							];
							$datos['exito'] = true;
							$datos['mensaje'] = 'Contribuyente encontrado.';
						} else {
							$datos['exito'] = false;
							$datos['mensaje'] = "No se encontró la información del contribuyente {$nit}.";
						}
					} else {
						$datos['exito'] = false;
						$datos['mensaje'] = "No se encontró la información del contribuyente {$nit}.";
					}
				} else {
					$datos['mensaje'] = "{$jsonToken->message}. {$jsonToken->description}";
				}				
			} else {
				$datos['mensaje'] = 'Servicio no disponible.';
			}
		}
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}
}

/* End of file Cliente.php */
/* Location: ./application/admin/controllers/mante/Cliente.php */
