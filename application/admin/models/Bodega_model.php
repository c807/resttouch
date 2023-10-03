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

        return $subcategorias && $subcategorias->subcategorias ? $subcategorias->subcategorias : '';
    }

	public function get_lista_bodegas($fltr = [])
	{
		$lista = [];
		$campos = $this->getCampos(false, '', 'bodega');

		if (isset($fltr['bodega']) && (int)$fltr['bodega'] > 0) {
			$this->db->where('bodega', (int)$fltr['bodega']);
		}

		if (isset($fltr['sede']) && (int)$fltr['sede'] > 0) {
			$this->db->where('sede', (int)$fltr['sede']);
		}		

		if (isset($fltr['descripcion']) && is_string($fltr['descripcion'])) {
			$this->db->where('descripcion', $fltr['descripcion']);
		}
        
        if (isset($fltr['merma']) && (int)$fltr['merma'] > 0) {
			$this->db->where('merma', (int)$fltr['merma']);
		}

        if (isset($fltr['permitir_requisicion']) && (int)$fltr['permitir_requisicion'] > 0) {
			$this->db->where('permitir_requisicion', (int)$fltr['permitir_requisicion']);
		}

        if (isset($fltr['pordefecto']) && (int)$fltr['pordefecto'] > 0) {
			$this->db->where('pordefecto', (int)$fltr['pordefecto']);
		}

        if (isset($fltr['debaja']) && (int)$fltr['debaja'] > 0) {
			$this->db->where('debaja', (int)$fltr['debaja']);
		}

		$tmp = $this->db
			->select($campos)
			->order_by('bodega')
			->get('bodega')
			->result();

		foreach ($tmp as $bode) {
			$lista[(int)$bode->bodega] = clone $bode;
		}

		return $lista;		
	}
}

/* End of file Bodega_model.php */
/* Location: ./application/admin/models/Bodega_model.php */
