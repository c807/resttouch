<?php
class Rpt_articulo_comandado_model extends General_model
{

    private function calculaPrecioExtra($detalle_comanda = null, $precioExtra = 0) {
        if (!$detalle_comanda) {
            return $precioExtra;
        }

        $res = $this->db->select('SUM(total) AS total, GROUP_CONCAT(DISTINCT detalle_comanda SEPARATOR ",") detalle_comanda')
            ->where("detalle_comanda_id IN({$detalle_comanda})")
            ->get('detalle_comanda')
            ->row();
        
        if ($res) {
            $precioExtra += (float)$res->total;
            $detalle_comanda = $res->detalle_comanda;
            if ($detalle_comanda) {
                $precioExtra += $this->calculaPrecioExtra($detalle_comanda);
            }            
        }

        return $precioExtra;
    }

    public function get_comandas_con_detalle($args = [])
    {
        $campos = 'GROUP_CONCAT(DISTINCT b.comanda SEPARATOR ", ") AS comanda, TRIM(CONCAT(TRIM(s.nombre), IFNULL(CONCAT(" (", s.alias, ")"), ""))) AS sede, d.descripcion AS articulo, SUM(a.cantidad) AS cantidad, ';
        $campos.= 'SUM(a.total) AS total, f.descripcion AS turno_tipo, ';
        $campos.= 'GROUP_CONCAT(DISTINCT a.detalle_comanda SEPARATOR ",") AS detalle_comanda';
        $this->db->select($campos);
        $this->db->from('detalle_comanda a');
        $this->db->join('comanda b', 'b.comanda = a.comanda');
        $this->db->join('turno c', 'c.turno = b.turno');
        $this->db->join('articulo d', 'd.articulo = a.articulo');
        $this->db->join('sede s', 's.sede = b.sede');
        $this->db->join('turno_tipo f', 'f.turno_tipo = c.turno_tipo');
        $this->db->join('impuesto_especial e', 'e.impuesto_especial = d.impuesto_especial', 'left');
        $this->db->where('a.cantidad <>', 0);
        $this->db->where('a.detalle_comanda_id IS NULL', null, false);
        $this->db->where("(TRIM(e.descripcion) <> 'TURISMO HOSPEDAJE' OR e.descripcion IS NULL)", null, false);

        if (isset($args['sede'])) {
            if (is_array($args['sede'])) {
                $this->db->where_in('b.sede', $args['sede']);
            } else {
                $this->db->where('b.sede', $args['sede']);
            }
        }

        if (isset($args['fdel'])) {
            $this->db->where('DATE(a.fecha) >=', $args['fdel']);
        }

        if (isset($args['fal'])) {
            $this->db->where('DATE(a.fecha) <=', $args['fal']);
        }        
        
        $this->db->group_by('s.sede, d.articulo');
        $this->db->order_by('2, d.descripcion');
        $result = $this->db->get()->result();

        $cntArticulosVendidos = count($result);
        for ($i = 0; $i < $cntArticulosVendidos; $i++) {
            $articuloVendido = $result[$i];
            $precioExtra = $this->calculaPrecioExtra($articuloVendido->detalle_comanda);
            $articuloVendido->total = (float)$articuloVendido->total + $precioExtra;
        }

        return $result;
    }
}
