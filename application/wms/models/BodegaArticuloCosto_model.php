<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class BodegaArticuloCosto_model extends General_model {

	public $bodega_articulo_costo;
	public $bodega;
	public $articulo;
	public $costo_ultima_compra = 0.00;
	public $costo_promedio = 0.00;
    // public $existencia = 0.00;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("bodega_articulo_costo");

		if(!empty($id)) {
			$this->cargar($id);
        }
        
        $this->load->model([ 
            'Articulo_model',
            'Sede_model'
        ]);
    }
    
    public function guardar_costos($idBodega, $idArticulo)
    {
        $obj = $this->buscar(['bodega' => $idBodega, 'articulo' => $idArticulo, '_uno' => true]);
        $bac = new BodegaArticuloCosto_model($obj ? $obj->bodega_articulo_costo : '');
        $art = new Articulo_model($idArticulo);

        if (!$bac->bodega_articulo_costo) {
            $bac->bodega = $idBodega;
            $bac->articulo = $idArticulo;
        }

        $costoUltimaCompra = $art->getCosto(['bodega' => $idBodega, 'metodo_costeo' => 1]);
        $costoPromedio = $art->getCosto(['bodega' => $idBodega, 'metodo_costeo' => 2]);

        $bac->costo_ultima_compra = $costoUltimaCompra ? $costoUltimaCompra : 0.00;
        $bac->costo_promedio = $costoPromedio ? $costoPromedio : 0.00;

        return $bac->guardar();
    }

    public function get_costo($idBodega, $idArticulo, $idPresentacion)
    {        
        $pres = $this->db->where("presentacion", $idPresentacion)->get("presentacion")->row();

        $sede = $this->db
            ->select("c.sede")
            ->join("categoria_grupo b", "a.categoria_grupo = b.categoria_grupo")
            ->join("categoria c", "c.categoria = b.categoria")
            ->where("a.articulo", $idArticulo)
            ->get("articulo a")
            ->row();

        $sede = new Sede_model($sede->sede);
        $emp = $sede->getEmpresa();

        $bac = $this->buscar(['bodega' => $idBodega, 'articulo' => $idArticulo, '_uno' => true]);

        if ($bac) {
            if ($emp->metodo_costeo == 1) {
                return $bac->costo_ultima_compra * $pres->cantidad;
            } else if ($emp->metodo_costeo == 2) {
                return $bac->costo_promedio * $pres->cantidad;
            }
        }

        return 0.00;
    }
}