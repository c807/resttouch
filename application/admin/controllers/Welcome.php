<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Welcome extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model('Config_model');
	}

	public function guardar_tipo_usuario()
	{
		$this->Config_model->guardar_tipo_usuario();
	}

	public function guardar_jerarquia()
	{
		$this->Config_model->guardar_jerarquia();
	}
}
