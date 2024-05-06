<?php

class Usuario_model extends General_model
{
    private $tabla = 'usuario';
    public $columnas = [];
    public $sede;
    public $nombres;
    public $apellidos;
    public $usrname;
    public $contrasenia;
    public $debaja = 0;
    public $esmesero = 0;
    public $pindesbloqueo = null;
    public $usatecladovirtual = 0;
    public $confirmar_ingreso = 0;
    public $confirmar_egreso = 0;
    public $rol = null;
    public $ver_panorama = 0;

    public function __construct($id = '')
    {
        parent::__construct();
        $this->setTabla($this->tabla);

        if (!empty($id)) {
            $this->cargar($id);
        }
    }

    function validaPwdGerenteTurno($pwd = null, $idsede = 0)
    {
        if ($pwd) {
            $dbusr = $this->db
                ->select('c.contrasenia, c.usuario')
                ->from('turno_has_usuario a')
                ->join('usuario_tipo b', 'b.usuario_tipo = a.usuario_tipo')
                ->join('usuario c', 'c.usuario = a.usuario')
                ->join('turno d', 'd.turno = a.turno')
                ->where('d.sede', $idsede)
                ->where('d.fin IS NULL')
                ->where('TRIM(LOWER(b.descripcion)) = "gerente"')
                ->get()
                ->result();

            foreach ($dbusr as $usr) {
                if (password_verify($pwd, $usr->contrasenia)) {
                    return (object)['usuario' => $usr->usuario, 'esgerente' => true];
                }
            }
        }
        return (object)['usuario' => null, 'esgerente' => false];
    }

    function logIn($credenciales = null)
    {
        if ($credenciales) {

            if (isset($credenciales['usr'])) {
                $this->db->where('usrname', $credenciales['usr']);
            } elseif (isset($credenciales['pindesbloqueo'])) {
                $this->db->where('pindesbloqueo', $credenciales['pindesbloqueo']);
            }

            if (isset($credenciales['sede'])) {
                $this->db->where('a.sede', $credenciales['sede']);
            }

            if (isset($credenciales['usuario'])) {
                $this->db->where('a.usuario', (int)$credenciales['usuario']);
            }

            $campos = 'a.usuario, a.contrasenia, a.pindesbloqueo, a.usrname, a.nombres, a.apellidos, a.sede, b.empresa, b.nombre as sede_nombre, b.direccion as sede_direccion, b.correo as sede_correo, ';
            $campos .= 'c.nombre as empresa_nombre, c.nit as empresa_nit, c.visa_merchant_id, CONCAT(d.admin_llave, "-", c.empresa, "-", b.sede) AS sede_uuid, a.usatecladovirtual, b.alias AS sede_alias, ';
            $campos .= 'a.confirmar_ingreso, a.confirmar_egreso, a.rol, c.metodo_costeo, a.ver_panorama';
            $dbusr = $this->db
                ->select($campos)                
                ->join('sede b', 'b.sede = a.sede')
                ->join('empresa c', 'c.empresa = b.empresa')
                ->join('corporacion d', 'd.corporacion = c.corporacion')
                ->where('debaja', 0)
                ->get('usuario a')
                ->row();

            if (isset($dbusr)) {
                $validado = false;

                if (isset($credenciales['pwd'])) {
                    $validado = password_verify($credenciales['pwd'], $dbusr->contrasenia);
                } elseif (isset($credenciales['pindesbloqueo'])) {
                    $validado = $credenciales['pindesbloqueo'] == $dbusr->pindesbloqueo;
                }

                if ($validado) {
                    $horasValidezToken = 12;
                    $horasValidezTokenRow = $this->db->select('valor')->where('campo', 'RT_HORAS_VALIDEZ_TOKEN')->get('configuracion')->row();
                    if ($horasValidezTokenRow && (int)$horasValidezTokenRow->valor > 0) {
                        $horasValidezToken = (int)$horasValidezTokenRow->valor;
                    }

                    $tokenData = array(
                        'idusuario' => $dbusr->usuario,
                        'sede' => $dbusr->sede,
                        'usuario' => $dbusr->usrname,
                        'inicia' => date('Y-m-d H:i:s'),
                        'hasta' => date('Y-m-d H:i:s', strtotime("+{$horasValidezToken} hours")),
                        'dominio' => $credenciales['dominio'],
                        'rol' => $dbusr->rol ?? 0,
                    );
                    return array(
                        'mensaje' => 'El usuario tiene acceso.',
                        'token' => AUTHORIZATION::generateToken($tokenData),
                        'usrname' => $dbusr->usrname,
                        'nombres' => $dbusr->nombres,
                        'apellidos' => $dbusr->apellidos,
                        'sede' => $dbusr->sede,
                        'idusr' => $dbusr->usuario,
                        'sede_uuid' => $dbusr->sede_uuid,
                        'usatecladovirtual' => $dbusr->usatecladovirtual,
                        'restaurante' => [
                            'nombre' => $dbusr->sede_nombre,
                            'direccion' => $dbusr->sede_direccion,
                            'correo' => $dbusr->sede_correo,
                            'alias' => $dbusr->sede_alias
                        ],
                        'empresa' => [
                            'visa_merchant_id' => $dbusr->visa_merchant_id,
                            'nombre' => $dbusr->empresa_nombre,
                            'nit' => $dbusr->empresa_nit,
                            'metodo_costeo' => (int)$dbusr->metodo_costeo
                        ],
                        'dominio' => $credenciales['dominio'],
                        'wms' => (object)[
                            'confirmar_ingreso' => $dbusr->confirmar_ingreso,
                            'confirmar_egreso' => $dbusr->confirmar_egreso
                        ],
                        'rol' => $dbusr->rol ?? 0,
                        'pos' => (object)[
                            'ver_panorama' => $dbusr->ver_panorama
                        ]
                    );
                } else {
                    return array(
                        'mensaje' => 'El usuario o la contraseña son inválidos. Intente de nuevo, por favor.',
                        'token' => null
                    );
                }
            } else {
                return array(
                    'mensaje' => 'El usuario es inválido. Intente de nuevo, por favor.',
                    'token' => null
                );
            }
        } else {
            return array(
                'mensaje' => 'Por favor envíe credenciales válidas.',
                'token' => null
            );
        }
    }

