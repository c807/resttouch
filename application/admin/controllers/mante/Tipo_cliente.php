<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tipo_cliente extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Tipo_cliente_model');

        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function guardar($id = "")
    {
        $tipoCliente = new Tipo_cliente_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {

            $fltr = ['TRIM(UPPER(descripcion))' => trim(strtoupper($req['descripcion']))];
            if (!empty($id)) {
                $fltr['tipo_cliente <>'] = $id;
            }

            $existe = $this->Tipo_cliente_model->buscar($fltr);
            if (!$existe) {
                $datos['exito'] = $tipoCliente->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = "Datos actualizados con éxito.";
                    $datos['tipo_cliente'] = $tipoCliente;
                } else {
                    $datos['mensaje'] = $tipoCliente->getMensaje();
                }
            } else {
                $datos['mensaje'] = "Ya existe ese tipo de cliente.";
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }

        $this->output->set_output(json_encode($datos));
    }

    public function buscar()
    {
        $datos = $this->Tipo_cliente_model->buscar($_GET);
        $datos = ordenar_array_objetos($datos, 'descripcion');
        $this->output->set_output(json_encode($datos));
    }
}

/* End of file Area.php */
/* Location: ./application/admin/controllers/mante/Area.php */