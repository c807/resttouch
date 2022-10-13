<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Usuario extends CI_Controller
{
    public function __construct()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method == "OPTIONS") {
            die();
        }

        parent::__construct();
        $this->load->model([
            'Usuario_model',
            'Catalogo_model'
        ]);

        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function login()
    {
        // $this->load->model('Acceso_model');
        $logged = ['status' => false];
        if ($this->input->method() == 'post') {

            $credenciales = json_decode(file_get_contents('php://input'), true);
            $usr = explode("@", $credenciales['usr']);

            $credenciales['usr'] = $usr[0];

            $usr = explode(".", $usr[1]);

            $datosDb = $this->Catalogo_model->getCredenciales(['dominio' => $usr[0]]);
            if ($datosDb) {
                $conn = [
                    'host' => $datosDb->db_hostname,
                    'user' => $datosDb->db_username,
                    'password' => $datosDb->db_password,
                    'database' => $datosDb->db_database
                ];
    
                $db = conexion_db($conn);
    
                $this->db = $this->load->database($db, true);
    
                $credenciales['dominio'] = $usr[0];
                $logged = $this->Usuario_model->logIn($credenciales);
    
                if (!empty($logged['token'])) {                    
                    $datos = $this->set_accesos_usuario($logged);
                    $logged['acceso'] = array_values($datos);
                    $logged['status'] = true;
                }
            } else {
                $logged['mensaje'] = "El dominio '{$usr[0]}' no existe, por favor revise las credenciales.";
            }
        } else {
            $logged['error'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($logged));
    }

    public function set_accesos_usuario($logged)
    {
        $this->load->model('Acceso_model');
        $datos = [];
        $tmp = [];
        $menu = $this->config->item("menu");
        $args = ['activo' => 1, 'usuario' => $logged['idusr']];
        $acceso = $this->Acceso_model->buscar($args);
        foreach ($acceso as $row) {
            $tmp[$row->modulo]['nombre'] = $menu[$row->modulo]['nombre'];

            $tmp[$row->modulo]['submodulo'][$row->submodulo]['nombre'] = $menu[$row->modulo]['submodulo'][$row->submodulo]['nombre'];

            $tmp[$row->modulo]['submodulo'][$row->submodulo]['opciones'][] = $menu[$row->modulo]['submodulo'][$row->submodulo]['opciones'][$row->opcion];
        }

        foreach ($tmp as $row) {
            $row['submodulo'] = array_values($row['submodulo']);
            $datos[] = $row;
        }

        return $datos;
    }

    public function desbloqueo_usuario()
    {
        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $logged = ['exito' => false];
        if (array_key_exists('Authorization', $headers)) {
            $data = AUTHORIZATION::validateToken($headers['Authorization']);
            if ($data === false) {
                $logged['mensaje'] = "Token incorrecto.";
            } else {
                if ($this->input->method() == 'post') {
                    $credenciales = json_decode(file_get_contents('php://input'), true);
                    $credenciales['dominio'] = $data->dominio;
                    $credenciales['sede'] = $data->sede;
                    $logged = $this->Usuario_model->logIn($credenciales);
                    if (!empty($logged['token'])) {
                        $datos = $this->set_accesos_usuario($logged);
                        $logged['acceso'] = array_values($datos);
                        $logged['exito'] = true;
                    } else {
                        $logged['mensaje'] = "Pin incorrecto.";
                        $logged['exito'] = false;
                    }
                } else {
                    $logged['mensaje'] = "Llamada incorrecta.";
                    $logged['exito'] = false;
                }
            }
        } else {
            $logged['mensaje'] = "¡Acceso no autorizado!";
        }
        $this->output->set_output(json_encode($logged));
    }

    public function obtener_usuarios()
    {
        $debaja = 0;

        if (isset($_GET['debaja'])) {
            $debaja = 1;
        }

        $this->output
            ->set_output(json_encode($this->Usuario_model->findAll($debaja)));
    }

    public function guardar_usuario($id = '')
    {
        $datos = ['status' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            $usu = new Usuario_model($id);

            if (empty($id)) {
                $datos = $usu->crear($req);
            } else {
                $datos = $usu->actualizar($req);
            }
        } else {
            $datos['error'] = "Parametros invalidos";
        }

        $this->output
            ->set_output(json_encode($datos));
    }

    public function usuarios_post()
    {
        $headers = $this->input->request_headers();
        $data = AUTHORIZATION::validateToken($headers['Authorization']);

        $datos = json_decode(file_get_contents('php://input'), true);
        $datos['sede'] = $data->sede;
        $nuevo = $this->Usuario_model->find($datos);

        $this->output->set_output(json_encode($nuevo));
    }

    public function checktoken_get()
    {
        $this->output->set_output(json_encode(['valido' => true]));
    }

    public function get_rol_turno($idUsuario = null)
    {
        $roles = '';
        if ($idUsuario)
        {
            $usr = new Usuario_model($idUsuario);
            $roles = $usr->getRolesTurno();            
        }
        $this->output->set_output(json_encode(['roles' => $roles]));
    }
}
