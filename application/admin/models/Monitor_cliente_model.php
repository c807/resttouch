<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Monitor_cliente_model extends General_model {

    public $esquemas = [];
	
	public function __construct()
	{
		parent::__construct();

        $this->load->model(['Schema_model']);
        $this->cargar_esquemas();
	}	

    public function cargar_esquemas () {
        $this->esquemas = $this->Schema_model->get_schemas();        
    }

    public function get_ultima_comanda($schema)
    {
        $campos = 'e.corporacion, e.nombre AS nombre_corporacion, d.empresa, d.nombre AS nombre_empresa, b.sede, ';
        $campos.= 'TRIM(CONCAT(b.nombre, IFNULL(CONCAT(" (", b.alias, ")"), ""))) AS nombre_sede, a.comanda, DATE(a.fhcreacion) AS fhcreacion, ';
        $campos.= "(SELECT count(comanda) FROM {$schema}.comanda WHERE sede = a.sede) AS cantidad_comandas, ";
        $campos.= 'CONCAT(TRIM(e.nombre), "-", TRIM(d.nombre), "-", TRIM(CONCAT(b.nombre, IFNULL(CONCAT(" (", b.alias, ")"), ""))), "-", DATE_FORMAT(a.fhcreacion, "%Y%m%d")) AS ordenar_por';
        $ultima_comanda = $this->db
            ->select($campos)
            ->join("{$schema}.sede b", 'b.sede = a.sede')
            ->join("(SELECT MAX(comanda) AS ultima_comanda FROM {$schema}.comanda GROUP BY sede) c", 'a.comanda = c.ultima_comanda')
            ->join("{$schema}.empresa d", 'd.empresa = b.empresa')
            ->join("{$schema}.corporacion e", 'e.corporacion = d.corporacion')
            ->order_by('a.fhcreacion DESC')
            ->get("{$schema}.comanda a")
            ->result();

        return $ultima_comanda;
    }

    public function get_ultima_factura($schema) {
        $campos = 'e.corporacion, e.nombre AS nombre_corporacion, d.empresa, d.nombre AS nombre_empresa, b.sede, ';
        $campos.= 'TRIM(CONCAT(b.nombre, IFNULL(CONCAT(" (", b.alias, ")"), ""))) AS nombre_sede, a.factura, ';
        $campos.= 'IFNULL(CONCAT(a.serie_factura, "-", a.numero_factura), "") AS factura, a.fecha_factura, ';
        $campos.= 'IF(a.fel_uuid_anulacion IS NULL, "VIGENTE", "ANULADA") AS estatus,';
        $campos.= "(SELECT count(factura) FROM {$schema}.factura WHERE sede = a.sede) AS cantidad_facturas, ";
        $campos.= 'CONCAT(TRIM(e.nombre), "-", TRIM(d.nombre), "-", TRIM(CONCAT(b.nombre, IFNULL(CONCAT(" (", b.alias, ")"), ""))), "-", DATE_FORMAT(a.fecha_factura, "%Y%m%d")) AS ordenar_por';
        $ultima_factura = $this->db
            ->select($campos)
            ->join("{$schema}.sede b", 'b.sede = a.sede')
            ->join("(SELECT MAX(factura) AS ultima_factura FROM {$schema}.factura GROUP by sede) c", 'a.factura = c.ultima_factura')
            ->join("{$schema}.empresa d", 'd.empresa = b.empresa')
            ->join("{$schema}.corporacion e", 'e.corporacion = d.corporacion')
            ->order_by('a.fecha_factura DESC')
            ->get("{$schema}.factura a")
            ->result();

        return $ultima_factura;
    }

    public function get_ultimos_movimientos() {        
        $ultimas_comandas = [];
        $ultimas_facturas = [];
        foreach($this->esquemas as $esquema) {
            $uc = $this->get_ultima_comanda($esquema->SCHEMA_NAME);
            if ($uc && count($uc) > 0) {
                $ultimas_comandas = array_merge($ultimas_comandas, $uc);
            }
            
            $uf = $this->get_ultima_factura($esquema->SCHEMA_NAME);            
            if ($uf && count($uf) > 0) {
                $ultimas_facturas = array_merge($ultimas_facturas, $uf);
            }            
        }

        $ultimas_comandas = ordenar_array_objetos($ultimas_comandas, 'ordenar_por');
        $ultimas_facturas = ordenar_array_objetos($ultimas_facturas, 'ordenar_por');
        
        return (object)['ultimas_comandas' => $ultimas_comandas, 'ultimas_facturas' => $ultimas_facturas];
    }
}
