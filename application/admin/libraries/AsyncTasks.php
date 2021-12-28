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

    private function run_get_task($endpoint) {
        $fp = fsockopen($_SERVER['HTTP_HOST'], 80, $errno, $errstr, 30);

        $carpeta = 'api';
        if (in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1'])) {
			$carpeta = 'resttouch';
		}

        if ($fp) {
            $out = "GET /{$carpeta}/{$endpoint} HTTP/1.1\r\n";
            $out .= "Host: {$_SERVER['HTTP_HOST']}\r\n";
            $out .= "Authorization: {$this->token}\r\n";
            $out .= "Connection: Close\r\n\r\n";
            fwrite($fp, $out);
            fclose($fp);
        }
    }

    public function actualizar_existencias_articulo($articulo)
    {
        $endpoint = "index.php/mante/articulo/actualiza_existencia_articulo/{$articulo}?async=1";
        $this->run_get_task($endpoint);
    }

    public function guardar_receta_en_comanda($id_comanda, $detalle_comanda_id, $id_articulo)
    {
        $endpoint = "restaurante.php/comanda/guardar_receta_en_comanda/{$id_comanda}/{$detalle_comanda_id}/{$id_articulo}";
        $this->run_get_task($endpoint);
    }

    public function actualiza_cantidad_hijos($id_detalle_comanda, $regresa_inventario)
    {
        $endpoint = "restaurante.php/comanda/actualiza_cantidad_hijos/{$id_detalle_comanda}/{$regresa_inventario}";
        $this->run_get_task($endpoint);        
    }
}
