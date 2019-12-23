<?php
defined('BASEPATH') OR exit('No direct script access allowed');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Allow: GET, POST, OPTIONS, PUT, DELETE');

class Catalogo extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		//$this->datos = [];
		$this->load->model("Catalogo_model");

		$this->output
		->set_content_type("application/json", "UTF-8");
	}

	public function index()
	{
		die("Forbidden");
	}

	public function get_forma_pago()
	{
		$this->output
		->set_output(json_encode([
			"forma_pago" => $this->Catalogo_model->getFormaPago($_GET)
		]));
	}

	public function get_serie_factura()
	{
		$this->output
		->set_output(json_encode([
			"serie_factura" => $this->Catalogo_model->getSerieFactura($_GET)
		]));
	}

}

/* End of file Catalogo.php */
/* Location: ./application/admin/controllers/Catalogo.php */