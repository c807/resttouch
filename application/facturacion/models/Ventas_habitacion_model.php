<?php
class Ventas_habitacion_model extends General_model
{
    public function get_reserva_data($fecha_del, $fecha_al, $sede) {
        $this->db->select("
            r.reserva, 
            a.descripcion AS articulo_descripcion, 
            TRIM(CONCAT(TRIM(d.nombre), IFNULL(CONCAT(' (', d.alias, ')'), ''))) AS sede, 
            r.fecha_del, 
            r.fecha_al, 
            tr.monto AS precio_diario,
            a.articulo
        ");
        $this->db->from('reserva r');
        $this->db->join('tarifa_reserva tr', 'r.tarifa_reserva = tr.tarifa_reserva');
        $this->db->join('articulo a', 'tr.articulo = a.articulo');
        $this->db->join('detalle_reserva dr', 'r.reserva = dr.reserva');
        $this->db->join('comanda c', 'r.reserva = c.reserva');
        $this->db->join('impuesto_especial ie', 'a.impuesto_especial = ie.impuesto_especial');
        $this->db->join('sede d', 'd.sede = c.sede');
        $this->db->where('r.estatus_reserva !=', 1);
        $this->db->where('r.fecha_del <=', $fecha_al);
        $this->db->where('r.fecha_al >=', $fecha_del);
        $this->db->where('c.sede', $sede);
        $this->db->where('ie.descripcion', 'TURISMO HOSPEDAJE');

        $query = $this->db->get();
        $result = $query->result();

        $reservas = [];
        $reservas_map = [];
        $processed_reservas = [];
        
        foreach ($result as $row) {
            if (!in_array($row->reserva, $processed_reservas)) {
                $dias_en_rango = (min(strtotime($row->fecha_al), strtotime($fecha_al)) - max(strtotime($row->fecha_del), strtotime($fecha_del))) / (60 * 60 * 24) + 1;
                $precio_ajustado = $row->precio_diario * $dias_en_rango;
                $key = $row->articulo . '_' . $row->precio_diario;
                if (!isset($reservas_map[$key])) {
                    $reservas_map[$key] = (object)[
                        'articulo_descripcion' => $row->articulo_descripcion,
                        'sede' => $row->sede,
                        'cantidad' => $dias_en_rango,
                        'precio' => $row->precio_diario,
                        'total' => $precio_ajustado
                    ];
                } else {
                    $reservas_map[$key]->cantidad += $dias_en_rango;
                    $reservas_map[$key]->total += $precio_ajustado;
                }
                $processed_reservas[] = $row->reserva;
            }
        }
        foreach ($reservas_map as $reserva) {
            $reservas[] = $reserva;
        }
        return $reservas;
    }
}


