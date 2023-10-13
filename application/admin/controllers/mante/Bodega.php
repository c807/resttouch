<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Bodega extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model('Bodega_model');
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);

        $this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$bod = new Bodega_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$req['sede'] = $this->data->sede;
			if (!isset($req['merma']) || $req['merma'] == null) {
				$req['merma'] = 0;
			}

			if (isset($req['pordefecto']) && (int)$req['pordefecto'] === 1) {
				$bod->quitar_por_defecto($req['sede']);
			}

			$datos['exito'] = $bod->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['bodega'] = $bod;
			} else {
				$datos['mensaje'] = $bod->getMensaje();
			}	
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{	
		$_GET['sede'] = $this->data->sede;
		$datos = $this->Bodega_model->buscar($_GET);

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function dar_de_baja($id)
	{		
		$datos = ['exito' => false];
		if ($id && (int)$id > 0) {
			$bodega = new Bodega_model($id);

			$enUso = $bodega->checkEnUso();
			if ($enUso === '') {
				$datos['exito'] = $bodega->guardar([
					'debaja' => 1,
					'usuariodebaja' => $this->data->idusuario,
					'fechabaja' => Hoy(3)
				]);
				if ($datos['exito']) {
					$datos['mensaje'] = 'Bodega dada de baja con éxito.';
				} else {
					$datos['mensaje'] = implode(';', $bodega->getMensaje());
				}
			} else {
				$datos['mensaje'] = "Esta bodega está en uso por las subcategorías {$enUso}. No se puede dar de baja.";
			}
		}  else {
			$datos['mensaje'] = 'Parámetros inválidos';
		}
		
		$this->output->set_output(json_encode($datos));
	}

}

/* End of file Bodega.php */
/* Location: ./application/admin/controllers/mante/Bodega.php */