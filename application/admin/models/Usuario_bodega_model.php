<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Usuario_bodega_model extends General_model
{

    public $usuario_bodega;
    public $usuario;
    public $bodega;
    public $debaja = 0;

    public function __construct($id = '')
    {
        parent::__construct();
        $this->setTabla('usuario_bodega');
        if (!empty($id)) {
            $this->cargar($id);
        }
    }

    public function buscar_bodegas_usuario($args = [])
    {
        $campos = $this->getCampos(false, 'a.', 'usuario_bodega');

        if (isset($args['usuario']) && (int)$args['usuario'] > 0) {
            $this->db->where('a.usuario', (int)$args['usuario']);
        }

        if (isset($args['bodega']) && (int)$args['bodega'] > 0) {
            $this->db->where('a.bodega', (int)$args['bodega']);
        }

        if (isset($args['debaja'])) {
            $this->db->where('a.debaja', (int)$args['debaja']);
        }

        return $this->db
            ->select("{$campos}, b.descripcion AS bodega_descripcion, b.debaja AS bodega_debaja")
            ->join('bodega b', 'b.bodega = a.bodega')
            ->get('usuario_bodega a')
            ->result();
    }
}
