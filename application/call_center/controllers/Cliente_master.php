<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cliente_master extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Cliente_master_model',
            'Cliente_master_nota_model',
            'Telefono_model',
            'Cliente_master_telefono_model',
            'Cliente_master_direccion_model',
            'Tipo_direccion_model',
            'Cliente_model',
            'Cliente_master_cliente_model'
        ]);

        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $this->data = new stdClass();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function buscar()
    {
        if (isset($_GET['_parecido'])) {
            $_GET['_sin_escape'] = true;
            if (isset($_GET['nombre']) && !empty(trim($_GET['nombre']))) {
                $nombre = str_replace(' ', '%', trim($_GET['nombre']));
                unset($_GET['nombre']);
                $_GET['_like']['nombre'] = $nombre;
            }
        }
        $datos = $this->Cliente_master_model->buscar($_GET);
        $datos = ordenar_array_objetos($datos, 'nombre');
        $this->output->set_output(json_encode($datos));
    }

    public function guardar($id = '')
    {
        $clt = new Cliente_master_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $datos['exito'] = $clt->guardar($req);
            if ($datos['exito']) {
                $datos['mensaje'] = "Datos actualizados con éxito.";
                $datos['cliente_master'] = $clt;
            } else {
                $datos['mensaje'] = $clt->getMensaje();
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }

    public function buscar_cliente_master_nota()
    {
        $datos = $this->Cliente_master_nota_model->buscar($_GET);
        $this->output->set_output(json_encode($datos));
    }

    public function guardar_nota($id = '')
    {
        $cltNota = new Cliente_master_nota_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $datos['exito'] = $cltNota->guardar($req);
            if ($datos['exito']) {
                $datos['mensaje'] = "Datos actualizados con éxito.";
                $datos['cliente_master_nota'] = $cltNota;
            } else {
                $datos['mensaje'] = $cltNota->getMensaje();
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }

    private function srch_telefono($args = [])
    {
        if (isset($args['_parecido'])) {
            $args['_sin_escape'] = true;
            if (isset($args['numero']) && !empty(trim($args['numero']))) {
                $args['numero'] = strtoupper(preg_replace("/[^0-9?!]/", '', $args['numero']));
                $numero = str_replace(' ', '%', trim($args['numero']));
                unset($args['numero']);
                $args['_like']['numero'] = $numero;
            }
        }
        return $this->Telefono_model->buscar($args);
    }

    public function buscar_telefono()
    {
        $this->output->set_output(json_encode($this->srch_telefono($_GET)));
    }
    public function guardar_direccion2()
    {
        $cltDir = new Cliente_master_direccion_model();
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $datos['exito'] = $cltDir->guardar($req);
            if ($datos['exito']) {
                $datos['mensaje'] = 'Datos actualizados con éxito.';
                $datos['cliente_master_direccion'] = $cltDir;
            } else {
                $datos['mensaje'] = $cltDir->getMensaje();
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }
    public function guardar_telefono()
    {
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            if (isset($req['numero'])) {
                $req['numero'] = preg_replace("/[^0-9?!]/", '', $req['numero']);
                $telefono = $this->Telefono_model->buscar(['numero' => $req['numero'], '_uno' => true]);
                if ($telefono) {
                    $req['telefono'] = $telefono->telefono;
                } else {
                    $tel = new Telefono_model();
                    $tel->guardar(['numero' => $req['numero']]);
                    $req['telefono'] = $tel->getPK();
                }
                unset($req['numero']);
            }

            $srch = $this->Cliente_master_telefono_model->buscar(['cliente_master' => $req['cliente_master'], 'telefono' => $req['telefono'], '_uno' => true]);
            if (!$srch) {
                $cmt = new Cliente_master_telefono_model();
                $datos['exito'] = $cmt->guardar([
                    'cliente_master' => $req['cliente_master'],
                    'telefono' => $req['telefono']
                ]);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Teléfono asociado al cliente con éxito.';
                } else {
                    $datos['mensaje'] = $cmt->getMensaje();
                }
            } else {
                if((int)$srch->desasociado === 1) {
                    $cmt = new Cliente_master_telefono_model($srch->cliente_master_telefono);
                    $datos['exito'] = $cmt->guardar(['desasociado' => 0]);
                    if ($datos['exito']) {
                        $datos['mensaje'] = 'Teléfono asociado al cliente con éxito.';
                    } else {
                        $datos['mensaje'] = $cmt->getMensaje();
                    }
                } else {
                    $datos['exito'] = true;
                    $datos['mensaje'] = 'Este cliente ya tiene asociado este número de teléfono.';
                }
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }

    public function buscar_telefono_cliente_master()
    {
        $this->output->set_output(json_encode($this->Cliente_master_telefono_model->get_lista_telefonos($_GET)));
    }

    public function desasociar_telefono_cliente_master($id)
    {
        $datos = ['exito' => false];
        $cmt = new Cliente_master_telefono_model($id);
        $datos['exito'] = $cmt->guardar(['desasociado' => 1]);
        if ($datos['exito']) {
            $datos['mensaje'] = 'Telefono desasociado del cliente con éxito.';
        } else {
            $datos['mensaje'] = $cmt->getMensaje();
        }
        $this->output->set_output(json_encode($datos));
    }

    private function get_direccion_completa($dir)
    {
        $dc = trim($dir->direccion1);
        if(!empty(trim($dir->direccion2))) { $dc .= ', '.trim($dir->direccion2); }
        if((int)$dir->zona > 0) { $dc .= ", zona {$dir->zona}"; }
        if(!empty(trim($dir->codigo_postal))) { $dc .= ', código postal '.trim($dir->codigo_postal); }
        if(!empty(trim($dir->municipio))) { $dc .= ', '.trim($dir->municipio); }
        if(!empty(trim($dir->departamento))) { $dc .= ', '.trim($dir->departamento); }
        if(!empty(trim($dir->pais))) { $dc .= ', '.trim($dir->pais); }
        return "{$dc}.";
    }

    public function buscar_direccion()
    {
        $datos = $this->Cliente_master_direccion_model->buscar($_GET);

        if (is_array($datos)) {
            foreach ($datos as $row) {
                $row->cliente_master = $this->Cliente_master_model->buscar(['cliente_master' => $row->cliente_master, '_uno' => true]);
                $row->tipo_direccion = $this->Tipo_direccion_model->buscar(['tipo_direccion' => $row->tipo_direccion, '_uno' => true]);
                $row->direccion_completa = $this->get_direccion_completa($row);
            }
        } else if (is_object($datos)) {
            $datos->cliente_master = $this->Cliente_master_model->buscar(['cliente_master' => $datos->cliente_master, '_uno' => true]);
            $datos->tipo_direccion = $this->Tipo_direccion_model->buscar(['tipo_direccion' => $datos->tipo_direccion, '_uno' => true]);
            $datos->direccion_completa = $this->get_direccion_completa($datos);
        }

        $this->output->set_output(json_encode($datos));
    }

    public function guardar_direccion($id = '')
    {
        $cltDir = new Cliente_master_direccion_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $datos['exito'] = $cltDir->guardar($req);
            if ($datos['exito']) {
                $datos['mensaje'] = "Datos actualizados con éxito.";
                $datos['cliente_master_direccion'] = $cltDir;
            } else {
                $datos['mensaje'] = $cltDir->getMensaje();
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }

    private function srch_datos_facturacion($args = []) {
        if (isset($args['nit']) && !empty(trim($args['nit']))) {
            $args['nit'] = strtoupper(preg_replace("/[^0-9KkCcFf?!]/", '', $args['nit']));
        }

        if (isset($args['_parecido'])) {
            $args['_sin_escape'] = true;
            if (isset($args['nit']) && !empty(trim($args['nit']))) {
                $nit = $args['nit'];
                unset($args['nit']);
                $args['_like']['nit'] = $nit;
            }
            if (isset($args['nombre']) && !empty(trim($args['nombre']))) {
                $nombre = trim(str_replace(' ', '%', trim($args['nombre'])));
                unset($args['nombre']);
                $args['_like']['nombre'] = $nombre;
            }
        }

        $datos = $this->Cliente_model->buscar($args);
        if (is_array($datos)) {
            $datos = ordenar_array_objetos($datos, 'nombre');
        }
        return $datos;
    }

    public function buscar_datos_facturacion()
    {
        $this->output->set_output(json_encode($this->srch_datos_facturacion($_GET)));
    }

    public function guardar_datos_facturacion()
    {
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            if (isset($req['nit']) && isset($req['nombre'])) {
                $cliente = $this->srch_datos_facturacion(['nit' => $req['nit'], '_uno' => true]);
                if ($cliente) {
                    $req['cliente'] = $cliente->cliente;
                } else {
                    $cli = new Cliente_model();
                    $cli->guardar([
                        'nombre' => $req['nombre'],
                        'direccion' => isset($req['direccion']) && !empty(trim($req['direccion'])) ? trim($req['direccion']) : 'Ciudad',
                        'nit' => strtoupper(preg_replace("/[^0-9KkCcFf?!]/", '', $req['nit'])),
                        'correo' => isset($req['correo']) && !empty(trim($req['correo'])) ? trim($req['correo']) : null
                    ]);
                    $req['cliente'] = $cli->getPK();
                }
            }

            $srch = $this->Cliente_master_cliente_model->buscar(['cliente_master' => $req['cliente_master'], 'cliente' => $req['cliente'], '_uno' => true]);
            if (!$srch) {
                $cmc = new Cliente_master_cliente_model();
                $datos['exito'] = $cmc->guardar([
                    'cliente_master' => $req['cliente_master'],
                    'cliente' => $req['cliente']
                ]);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Datos de facturación asociados al cliente con éxito.';
                } else {
                    $datos['mensaje'] = $cmc->getMensaje();
                }
            } else {
                $datos['exito'] = true;
                $datos['mensaje'] = 'Este cliente ya tiene asociados estos datos de facturación.';
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }
}
