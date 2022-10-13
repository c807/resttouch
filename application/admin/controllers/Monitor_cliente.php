<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Monitor_cliente extends CI_Controller
{
	public $mc = null;
	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Monitor_cliente_model',			
		]);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		$this->output->set_content_type("application/json", "UTF-8");
		
		$this->mc = new Monitor_cliente_model();
	}

    public function ultimos_movimientos()
    {        
        $this->output->set_output(json_encode($this->mc->get_ultimos_movimientos()));
    }

}
