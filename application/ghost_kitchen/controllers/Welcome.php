<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Welcome extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
	}

	public function index()
	{
		$this->load->view('welcome_message');
	}
}
