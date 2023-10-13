<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Presentacion extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Presentacion_model', 'Umedida_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
	}

	public function guardar($id = '')
	{
		$presentacion = new Presentacion_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$existe = $this->Presentacion_model->buscar_presentaciones(['descripcion' => $req['descripcion']]);
			if (!$existe || !empty($id)) {

				if ((int)$req['debaja'] === 1) {
					$req['fechabaja'] = date('Y-m-d H:i:s');
					$req['usuariobaja'] = $this->data->idusuario;
				}

				$datos['exito'] = $presentacion->guardar($req);

				if ($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['presentacion'] = $presentacion;
				} else {
					$datos['mensaje'] = $presentacion->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Ya hay una presentación con ese nombre.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$listaMedidas = $this->Umedida_model->get_lista_medidas();
		$tmp = $this->Presentacion_model->buscar_presentaciones($_GET);
		$datos = [];
		if (is_array($tmp)) {
			foreach ($tmp as $row) {
				$row->medida = $listaMedidas[(int)$row->medida];
				$datos[] = $row;
			}
			$datos = ordenar_array_objetos($datos, 'descripcion');
		} else if ($tmp) {
			$tmp->medida = $listaMedidas[(int)$tmp->medida];
			$datos[] = $tmp;
		}
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}
}

/* End of file Presentacion.php */
/* Location: ./application/admin/controllers/mante/Presentacion.php */