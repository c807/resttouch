<?php
class Rpt_articulo_comandado_model extends General_model
{
    public function get_comandas_con_detalle($args = [])
    {
        if (isset($args['sede'])) {
            if (is_array($args['sede'])) {
                $this->db->where_in('a.sede', $args['sede']);
            } else {
                $this->db->where('a.sede', $args['sede']);
            }
        }

        if (isset($args['turno_tipo']) && !is_null($args['turno_tipo']) && (int)$args['turno_tipo'] > 0) {
            $this->db->where('f.turno_tipo', $args['turno_tipo']);
        }

        $tipoFecha = 'DATE(a.fhcreacion)';
        if (isset($args['tipo_fecha'])) {
            switch ((int)$args['tipo_fecha']) {
                case 2:
                    $tipoFecha = 'DATE(e.fecha)';
                    break;
                case 3:
                    $tipoFecha = 'DATE(e.inicio)';
                    break;
                case 4:
                    $tipoFecha = 'DATE(e.fin)';
                    break;
            }
        }

        if (isset($args['fdel'])) {
            $this->db->where("{$tipoFecha} >=", $args['fdel']);
        }

        if (isset($args['fal'])) {
            $this->db->where("{$tipoFecha} <=", $args['fal']);
        }

        $select_comanda = "a.comanda, TRIM(CONCAT(TRIM(d.nombre), IFNULL(CONCAT(' (', d.alias, ')'), ''))) AS sede, f.descripcion AS turno_tipo";
        
        $comandas = $this->db
            ->select($select_comanda)
            ->join('sede d', 'd.sede = a.sede')
            ->join('turno e', 'e.turno = a.turno')
            ->join('turno_tipo f', 'f.turno_tipo = e.turno_tipo')
            ->get('comanda a')
            ->result();

        foreach ($comandas as &$comanda) {
            $this->db->where('a.comanda', $comanda->comanda);
            $this->db->where('a.cantidad >', 0);
            $this->db->where('(b.impuesto_especial IS NULL OR b.impuesto_especial != 1)');

            $select_detalle = 'a.detalle_comanda, a.comanda, b.descripcion AS articulo, a.cantidad, a.total';
            
            $detalle = $this->db
                ->select($select_detalle)
                ->join('articulo b', 'b.articulo = a.articulo')
                ->get('detalle_comanda a')
                ->result();

            $comanda->detalle = $detalle;
        }

        return $comandas;
    }
}
