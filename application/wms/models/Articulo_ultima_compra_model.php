<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Articulo_ultima_compra_model extends General_model
{

    public $articulo_ultima_compra;
    public $articulo;
    public $presentacion;
    public $ultimo_proveedor;
    public $ultimo_costo = 0.00;

    public function __construct($id = "")
    {
        parent::__construct();
        $this->setTabla('articulo_ultima_compra');

        if (!empty($id)) {
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
        $campos .= 'a.ultimo_proveedor, d.razon_social AS proveedor, d.nit, a.ultimo_costo';

        $data = $this->db
            ->select($campos)
            ->join('articulo b', 'b.articulo = a.articulo')
            ->join('presentacion c', 'c.presentacion = a.presentacion')
            ->join('proveedor d', 'd.proveedor = a.ultimo_proveedor')
            ->get("{$this->_tabla} a");

        if (isset($args['_uno'])) {
            return $data->row();
        }

        return $data->result();
    }

    public function get_articulos_proveedor($idSede, $idProveedor = null)
    {
        $proveedores = [];
        // Artículos con proveedor
        if ((int)$idProveedor > 0) {
            $prov = $this->db->select('proveedor, razon_social')->where('proveedor', $idProveedor)->get('proveedor')->row();
            $articulosConProveedor = $this->db
                ->select('a.articulo, a.descripcion')
                ->join('articulo_ultima_compra b', 'a.articulo = b.articulo')
                ->join('categoria_grupo c', 'c.categoria_grupo = a.categoria_grupo')
                ->join('categoria d', 'd.categoria = c.categoria')
                ->where('d.sede', $idSede)
                ->where('b.ultimo_proveedor', $idProveedor)
                ->group_by('a.articulo')
                ->order_by('a.descripcion')
                ->get('articulo a')
                ->result();

            foreach ($articulosConProveedor as $articulo) {
                $articulo->presentaciones = $this->db
                    ->select('a.presentacion, b.descripcion AS descripcion_presentacion, MAX(a.ultimo_costo) AS ultimo_costo')
                    ->join('presentacion b', 'b.presentacion = a.presentacion')
                    ->where('a.articulo', $articulo->articulo)
                    ->where('a.ultimo_proveedor', $idProveedor)
                    ->group_by('a.presentacion')
                    ->order_by('b.descripcion')
                    ->get('articulo_ultima_compra a')
                    ->result();
            }

            $proveedores[] = (object)[
                'proveedor' => $prov->proveedor,
                'razon_social' => $prov->razon_social,
                'articulos' => $articulosConProveedor
            ];
        }

        // Artículos sin proveedor
        $articulosSinProveedor = $this->db
            ->select('a.articulo, a.descripcion, d.presentacion, d.descripcion AS descripcion_presentacion')
            ->join('categoria_grupo b', 'b.categoria_grupo = a.categoria_grupo')
            ->join('categoria c', 'c.categoria = b.categoria')
            ->join('presentacion d', 'd.presentacion = a.presentacion')
            ->join('articulo_ultima_compra e', 'e.articulo = a.articulo', 'left')
            ->where('c.sede', $idSede)
            ->where('a.mostrar_inventario', 1)
            ->where('e.articulo IS NULL')
            ->get('articulo a')
            ->result();

        if ($articulosSinProveedor && count($articulosSinProveedor) > 0) {
            $articulos = [];
            foreach ($articulosSinProveedor as $asp) {
                $articulos[] = (object)[
                    'articulo' => $asp->articulo,
                    'descripcion' => $asp->descripcion,
                    'presentaciones' => [
                        (object)[
                            'presentacion' => $asp->presentacion,
                            'descripcion_presentacion' => $asp->descripcion_presentacion,
                            'ultimo_costo' => null
                        ]
                    ]
                ];
            }
            $proveedores[] = (object)[
                'proveedor' => 0,
                'razon_social' => 'Sin proveedor',
                'articulos' => $articulos
            ];
        }

        return $proveedores;
    }
}
