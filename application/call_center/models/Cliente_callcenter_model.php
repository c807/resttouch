<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_callcenter_model extends CI_Model {

  public function get_clientes_callcenter ($args=[])
  {
    if (verDato($args, "sede")) {
      if (is_array($args["sede"])) {
          $this->db->where_in("cmd.sede", $args["sede"]);
      } else {
          $this->db->where("cmd.sede", $args["sede"]);
      }
    }

    $subquery_direccion = $this->db
      ->select("cmd.cliente_master, MAX(cmd.cliente_master_direccion) as max_cliente_master_direccion")
      ->from("cliente_master_direccion cmd")
      ->group_by("cmd.cliente_master")
      ->get_compiled_select();

    $subquery_telefono = $this->db
      ->select("cmt.cliente_master, MAX(cmt.cliente_master_telefono) as max_cliente_master_telefono")
      ->from("cliente_master_telefono cmt")
      ->group_by("cmt.cliente_master")
      ->get_compiled_select();
    
    $subquery_nit = $this->db
      ->select("cmc.cliente_master, MAX(cmc.cliente_master_cliente) as max_cliente_master_cliente")
      ->from("cliente_master_cliente cmc")
      ->group_by("cmc.cliente_master")
      ->get_compiled_select();

    return $this->db
      ->select("
        cm.cliente_master,
        cm.nombre as nombre_cliente,
        s.nombre as nombre_sede,
        s.alias as alias_sede,
        cmd.direccion1 as direccion_cliente,
        t.numero as telefono_cliente,
        cl.nit as nit_cliente
        ")
      ->from("cliente_master cm")
      ->join("($subquery_direccion) sub_direccion", "cm.cliente_master = sub_direccion.cliente_master")
      ->join("cliente_master_direccion cmd", "cmd.cliente_master_direccion = sub_direccion.max_cliente_master_direccion")
      ->join("($subquery_telefono) sub_telefono", "cm.cliente_master = sub_telefono.cliente_master")
      ->join("cliente_master_telefono cmt", "cmt.cliente_master_telefono = sub_telefono.max_cliente_master_telefono")
      ->join("telefono t", "cmt.telefono = t.telefono")
      ->join("($subquery_nit) sub_nit", "cm.cliente_master = sub_nit.cliente_master", 'left')
      ->join("cliente_master_cliente cmc", "cmc.cliente_master_cliente = sub_nit.max_cliente_master_cliente", 'left')
      ->join("cliente cl", "cmc.cliente = cl.cliente", 'left')
      ->join("sede s", "cmd.sede = s.sede", 'left')
      ->order_by("cm.cliente_master", "ASC")
      ->get()
      ->result();
  }
}