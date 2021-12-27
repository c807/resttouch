<?php

class AsyncTasks
{
    protected $CI;
    private $token;

    public function __construct()
    {        
        $this->CI = &get_instance();        

        $this->CI->load->helper(['jwt', 'authorization']);
		$headers = $this->CI->input->request_headers();
		$this->token = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    }

    public function actualizar_existencias_articulo($articulo)
    {
        $fp = fsockopen($_SERVER['HTTP_HOST'], 80, $errno, $errstr, 30);
        if ($fp) {
            $out = "GET /resttouch/index.php/mante/articulo/actualiza_existencia_articulo/{$articulo}?async=1 HTTP/1.1\r\n";
            $out .= "Host: localhost\r\n";
            $out .= "Authorization: {$this->token}\r\n";
            $out .= "Connection: Close\r\n\r\n";
            fwrite($fp, $out);
            fclose($fp);
        }
    }
}
