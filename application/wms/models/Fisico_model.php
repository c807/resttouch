<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fisico_model extends General_model {

	public $sede;
	public $usuario;
	public $categoria_grupo = null;
	public $bodega;
	public $fhcreacion;
	public $fecha;
	public $notas;
	public $confirmado = 0;
	public $confirmado_fecha;
	public $escuadrediario = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("inventario_fisico");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getDetalle($args = [])
	{
		return $this->db
					->select("
						a.detalle_inventario_fisico as id,
						a.precio,
						a.existencia_sistema,
						ifnull(a.existencia_fisica, 0) existencia_fisica,
						ifnull(a.diferencia, 0) diferencia,
						b.descripcion as narticulo,
						b.codigo as codigo,
						b.articulo,
						c.descripcion as ncategoria_grupo,
						d.descripcion as ncategoria,
						c.categoria_grupo,
						d.categoria,
						e.descripcion as npresentacion
						")
					->join("articulo b", "a.articulo = b.articulo")
					->join("categoria_grupo c", "b.categoria_grupo = c.categoria_grupo")
					->join("categoria d", "c.categoria = d.categoria")
					->join("presentacion e", "b.presentacion = e.presentacion")
					->where("a.inventario_fisico", $this->getPK())
					->order_by("d.descripcion, c.descripcion, b.descripcion")
					->get("detalle_inventario_fisico a")
					->result();
	}

	public function setDetalle($args = [], $id = "")
	{
		$det = new Fisico_detalle_model($id);
		$args['inventario_fisico'] = $this->getPK();
		$result = $det->guardar($args);

		if($result) {
			return $det;
		}

		$this->mensaje = $det->getMensaje();

		return $result;
	}

}

/* End of file Fisico_model.php */
/* Location: ./application/wms/models/Fisico_model.php */