<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Schema extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Schema_model',
            'Cliente_rt_model',
            'Cliente_rt_corporacion_model'
        ]);
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function test()
    {
        $datos = ['APPPATH' => APPPATH];
        $this->output->set_output(json_encode($datos));
    }

    public function buscar()
    {
        $datos = $this->Schema_model->get_schemas($_GET);
        $this->output->set_output(json_encode($datos));
    }

    public function buscar_esquemas_clientes()
    {
        $datos = $this->Cliente_rt_model->get_esquemas_clientes($_GET);
        $this->output->set_output(json_encode($datos));
    }

    public function buscar_configuracion_corporacion()
    {
        $datos = [];
        if (isset($_GET['esquema']) && !empty($_GET['esquema']) && !(strpos($_GET['esquema'], 'rt_') === false)) {
            $datos = $this->Cliente_rt_model->get_configuracion_corporacion($_GET['esquema']);
        }
        $this->output->set_output(json_encode($datos));
    }

    public function nuevo()
    {
        set_time_limit(0);
        ini_set('memory_limit', '-1');
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);

            $esquema = 'rt_' . trim(strtolower($req['esquema']));
            $existeEsquema = $this->Schema_model->get_schemas(['schema_name' => $esquema, '_uno' => true]);
            if (!$existeEsquema) {
                $dominio = trim(strtolower($req['dominio']));
                $existeDominio = $this->Cliente_rt_corporacion_model->buscar(['dominio' => $dominio, '_uno' => true]);
                if (!$existeDominio) {
                    $cliente_rt = new Cliente_rt_model();
                    $cliente_rt->nombre = $req['nombre_cliente'];
                    $cliente_rt->guardar();
                    if (!empty($cliente_rt->id)) {
                        $cc = new Cliente_rt_corporacion_model();
                        $cc->cliente_id = $cliente_rt->id;
                        $cc->llave = $cc->get_nueva_llave();
                        $cc->dominio = $dominio;
                        $defaultDbServer = $this->Schema_model->get_datos_server_db();
                        $cc->db_hostname = isset($req['db_hostname']) && !empty($req['db_hostname']) ? $req['db_hostname'] : $defaultDbServer['db_hostname'];
                        $cc->db_username = isset($req['db_username']) && !empty($req['db_username']) ? $req['db_username'] : $defaultDbServer['db_username'];
                        $cc->db_password = isset($req['db_password']) && !empty($req['db_password']) ? $req['db_password'] : $defaultDbServer['db_password'];
                        $cc->db_database = $esquema;
                        $cc->guardar();
                        if (!empty($cc->id)) {
                            $obj = (object)[
                                'esquema' => $esquema,
                                'uuid' => $cc->llave,
                                'corporacion' => $req['corporacion'],
                                'empresa' => $req['empresa'],
                                'sede' => $req['sede'],
                                'nombres' => $req['nombres'],
                                'apellidos' => $req['apellidos'],
                                'usuario' => $req['usuario']
                            ];
                            $datos = $this->Schema_model->nuevo_esquema($obj);
                        } else {
                            $datos['mensaje'] = "No se pudo crear el detalle del cliente {$req['nombre_cliente']}.";
                        }
                    } else {
                        $datos['mensaje'] = "No se pudo crear el cliente '{$req['nombre_cliente']}'.";
                    }
                } else {
                    $datos['mensaje'] = "El dominio '{$req['dominio']}' ya existe.";
                }
            } else {
                $datos['mensaje'] = "El esquema '{$req['esquema']}' ya existe.";
            }
        } else {
            $datos['mensaje'] = "Parámetros inválidos.";
        }
        $this->output->set_output(json_encode($datos));
    }

    public function actualizar()
    {
        set_time_limit(0);
        ini_set('memory_limit', '-1');
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            if (strpos($req['sql'], 'RT_DATABASE_NAME') === false) {
                $datos['mensaje'] = 'Por favor envíe el string de las actualizaciones en el formato requerido.';
            } else {
                $datos['exito'] = true;
                $datos['mensaje'] = 'Por favor revisar los resultados de las actualizaciones.';
                $datos['resultados'] = $this->Schema_model->actualiza_esquemas($req['sql']);
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }

    public function guardar_configuracion_corporacion()
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            $datos['exito'] = $this->Cliente_rt_model->guardar_configuracion_corporacion($req);
            if ($datos['exito']) {
                $datos['mensaje'] = 'Configuración guardada correctamente.';
            } else {
                $datos['mensaje'] = 'Error al actualizar la configuración.';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }
}
