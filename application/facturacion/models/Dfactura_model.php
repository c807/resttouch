<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dfactura_model extends General_model {

	public $detalle_factura;
	public $factura;
	public $articulo;
	public $cantidad;
	public $cantidad_inventario = 0.00;
	public $precio_unitario;
	public $precio_unitario_ext = 0.0000000000;	
	public $total;
	public $total_ext = 0.0000000000;
	public $monto_base;
	public $monto_base_ext = 0.0000000000;
	public $monto_iva;
	public $monto_iva_ext = 0.0000000000;
	public $bien_servicio = 'B';
	public $descuento = 0;
	public $descuento_ext = 0.0000000000;
	public $presentacion;
	public $impuesto_especial;
	public $porcentaje_impuesto_especial = 0.00;
	public $valor_impuesto_especial = 0.00;
	public $valor_impuesto_especial_ext = 0.0000000000;
	public $detalle_factura_id;
	public $bodega;
	public $cantidad_gravable = 0.00;
	public $precio_sugerido = 0.00;
	public $precio_sugerido_ext = 0.0000000000;
	public $costo_unitario = null;
	public $costo_total = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("detalle_factura");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getArticulo() {
		return $this->db
					->where("articulo", $this->articulo)
					->get("articulo")
					->row();
	}

	public function actualizarCantidadHijos()
	{
		$tmp = $this->db
					->select("a.detalle_factura, b.articulo")
					->join("articulo b", "a.articulo = b.articulo")
					->where("a.detalle_factura_id", $this->getPK())
					->get("detalle_factura a")
					->result();

		foreach ($tmp as $row) {
			$det = new Dfactura_model($row->detalle_factura);
			$art = new Articulo_model($this->articulo);
			$rec = $art->getReceta([
				"articulo" => $row->articulo,
				"_uno" => true
			]);
			$det->guardar(['cantidad' => $this->cantidad * $rec[0]->cantidad]);
			$det->actualizarCantidadHijos();
		}
	}

}

/* End of file Dfactura_model.php */
/* Location: ./application/restaurante/models/Dfactura_model.php */