<?php
class Rpt_articulo_comandado_model extends General_model
{
    public function get_comandas_con_detalle($args = [])
    {
        $this->db->select('GROUP_CONCAT(b.comanda SEPARATOR "-") AS comanda, TRIM(CONCAT(TRIM(s.nombre), IFNULL(CONCAT(" (", s.alias, ")"), ""))) AS sede, d.descripcion AS articulo, SUM(a.cantidad) AS cantidad, SUM(a.total) AS total, f.descripcion AS turno_tipo');
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

        if (isset($args['turno_tipo']) && !is_null($args['turno_tipo']) && (int)$args['turno_tipo'] > 0) {
            $this->db->where('c.turno_tipo', $args['turno_tipo']);
        }

        if (isset($args['fdel'])) {
            $this->db->where('DATE(a.fecha) >=', $args['fdel']);
        }

        if (isset($args['fal'])) {
            $this->db->where('DATE(a.fecha) <=', $args['fal']);
        }
        
        $this->db->group_by('s.nombre, s.alias, a.articulo, d.descripcion, f.descripcion');
        $result = $this->db->get()->result();
        return $result;
    }
}
