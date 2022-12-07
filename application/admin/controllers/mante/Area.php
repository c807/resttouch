<?php
defined('BASEPATH') or exit('No direct script access allowed');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Allow: GET, POST, OPTIONS, PUT, DELETE');

class Area extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model('Area_model');

		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);

		$this->output->set_content_type("application/json", "UTF-8");
	}

	public function guardar($id = "")
	{
		$mesa = new Area_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$fltr = [
				'TRIM(UPPER(nombre))' => trim(strtoupper($req['nombre'])),
				'sede' => $this->data->sede
			];

			if (!empty($id)) {
				$fltr['area <>'] = $id;
			}
						
			$existe = $this->Area_model->buscar($fltr);
			if (!$existe) {
				
				if(!isset($req['escallcenter']) || empty($req['escallcenter'])) {
					$req['escallcenter'] = 0;
				}

				$datos['exito'] = $mesa->guardar($req);
	
				if ($datos['exito']) {
					$datos['mensaje'] = "Datos actualizados con éxito.";
					$datos['area'] = $mesa;
				} else {
					$datos['mensaje'] = $mesa->getMensaje();
				}
			} else {
				$datos['mensaje'] = "Ya hay un área con ese nombre.";				
			}
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}

		$this->output
			->set_output(json_encode($datos));
	}

	public function get_areas()
	{
		$this->load->model('Mesa_model');
		$_GET['sede'] = $this->data->sede;

		// Esto es para ver solo mesas disponibles
		$verDeBaja = false;
		if (isset($_GET['debaja'])) {
			$verDeBaja = (int)$_GET['debaja'] === 1 ? true : false;
			unset($_GET['debaja']);
		}
		// Fin de lo que es para ver solo mesas disponibles

		$areas = $this->Area_model->buscar($_GET);
		$datos = [];

		if (is_array($areas)) {
			foreach ($areas as $row) {
				$area = new Area_model($row->area);
				$row->mesas = $area->get_mesas($verDeBaja);
				$datos[] = $row;
			}
		} else {
			$area = new Area_model($areas->area);
			$areas->mesas = $area->get_mesas($verDeBaja);
			$datos[] = $areas;
		}

		$this->output
			->set_content_type("application/json")
			->set_output(json_encode($datos));
	}

	public function get_mesas_disponibles()
	{
		$soloDispoibles = isset($_GET['solo_disponibles']) ? (int)$_GET['solo_disponibles'] : 0;
		$fltrHabitacion = isset($_GET['eshabitacion']) ? (int)$_GET['eshabitacion'] : null;
		$solo_ocupadas = isset($_GET['solo_ocupadas']) ? (int)$_GET['solo_ocupadas'] : 0;

		$this->load->model('Mesa_model');		
		$mesas = $this->Mesa_model->getDisponibles($this->data->sede, ($soloDispoibles === 1), $fltrHabitacion, ($solo_ocupadas === 1));
		foreach($mesas as $mesa) {
			$mesa->area = new Area_model($mesa->area);
		}
		$this->output->set_content_type("application/json")->set_output(json_encode($mesas));
	}
}

/* End of file Area.php */
/* Location: ./application/admin/controllers/mante/Area.php */