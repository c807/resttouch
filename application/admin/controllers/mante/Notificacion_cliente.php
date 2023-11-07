<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Notificacion_cliente extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model(['Notificacion_cliente_model', 'Cliente_rt_corporacion_model']);
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function guardar($id = '')
    {
        $notiCliente = new Notificacion_cliente_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {

            $datos['exito'] = $notiCliente->guardar($req);

            if ($datos['exito']) {
                $datos['mensaje'] = 'Datos actualizados con éxito.';
                $datos['notificacion_cliente'] = $notiCliente;
            } else {
                $datos['mensaje'] = $notiCliente->getMensaje();
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }

    public function buscar()
    {
        $datos = $this->Notificacion_cliente_model->buscar($_GET);
        $this->output->set_content_type('application/json')->set_output(json_encode($datos));
    }

    public function get_lista_clientes()
    {
        $datos = $this->Notificacion_cliente_model->get_lista_clientes();
        $this->output->set_content_type('application/json')->set_output(json_encode($datos));
    }

    public function toggle_bloqueo_cliente($id)
    {
        $datos = ['exito' => false];
        if ($id && (int)$id > 0) {
            $clirt = new Cliente_rt_corporacion_model($id);
            $datos['exito'] = $clirt->guardar(['bloqueado' => (int)$clirt->bloqueado === 0 ? 1 : 0]);
            if ($datos['exito']) {
                $datos['mensaje'] = 'Datos actualizados con éxito.';
                $datos['bloqueado'] = (int)$clirt->bloqueado;
            } else {
                $datos['mensaje'] = $clirt->getMensaje();
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }
}

/* End of file Conocimiento.php */
/* Location: ./application/admin/controllers/mante/Conocimiento.php */