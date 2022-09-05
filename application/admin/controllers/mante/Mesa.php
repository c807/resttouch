<?php
defined('BASEPATH') OR exit('No direct script access allowed');

// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Headers: Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
// header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
// header('Allow: GET, POST, OPTIONS, PUT, DELETE');

class Mesa extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model(['Mesa_model', 'Bitacora_model', 'Area_model', 'Sede_model', 'Usuario_model', 'Accion_model']);

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->tokenData = AUTHORIZATION::validateToken($headers['Authorization']);
		}
        $this->output->set_content_type("application/json", "UTF-8");
	}

	public function guardar($id = "") 
	{
		$mesa = new Mesa_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {

			$datos['exito'] = $mesa->guardar($req);

			if($datos['exito']) {
				$datos['mensaje'] = "Datos actualizados con éxito.";
				$datos['mesa'] = $mesa;
			} else {
				$datos['mensaje'] = $mesa->getMensaje();
			}	
		} else {
			$datos['mensaje'] = "Parámetros inválidos.";
		}		
		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$datos = $this->Mesa_model->buscar($_GET);
		if (isset($_GET['_fulldata']) && (int)$_GET['_fulldata'] === 1) {
			foreach ($datos as $dato) {
				$dato->area = $this->Area_model->buscar(['area' => $dato->area, '_uno' => true]);
				$dato->ordenar_por = $dato->area->nombre.'-'.($dato->etiqueta ?? $dato->numero);
			}
			$datos = ordenar_array_objetos($datos, 'ordenar_por');
		}
		$this->output->set_output(json_encode($datos));
	}

	public function liberar_mesa($id)
	{
		$mesa = new Mesa_model($id);
		$datos = ['exito' => false];
		if((int)$mesa->estatus === 2) {
			$datos = $mesa->liberar_mesa();
			if($datos['exito']) {
				$usr = new Usuario_model($this->tokenData->idusuario);
				$bit = new Bitacora_model();
				$acc = $this->Accion_model->buscar(['descripcion' => 'Modificacion', '_uno' => true]);

				$area = new Area_model($mesa->area);
				$sede = new Sede_model($area->sede);
				
				$lblMesa = $mesa->etiqueta ?? $mesa->numero;
				$comentario = "El usuario {$usr->nombres} {$usr->apellidos} liberó la mesa '{$lblMesa}' del área '{$area->nombre}' de la sede '{$sede->nombre} ($sede->alias)'.";

				if (isset($datos['comandas_relacionadas']) && strlen(trim($datos['comandas_relacionadas'])) > 0) {
					$ese = (int)$datos['comandas_cerradas'] <= 1 ? '' : 's';
					$comentario.= " Se forzó el cierre de la{$ese} comanda{$ese} {$datos['comandas_relacionadas']}.";
				}

				$bit->guardar([
					"accion" => $acc->accion,
					"usuario" => $this->tokenData->idusuario,
					"tabla" => 'mesa',
					"registro" => $mesa->getPK(),
					"comentario" => $comentario
				]);

				$datos['mensaje'] = 'La mesa fue liberada exitosamente.';
			}
		} else {
			$datos['mensaje'] = 'La mesa ya está disponible, por favor revisar.';
		}
		$this->output->set_output(json_encode($datos));
	}

}

/* End of file Mesa.php */
/* Location: ./application/admin/controllers/mante/Mesa.php */