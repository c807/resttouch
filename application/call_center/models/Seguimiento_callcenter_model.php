<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Seguimiento_callcenter_model extends CI_Model
{
    public function get_pedidos($args = [])
    {
        if (isset($args["_fdel"])) {
            $this->db->where('DATE(a.fhcreacion) >=', $args["_fdel"]);
		}

		if (isset($args["_fal"])) {
            $this->db->where('DATE(a.fhcreacion) <=', $args["_fal"]);
		}

        if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where("a.{$key}", $row);
				}
			}
		}

        $campos = 'a.comanda, a.usuario, b.nombres, b.apellidos, a.sede, c.nombre AS sede_atiende, a.comanda_origen_datos, a.fhcreacion, ';
        $campos.= 'IFNULL(a.notas_generales, "No tiene") AS observaciones, a.cliente_master, d.nombre AS cliente, a.tiempo_entrega, ';
        $campos.= 'e.descripcion AS tiempo_ofrecido, a.estatus_callcenter, f.descripcion AS estatus, f.color AS color_estatus, ';
        $campos.= 'a.tipo_domicilio, g.descripcion AS domicilio_tipo, a.repartidor, IFNULL(h.nombre, "No asignado") AS motorista, a.fhtomapedido';
        $pedidos = $this->db->select($campos, false)
            ->join('usuario b', 'b.usuario = a.usuario')
            ->join('sede c', 'c.sede = a.sede')
            ->join('cliente_master d', 'd.cliente_master = a.cliente_master')
            ->join('tiempo_entrega e', 'e.tiempo_entrega = a.tiempo_entrega')
            ->join('estatus_callcenter f', 'f.estatus_callcenter = a.estatus_callcenter')
            ->join('tipo_domicilio g', 'g.tipo_domicilio = a.tipo_domicilio')
            ->join('repartidor h', 'h.repartidor = a.repartidor', 'left')
            ->order_by('a.fhcreacion', 'DESC')
            ->get('comanda a')
            ->result();
        
        foreach($pedidos as $pedido) {
            try {                
                $pedido->comanda_origen_datos = json_decode($pedido->comanda_origen_datos);
            } catch (Exception $e) {
                $pedido->comanda_origen_datos = (object)[];
            }
            $cmdHisto = $this->Cliente_master_model->get_historico(['comanda' => $pedido->comanda]);
            $pedido->detalle = $cmdHisto && count($cmdHisto) > 0 ? $cmdHisto[0]->detalle : [];
        }

        return $pedidos;
    }
}