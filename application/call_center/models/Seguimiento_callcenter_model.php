<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Seguimiento_callcenter_model extends CI_Model
{
    public function get_pedidos($args = [])
    {
        $this->load->model(['Comanda_model', 'Factura_model']);
        if (isset($args['_fdel'])) {
            $this->db->where('DATE(a.fhcreacion) >=', $args['_fdel']);
        }

        if (isset($args['_fal'])) {
            $this->db->where('DATE(a.fhcreacion) <=', $args['_fal']);
        }

        if (count($args) > 0) {
            foreach ($args as $key => $row) {
                if (substr($key, 0, 1) != '_') {
                    $this->db->where("a.{$key}", $row);
                }
            }
        }

        $campos = 'a.comanda, a.usuario, b.nombres, b.apellidos, a.sede, IFNULL(c.alias, c.nombre) AS sede_atiende, a.comanda_origen_datos, a.fhcreacion, ';
        $campos .= 'IFNULL(a.notas_generales, "No tiene") AS observaciones, a.cliente_master, d.nombre AS cliente, a.tiempo_entrega, ';
        $campos .= 'e.descripcion AS tiempo_ofrecido, a.estatus_callcenter, f.descripcion AS estatus, f.color AS color_estatus, ';
        $campos .= 'a.tipo_domicilio, g.descripcion AS domicilio_tipo, a.repartidor, IFNULL(h.nombre, "No asignado") AS motorista, a.fhtomapedido, ';
        $campos .= '0 AS total_pedido, 0 AS total_propina, "" AS formas_pago';
        $pedidos = $this->db->select($campos, false)
            ->join('usuario b', 'b.usuario = a.usuario')
            ->join('sede c', 'c.sede = a.sede')
            ->join('cliente_master d', 'd.cliente_master = a.cliente_master')
            ->join('tiempo_entrega e', 'e.tiempo_entrega = a.tiempo_entrega')
            ->join('estatus_callcenter f', 'f.estatus_callcenter = a.estatus_callcenter')
            ->join('tipo_domicilio g', 'g.tipo_domicilio = a.tipo_domicilio')
            ->join('repartidor h', 'h.repartidor = a.repartidor', 'left')
            ->where('a.tiempo_entrega IS NOT NULL')
            ->where('a.tipo_domicilio IS NOT NULL')
            ->order_by('a.fhcreacion', 'DESC')
            ->get('comanda a')
            ->result();

        $lista_comandas = '';
        foreach ($pedidos as $pedido) {
            if ($lista_comandas !== '') {
                $lista_comandas .= ',';
            }
            $lista_comandas .= $pedido->comanda;
        }

        $formas_pago_comandas = [];
        $facturas_comandas = [];
        $detalle_comandas = [];

        if ($lista_comandas !== '') {
            $formas_pago_comandas = $this->db
                ->select('d.forma_pago, d.descripcion AS descripcion_forma_pago, c.monto, c.propina, c.documento, c.vuelto_para, c.vuelto, c.cuenta_forma_pago, b.cuenta, a.comanda')
                ->join('cuenta b', 'a.comanda = b.comanda')
                ->join('cuenta_forma_pago c', 'b.cuenta = c.cuenta')
                ->join('forma_pago d', 'd.forma_pago = c.forma_pago')
                ->where("a.comanda IN ({$lista_comandas})")
                ->order_by('a.comanda, d.descripcion')
                ->get('comanda a')
                ->result();
    
            $facturas_comandas = $this->db
                ->select('e.comanda, f.nombre, f.nit, f.direccion, f.correo as email')
                ->join('detalle_factura b', 'a.factura = b.factura')
                ->join('detalle_factura_detalle_cuenta c', 'b.detalle_factura = c.detalle_factura')
                ->join('detalle_cuenta d', 'c.detalle_cuenta = d.detalle_cuenta')
                ->join('cuenta e', 'e.cuenta = d.cuenta_cuenta')
                ->join('cliente f', 'f.cliente = a.cliente')
                ->where("e.comanda IN({$lista_comandas})")
                ->group_by('e.comanda')
                ->get('factura a')
                ->result();
    
            $detalle_comandas = $this->db
                ->select('a.comanda, a.detalle_comanda, a.cantidad, a.articulo, b.descripcion, a.notas, a.detalle_comanda_id, b.multiple, b.esreceta, b.esextra')
                ->join('articulo b', 'b.articulo = a.articulo')
                ->where('a.cantidad >', 0)
                ->where("a.comanda IN({$lista_comandas})")
                ->order_by('a.comanda, a.detalle_comanda')
                ->get('detalle_comanda a')
                ->result();
        }

        foreach ($pedidos as $pedido) {
            try {
                $pedido->comanda_origen_datos = json_decode($pedido->comanda_origen_datos);
            } catch (Exception $e) {
                $pedido->comanda_origen_datos = (object)[];
            }
            // $cmdHisto = $this->Cliente_master_model->get_historico(['comanda' => $pedido->comanda], false, false);
            // $pedido->detalle = $cmdHisto && count($cmdHisto) > 0 ? $cmdHisto[0]->detalle : [];            
            $pedido->detalle = $this->get_detalle_pedido($detalle_comandas, $pedido->comanda);
            // $pedido->forma_pago = $this->Comanda_model->get_forma_pago($pedido->comanda);
            $pedido->forma_pago = $this->get_forma_pago_comanda($formas_pago_comandas, $pedido->comanda);
            // $cmd = new Comanda_model($pedido->comanda);
            // $factura = $cmd->getFactura();
            // $pedido->datos_facturacion = ($factura && isset($factura->cliente) && (int)$factura->cliente > 0) ? $this->db->select('nombre, nit, direccion, correo AS email')->where('cliente', $factura->cliente)->get('cliente')->row() : null;
            $pedido->datos_facturacion = $this->get_datos_facturacion($facturas_comandas, $pedido->comanda);

            $formas_pago = [];
            if (count($pedido->forma_pago) > 0) {
                foreach ($pedido->forma_pago as $fp) {
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

    private function get_forma_pago_comanda($formas_pago_comandas, $idComanda)
    {
        $fpc = [];
        foreach ($formas_pago_comandas as $fp) {
            if ((int)$fp->comanda === (int)$idComanda) {
                $fpc[] = (object)[
                    'forma_pago' => $fp->forma_pago,
                    'descripcion_forma_pago' => $fp->descripcion_forma_pago,
                    'monto' => $fp->monto,
                    'propina' => $fp->propina,
                    'documento' => $fp->documento,
                    'vuelto_para' => $fp->vuelto_para,
                    'vuelto' => $fp->vuelto,
                    'cuenta_forma_pago' => $fp->cuenta_forma_pago,
                    'cuenta' => $fp->cuenta
                ];
            }
        }
        return $fpc;
    }

    private function get_datos_facturacion($facturas_comandas, $idComanda)
    {
        $df = null;
        foreach ($facturas_comandas as $fc) {
            if ((int)$fc->comanda === (int)$idComanda) {
                $df = (object)[
                    'nombre' => $fc->nombre,
                    'nit' => $fc->nit,
                    'direccion' => $fc->direccion,
                    'email' => $fc->email
                ];
                break;
            }
        }
        return $df;
    }

    private function get_detalle_pedido($detalle_comandas, $idComanda)
    {
        $detalle = $this->get_detalle_comanda($detalle_comandas, $idComanda);
        $datos = [];
        $ids_detalle_comanda = [];

        foreach ($detalle as $det) {
            if (empty($det->detalle_comanda_id)) {
                if (!in_array((int)$det->detalle_comanda, $ids_detalle_comanda)) {
                    $ids_detalle_comanda[] = (int)$det->detalle_comanda;
                    $datos[] = $det;
                }
                foreach ($detalle as $subdet) {
                    if ((int)$subdet->detalle_comanda !== (int)$det->detalle_comanda && (int)$subdet->detalle_comanda_id === (int)$det->detalle_comanda && (int)$subdet->multiple === 0) {
                        if (!in_array((int)$subdet->detalle_comanda, $ids_detalle_comanda)) {
                            $ids_detalle_comanda[] = (int)$subdet->detalle_comanda;                            
                            $datos[] = $subdet;
                        }
                    }
                }
            } else if ((int)$det->multiple === 1) {
                foreach ($detalle as $subdet) {
                    if ((int)$subdet->detalle_comanda !== (int)$det->detalle_comanda && (int)$subdet->detalle_comanda_id === (int)$det->detalle_comanda && (int)$subdet->multiple === 0) {
                        if (!in_array((int)$subdet->detalle_comanda, $ids_detalle_comanda)) {
                            $ids_detalle_comanda[] = (int)$subdet->detalle_comanda;
                            $datos[] = $subdet;
                        }
                    }
                }
            } else if((int)$det->esextra === 1) {
                if (!in_array((int)$det->detalle_comanda, $ids_detalle_comanda)) {
                    $ids_detalle_comanda[] = (int)$det->detalle_comanda;
                    $datos[] = $det;
                }
                if((int)$det->esreceta === 0) {
                    foreach ($detalle as $subdet) {
                        if ((int)$subdet->detalle_comanda !== (int)$det->detalle_comanda && (int)$subdet->detalle_comanda_id === (int)$det->detalle_comanda && (int)$subdet->multiple === 0) {
                            if (!in_array((int)$subdet->detalle_comanda, $ids_detalle_comanda)) {
                                $ids_detalle_comanda[] = (int)$subdet->detalle_comanda;                            
                                $datos[] = $subdet;
                            }
                        }
                    }
                }
            }
        }

        return $datos;
    }

    private function get_detalle_comanda($detalle_comandas, $idComanda)
    {
        $datos = [];
        foreach ($detalle_comandas as $det) {
            if ((int)$det->comanda === (int)$idComanda) {
                $datos[] = (object)[
                    'detalle_comanda' => $det->detalle_comanda,
                    'cantidad' => $det->cantidad,
                    'articulo' => $det->articulo,
                    'descripcion' => $det->descripcion,
                    'notas' => $det->notas,
                    'detalle_comanda_id' => $det->detalle_comanda_id,
                    'multiple' => $det->multiple,
                    'esreceta' => $det->esreceta,
                    'esextra' => $det->esextra
                ];
            }
        }
        return $datos;
    }
}
