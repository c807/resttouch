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
    public $esajuste = 0;
    public $notas = null;

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
            'Empresa_model',
            'Ingreso_model'
        ]);
    }

    public function guardar_costos($idBodega, $idArticulo, $existencia = null)
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
        $bac->fecha = date('Y-m-d H:i:s');

        if (!is_null($existencia)) {
            $bac->existencia = $existencia;
        }

        return $bac->guardar();
    }

    public function get_datos_costo($idBodega = null, $idArticulo = null, $calcularExistencias = false)
    {
        if ($idBodega) {
            $this->db->where('a.bodega', (int)$idBodega);
        }

        if ($idArticulo) {
            $this->db->where('a.articulo', (int)$idArticulo);
        }

        $datos_de_costo = $this->db
            ->select('a.bodega_articulo_costo, f.metodo_costeo, a.costo_ultima_compra, a.costo_promedio, g.cantidad AS cantidad_presentacion, a.existencia')
            ->join('articulo b', 'b.articulo = a.articulo')
            ->join('categoria_grupo c', 'c.categoria_grupo = b.categoria_grupo')
            ->join('categoria d', 'd.categoria = c.categoria')
            ->join('sede e', 'e.sede = d.sede')
            ->join('empresa f', 'f.empresa = e.empresa')
            ->join('presentacion g', 'g.presentacion = b.presentacion_reporte')
            ->where('a.fecha IS NOT NULL')
            ->order_by('a.fecha DESC, a.bodega_articulo_costo DESC')
            ->limit(1)
            ->get('bodega_articulo_costo a')
            ->row();

        if($datos_de_costo && $idBodega && $idArticulo && $calcularExistencias) {
            $this->load->model(['Umedida_model', 'Articulo_model']);
            $sede = $this->db->select('sede')->where('bodega', $idBodega)->get('bodega')->row();
            $hoy = date('Y-m-d');
            $listaMedidas = $this->Umedida_model->get_lista_medidas();
		    $listaArticulos = $this->Articulo_model->get_lista_articulos();
            $art = new Articulo_model($idArticulo);
            $paramsExist = [
                'sede' => [0 => (int)$sede->sede], 'bodega' => [0 => (int)$idBodega], 
                'solo_bajo_minimo' => 0, '_excel' => 0, 'categoria_grupo' => (int)$art->categoria_grupo,
                'fecha_al' => $hoy, 'fecha' => $hoy
            ];						
            $existencia = $art->getExistencias($paramsExist, $listaMedidas, $listaArticulos);
            $datos_de_costo->existencia = $existencia && $existencia->saldo_calculado ? $existencia->saldo_calculado : round(0, 5);
        }

        return $datos_de_costo;
    }

    public function get_costo($idBodega, $idArticulo, $idPresentacion = null)
    {
        $datos_costo = $this->get_datos_costo($idBodega, $idArticulo);

        if (!$datos_costo) {
            $datos_costo = $this->get_datos_costo(null, $idArticulo);
        }

        $cantidad_presentacion = (float)0;
        if ((int)$idPresentacion > 0) {
            $pres = $this->db->select('cantidad')->where('presentacion', $idPresentacion)->get('presentacion')->row();
            $cantidad_presentacion = (float)$pres->cantidad;
        }

        if ($datos_costo) {
            if ($cantidad_presentacion === (float)0) {
                $cantidad_presentacion = (float)$datos_costo->cantidad_presentacion;
            }

            if ((int)$datos_costo->metodo_costeo === 1) {
                return (float)$datos_costo->costo_ultima_compra * $cantidad_presentacion;
            } else if ((int)$datos_costo->metodo_costeo === 2) {
                return (float)$datos_costo->costo_promedio * $cantidad_presentacion;
            }
        } else {

            $bac = $this->buscar(['bodega' => $idBodega, 'articulo' => $idArticulo, '_uno' => true]);

            if ($bac) {
                $dc = $this->db
                    ->select('c.sede, e.metodo_costeo, f.cantidad AS cantidad_presentacion')
                    ->join('categoria_grupo b', 'a.categoria_grupo = b.categoria_grupo')
                    ->join('categoria c', 'c.categoria = b.categoria')
                    ->join('sede d', 'd.sede = c.sede')
                    ->join('empresa e', 'e.empresa = d.empresa')
                    ->join('presentacion f', 'f.presentacion = a.presentacion_reporte')
                    ->where('a.articulo', $idArticulo)
                    ->get('articulo a')
                    ->row();

                if ($cantidad_presentacion === (float)0) {
                    $cantidad_presentacion = (float)$dc->cantidad_presentacion;
                }

                if ((int)$dc->metodo_costeo === 1) {
                    return (float)$bac->costo_ultima_compra * $cantidad_presentacion;
                } else if ((int)$dc->metodo_costeo == 2) {
                    return (float)$bac->costo_promedio * $cantidad_presentacion;
                }
            } else {
                $this->load->model(['Articulo_model']);
                $art = new Articulo_model($idArticulo);
                $pres = $this->db->select('cantidad')->where('presentacion', (int)$art->presentacion_reporte)->get('presentacion')->row();
                $costo = $art->getCosto(['bodega' => $idBodega]);
                if ($costo && (float)$costo > (float)0) {
                    $this->guardar_costos($idBodega, $idArticulo);
                    return (float)$costo * (float)$pres->cantidad;
                } else {
                    $costo = $art->getCosto();
                    return (float)$costo * (float)$pres->cantidad;
                }
            }
        }

        return (float)0;
    }

    public function filtrar($args = [])
    {
        if (count($args) > 0) {
            foreach ($args as $key => $row) {
                if (substr($key, 0, 1) != '_') {
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
        $args['fecha'] = date('Y-m-d');
        $articulosConIngreso = $this->Ingreso_model->get_articulos_con_ingresos($args);

        $lstArticulos = [];
        foreach ($articulosConIngreso as $art) {
            $lstArticulos[] = $art->articulo;
        }

        if (count($lstArticulos) > 0) {
            $campos = 'TRIM(CONCAT(d.nombre, IFNULL(CONCAT(" (", d.alias, ")"), ""))) AS descripcion_sede, c.descripcion AS descripcion_categoria, b.descripcion AS descripcion_subcategoria, ';
            $campos .= "{$args['bodega']} AS bodega, (SELECT descripcion FROM bodega WHERE bodega = {$args['bodega']}) AS descripcion_bodega, ";
            $campos .= 'a.articulo, a.descripcion AS descripcion_articulo, e.descripcion AS descripcion_presentacion, 0.00000 AS costo_unitario, 0.00 AS existencia';
            return $this->db
                ->select($campos, false)
                ->join('categoria_grupo b', 'b.categoria_grupo = a.categoria_grupo')
                ->join('categoria c', 'c.categoria = b.categoria')
                ->join('sede d', 'd.sede = c.sede')
                ->join('presentacion e', 'e.presentacion = a.presentacion_reporte')
                ->where_in('a.articulo', $lstArticulos)
                ->get('articulo a')
                ->result();
        }

        return [];
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

    public function get_cargas_realizadas()
    {
        return $this->db
            ->select('DATE(a.fecha) AS fecha, CONCAT(c.nombre, IFNULL(CONCAT(" (", c.alias, ")"), "")) AS sede, b.descripcion AS bodega')
            ->join('bodega b', 'b.bodega = a.bodega')
            ->join('sede c', 'c.sede = b.sede')
            ->where('a.esajuste', 1)
            ->group_by('1, 2, 3')
            ->order_by('1 DESC, 2, 3')
            ->get('bodega_articulo_costo a')
            ->result();
    }

    public function get_detalle_carga_realizada($args)
    {
        $campos = 'a.fecha, CONCAT(c.nombre, IFNULL(CONCAT(" (", c.alias, ")"), "")) AS sede, b.descripcion AS bodega, d.descripcion AS articulo, e.descripcion AS presentacion, a.cuc_ingresado, ';
        $campos .= 'a.cp_ingresado, a.existencia_ingresada, f.metodo_costeo';
        return $this->db
            ->select($campos)
            ->join('bodega b', 'b.bodega = a.bodega')
            ->join('sede c', 'c.sede = b.sede')
            ->join('articulo d', 'd.articulo = a.articulo')
            ->join('presentacion e', 'e.presentacion = d.presentacion_reporte')
            ->join('empresa f', 'f.empresa = c.empresa')
            ->where('a.esajuste', 1)
            ->where('DATE(a.fecha)', $args['fecha'])
            ->order_by('1, 2, 3')
            ->get('bodega_articulo_costo a')
            ->result();
    }
}
