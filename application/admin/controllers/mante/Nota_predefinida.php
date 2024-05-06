<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Nota_predefinida extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Nota_predefinida_model', 'Categoria_grupo_nota_predefinida_model']);
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function guardar($id = '')
	{
		$nota = new Nota_predefinida_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			$datos['exito'] = $nota->guardar($req);
			if ($datos['exito']) {
				$datos['mensaje'] = 'Datos actualizados con éxito.';
				$datos['nota_predefinida'] = $nota;
			} else {
				$datos['mensaje'] = $nota->getMensaje();
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Nota_predefinida_model->buscar($_GET);
		$datos = ordenar_array_objetos($datos, 'nota');
		$this->output->set_output(json_encode($datos));
	}

	public function get_categorias()
	{
		$datos = $this->Categoria_grupo_nota_predefinida_model->buscar($_GET);

		$this->output->set_output(json_encode($datos));
	}

	public function set_categorias()
	{
		$req = json_decode(file_get_contents('php://input'));

		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			if ($req->nota && isset($req->grupos)) {
				$notaPre = new Nota_predefinida_model($req->nota);

				$actuales = $notaPre->getGrupos();


				if ($actuales) {
					$this->Categoria_grupo_nota_predefinida_model->eliminarNota($notaPre->getPK());
				}


				if ($notaPre) {

					foreach ($req->grupos as $grupo) {
						$tmp = new Categoria_grupo_nota_predefinida_model();
						$tmp->categoria_grupo = $grupo;
						$tmp->nota_predefinida = $notaPre->getPK();
						$tmp->guardar();
					}

					$datos['exito'] = true;
					$datos['mensaje'] = "Subcategorias asignadas correctamente";

				} else {
					$datos['mensaje'] = 'La nota no existe, no puede continuar';
				}
			} else {
				$datos['mensaje'] = 'Datos incompletos';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos';
		}
		$this->output->set_output(json_encode($datos));	
	}
}

/* End of file Nota.php */
/* Location: ./application/admin/controllers/mante/Nota.php */