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

	public function get_error_messages()
	{
		if ($this->_debug_msg && is_array($this->_debug_msg) && count($this->_debug_msg) > 0) {
			return join('. ', $this->_debug_msg);
		}
		return '';
	}	

}

/* End of file Mail.php */
/* Location: ./application/admin/libraries/Mail.php */
