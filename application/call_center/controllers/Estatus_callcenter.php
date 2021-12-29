<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Estatus_callcenter extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Estatus_callcenter_model'
        ]);

        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $this->data = new stdClass();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function buscar()
    {
        $datos = $this->Estatus_callcenter_model->buscar($_GET);
        $datos = ordenar_array_objetos($datos, 'orden', 1);
        $this->output->set_output(json_encode($datos));
    }

    public function guardar($id = '')
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $estatus = new Estatus_callcenter_model($id);
            $req = json_decode(file_get_contents('php://input'), true);
            $existe = $this->Estatus_callcenter_model->buscar(['UPPER(TRIM(descripcion))' => strtoupper(trim($req['descripcion'])), '_uno' => true]);
            if (!$existe) {
                $datos['exito'] = $estatus->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = "Datos actualizados con éxito.";
                    $datos['estatus_callcenter'] = $estatus;
                } else {
                    $datos['mensaje'] = $estatus->getMensaje();
                }
            } else {
                $datos['mensaje'] = "'{$req['descripcion']}' ya existe en el listado.";
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }
}
