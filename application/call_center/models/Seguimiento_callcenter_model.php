<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Seguimiento_callcenter_model extends CI_Model
{
    public function get_pedidos($args = [])
    {
        $this->load->model('Comanda_model');
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
        $campos.= 'a.tipo_domicilio, g.descripcion AS domicilio_tipo, a.repartidor, IFNULL(h.nombre, "No asignado") AS motorista, a.fhtomapedido, ';
        $campos.= '0 AS total_pedido, 0 AS total_propina, "" AS formas_pago';
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
            $pedido->forma_pago = $this->Comanda_model->get_forma_pago($pedido->comanda);
            $formas_pago = [];
            if (count($pedido->forma_pago) > 0) {
                foreach($pedido->forma_pago as $fp) {
                    $pedido->total_pedido += (float)$fp->monto;
                    $pedido->total_propina += (float)$fp->propina;
                    if (!in_array($fp->descripcion_forma_pago, $formas_pago)) {
                        $formas_pago[] = $fp->descripcion_forma_pago;
                    }
                }
                $pedido->formas_pago = implode(', ', $formas_pago);
            }
        }

        return $pedidos;
    }
}