<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cliente_rt_corporacion_model extends General_model
{

    public $id;
    public $cliente_id;
    public $llave;
    public $dominio;
    public $db_hostname;
    public $db_username;
    public $db_password;
    public $db_database;
    public $bloqueado = 0;

    public function __construct($id = '')
    {
        parent::__construct();
        $this->setTabla('administracion.cliente_corporacion');        
        $this->setLlave('id');
        if (!empty($id)) {
            $this->cargar($id);
        }
    }

    public function get_nueva_llave()
    {
        $this->load->library('Uuid');
        $uuid = new Uuid();
        $nva = $uuid->v4();
        while ($this->buscar(['llave' => $nva, '_uno' => true])) {
            $nva = $uuid->v4();
        }
        return $nva;
    }
}
