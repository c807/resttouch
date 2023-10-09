<?php

if (!defined('BASEPATH')) exit('No direct script access allowed');

class Inicio
{
	public function verificarSesion()
	{
		$this->ci = &get_instance();
		$this->ci->load->helper(['jwt', 'authorization']);
		$this->ci->load->model('Catalogo_model');
		$this->libres = ['/usuario/login', '/solicitud_registro/guardar'];

		// $esVesuvio = false;
		// $credenciales = json_decode(file_get_contents('php://input'), true);
		// if (isset($credenciales['usr'])) {
		// 	$datosDominio = explode('@', $credenciales['usr']);
		// 	if (count($datosDominio) === 2) {
		// 		if (strcasecmp('vesuvio', $datosDominio[1]) == 0) {
		// 			$esVesuvio = true;
		// 		}
		// 	}
		// } else {
		// 	$headers = $this->ci->input->request_headers();
		// 	if (array_key_exists('Authorization', $headers)) {
		// 		$token = $headers['Authorization'];
		// 		try {
		// 			$data = AUTHORIZATION::validateToken($token);
		// 			if ($data && isset($data->dominio) && strcasecmp('vesuvio', $data->dominio) == 0) {
		// 				$esVesuvio = true;
		// 			}
		// 		} catch (Exception $e) {
		// 		}
		// 	}
		// }

		// if ($esVesuvio) {
		// 	include(APPPATH . 'config/database.php');
		// 	$this->ci->db->close();
		// 	$this->ci->db = null;
		// 	$this->ci->load->database($db['vesuvio'], TRUE);
		// }

		if (!in_array($_SERVER['PATH_INFO'], $this->libres)) {
			$headers = $this->ci->input->request_headers();
			$response = ['mensaje' => '¡Acceso no autorizado!', 'valido' => false];
			$continuar = true;
			if (array_key_exists('Authorization', $headers)) {
				$token = $headers['Authorization'];
				try {
					$data = AUTHORIZATION::validateToken($token);
					if ($data === false) {
						$continuar = false;
					} else {
						$now = new DateTime(date('Y-m-d H:i:s'));
						$hasta = new DateTime($data->hasta);

						if ($now->format('Y-m-d H:i:s') > $hasta->format('Y-m-d H:i:s')) {
							$response['mensaje'] = 'El token ya se venció. Debe loggearse de nuevo, por favor.';
							$continuar = false;
						} else {
							$datosDb = $this->ci->Catalogo_model->getCredenciales(['dominio' => $data->dominio]);
							$conn = [
								'host' => $datosDb->db_hostname,
								'user' => $datosDb->db_username,
								'password' => $datosDb->db_password,
								'database' => $datosDb->db_database
							];
							$db = conexion_db($conn);
							$this->ci->db = $this->ci->load->database($db, true);
						}
					}
				} catch (Exception $e) {
					$continuar = false;
				}
			} else {
				$continuar = false;
			}

			if (!$continuar) {
				header('Content-type: application/json');
				echo json_encode($response);
				exit();
			}
		}
	}

	public function headers()
	{
		header('Cache-Control: no-cache, no-store, max-age=0');
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
		header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
		header('Allow: GET, POST, OPTIONS, PUT, DELETE');
	}
}
