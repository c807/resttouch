<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Resumen_traslados_model extends CI_Model {

    public function get_resumen_traslados($params) {
        $fecha_del = isset($params['fdel']) ? $params['fdel'] : date('Y-m-d');
        $fecha_al = isset($params['fal']) ? $params['fal'] : date('Y-m-d');
        $bodega = isset($params['bodega']) ? $params['bodega'] : 0;
        $bodega_destino = isset($params['bodega_destino']) ? $params['bodega_destino'] : [];

        $this->db->select('ed.articulo, a.descripcion as articulo_descripcion, ed.precio_unitario,
                           e.bodega_destino, SUM(ed.cantidad) as cantidad,
                           b1.descripcion as bodega_origen, s1.nombre as sede_origen, s1.alias as alias_origen,
                           b2.descripcion as bodega_destino_desc, s2.nombre as sede_destino, s2.alias as alias_destino');
        $this->db->from('egreso e');
        $this->db->join('bodega b1', 'e.bodega = b1.bodega');
        $this->db->join('sede s1', 'b1.sede = s1.sede');
        $this->db->join('bodega b2', 'e.bodega_destino = b2.bodega');
        $this->db->join('sede s2', 'b2.sede = s2.sede');
        $this->db->join('egreso_detalle ed', 'e.egreso = ed.egreso');
        $this->db->join('articulo a', 'ed.articulo = a.articulo');
        $this->db->where('e.fecha >=', $fecha_del);
        $this->db->where('e.fecha <=', $fecha_al);
        $this->db->where('e.bodega', $bodega);
        $this->db->where('e.traslado', 1);
        $this->db->where('e.estatus_movimiento', 2);
        if (!empty($bodega_destino)) {
            $this->db->where_in('e.bodega_destino', $bodega_destino);
        }
        $this->db->group_by(['ed.articulo', 'e.bodega_destino', 'ed.precio_unitario', 'b1.descripcion', 's1.nombre', 's1.alias', 'b2.descripcion', 's2.nombre', 's2.alias']);
        $query = $this->db->get();
        return $query->result_array();
    }
}

