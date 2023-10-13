<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tipo_movimiento extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model('Tipo_movimiento_model');
        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function guardar($id = '')
    {
        $tipoMovimiento = new Tipo_movimiento_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {

            $fltr = [
                'TRIM(UPPER(descripcion))' => trim(strtoupper($req['descripcion'])),
                'ingreso' => $req['ingreso'],
                'egreso' => $req['egreso'],
                'requisicion' => $req['requisicion']
            ];
            if (!empty($id)) {
                $fltr['tipo_movimiento <>'] = $id;
            }

            $existe = $this->Tipo_movimiento_model->buscar($fltr);
            if (!$existe) {
                $datos['exito'] = $tipoMovimiento->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                    $datos['tipo_movimiento'] = $tipoMovimiento;
                } else {
                    $datos['mensaje'] = $tipoMovimiento->getMensaje();
                }
            } else {
                $datos['mensaje'] = 'Ya existe ese tipo de movimiento.';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }

    public function buscar()
    {
        $datos = $this->Tipo_movimiento_model->buscar($_GET);
        $datos = ordenar_array_objetos($datos, 'descripcion');
        $this->output->set_output(json_encode($datos));
    }
}
