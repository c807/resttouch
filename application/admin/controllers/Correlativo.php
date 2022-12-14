<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Correlativo extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model(['Correlativo_model']);
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function get_correlativo()
    {
        $datos = $this->Correlativo_model->get_correlativo($_GET);
        $this->output->set_output(json_encode($datos));
    }
}
