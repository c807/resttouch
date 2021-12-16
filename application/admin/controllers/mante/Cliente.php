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
			try {
				$soapClient = new SoapClient('https://www.ingface.net/ServiciosIngface/ingfaceWsServices?wsdl');
				$resultado = $soapClient->nitContribuyentes(['usuario' => 'DEMO', 'clave' => 'C2FDC80789AFAF22C372965901B16DF533A4FCB19FD9F2FD5CBDA554032983B0', 'nit' => $nit]);
				if (!strpos($resultado->return->nombre, 'no valido')) {
					$datos['contribuyente'] = [
						'nombre' => $this->prettyNombreContribuyente($resultado->return->nombre),
						// 'direccion' => trim($resultado->return->direccion_completa)
						'direccion' => 'Ciudad'
					];
					$datos['exito'] = true;
					$datos['mensaje'] = 'Contribuyente encontrado.';
				} else {
					$datos['mensaje'] = 'N.I.T. no válido.';
				}
			} catch(Exception $e) {
				$datos['exito'] = false;
				$datos['mensaje'] = 'El servicio ha sido deshabilitado por INFILE. ('.$e->getMessage().')';
			}
		}
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

}

/* End of file Cliente.php */
/* Location: ./application/admin/controllers/mante/Cliente.php */
