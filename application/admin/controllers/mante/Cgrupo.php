<?php
defined('BASEPATH') or exit('No direct script access allowed');

/*
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Allow: GET, POST, OPTIONS, PUT, DELETE');
*/

class Cgrupo extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model(['Cgrupo_model', 'Catalogo_model', 'Categoria_model', 'Impresora_model']);

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);

		$this->output->set_content_type("application/json", "UTF-8");
	}


	public function guardar($id = "")
	{
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			$cat = new Cgrupo_model($id);
			$continuar = true;

			if ((int)$id > 0 && (int)$req['categoria_grupo_grupo'] > 0) {
				$padre = new Cgrupo_model($req['categoria_grupo_grupo']);
				if ((int)$id === (int)$padre->categoria_grupo_grupo)
				{
					$continuar = false;
					$datos['mensaje'] = 'No puede anidar subcategorías de forma cíclica.';
				}
			}

			if ($continuar) 
			{
				$datos['exito'] = $cat->guardar($req);
	
				if ($datos['exito']) {
					$datos['mensaje'] = "Datos actualizados con éxito.";
					$datos['categoria'] = $cat;
				} else {
					$datos['mensaje'] = $cat->getMensaje();
				}
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = [];
		if (count($_GET) == 0) {
			$_GET['categoria_grupo_grupo'] = null;
		}
		
		if (!isset($_GET['_activos'])) { $_GET['debaja'] = 0; }

		$tmp = $this->Cgrupo_model->buscar($_GET);

		if (is_array($tmp)) {
			foreach ($tmp as $row) {
				if (!isset($_GET['_sede'])) {
					$datos[] = $this->Catalogo_model->getCategoriaGrupo([
						"categoria_grupo" => $row->categoria_grupo,
						"raiz" => true,
						"_uno" => true
					]);
				} else {
					$cat = new Categoria_model($row->categoria);
					if ((int)$this->data->sede === (int)$cat->sede) {
						$datos[] = $this->Catalogo_model->getCategoriaGrupo([
							"categoria_grupo" => $row->categoria_grupo,
							"raiz" => true,
							"_uno" => true
						]);
					}
				}
			}
			$datos = ordenar_array_objetos($datos, 'descripcion');
		} else if (is_object($tmp)) {
			if (!isset($_GET['_sede'])) {
				$datos[] = $this->Catalogo_model->getCategoriaGrupo([
					"categoria_grupo" => $tmp->categoria_grupo,
					"raiz" => true,
					"_uno" => true
				]);
			} else {
				$cat = new Categoria_model($tmp->categoria);
				if ((int)$this->data->sede === (int)$cat->sede) {
					$datos[] = $this->Catalogo_model->getCategoriaGrupo([
						"categoria_grupo" => $tmp->categoria_grupo,
						"raiz" => true,
						"_uno" => true
					]);
				}
			}
		}

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($datos));
	}

	public function get_categoria_grupo()
	{
		if (!isset($_GET['categoria_grupo_grupo'])) { $_GET['categoria_grupo_grupo'] = null; }
		if (!isset($_GET['_activos'])) { $_GET['debaja'] = 0; }

		$datos = $this->Cgrupo_model->buscar($_GET);

		usort($datos, function ($a, $b) {
			return strcmp($a->descripcion, $b->descripcion);
		});

		foreach ($datos as $cg) {
			$cg->impresora = new Impresora_model($cg->impresora);
		}

		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}

	public function dar_de_baja($id)
	{
		$datos = new stdClass();
		$datos->exito = false;

		$cgrupo = new Cgrupo_model($id);
		$cgrupo->debaja = 1;
		$cgrupo->usuariobaja = $this->data->idusuario;
		$cgrupo->fechabaja = date('Y-m-d');
		$datos->exito = $cgrupo->guardar();

		if ($datos->exito)
		{
			$cgrupo->dar_de_baja_articulos($this->data->idusuario);
			$datos->mensaje = 'Subcategoría dada de baja con éxito.';
		} else {
			$datos->mensaje = $cgrupo->getMensaje();
		}

		
		$datos->subcategoria = $cgrupo;
		
		$this->output->set_output(json_encode($datos));
	}

	public function simple_search()
	{
		$datos = $this->Cgrupo_model->get_simple_list($_GET);
		$this->output->set_content_type("application/json")->set_output(json_encode($datos));
	}


}

/* End of file Cgrupo.php */
/* Location: ./application/admin/controllers/mante/Cgrupo.php */