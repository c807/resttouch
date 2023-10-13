<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Documento extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Documento_model', 'Documento_tipo_model', 'Tipo_compra_venta_model', 'Ingreso_model', 'Webhook_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function getForeignData($doc)
	{
		$doc->ingreso = new Ingreso_model($doc->ingreso);
		$doc->documento_tipo = new Documento_tipo_model($doc->documento_tipo);
		$doc->tipo_compra_venta = new Tipo_compra_venta_model($doc->tipo_compra_venta);
		return $doc;
	}

	public function guardar($id = '')
	{
		$doc = new Documento_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $doc->guardar($req);

			if ($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito';
				$datos['documento'] = $this->getForeignData($doc);
			} else {
				$datos['mensaje'] = $doc->getMensaje();
			}
		} else {
			$datos['mensaje'] = 'Parametros inválidos';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Documento_model->buscar($_GET);

		foreach ($datos as $dato) {
			$dato = (object)$this->getForeignData($dato);
		}

		$this->output->set_output(json_encode($datos));
	}

	public function enviar($id = null)
	{
		$datos = ['exito' => false];

		if ($id) {
			$doc = new Documento_model($id);
			$datos['data_contable'] = $doc->getDataContable($doc->documento);

			if ($datos['data_contable']) {
				if (!empty($datos['data_contable']->cuenta_contable_gasto)) {

					if (!empty($datos['data_contable']->idproveedor)) {
						$webhook = $this->Webhook_model->buscar_webhook(['evento' => 'RTEV_ENVIAR_COMPRA_CONTA', '_uno' => true]);
						if ($webhook) {
							$this->load->library('Webhook');
							if (strtolower(trim($webhook->tipo_llamada)) == 'soap') {
								$req = '';
							} else if (strtolower(trim($webhook->tipo_llamada)) == 'json') {
								$req = $datos['data_contable'];
							}

							$this->load->helper('api');
							$web = new Webhook($webhook);
							$web->setRequest($req);
							$datos['respuesta'] = json_decode($web->setEvento());

							if ((int)$datos['respuesta']->lastid > 0) {
								$datos['exito'] = true;
								$datos['mensaje'] = 'Compra enviada con éxito a contabilidad.';
								$datos['documento'] = $this->getForeignData($doc);
								unset($datos['data_contable']);
								unset($datos['respuesta']);
								$doc->guardar(['enviado' => 1]);
							} else {
								$datos['mensaje'] = 'Hubo un problema en el envío a la contabilidad.';
							}
						} else {
							$datos['mensaje'] = 'No está configurada la conexión a la contabilidad.';
						}
					} else {
						$datos['mensaje'] = 'El proveedor no tiene asignado un codigo del sistema contable. Por favor asignelo.';
					}
				} else {
					$datos['mensaje'] = 'El proveedor no tiene asignada una cuenta contable. Por favor asignela.';
				}
			} else {
				$datos['mensaje'] = 'No se encontró la información para el documento seleccionado.';
			}
		} else {
			$datos['mensaje'] = 'Parametros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}
}
