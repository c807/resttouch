<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CDetalle_model extends General_Model
{

	public $orden_compra_detalle;
	public $orden_compra;
	public $articulo;
	public $cantidad;
	public $monto;
	public $total;
	public $presentacion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('orden_compra_detalle');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getArticulo()
	{
		return $this->db
			->where('articulo', $this->articulo)
			->get('articulo')
			->row();
	}

	public function getPresentacion()
	{
		return $this->db
			->where('presentacion', $this->presentacion)
			->get('presentacion')
			->row();
	}
}

/* End of file CDetalle_model.php */
/* Location: ./application/wms/models/CDetalle_model.php */