<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Compra_model extends General_Model {

	public $orden_compra;
	public $sede;
	public $proveedor;
	public $fecha_orden;
	public $fecha;
	public $usuario;
	public $estatus_movimiento;
	public $notas = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('orden_compra');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getProveedor()
	{
		return $this->db
					->where('proveedor', $this->proveedor)
					->get('proveedor')
					->row();
	}

	public function setDetalle(Array $args, $id = '')
	{
		$det = new CDetalle_Model($id);
		$args['orden_compra'] = $this->orden_compra;
		$result = $det->guardar($args);

		if($result) {
			return $det;
		}

		$this->mensaje = $det->getMensaje();

		return $result;
	}

	public function getDetalle($args = [])
	{
		$args['orden_compra'] = $this->orden_compra;
		$det = $this->CDetalle_model->buscar($args);
		$datos = [] ;
		if(is_array($det)) {
			foreach ($det as $row) {
				$detalle = new CDetalle_Model($row->orden_compra_detalle);
				$row->articulo = $detalle->getArticulo();
				$row->presentacion = $detalle->getPresentacion();
				$datos[] = $row;
			}
		} else if($det) {
			$detalle = new CDetalle_Model($det->orden_compra_detalle);
			$det->articulo = $detalle->getArticulo();
			$det->presentacion = $detalle->getPresentacion();
			$datos[] = $det;
		}

		return $datos;
	}

	public function generarIngreso($args =[])
	{
		$ing = new Ingreso_model();
		$datos = [
			'tipo_movimiento' => $args['tipo_movimiento'],
			'fecha' => date('Y-m-d H:i:s'),
			'bodega' => $args['bodega'],
			'usuario' => $this->usuario,
			'comentario' => $this->notas,
			'proveedor' => $this->proveedor,
			'estatus_movimiento' => 2
		];

		if($ing->guardar($datos)) {
			foreach ($this->getDetalle() as $row) {
				$row->articulo = $row->articulo->articulo;
				$row->precio_unitario = $row->monto;
				$row->precio_total = $row->total;
				$det = $ing->setDetalle((array) $row);				
			}
			$this->db
				 ->set('ingreso', $ing->ingreso)
				 ->set('orden_compra', $this->orden_compra)
				 ->insert('ingreso_has_orden_compra');
			return $ing;
		} else {
			$this->mensaje = $det->getMensaje();
		}

		return false;
	}

}

/* End of file Compra_model.php */
/* Location: ./application/wms/models/Compra_model.php */