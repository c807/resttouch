<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tipo_usuario extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Tipo_usuario_model', 'Tipo_usuario_cgrupo_model', 'Cgrupo_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	private function chkExiste($descripcion)
	{
		$tu = $this->Tipo_usuario_model->buscar(['TRIM(UPPER(descripcion))' =>  trim(strtoupper($descripcion))]);
		return $tu ? true : false;
	}

	public function guardar($id = '')
	{
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			$datos          = json_decode(file_get_contents('php://input'), true);
			$tusuario       = new Tipo_usuario_model($id);

			if (!$this->chkExiste($datos['descripcion'])) {
				$datos['exito'] = $tusuario->guardar($datos);

				if ($datos['exito']) {
					$datos['mensaje']   = 'Datos actualizados con éxito.';
					$datos['categoria'] = $tusuario;
				} else {
					$datos['mensaje'] = $tusuario->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Este tipo de empleado ya existe.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		//$datos = $this->Tipo_usuario_model->buscar($_GET);
		$datos = [];
		$tmp = $this->Tipo_usuario_model->buscar($_GET);

		if (is_array($tmp)) {
			foreach ($tmp as $row) {
				$tuser = new Tipo_usuario_model($row->usuario_tipo);
				$row->jerarquia = $tuser->getJerarquia();
				$datos[] = $row;
			}
			$datos = ordenar_array_objetos($datos, 'descripcion');
		} else if (is_object($tmp)) {
			$tuser = new Tipo_usuario_model($tmp->usuario_tipo);
			$tmp->jerarquia = $tuser->getJerarquia();
			$datos = $tmp;
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function guardar_cgrupo($id = '')
	{
		$datos = ['exito' => false];

		if ($this->input->method() == 'post') {
			$datos = json_decode(file_get_contents('php://input'), true);
			$tucg = new Tipo_usuario_cgrupo_model($id);
			$datos['exito'] = $tucg->guardar($datos);;

			if ($datos['exito']) {
				$datos['mensaje']   = 'Datos actualizados con éxito.';
				$datos['tipo_usuario_cgrupo'] = $tucg;
			} else {
				$datos['mensaje'] = $tucg->getMensaje();
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function buscar_cgrupo()
	{
		//$datos = $this->Tipo_usuario_model->buscar($_GET);
		$datos = [];
		$tmp = $this->Tipo_usuario_cgrupo_model->buscar($_GET);

		if (is_array($tmp)) {
			foreach ($tmp as $row) {
				$tuser = new Tipo_usuario_model($row->usuario_tipo);
				$tuser->jerarquia = $tuser->getJerarquia();
				$row->usuario_tipo = $tuser;

				$cg = new Cgrupo_model($row->categoria_grupo);
				$row->categoria_grupo = $cg;

				$datos[] = $row;
			}
		} else if (is_object($tmp)) {
			$tuser = new Tipo_usuario_model($tmp->usuario_tipo);
			$tuser->jerarquia = $tuser->getJerarquia();
			$tmp->usuario_tipo = $tuser;

			$cg = new Cgrupo_model($tmp->categoria_grupo);
			$tmp->categoria_grupo = $cg;

			$datos = $tmp;
		}

		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}
}

/* End of file Tipo_usuario.php */
/* Location: ./application/admin/controllers/mante/Tipo_usuario.php */