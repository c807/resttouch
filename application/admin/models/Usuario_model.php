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

    public function __construct($id = '')
    {
        parent::__construct();
        $this->setTabla($this->tabla);

        if(!empty($id)) {
            $this->cargar($id);
        }
    }

    function validaPwdGerenteTurno($pwd = null) {
        if($pwd){
            $dbusr = $this->db
                ->select("c.contrasenia")
                ->from("turno_has_usuario a")
                ->join("usuario_tipo b", "b.usuario_tipo = a.usuario_tipo")
                ->join("usuario c", "c.usuario = a.usuario")                 
                ->where("TRIM(LOWER(b.descripcion)) = 'gerente'")
                ->get()
                ->result();

            foreach($dbusr as $usr) {
                if (password_verify($pwd, $usr->contrasenia)) {
                    return true;
                } 
            }
        }
        return false;
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

            $dbusr = $this->db
                ->select("
                    a.usuario, 
                    a.contrasenia, 
                    a.pindesbloqueo,
                    a.usrname, 
                    a.nombres, 
                    a.apellidos, 
                    a.sede,
                    b.empresa,
                    b.nombre as sede_nombre,
                    b.direccion as sede_direccion,
                    b.correo as sede_correo,
                    c.nombre as empresa_nombre,
                    c.nit as empresa_nit,
                    c.visa_merchant_id,
                    CONCAT(d.admin_llave, '-', c.empresa, '-', b.sede) AS sede_uuid, a.usatecladovirtual")
                ->from("{$this->tabla} a")
                ->join("sede b", "b.sede = a.sede")
                ->join("empresa c", "c.empresa = b.empresa")
                ->join("corporacion d", "d.corporacion = c.corporacion")                
                // ->where('usrname', $credenciales['usr'])
                ->where('debaja', 0)
                ->get()
                ->row();

            if (isset($dbusr)) {
                $validado = false;

                if (isset($credenciales['pwd'])) {
                    $validado = password_verify($credenciales['pwd'], $dbusr->contrasenia);
                } elseif (isset($credenciales['pindesbloqueo'])) {
                    $validado = $credenciales['pindesbloqueo'] == $dbusr->pindesbloqueo;
                }

                if ($validado) {
                    $tokenData = array(
                        'idusuario' => $dbusr->usuario,
                        'sede' => $dbusr->sede,
                        //'usuario' => $credenciales['usr'],
                        'usuario' => $dbusr->usrname,
                        'inicia' => date('Y-m-d H:i:s'),
                        'hasta' => date('Y-m-d H:i:s', strtotime('+12 hours')),
                        'dominio' => $credenciales['dominio']
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
                            "nombre" => $dbusr->sede_nombre,
                            "direccion" => $dbusr->sede_direccion,
                            "correo" => $dbusr->sede_correo
                        ],
                        'empresa' => [
                            "visa_merchant_id" => $dbusr->visa_merchant_id,
                            "nombre" => $dbusr->empresa_nombre,
                            "nit" => $dbusr->empresa_nit
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
        if ((int)$sede > 0)
        {
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
            ->select('usuario, nombres, apellidos, usrname, debaja, esmesero, pindesbloqueo, usatecladovirtual')
            ->from($this->tabla)
            ->where("sede", $data->sede)
            ->get()
            ->result();
    }

    function find($filtros = [])
    {
        if (count($filtros) > 0) {
            foreach ($filtros as $key => $value) {
                if($key != "_uno"){                    
                    $this->db->where($key, $value);
                }
            }
        }

        $tmp = $this->db
            ->select('usuario, sede, nombres, apellidos, usrname, debaja, esmesero, pindesbloqueo, usatecladovirtual')
            ->from($this->tabla)
            ->get();

        if(isset($filtros['_uno'])){
            return $tmp->row();
        }

        return $tmp->result();
    }

    public function getRolesTurno()
    {
        $turno = $this->db->select('turno')->where('fin IS NULL')->where('sede', $this->sede)->get('turno')->row();
        if($turno)
        {
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
                foreach($roles as $r) 
                {
                    $tmp[] = strtolower($r->descripcion);
                }
                return implode(',', $tmp);
            } else {
                return '';
            }
        }
        return '';
    }
}
