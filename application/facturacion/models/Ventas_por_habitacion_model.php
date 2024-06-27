<?php
class Ventas_por_habitacion_model extends General_model
{
    public function get_reserva_data($fecha_del, $fecha_al, $sede) {
        $this->db->select("r.reserva, th.descripcion AS tipo_habitacion_descripcion, TRIM(CONCAT(TRIM(d.nombre), IFNULL(CONCAT(' (', d.alias, ')'), ''))) AS sede, 
            dc.cantidad, r.fecha_del, r.fecha_al, dc.precio");
        $this->db->from('reserva r');
        $this->db->join('tarifa_reserva tr', 'r.tarifa_reserva = tr.tarifa_reserva');
        $this->db->join('tipo_habitacion th', 'tr.tipo_habitacion = th.tipo_habitacion');
        $this->db->join('detalle_reserva dr', 'r.reserva = dr.reserva');
        $this->db->join('comanda c', 'r.reserva = c.reserva');
        $this->db->join('detalle_comanda dc', 'c.comanda = dc.comanda');
        $this->db->join('articulo a', 'dc.articulo = a.articulo');
        $this->db->join('impuesto_especial ie', 'a.impuesto_especial = ie.impuesto_especial');
        $this->db->join('sede d', 'd.sede = c.sede');
        $this->db->where('r.estatus_reserva !=', 1);
        $this->db->where('r.cobradoencomanda', 1);
        $this->db->where('r.fecha_del <=', $fecha_al);
        $this->db->where('r.fecha_al >=', $fecha_del);
        $this->db->where('c.sede', $sede);
        $this->db->where('ie.descripcion', 'TURISMO HOSPEDAJE');

        $query = $this->db->get();
        $result = $query->result();

        $reservas = [];
        $reservas_map = [];
        foreach ($result as $row) {
            $total_dias_reserva = (strtotime($row->fecha_al) - strtotime($row->fecha_del)) / (60 * 60 * 24) + 1;
            $dias_en_rango = (min(strtotime($row->fecha_al), strtotime($fecha_al)) - max(strtotime($row->fecha_del), strtotime($fecha_del))) / (60 * 60 * 24) + 1;
            $precio_por_dia = $row->precio / $total_dias_reserva;
            $precio_ajustado = $precio_por_dia * $dias_en_rango;

            if (!isset($reservas_map[$row->reserva])) {
                $reservas[] = (object)[
                    'tipo_habitacion_descripcion' => $row->tipo_habitacion_descripcion,
                    'sede' => $row->sede,
                    'cantidad' => $row->cantidad,
                    'precio' => $precio_ajustado
                ];
                $reservas_map[$row->reserva] = true;
            }
        }
        return $reservas;
    }
}

