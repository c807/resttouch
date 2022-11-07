<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Propina extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model("Propina_model");
        $this->output
		->set_content_type("application/json", "UTF-8");

		$this->load->helper(['jwt', 'authorization']);

		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	public function guardar($id = null)
	{
		$prop = new Propina_model($id);
		$req = json_decode(file_get_contents("php://input"), true);
		$datos = ["exito" => false];
		if ($this->input->method() == "post") {
			$req['sede'] = $this->data->sede;
			$req["anulado"] = empty($req["anulado"]) ? 0 : $req["anulado"];
			$datos["exito"] = $prop->guardar($req);

			if($datos["exito"]) {
				$datos["propina"] = $prop->buscar([
					"propina_distribucion" => $prop->getPK(), 
					"_uno" => true
				]);

				$datos["mensaje"] = "Datos Actualizados con Exito";
			} else {
				$datos["mensaje"] = $prop->getMensaje();
			}	
		} else {
			$datos["mensaje"] = "Parametros Invalidos";
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{	
		$_GET['anulado'] = 0;

		if (!isset($_GET['sede'])) {
			$_GET['sede'] = $this->data->sede;
		}

		$tmp = $this->Propina_model->buscar($_GET);

		$datos = [];
		if(is_array($tmp)) {
			foreach ($tmp as $row) {
				$pres = new Propina_model($row->propina_distribucion);
				$row->usuario_tipo = $pres->getUsuario();
				$datos[] = $row;
			}
		} else if($tmp){
			$pres = new Propina_model($tmp->propina_distribucion);
			$tmp->usuario_tipo = $pres->getUsuario();
			$datos[] = $tmp;
		}

		$this->output
		->set_output(json_encode($datos));
	}

}

/* End of file Propina.php */
/* Location: ./application/admin/controllers/mante/Propina.php */