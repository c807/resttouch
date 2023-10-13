<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Rol extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model(['Rol_model', 'Rol_acceso_model', 'Catalogo_model']);
        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    private function get_formatted_menu()
    {
        $menu = $this->config->item('menu');
        $arbol = [];

        $modulosCorporacion = $this->Catalogo_model->getModulo();
        if (!empty($modulosCorporacion)) {
            $arrModulos = [];
            foreach ($modulosCorporacion as $mod) {
                $arrModulos[] = (int)$mod->modulo;
            }
            foreach ($menu as $mKey => $modulo) {
                if ($mKey !== 3 && in_array($mKey, $arrModulos)) {
                    $arbol[] = (object)[
                        'modulo' => $mKey,
                        'descripcion' => $modulo['nombre'],
                        'submodulos' => []
                    ];

                    $mIdx = count($arbol) - 1;
                    foreach ($modulo['submodulo'] as $smKey => $submodulo) {
                        $arbol[$mIdx]->submodulos[] = (object)[
                            'submodulo' => $smKey,
                            'descripcion' => $submodulo['nombre'],
                            'opciones' => []
                        ];

                        $smIdx = count($arbol[$mIdx]->submodulos) - 1;
                        foreach ($submodulo['opciones'] as $oKey => $opcion) {
                            $arbol[$mIdx]->submodulos[$smIdx]->opciones[] = (object)[
                                'opcion' => $oKey,
                                'descripcion' => $opcion['nombre'],
                                'incluido' => 0
                            ];
                        }
                    }
                }
            }
        }

        return $arbol;
    }

    private function inserta_accesos_rol($idRol)
    {
        $menu = $this->get_formatted_menu();
        foreach ($menu as $modulo) {
            foreach ($modulo->submodulos as $submodulo) {
                foreach ($submodulo->opciones as $opcion) {
                    $acceso = new Rol_acceso_model();
                    $existe = $acceso->buscar([
                        'rol' => $idRol,
                        'modulo' => $modulo->modulo,
                        'submodulo' => $submodulo->submodulo,
                        'opcion' => $opcion->opcion,
                        '_uno' => true
                    ]);
                    if (!$existe) {
                        $acceso->guardar([
                            'rol' => $idRol,
                            'modulo' => $modulo->modulo,
                            'submodulo' => $submodulo->submodulo,
                            'opcion' => $opcion->opcion,
                            'incluido' => $opcion->incluido
                        ]);
                    }
                }
            }
        }
    }

    public function guardar($id = '')
    {
        $rol = new Rol_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {

            $fltr = ['TRIM(UPPER(descripcion))' => trim(strtoupper($req['descripcion'])), '_uno' => true];
            if (!empty($id)) {
                $fltr['rol <>'] = $id;
            }

            $existe = $this->Rol_model->buscar($fltr);
            if (!$existe) {
                $datos['exito'] = $rol->guardar($req);
                if ($datos['exito']) {
                    $this->inserta_accesos_rol($rol->getPK());
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                    $datos['rol'] = $rol;
                    // $datos['rol_acceso'] = $this->get_detalle_rol(['rol' => $rol->getPK()]);
                } else {
                    $datos['mensaje'] = $rol->getMensaje();
                }
            } else {
                $datos['mensaje'] = 'Ya existe este rol.';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }

    public function buscar()
    {
        $datos = $this->Rol_model->buscar($_GET);
        $datos = ordenar_array_objetos($datos, 'descripcion');
        $this->output->set_output(json_encode($datos));
    }

    private function get_detalle_rol($idRol)
    {
        $datos = $this->Rol_acceso_model->buscar(['rol' => $idRol]);
        $menu = $this->get_formatted_menu();
        foreach ($menu as $mKey => $modulo) {
            foreach ($modulo->submodulos as $smKey => $submodulo) {
                foreach ($submodulo->opciones as $oKey => $opcion) {
                    foreach ($datos as $d) {
                        if (
                            (int)$d->rol === (int)$idRol &&
                            (int)$d->modulo === (int)$modulo->modulo &&
                            (int)$d->submodulo === (int)$submodulo->submodulo &&
                            (int)$d->opcion === (int)$opcion->opcion
                        ) {
                            $menu[$mKey]->submodulos[$smKey]->opciones[$oKey]->incluido = $d->incluido;
                            continue;
                        }
                    }
                }
            }
        }

        return $menu;
    }

    public function buscar_detalle($idRol)
    {
        $datos = $this->get_detalle_rol($idRol);
        $this->output->set_output(json_encode($datos));
    }

    public function guardar_detalle()
    {
        $req = json_decode(file_get_contents('php://input'), true);

        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $rol_acceso = new Rol_acceso_model();

            $fltr = [
                'rol' => $req['rol'],
                'modulo' => $req['modulo'],
                'submodulo' => $req['submodulo'],
                'opcion' => $req['opcion'],
                '_uno' => true
            ];

            $existe = $rol_acceso->buscar($fltr);
            if (!$existe) {
                $datos['exito'] = $rol_acceso->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                } else {
                    $datos['mensaje'] = $rol_acceso->getMensaje();
                }
            } else {
                $ra = new Rol_acceso_model($existe->rol_acceso);
                $datos['exito'] = $ra->guardar(['incluido' => $req['incluido']]);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                } else {
                    $datos['mensaje'] = $ra->getMensaje();
                }
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }
}
