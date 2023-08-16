<?php
defined('BASEPATH') or exit('No direct script access allowed');

class BodegaArticuloCosto_model extends General_model
{

    public $bodega_articulo_costo;
    public $bodega;
    public $articulo;
    public $cuc_ingresado = 0.00;
    public $costo_ultima_compra = 0.00;
    public $cp_ingresado = 0.00;
    public $costo_promedio = 0.00;
    public $existencia_ingresada = 0.00;
    public $existencia = 0.00;
    public $fecha;

    public function __construct($id = "")
    {
        parent::__construct();
        $this->setTabla('bodega_articulo_costo');

        if (!empty($id)) {
            $this->cargar($id);
        }

        $this->load->model([
            'Articulo_model',
            'Sede_model',
            'Empresa_model'
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
        } else {
            $this->load->model(['Articulo_model']);
            $art = new Articulo_model($idArticulo);
            $costo = $art->getCosto(['bodega' => $idBodega]);
            if ($costo && (float)$costo > (float)0) {
                return (float)$costo * $pres->cantidad;
            } else {
                $costo = $art->getCosto();
                return (float)$costo * $pres->cantidad;
            }
        }

        return (float)0;
    }

    public function filtrar($args = [])
    {
        if (count($args) > 0) {
            foreach ($args as $key => $row) {
                if (substr($key, 0, 1) != "_") {
                    if (trim($key) === 'bodega') {
                        $key = 'a.bodega';
                    }
                    $this->db->where($key, $row);
                }
            }
        }

        $campos = 'a.bodega_articulo_costo, a.bodega, a.articulo, b.descripcion AS descripcion_articulo, CONCAT(TRIM(d.descripcion), " (", TRIM(e.descripcion), ")") AS subcategoria, b.presentacion_reporte, ';
        $campos .= 'c.descripcion AS descripcion_presentacion_reporte, c.cantidad AS cantidad_medida, a.cuc_ingresado, a.costo_ultima_compra, a.cp_ingresado, a.costo_promedio, a.existencia, a.fecha, ';
        $campos .= 'e.categoria, d.categoria_grupo, f.sede, TRIM(CONCAT(f.nombre, IFNULL(CONCAT(" (", f.alias, ")"), ""))) AS descripcion_sede';
        return $this->db
            ->select($campos)
            ->join('articulo b', 'b.articulo = a.articulo')
            ->join('presentacion c', 'c.presentacion = b.presentacion_reporte')
            ->join('categoria_grupo d', 'd.categoria_grupo = b.categoria_grupo')
            ->join('categoria e', 'e.categoria = d.categoria')
            ->join('sede f', 'f.sede = e.sede')
            ->order_by('b.descripcion')
            ->get('bodega_articulo_costo a')
            ->result();
    }

    public function get_articulos_excel($args = [])
    {
        if (isset($args['sede']) && (int)$args['sede'] > 0) {
            $this->db->where('d.sede', $args['sede']);
        }

        if (isset($args['bodega']) && (int)$args['bodega'] > 0) {
            $this->db->where('f.bodega', $args['bodega']);
        }

        if (isset($args['categoria']) && (int)$args['categoria'] > 0) {
            $this->db->where('c.categoria', $args['categoria']);
        }

        if (isset($args['categoria_grupo']) && (int)$args['categoria_grupo'] > 0) {
            $this->db->where('b.categoria_grupo', $args['categoria_grupo']);
        }

        $campos = 'TRIM(CONCAT(d.nombre, IFNULL(CONCAT(" (", d.alias, ")"), ""))) AS descripcion_sede, c.descripcion AS descripcion_categoria, b.descripcion AS descripcion_subcategoria, ';
        $campos .= 'f.bodega, f.descripcion AS descripcion_bodega, a.articulo, a.descripcion AS descripcion_articulo, e.descripcion AS descripcion_presentacion, 0.00000 AS costo_unitario, 0.00 AS existencia';        
        return $this->db
            ->select($campos, false)
            ->join('categoria_grupo b', 'b.categoria_grupo = a.categoria_grupo')
            ->join('categoria c', 'c.categoria = b.categoria')
            ->join('sede d', 'd.sede = c.sede')
            ->join('presentacion e', 'e.presentacion = a.presentacion_reporte')
            ->join('bodega f', 'f.bodega = b.bodega')
            ->where('a.mostrar_inventario', 1)
            ->where('a.debaja', 0)
            ->get('articulo a')
            ->result();
    }

    public function ajustar_costo_promedio_existencia($args)
    {
        $data_presentacion = $this->db->select('b.cantidad')->join('presentacion b', 'b.presentacion = a.presentacion_reporte')->where('a.articulo', $args['articulo'])->get('articulo a')->row();
        $cantidad_presentacion = (float)$data_presentacion->cantidad;

        if ($cantidad_presentacion > (float)0) {
            $args['costo_ultima_compra'] = round(abs($args['cuc_ingresado']) / $cantidad_presentacion, 5);
            $args['costo_promedio'] = round(abs($args['cp_ingresado']) / $cantidad_presentacion, 5);
            $args['existencia'] = round(abs($args['existencia_ingresada']) * $cantidad_presentacion, 2);
            $this->db->insert('bodega_articulo_costo', $args);
            return $this->db->affected_rows() > 0;
        } else {
            return false;
        }
    }
}
