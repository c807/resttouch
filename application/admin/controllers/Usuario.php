<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Usuario extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model(['Usuario_model', 'Catalogo_model', 'Usuario_bodega_model']);
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function login()
    {
        $logged = ['status' => false];
        if ($this->input->method() == 'post') {

            $credenciales = json_decode(file_get_contents('php://input'), true);
            $usr = explode('@', $credenciales['usr']);

            $credenciales['usr'] = $usr[0];

            $usr = explode('.', $usr[1]);

            $datosDb = $this->Catalogo_model->getCredenciales(['dominio' => $usr[0]]);
            if ($datosDb) {
                if ((int)$datosDb->bloqueado === 0) {
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
                    $logged['mensaje'] = "Los usuarios del dominio '{$usr[0]}' han sido bloqueados por falta de pago. Por favor comuníquese con el área Comercial de Rest-Touch Pro.";
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
        $menu = $this->config->item('menu');
        $args = ['activo' => 1, 'usuario' => $logged['idusr']];
        // $acceso = $this->Acceso_model->buscar($args);
        $acceso = $this->Acceso_model->buscar_acceso($args);
        foreach ($acceso as $row) {
            $tmp[$row->modulo]['nombre'] = $menu[$row->modulo]['nombre'];
            $tmp[$row->modulo]['dispositivo'] = $menu[$row->modulo]['dispositivo'];

            $tmp[$row->modulo]['submodulo'][$row->submodulo]['nombre'] = $menu[$row->modulo]['submodulo'][$row->submodulo]['nombre'];
            $tmp[$row->modulo]['submodulo'][$row->submodulo]['dispositivo'] = $menu[$row->modulo]['submodulo'][$row->submodulo]['dispositivo'];

            if (isset($menu[$row->modulo]['submodulo'][$row->submodulo]['opciones'][$row->opcion])) {
                $tmp[$row->modulo]['submodulo'][$row->submodulo]['opciones'][] = (array)$menu[$row->modulo]['submodulo'][$row->submodulo]['opciones'][$row->opcion];
            }
        }

        foreach ($tmp as $row) {
            $row['submodulo'] = array_values($row['submodulo']);
            $datos[] = $row;
        }

        $datos = $this->ordenar_menu($datos);

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
                $logged['mensaje'] = 'Token incorrecto.';
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
                        $logged['mensaje'] = 'Pin incorrecto.';
                        $logged['exito'] = false;
                    }
                } else {
                    $logged['mensaje'] = 'Llamada incorrecta.';
                    $logged['exito'] = false;
                }
            }
        } else {
            $logged['mensaje'] = '¡Acceso no autorizado!';
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

    private function set_permisos_rol_usuario($idUsuario, $idRol)
    {
        $this->Usuario_model->setAccesosRolUsuario($idUsuario, $idRol);
    }

    public function guardar_usuario($id = '')
    {
        $datos = ['status' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            $usu = new Usuario_model($id);

            if (empty($id)) {
                $datos = $usu->crear($req);
                $this->set_permisos_rol_usuario($usu->getPK(), (int)$req['rol']);
            } else {
                $rolOriginal = (int)$usu->rol;
                $datos = $usu->actualizar($req);
                if ($rolOriginal !== (int)$req['rol']) {
                    $this->set_permisos_rol_usuario($usu->getPK(), (int)$req['rol']);
                }
            }
        } else {
            $datos['error'] = 'Parámetros inválidos';
        }

        $this->output->set_output(json_encode($datos));
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
        if ($idUsuario) {
            $usr = new Usuario_model($idUsuario);
            $roles = $usr->getRolesTurno();
        }
        $this->output->set_output(json_encode(['roles' => $roles]));
    }

    private function ordenar_menu($menu)
    {
        usort($menu, function ($a, $b) {
            return strcasecmp(quitar_acentos($a['nombre']), quitar_acentos($b['nombre']));
        });

        $keysModulos = array_keys($menu);
        foreach ($keysModulos as $kM) {
            if (array_key_exists('submodulo', $menu[$kM])) {
                usort($menu[$kM]['submodulo'], function ($a, $b) {
                    return strcasecmp(quitar_acentos($a['nombre']), quitar_acentos($b['nombre']));
                });
                $keysSubModulos = array_keys($menu[$kM]['submodulo']);
                foreach ($keysSubModulos as $kSM) {
                    if (array_key_exists('opciones', $menu[$kM]['submodulo'][$kSM])) {
                        usort($menu[$kM]['submodulo'][$kSM]['opciones'], function ($a, $b) {
                            return strcasecmp(quitar_acentos($a['nombre']), quitar_acentos($b['nombre']));
                        });
                    }
                }
            }
        }

        return $menu;
    }

    /* Sección de usuarios por bodega para ver quienes pueden confirmar ingresos/egresos de esa bodega */
    public function get_usuario_bodega()
    {
        $data = $this->Usuario_bodega_model->buscar_bodegas_usuario($_GET);
        $this->output->set_output(json_encode($data));
    }

    public function set_usuario_bodega($id = '')
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            $usuarioBodega = new Usuario_bodega_model($id);
            $datos['exito'] = $usuarioBodega->guardar($req);
            if ($datos['exito']) {
                $datos['usuario_bodega'] = $usuarioBodega;
                $datos['mensaje'] = 'Datos actualizados con éxito.';
            } else {
                $datos['mensaje'] = $usuarioBodega->getMensaje();
            }
        } else {
            $datos['error'] = 'Parámetros inválidos';
        }
        $this->output->set_output(json_encode($datos));
    }

}
