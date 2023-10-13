<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Repartidor extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model(['Repartidor_model']);
        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $this->data = new stdClass();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function buscar()
    {
        $datos = $this->Repartidor_model->buscar($_GET);
        $datos = ordenar_array_objetos($datos, 'nombre');
        $this->output->set_output(json_encode($datos));
    }

    public function guardar($id = '')
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $entidad = new Repartidor_model($id);
            $req = json_decode(file_get_contents('php://input'), true);
            if(!isset($req['sede'])) {
                $req['sede'] = $this->data->sede;
            }
            $existe = $this->Repartidor_model->buscar(['UPPER(TRIM(nombre))' => strtoupper(trim($req['nombre'])), 'sede' => $req['sede'], '_uno' => true]);
            if (!$existe) {
                $datos['exito'] = $entidad->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                    $datos['repartidor'] = $entidad;
                } else {
                    $datos['mensaje'] = $entidad->getMensaje();
                }
            } else {
                $datos['mensaje'] = "'{$req['nombre']}' ya existe en el listado.";
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }
}
