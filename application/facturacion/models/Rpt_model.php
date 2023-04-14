<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Rpt_model extends General_model
{

    public function __construct()
    {
        parent::__construct();
    }


    public function get_lista_comandas($args = [])
    {
        $comandas = '';
        if (isset($args['_rango_turno']) && $args['_rango_turno']) {
            $this->db->where('DATE(g.fecha) >=', $args['fdel']);
            $this->db->where('DATE(g.fecha) <=', $args['fal']);
        } else {
            // $this->db->where('DATE(a.fhcreacion) >=', $args['fdel']);
            // $this->db->where('DATE(a.fhcreacion) <=', $args['fal']);
            $this->db->where('f.fecha_factura >=', $args['fdel']);
            $this->db->where('f.fecha_factura <=', $args['fal']);
            // $where = "((f.fecha_factura >= {$args['fdel']} AND f.fecha_factura <= {$args['fal']}) OR f.fecha_factura > {$args['fal']})";
            // $this->db->where($where);
        }

        if (isset($args['turno_tipo'])) {
            $this->db->where('g.turno_tipo', $args['turno_tipo']);
        }

        if (isset($args['domicilio'])) {
			$this->db->where('a.domicilio', $args['domicilio']);			
		}

		if (isset($args['tipo_domicilio'])) {
			$this->db->where('a.tipo_domicilio', $args['tipo_domicilio']);			
		}

        $facturadas = $this->db
            ->select("GROUP_CONCAT(DISTINCT a.comanda ORDER BY a.comanda SEPARATOR ',') AS comandas, GROUP_CONCAT(DISTINCT f.factura ORDER BY f.factura SEPARATOR ',') AS facturas")
            ->join('detalle_comanda b', 'a.comanda = b.comanda')
            ->join('detalle_cuenta c', 'b.detalle_comanda = c.detalle_comanda')
            ->join('detalle_factura_detalle_cuenta d', 'c.detalle_cuenta = d.detalle_cuenta')
            ->join('detalle_factura e', 'e.detalle_factura = d.detalle_factura')
            ->join('factura f', 'f.factura = e.factura')
            ->join('turno g', 'g.turno = a.turno')
            ->where('f.numero_factura IS NOT NULL')
            ->where('f.fel_uuid_anulacion IS NULL')
            ->where('f.sede', $args['idsede'])
            ->where('a.sede', $args['idsede'])                        
            ->get('comanda a')
            ->row();

        if ($facturadas && $facturadas->comandas) {
            $comandas = $facturadas->comandas;
        }

        $data['facturas'] = $facturadas && $facturadas->facturas ? $facturadas->facturas : '';

        if (isset($args['_rango_turno']) && $args['_rango_turno']) {
            $this->db->where('DATE(e.fecha) >=', $args['fdel']);
            $this->db->where('DATE(e.fecha) <=', $args['fal']);
        } else {
            $this->db->where('DATE(a.fhcreacion) >=', $args['fdel']);
            $this->db->where('DATE(a.fhcreacion) <=', $args['fal']);
        }

        if (isset($args['turno_tipo'])) {
            $this->db->where('e.turno_tipo', $args['turno_tipo']);
        }

        if (isset($args['domicilio'])) {
			$this->db->where('a.domicilio', $args['domicilio']);			
		}

		if (isset($args['tipo_domicilio'])) {
			$this->db->where('a.tipo_domicilio', $args['tipo_domicilio']);			
		}

        $sinfactura = $this->db
            ->select("GROUP_CONCAT(DISTINCT a.comanda ORDER BY a.comanda SEPARATOR ',') AS comandas")
            ->join('cuenta b', 'a.comanda = b.comanda')
            ->join('cuenta_forma_pago c', 'b.cuenta = c.cuenta')
            ->join('forma_pago d', 'd.forma_pago = c.forma_pago')
            ->join('turno e', 'e.turno = a.turno')            
            ->where('a.sede', $args['idsede'])
            ->where('d.sinfactura', 1)            
            ->get('comanda a')
            ->row();

        if ($sinfactura && $sinfactura->comandas) {
            if ($comandas !== '') {
                $comandas .= ', ';
            }
            $comandas .= $sinfactura->comandas;
        }

        $data['comandas'] = $comandas;

        return (object)$data;
    }


    public function get_ventas_articulos($comandas = '', $facturas = '', $args = [])
    {
        $combos = [];
        $multiples = [];
        $extras = [];
        $directos = [];

        if (!empty($comandas)) {
            $combos = $this->db
                ->select('a.articulo, b.descripcion, SUM(a.cantidad) AS cantidad, SUM(a.total + a.aumento) AS total')
                ->join('articulo b', 'b.articulo = a.articulo')
                ->join('comanda c', 'c.comanda = a.comanda')
                ->where("a.comanda IN({$comandas})")
                ->where('b.multiple', 0)
                ->where('b.combo', 1)
                ->where('a.cantidad >', 0)
                ->where('b.esextra', 0)
                // ->where('DATE(c.fhcreacion) >=', $args['fdel'])
                // ->where('DATE(c.fhcreacion) <=', $args['fal'])
                ->group_by('a.articulo, b.descripcion')                
                ->get('detalle_comanda a')
                ->result();
    
            $multiples = $this->db
                ->select('a.articulo, b.descripcion, COUNT(a.articulo) AS cantidad, SUM(a.total + a.aumento) AS total', false)
                ->join('articulo b', 'b.articulo = a.articulo')
                ->join('comanda c', 'c.comanda = a.comanda')
                ->where("a.comanda IN({$comandas})")
                ->where('a.detalle_comanda_id IS NOT NULL')
                ->where('b.multiple', 0)
                ->where('b.combo', 0)                
                ->where('a.cantidad >', 0)
                ->where('b.esextra', 0)
                // ->where('DATE(c.fhcreacion) >=', $args['fdel'])
                // ->where('DATE(c.fhcreacion) <=', $args['fal'])
                ->group_by('a.articulo, b.descripcion')                
                ->get('detalle_comanda a')
                ->result();

            $extras = $this->db
                ->select('a.articulo, b.descripcion, SUM(a.cantidad) AS cantidad, SUM(a.total + a.aumento) AS total', false)
                ->join('articulo b', 'b.articulo = a.articulo')
                ->join('comanda c', 'c.comanda = a.comanda')
                ->where("a.comanda IN({$comandas})")
                ->where('a.detalle_comanda_id IS NOT NULL')
                ->where('b.multiple', 0)
                ->where('b.combo', 0)                
                ->where('a.cantidad >', 0)                
                ->where('b.esextra', 1)
                ->group_by('a.articulo, b.descripcion')                
                ->get('detalle_comanda a')
                ->result();
    
            $directos = $this->db
                ->select('a.articulo, b.descripcion, SUM(a.cantidad) AS cantidad, SUM(a.total + a.aumento) AS total')
                ->join('articulo b', 'b.articulo = a.articulo')
                ->join('comanda c', 'c.comanda = a.comanda')
                ->where("a.comanda IN({$comandas})")
                ->where('a.detalle_comanda_id IS NULL')
                ->where('b.multiple', 0)
                ->where('b.combo', 0)
                ->where('a.total >', 0)
                // ->where('a.total <>', 0)
                ->where('a.cantidad >', 0)
                ->where('b.esextra', 0)
                // ->where('DATE(c.fhcreacion) >=', $args['fdel'])
                // ->where('DATE(c.fhcreacion) <=', $args['fal'])
                ->group_by('a.articulo, b.descripcion')                
                ->get('detalle_comanda a')
                ->result();
        }

        $facturas_manuales = [];

        if(!isset($args['turno_tipo']) && !isset($args['domicilio'])) {
            $facturas_manuales = $this->db
                ->select('b.articulo, c.descripcion, SUM(b.cantidad) AS cantidad, SUM(b.total) AS total')
                ->join('detalle_factura b', 'a.factura = b.factura')
                ->join('articulo c', 'c.articulo = b.articulo')                
                ->join('detalle_factura_detalle_cuenta f', 'b.detalle_factura = f.detalle_factura', 'left')
                ->where('a.sede', $args['idsede'])
                ->where('a.fel_uuid IS NOT NULL')
                ->where('a.fel_uuid_anulacion IS NULL')
                ->where('a.fecha_factura >=', $args['fdel'])
                ->where('a.fecha_factura <=', $args['fal'])
                ->not_like('c.descripcion', 'prop')
                ->where('f.detalle_factura_detalle_cuenta IS NULL')                
                ->group_by('b.articulo, c.descripcion')
                ->get('factura a')
                ->result();
        }

        $articulos = array_merge($combos, $multiples, $extras, $directos, $facturas_manuales);
        if (!empty($articulos)) {
            $articulos = ordenar_array_objetos($articulos, 'descripcion');
        }

        return $articulos;
    }

    public function get_ventas_categorias($comandas = '', $facturas = '', $args = [])
    {
        $combos = [];        
        $directos = [];

        if (!empty($comandas)) {
            $combos = $this->db
                ->select('a.detalle_comanda, d.categoria AS idcat, d.descripcion AS categoria, c.categoria_grupo AS idsubcat, c.descripcion AS subcategoria, b.articulo AS idarticulo, b.descripcion AS articulo, a.cantidad, (a.total + a.aumento) AS total, a.precio, b.combo')
                ->join('articulo b', 'b.articulo = a.articulo')
                ->join('categoria_grupo c', 'c.categoria_grupo = b.categoria_grupo')
                ->join('categoria d', 'd.categoria = c.categoria')
                ->join('comanda e', 'e.comanda = a.comanda')
                ->where("a.comanda IN({$comandas})")
                ->where('b.multiple', 0)
                ->where('b.combo', 1)
                ->where('a.cantidad >', 0)
                // ->where('DATE(e.fhcreacion) >=', $args['fdel'])
                // ->where('DATE(e.fhcreacion) <=', $args['fal'])
                ->order_by('d.descripcion, c.descripcion, b.descripcion')
                ->get('detalle_comanda a')
                ->result();

            $directos = $this->db
                ->select('a.detalle_comanda, d.categoria AS idcat, d.descripcion AS categoria, c.categoria_grupo AS idsubcat, c.descripcion AS subcategoria, b.articulo AS idarticulo, b.descripcion AS articulo, a.cantidad, (a.total + a.aumento) AS total, a.precio, b.combo')
                ->join('articulo b', 'b.articulo = a.articulo')
                ->join('categoria_grupo c', 'c.categoria_grupo = b.categoria_grupo')
                ->join('categoria d', 'd.categoria = c.categoria')
                ->join('comanda e', 'e.comanda = a.comanda')
                ->where("a.comanda IN({$comandas})")
                ->where('a.detalle_comanda_id IS NULL')
                ->where('b.multiple', 0)
                ->where('b.combo', 0)
                ->where('a.total >', 0)
                // ->where('a.total <>', 0)
                ->where('a.cantidad >', 0)
                // ->where('DATE(e.fhcreacion) >=', $args['fdel'])
                // ->where('DATE(e.fhcreacion) <=', $args['fal'])
                ->order_by('d.descripcion, c.descripcion, b.descripcion')
                ->get('detalle_comanda a')
                ->result();
        }

        $facturas_manuales = [];

        if(!isset($args['turno_tipo']) && !isset($args['domicilio'])) {
            // if(!empty($facturas)) {            
            //     $this->db->where("b.factura NOT IN({$facturas})");
            // }    
            $facturas_manuales = $this->db
                ->select('0 AS detalle_comanda, e.categoria AS idcat, e.descripcion AS categoria, d.categoria_grupo AS idsubcat, d.descripcion AS subcategoria, c.articulo AS idarticulo, c.descripcion AS articulo, b.cantidad, b.total, b.precio_unitario AS precio', false)
                ->join('detalle_factura b', 'a.factura = b.factura')
                ->join('articulo c', 'c.articulo = b.articulo')
                ->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo')
                ->join('categoria e', 'e.categoria = d.categoria')
                ->join('detalle_factura_detalle_cuenta f', 'b.detalle_factura = f.detalle_factura', 'left')
                ->where('a.sede', $args['idsede'])
                ->where('a.fel_uuid IS NOT NULL')
                ->where('a.fel_uuid_anulacion IS NULL')
                ->where('a.fecha_factura >=', $args['fdel'])
                ->where('a.fecha_factura <=', $args['fal'])
                ->not_like('c.descripcion', 'prop')
                ->where('f.detalle_factura_detalle_cuenta IS NULL')
                ->order_by('e.descripcion, d.descripcion, c.descripcion')
                ->get('factura a')
                ->result();
        }

        $articulos = array_merge($combos, $directos, $facturas_manuales);

        return $articulos;
    }

    public function get_suma_descuentos($comandas) 
    {
        $descuentos = 0;
        $mnt = $this->db->select_sum('a.monto')
            ->join('forma_pago b', 'b.forma_pago = a.forma_pago')
            ->where('b.descuento', 1)
            ->where("cuenta IN(SELECT cuenta FROM cuenta WHERE comanda IN({$comandas}))", NULL, FALSE)
            ->get('cuenta_forma_pago a')
            ->row();
        
        if ($mnt) {
            $descuentos = (float)$mnt->monto;
        }
        return $descuentos;
    }

    public function get_suma_propinas($comandas)
    {
        $propina = 0;
        $mnt = $this->db->select_sum('propina')
            ->where("cuenta IN(SELECT cuenta FROM cuenta WHERE comanda IN({$comandas}))", NULL, FALSE)
            ->get('cuenta_forma_pago')
            ->row();
        
        if ($mnt) {
            $propina = (float)$mnt->propina;
        }
        return $propina;        

    }

    public function get_detalle_ventas_mesero($comandas, $args = [], $soloMeseros = true)
    {
        if (isset($args['idsede'])) {
            $this->db->where('a.sede', $args['idsede']);
        }

        if (isset($args['mesero'])) {
            $this->db->where('a.mesero', $args['mesero']);
        }

        if ($soloMeseros) {
            $this->db->select('a.mesero, b.nombres, b.apellidos');
            $this->db->group_by('a.mesero');
            $this->db->order_by('b.nombres, b.apellidos');
        } else {
            $this->db->select('d.descripcion, SUM(c.cantidad) AS cantidad, SUM(c.total + c.aumento) AS total');
            $this->db->group_by('c.articulo');
            $this->db->order_by('3 DESC, d.descripcion');
        }

        $data = $this->db
            ->join('usuario b', 'b.usuario = a.mesero')
            ->join('detalle_comanda c', 'a.comanda = c.comanda')
            ->join('articulo d', 'd.articulo = c.articulo')
            ->where('c.cantidad >', 0)
            // ->where('c.total >', 0)
            ->where('c.total <>', 0)
            ->where("a.comanda IN({$comandas})")
            ->get('comanda a')->result();

        if ($soloMeseros) {            
            foreach($data as $mesero) {
                $args['mesero'] = $mesero->mesero;
                $mesero->ventas = $this->get_detalle_ventas_mesero($comandas, $args, false);
            }
        }

        return $data;
    }

    public function get_tipo_domicilio($idTipoDomicilio)
    {
        return $this->db->where('tipo_domicilio', $idTipoDomicilio)->get('tipo_domicilio')->row();
    }
}
