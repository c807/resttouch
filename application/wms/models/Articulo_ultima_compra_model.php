<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Articulo_ultima_compra_model extends General_model {

	public $articulo_ultima_compra;
	public $articulo;
	public $presentacion;
	public $ultimo_proveedor;
	public $ultimo_costo = 0.00;    

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('articulo_ultima_compra');

		if(!empty($id)) {
			$this->cargar($id);
        }
        
        // $this->load->model([ 
        //     'Articulo_model',
        //     'Sede_model'
        // ]);
    }

    public function get_full_data($args = [])
    {
        if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where("a.{$key}", $row);
				}
			}
		}

        $campos = 'a.articulo_ultima_compra, a.articulo, b.codigo AS codigo_articulo, b.descripcion AS descripcion_articulo, c.presentacion, c.descripcion AS descripcion_presentacion, ';
        $campos.= 'a.ultimo_proveedor, d.razon_social AS proveedor, d.nit, a.ultimo_costo';

        $data = $this->db
            ->select($campos)
            ->join('articulo b', 'b.articulo = a.articulo')
            ->join('presentacion c', 'c.presentacion = a.presentacion')
            ->join('proveedor d', 'd.proveedor = a.ultimo_proveedor')
            ->get("{$this->_tabla} a");
        
        if(isset($args['_uno'])) {
            return $data->row();
        }

        return $data->result();
    }
    

}