<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mail extends CI_Email
{
	public $protocol    = "smtp";
	//public $smtp_host   = "ftp.consolidados807.com";
	public $smtp_host   = "192.168.168.9";
	public $smtp_user   = "aponce@consolidados807.com";
	public $smtp_pass   = "conso807";
	public $mailtype    = "html";
	public $alt_message = "Para ver este mensaje, por favor utilice un lector compatible con HTML.";
	public $plantilla   = 1;

	public function __construct()
	{
        parent::__construct();
	}

	

}

/* End of file Mail.php */
/* Location: ./application/admin/libraries/Mail.php */
