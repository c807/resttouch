<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Bodega_model extends General_model
{

    public $bodega;
    public $descripcion;
    public $sede;
    public $merma = 0;
    public $pordefecto = 0;
    public $permitir_requisicion = 0;
    public $debaja = 0;
    public $usuariodebaja = null;
    public $fechabaja = null;

    public function __construct($id = '')
    {
        parent::__construct();
        $this->setTabla("bodega");
        if (!empty($id)) {
            $this->cargar($id);
        }
    }

    public function quitar_por_defecto($sede)
    {
        $this->db->set('pordefecto', 0);
        $this->db->where('sede', $sede);
        $this->db->update('bodega');
    }

    public function checkEnUso()
    {
        $subcategorias = $this->db
            ->select('GROUP_CONCAT(descripcion ORDER BY descripcion SEPARATOR ", ") AS subcategorias')            
            ->where('bodega', $this->getPK())
            ->get('categoria_grupo')
            ->row();

        return $subcategorias ? $subcategorias->subcategorias : '';
    }

}

/* End of file Bodega_model.php */
/* Location: ./application/admin/models/Bodega_model.php */
