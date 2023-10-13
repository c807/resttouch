<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Seguimiento_callcenter extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model(['Seguimiento_callcenter_model', 'Cliente_master_model']);

        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        if (array_key_exists('Authorization', $headers) && !empty($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function get_pedidos()
    {
        $datos = $this->Seguimiento_callcenter_model->get_pedidos($_GET);
        $this->output->set_output(json_encode($datos));
    }

    public function test($idcomanda = '')
    {
        $datos = $this->Cliente_master_model->get_detalle_comanda_seguimiento(['comanda' => $idcomanda]);
        $this->output->set_output(json_encode($datos));
    }
}
