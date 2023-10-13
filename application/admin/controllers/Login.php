<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Login extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		//Do your magic here
	}

	public function index()
	{
		$this->load->view('login');
	}
}

/* End of file Login.php */
/* Location: ./application/admin/controllers/Login.php */