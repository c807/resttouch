<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Api_gk extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Catalogo_model',
            'Orden_gk_model'
        ]);
        $this->output->set_content_type("application/json", "UTF-8");
    }

    private function setDatosDB($llave)
    {
        $datosDb = $this->Catalogo_model->getCredenciales(['llave' => $llave]);

        $conn = [
            'host' => $datosDb->db_hostname,
            'user' => $datosDb->db_username,
            'password' => $datosDb->db_password,
            'database' => $datosDb->db_database
        ];

        $db = conexion_db($conn);
        $this->db = $this->load->database($db, true);
    }

    private function get_origen_orden($host)
    {
        $comanda_origen = null;
        $origenes = $this->Catalogo_model->getComandaOrigen();
        foreach($origenes as $origen) {
            $pos = strpos(strtoupper(trim($host)), strtoupper(trim($origen->descripcion)));
            if( $pos === false ) {
                continue;
            } else {
                $comanda_origen = $origen;
                break;
            }
        }
        return $comanda_origen;
    }

    public function orden()
    {
        $datos = new stdClass();
        $datos->exito = false;

        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'));
            if (isset($req->llave)) {
                $this->setDatosDB($req->llave);
                $corporacion = $this->Catalogo_model->getCorporacion(['admin_llave' => $req->llave, '_uno' => true]);
                if($corporacion) {
                    $origen = $this->get_origen_orden($req->host);
                    if ($origen) {
                        $ruta = $this->Catalogo_model->getDetalleConfigComandaOrigen([
                            'configuracion_comanda_origen' => 1,
                            'comanda_origen' => $origen->comanda_origen,
                            '_uno' => true
                        ]);    
                        if($ruta) {
                            $ordengk = new Orden_gk_model();
                            $ordengk->corporacion = $corporacion->corporacion;
                            $ordengk->protocolo = $req->protocolo;
                            $ordengk->host = $req->host;
                            $ordengk->ip = $req->ip;
                            $ordengk->url_original = $req->url_original;
                            $ordengk->encabezados = $req->encabezados;
                            $ordengk->comanda_origen = $origen->comanda_origen;
                            $ordengk->numero_orden = get_dato_from_object($req->orden, $ruta->ruta);
                            $ordengk->raw_orden = json_encode($req->orden);
                            $ordenrt = $ordengk->get_orden_rt();
                            if ($ordenrt) {
                                $ordengk->estatus_orden_gk = $ordenrt->completa ? 1 : 3;
                                $ordengk->orden_rt = json_encode($ordenrt);
                            }
                            $datos->exito = $ordengk->guardar();
                            if ($datos->exito)
                            {
                                $datos->mensaje = 'Orden guardada con éxito.';
                                $datos->orden = $ordengk;
                            } else {
                                $datos->mensaje = $ordengk->getMensaje();
                            }
                        } else {
                            $datos->mensaje = 'No existe configuración de ruta para número de orden.';
                        }
                    } else {
                        $datos->mensaje = "No existe el origen ({$req->host}) de la orden.";
                    }                    
                } else {
                    $datos->mensaje = 'La llave no es válida.';
                }
            } else {
                $datos->mensaje = 'La llave no es válida o no fue enviada.';
            }
        } else {
            $datos->mensaje = 'El método de llamada no es válido.';
        }
        $this->output->set_output(json_encode($datos));
    }
}
