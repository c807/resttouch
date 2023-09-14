<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Certificador extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Certificador_fel_model',
			'Certificador_configuracion_model'
		]);
        $this->output
		->set_content_type("application/json", "UTF-8");
	}

	function guardar_configuracion($id = "")
	{
		$config = new Certificador_configuracion_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			
			$datos['exito'] = $config->guardar($req);
			if($datos['exito']) {

				if (!empty($id)) {
					$config->actualizarCertificadores();
				}
				
				$datos['mensaje'] = "Datos actualizados con éxito.";
				$datos['configuracion'] = $this->Certificador_configuracion_model->buscar([
					"certificador_configuracion" => $config->getPK(),
					"_uno" => true
				]);
			} else {
				$datos['mensaje'] = implode(", ", $config->getMensaje());
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	function guardar_certificador($conf, $id = "")
	{
		$config = new Certificador_configuracion_model($conf);
		$cert = new Certificador_fel_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {

			$req['nombre'] = $config->nombre;
			$req['vinculo_factura'] = $config->vinculo_factura;
			$req['vinculo_firma'] = $config->vinculo_firma;
			$req['metodo_factura'] = $config->metodo_factura;
			$req['vinculo_anulacion'] = $config->vinculo_anulacion;
			$req['metodo_anulacion'] = $config->metodo_anulacion;
			$req['vinculo_grafo'] = $config->vinculo_grafo;
			$req['metodo_grafo'] = $config->metodo_grafo;
			$req['certificador_configuracion'] = $conf;

			$datos['exito'] = $cert->guardar($req);
			if($datos['exito']) {
				$datos['mensaje'] = "Datos actualizados con éxito.";
				$datos['certificador'] = $this->Certificador_fel_model->buscar([
					"certificador_fel" => $cert->getPK(),
					"_uno" => true
				]);
			} else {
				$datos['mensaje'] = implode(", ", $cert->getMensaje());
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	function get_configuracion()
	{
		$datos = $this->Certificador_configuracion_model->buscar($_GET);

		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($datos));
	}

	function get_certificador()
	{
		$datos = $this->Certificador_fel_model->buscar($_GET);

		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($datos));
	}

}

/* End of file Certificador.php */
/* Location: ./application/admin/controllers/mante/Certificador.php */