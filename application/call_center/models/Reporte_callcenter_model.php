<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reporte_callcenter_model extends CI_Model {

	public function get_venta_callcenter($args=[])
	{
		if (verDato($args, "sede")) {
			if (is_array($args["sede"])) {
				$this->db->where_in("b.sede", $args["sede"]);
			} else {
				$this->db->where("b.sede", $args["sede"]);
			}
		}

		if (verDato($args, "categoria")) {
			$this->db->where("d.categoria", $args["categoria"]);
		}

		if (verDato($args, "categoria_grupo")) {
			$this->db->where("c.categoria_grupo", $args["categoria_grupo"]);
		}

		if (verDato($args, "tipo_reporte") == 1) {
			$this->db->group_by("a.detalle_comanda");
		} else {
			$this->db->group_by("a.articulo");
		}

		return $this->db
		->select("
			c.descripcion as narticulo,
			f.nombre as nsede,
			f.alias as alias_sede,
			b.sede, 
			a.articulo, 
			a.precio,
			sum(a.cantidad) as cantidad, 
			sum(a.total) as total
		")
		->from("detalle_comanda a")
		->join("comanda b", "b.comanda = a.comanda")
		->join("articulo c", "c.articulo = a.articulo")
		->join("categoria_grupo d", "d.categoria_grupo = c.categoria_grupo")
		->join("categoria e", "e.categoria = d.categoria")
		->join("sede f", "f.sede = b.sede")
		->where("date(b.fhcreacion) between '{$args["fdel"]}' and '{$args["fal"]}'")
		->where("b.domicilio", 1)
		->where("b.tipo_domicilio is not null")
		->where("b.estatus_callcenter", 8)
		->where("a.cantidad <> 0")
		->where("a.total <> 0")
		->order_by("f.nombre, c.descripcion")
		->get()
		->result();
	}
}

/* End of file Reporte_callcenter_model.php */
/* Location: ./application/call_center/models/Reporte_callcenter_model.php */