    private function checkUserExists($usr, $sede = 0)
    {
        if ((int)$sede > 0) {
            $this->db->where('sede', $sede);
        }

        $existe = -1;
        $dbusr = $this->db
            ->select('usuario')
            ->from($this->tabla)
            ->where('usrname', $usr)
            ->get();
        if ($dbusr->num_rows() > 0) {
            $user = $dbusr->row();
            $existe = (int) $user->usuario;
        }

        return $existe;
    }

    public function getValidData($data, $columnas)
    {
        $datos = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $columnas)) {
                $datos[$key] = $value;
            }
        }
        return $datos;
    }

    function crear($dataToInsert = null)
    {
        //$dataToInsert = $this->getValidData($dataToInsert, $this->columnas);
        if ($dataToInsert) {
            $idusr = $this->checkUserExists($dataToInsert['usrname']);
            if ($idusr < 0) {
                if (array_key_exists('contrasenia', $dataToInsert)) {
                    $dataToInsert['contrasenia'] = password_hash($dataToInsert['contrasenia'], PASSWORD_BCRYPT, array('cost' => 12));
                }

                $this->guardar($dataToInsert);
                return array(
                    'mensaje' => 'Usuario creado con éxito.',
                    'id' => $this->getPK()
                );
            } else {
                return array(
                    'mensaje' => 'Este usuario ya existe.',
                    'usuario' => null
                );
            }
        } else {
            return array(
                'mensaje' => 'La información enviada no es correcta o está incompleta.',
                'usuario' => null
            );
        }
    }

    function actualizar($dataToUpdate = null)
    {
        //$dataToUpdate = $this->getValidData($dataToUpdate, $this->columnas);
        if ($dataToUpdate) {
            if (array_key_exists('contrasenia', $dataToUpdate)) {
                $dataToUpdate['contrasenia'] = password_hash($dataToUpdate['contrasenia'], PASSWORD_BCRYPT, array('cost' => 12));
            }

            $this->guardar($dataToUpdate);
            return array(
                'mensaje' => 'Usuario actualizado con éxito.',
                'usuario' => $this->getPK()
            );
        } else {
            return array(
                'mensaje' => 'La información enviada no es correcta o está incompleta.',
                'usuario' => null
            );
        }
    }

    function findAll($debaja = 0)
    {
        $headers = $this->input->request_headers();
        $data = AUTHORIZATION::validateToken($headers['Authorization']);

        if ($debaja !== 3) {
            $this->db->where('debaja', $debaja);
        }

        return $this->db
            ->select('usuario, nombres, apellidos, usrname, debaja, esmesero, pindesbloqueo, usatecladovirtual, confirmar_ingreso, confirmar_egreso, rol, ver_panorama')
            ->from($this->tabla)
            ->where('sede', $data->sede)
            ->get()
            ->result();
    }

    function find($filtros = [])
    {
        if (count($filtros) > 0) {
            foreach ($filtros as $key => $value) {
                if ($key != '_uno') {
                    $this->db->where($key, $value);
                }
            }
        }

        $tmp = $this->db
            ->select('usuario, sede, nombres, apellidos, usrname, debaja, esmesero, pindesbloqueo, usatecladovirtual, confirmar_ingreso, confirmar_egreso, rol, ver_panorama')
            ->from($this->tabla)
            ->get();

        if (isset($filtros['_uno'])) {
            return $tmp->row();
        }

        return $tmp->result();
    }

    public function getRolesTurno()
    {
        $turno = $this->db->select('turno')->where('fin IS NULL')->where('sede', $this->sede)->get('turno')->row();
        if ($turno) {
            $roles = $this->db
                ->select('b.descripcion')
                ->join('usuario_tipo b', 'b.usuario_tipo = a.usuario_tipo')
                ->where('a.anulado', 0)
                ->where('a.turno', $turno->turno)
                ->where('a.usuario', $this->getPK())
                ->get('turno_has_usuario a')
                ->result();
            if ($roles) {
                $tmp = [];
                foreach ($roles as $r) {
                    $tmp[] = strtolower($r->descripcion);
                }
                return implode(',', $tmp);
            } else {
                return '';
            }
        }
        return '';
    }

    public function setAccesosRolUsuario($idUsuario, $idRol)
    {
        // Elimino permisos existentes
        $this->db->where('usuario', $idUsuario)->delete('acceso');

        // Agrego permisos nuevos según el rol asignado
        $query = 'INSERT INTO acceso(usuario, modulo, submodulo, opcion, activo) ';
        $query .= "SELECT {$idUsuario}, modulo, submodulo, opcion, incluido AS activo ";
        $query .= 'FROM rol_acceso ';
        $query .= "WHERE incluido = 1 AND rol = {$idRol} ";
        $query .= 'ORDER BY modulo, submodulo, opcion';
        $this->db->query($query);
    }

    public function get_lista_usuarios($fltr = [])
    {
        $lista = [];
        $campos = $this->getCampos(false, '', 'usuario');

        if (isset($fltr['usuario']) && (int)$fltr['usuario'] > 0) {
            $this->db->where('usuario', (int)$fltr['usuario']);
        }

        if (isset($fltr['sede']) && (int)$fltr['sede'] > 0) {
            $this->db->where('sede', (int)$fltr['sede']);
        }

        if (isset($fltr['debaja']) && (int)$fltr['debaja'] > 0) {
            $this->db->where('debaja', (int)$fltr['debaja']);
        }

        if (isset($fltr['rol']) && (int)$fltr['rol'] > 0) {
            $this->db->where('rol', (int)$fltr['rol']);
        }

        $tmp = $this->db
            ->select($campos)
            ->order_by('usuario')
            ->get('usuario')
            ->result();

        foreach ($tmp as $usr) {
            if (isset($usr->contrasenia)) {
                unset($usr->contrasenia);
            }

            $lista[(int)$usr->usuario] = clone $usr;
        }

        return $lista;
    }
}
