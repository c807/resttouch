<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Correlativo_model extends General_model
{

    public $admin_llave;
    public $nombre;

    public function __construct($id = '')
    {
        parent::__construct();
        $this->setTabla('correlativo');
        if (!empty($id)) {
            $this->cargar($id);
        }
    }

    public function get_correlativo($args = [])
    {
        if (!isset($args['tabla']) || (isset($args['tabla']) && empty(trim($args['tabla'])))) {
            $args['tabla'] = 'comanda';
        }

        $args['tabla'] = trim($args['tabla']);
        $hoy = date('Y-m-d');
        $siguiente = 1;
        $this->db->query('LOCK TABLE correlativo WRITE');
        $correlativo = $this->db->select('siguiente')->where('tabla', $args['tabla'])->where('fecha', $hoy)->get('correlativo')->row();
        if ($correlativo) {
            $siguiente = (int)$correlativo->siguiente;
            $this->db->where('tabla', $args['tabla'])->where('fecha', $hoy)->update('correlativo', array('siguiente' => $siguiente + 1));
        } else {
            $this->db->insert('correlativo', ['tabla' => $args['tabla'], 'fecha' => $hoy, 'siguiente' => 2]);
        }
        $this->db->query('UNLOCK TABLES');
        return ['tabla' => $args['tabla'], 'fecha' => $hoy, 'siguiente' => $siguiente];
    }
}

/* End of file Corporacion_model.php */
/* Location: ./application/admin/models/Corporacion_model.php */