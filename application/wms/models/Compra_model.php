<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Compra_model extends General_Model
{

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

		if (!empty($id)) {
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

	public function setDetalle(array $args, $id = '')
	{
		$det = new CDetalle_Model($id);
		$args['orden_compra'] = $this->orden_compra;
		$result = $det->guardar($args);

		if ($result) {
			return $det;
		}

		$this->mensaje = $det->getMensaje();

		return $result;
	}

	public function getDetalle($args = [])
	{
		$args['orden_compra'] = $this->orden_compra;
		$det = $this->CDetalle_model->buscar($args);
		$datos = [];
		if (is_array($det)) {
			foreach ($det as $row) {
				$detalle = new CDetalle_Model($row->orden_compra_detalle);
				$row->articulo = $detalle->getArticulo();
				$row->presentacion = $detalle->getPresentacion();
				$datos[] = $row;
			}
		} else if ($det) {
			$detalle = new CDetalle_Model($det->orden_compra_detalle);
			$det->articulo = $detalle->getArticulo();
			$det->presentacion = $detalle->getPresentacion();
			$datos[] = $det;
		}

		return $datos;
	}

	public function generarIngreso($args = [])
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

		$this->load->model([
			'BodegaArticuloCosto_model',
			'Bodega_model',
			'Presentacion_model',
			'Articulo_model',
			'Sede_model',
			'Receta_model'
		]);
		$sede = new Sede_model($this->data->sede);
		$emp = $sede->getEmpresa();
		$iva = 1 + $emp->porcentaje_iva;

		if ($ing->guardar($datos)) {
			$bac = new BodegaArticuloCosto_model();
			$bod = new Bodega_model($ing->bodega);
			$detOcs = $this->getDetalle();
			foreach ($detOcs as $row) {
				if ((float)$row->cantidad > (float)0) {
					$costo = $row->monto / $iva;
					$row->articulo = $row->articulo->articulo;
					$row->presentacion = $row->presentacion->presentacion;
					$row->precio_unitario = $costo;
					$row->precio_total = $costo * $row->cantidad;
					$row->precio_costo_iva = $row->precio_total * $emp->porcentaje_iva;
					$pres = new Presentacion_model($row->presentacion);

					$det = $ing->setDetalle((array) $row);
					if ($det) {
						$art = new Articulo_model($row->articulo);
						$art->actualizarExistencia([
							"bodega" => $ing->bodega,
							"sede" => $bod->sede
						]);

						$bcosto = $this->BodegaArticuloCosto_model->buscar([
							'bodega' => $ing->bodega,
							'articulo' => $art->getPK(),
							'_uno' => true
						]);

						$costo = $art->getCosto(["bodega" => $ing->bodega]);

						if ($bcosto) {
							$bac->cargar($bcosto->bodega_articulo_costo);
							/*Ultima compra*/
							$costo_uc = $art->getCosto([
								"bodega" => $ing->bodega,
								"metodo_costeo" => 1
							]);
							$bac->costo_ultima_compra = $costo_uc;

							/*Costo promedio*/
							$costo = $bcosto->costo_promedio * $art->existencias + $row->precio_total;
							$existencia = $art->existencias + $row->cantidad * $pres->cantidad;
							if ($existencia != 0) {
								$costo = $costo / $existencia;
							}

							$bac->costo_promedio = $costo;
						} else {
							$bac->bodega = $ing->bodega;
							$bac->articulo = $art->getPK();
							$bac->costo_ultima_compra = $costo ?? 0;
							$bac->costo_promedio = $costo ?? 0;
						}

						$art->guardar(["costo" => $costo]);
						$bac->guardar();

						if ((int)$ing->ajuste === 0) {
							$this->Ingreso_model->actualiza_ultima_compra($ing, $det, $row->monto);
						}
					} else {
						$this->mensaje = $ing->getMensaje();
					}
				}
			}
			$this->db
				->set('ingreso', $ing->ingreso)
				->set('orden_compra', $this->orden_compra)
				->insert('ingreso_has_orden_compra');
			return $ing;
		} else {
			$this->mensaje = $ing->getMensaje();
		}

		return false;
	}
}

/* End of file Compra_model.php */
/* Location: ./application/wms/models/Compra_model.php */