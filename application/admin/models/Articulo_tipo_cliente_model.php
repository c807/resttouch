<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Articulo_tipo_cliente_model extends General_model
{

	public $articulo_tipo_cliente;
	public $articulo;
	public $tipo_cliente;
	public $precio = 0.00;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('articulo_tipo_cliente');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

    public function get_articulo_tipo_cliente($args = [])
    {
        $datos = $this->buscar($args);
        if (isset($args['_flat'])) {
            $datos = ordenar_array_objetos($datos, 'tipo_cliente', 1);
            return $datos;
        }

        foreach ($datos as $row) {
            $row->articulo = $this->db
                ->select('a.articulo, a.descripcion')
                ->where('a.articulo', $row->articulo)
                ->get('articulo a')
                ->row();

            $row->tipo_cliente = $this->db
                ->select('tipo_cliente, descripcion')
                ->where('tipo_cliente', $row->tipo_cliente)
                ->get('tipo_cliente')
                ->row();
            
            $row->orden = "{$row->articulo->descripcion}-{$row->tipo_cliente->descripcion}";
        }

        $datos = ordenar_array_objetos($datos, 'orden');
        return $datos;
    }


}