<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Dcomanda_model extends General_Model
{

	public $detalle_comanda;
	public $comanda;
	public $articulo;
	public $cantidad;
	public $precio;
	public $impreso = false;
	public $total;
	public $aumento_porcentaje = 0.0;
	public $aumento = 0.0;
	public $notas;
	public $notas_predefinidas;
	public $cocinado = 0;
	public $presentacion;
	public $presentacion_bck = null;
	public $numero;
	public $fecha;
	public $tiempo_preparacion;
	public $fecha_impresion;
	public $fecha_proceso;
	public $detalle_comanda_id;
	public $bodega;
	public $cantidad_inventario = null;
	public $costo_unitario = null;
	public $costo_total = null;
	public $cantidad_inventario_backup = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("detalle_comanda");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getArticulo()
	{
		$datos = [];
		$tmp = $this->db
			->where("articulo", $this->articulo)
			->get("articulo")
			->row();
		$tmp->impresora = $this->db
			->select("b.*")
			->join("impresora b", "b.impresora = a.impresora")
			->where("a.categoria_grupo", $tmp->categoria_grupo)
			->get("categoria_grupo a")
			->row();

		return $tmp;
	}

	public function getDescripcionCombo($iddetcomanda = '', $soloExtras = false)
	{
		$iddetcomanda = !empty($iddetcomanda) ? $iddetcomanda : $this->getPK();
		$descripcion = "";

		if ($soloExtras) {
			$this->db->where('b.esextra', 1);
		}

		$tmp = $this->db
			->select('a.detalle_comanda, b.descripcion, a.cantidad, b.multiple, b.esreceta')
			->join('articulo b', 'a.articulo = b.articulo')			
			->where('a.detalle_comanda_id', $iddetcomanda)
			->get('detalle_comanda a')
			->result();

		foreach ($tmp as $row) {			
			if ($row->multiple == 0 && (float)$row->cantidad > 0 && (int)$row->cantidad !== 1) {
				$descripcion .= " {$row->cantidad}";
			}
			$descripcion .= " {$row->descripcion} |";
			if ((int)$row->esreceta === 0) {				
				$descripcion .= $this->getDescripcionCombo($row->detalle_comanda);
			} else {
				$descripcion .= $this->getDescripcionCombo($row->detalle_comanda, true);
			}
		}

		return $descripcion;
	}

	public function getPrecioExtraCombo()
	{
		$montoExtra = 0.00;
		$tmp = $this->db
			->select("a.detalle_comanda, a.precio, a.cantidad, b.multiple, b.combo, a.detalle_comanda_id")
			->join("articulo b", "a.articulo = b.articulo")
			->where("a.detalle_comanda_id", $this->getPK())
			->get("detalle_comanda a")
			->result();		

		foreach ($tmp as $row) {
			$esHijoNoMultipleCobrable = (int)$row->multiple === 0 && (int)$row->combo === 0 && $row->detalle_comanda_id !== null && $row->precio !== null;
			$det = new Dcomanda_model($row->detalle_comanda);
			// $montoExtra += $row->precio ? (float)$row->precio * $row->cantidad : 0.00;
			$montoExtra += $row->precio ? (float)$row->precio * ($esHijoNoMultipleCobrable ? (float)$row->cantidad : (float)$this->cantidad) : 0.00;
			$montoExtra += $det->getPrecioExtraCombo();
		}

		return $montoExtra;
	}

	private function fatherIsTopLevel($idFather)
	{
		$father = new Dcomanda_model($idFather);	
		return $father->detalle_comanda_id === null;			
	}

	public function actualizarCantidadHijos($regresa_inventario = null, $esNuevo = false, $factor_modificacion = null)
	{
		$tmp = $this->db
			->select('a.detalle_comanda, b.articulo')
			->join('articulo b', 'b.articulo = a.articulo')
			->where('a.detalle_comanda_id', $this->getPK())
			->get('detalle_comanda a')
			->result();

		foreach ($tmp as $row) {
			$det = new Dcomanda_model($row->detalle_comanda);
			$art = new Articulo_model($this->articulo);
			$rec = $art->getReceta(['articulo' => $row->articulo, '_uno' => true]);

			if ($rec && is_array($rec) && is_object($rec[0])) {
				$valorCantidadInventarioOriginalDetalle = (float)$det->cantidad_inventario;
				$args = ['cantidad' => $this->cantidad * $rec[0]->cantidad];
	
				if ($regresa_inventario || is_null($regresa_inventario)) {
					$args['cantidad_inventario'] = $this->cantidad_inventario * $rec[0]->cantidad;
				}
				
				$det->guardar($args);

				$datos_costo = $this->BodegaArticuloCosto_model->get_datos_costo($det->bodega, $det->articulo);
				if ($datos_costo) {
					$pres = $this->db->select('cantidad')->where('presentacion', $det->presentacion)->get('presentacion')->row();
					$cantidad_presentacion = round((float)$pres->cantidad, 5);

					if ((int)$art->mostrar_pos === 1 && $this->fatherIsTopLevel((int)$det->detalle_comanda_id)) {
						$existencia_nueva_hijo = round((float)$datos_costo->existencia - (((float)$det->cantidad_inventario / ((float)$this->cantidad !== (float)0 ? (float)$this->cantidad : 1)) * $cantidad_presentacion), 5);
					} else {
						$existencia_nueva_hijo = round((float)$datos_costo->existencia - ((float)$det->cantidad_inventario * $cantidad_presentacion), 5);
					}
					
					if ($regresa_inventario && !$esNuevo) {	
						if(!is_null($factor_modificacion) && is_numeric($factor_modificacion)) {
							$valorCantidadInventarioOriginalDetalle = $factor_modificacion * (float)$rec[0]->cantidad;
						}
						$existencia_nueva_hijo = round((float)$datos_costo->existencia + ((float)$valorCantidadInventarioOriginalDetalle * $cantidad_presentacion), 5);
					}
					$nvaData = [
						'bodega' => (int)$det->bodega,
						'articulo' => (int)$det->articulo,
						'cuc_ingresado' => 0,
						'costo_ultima_compra' => round((float)$datos_costo->costo_ultima_compra, 5),
						'cp_ingresado' => 0,
						'costo_promedio' => round((float)$datos_costo->costo_promedio, 5),
						'existencia_ingresada' => 0,							
						'existencia' => $existencia_nueva_hijo,
						'fecha' => date('Y-m-d H:i:s'),
						'notas' => "Comanda {$det->comanda}"
					];
					$nvoBac = new BodegaArticuloCosto_model();
					$nvoBac->guardar($nvaData);						
				}

				// $det->actualizarCantidadHijos($regresa_inventario, $esNuevo, true);
				$det->actualizarCantidadHijos();
			}
		}
	}

	public function distribuir_cuenta($args)
	{
		if (verDato($args, "cuenta")) {
			$tmp = $this->db
				->where("detalle_comanda", $this->getPK())
				->get("detalle_cuenta")
				->row();
			if ($tmp) {
				$dcta = new Dcuenta_model($tmp->detalle_cuenta);

				if ($args['cantidad'] == $this->cantidad) {
					$exito = $dcta->guardar([
						"cuenta_cuenta" => $args['cuenta']
					]);
				} else {
					$det = new Dcomanda_model();
					$cta = new Dcuenta_model();

					$det->guardar([
						"comanda" => $this->comanda,
						"articulo" => $this->articulo,
						"cantidad" => $args['cantidad'],
						"precio" => $this->precio,
						"impreso" => $this->impreso,
						"total" => $this->precio * $args['cantidad'],
						"notas" => $this->notas,
						"notas_predefinidas" => $this->notas_predefinidas,
						"cocinado" => $this->cocinado,
						"presentacion" => $this->presentacion,
						"numero" => $this->numero,
						"fecha" => $this->fecha,
						"tiempo_preparacion" => $this->tiempo_preparacion,
						"fecha_impresion" => $this->fecha_impresion,
						"fecha_proceso" => $this->fecha_proceso,
						"detalle_comanda_id" => verDato($args, "detalle_comanda_id", null)
					]);

					$args['detalle_comanda_id'] = $det->getPK();

					$cta->guardar([
						"cuenta_cuenta" => $args['cuenta'],
						"detalle_comanda" => $det->getPK()
					]);

					$exito = $this->guardar([
						"cantidad" => ($this->cantidad - $args['cantidad']),
						"total" => $this->precio * ($this->cantidad - $args['cantidad'])
					]);
				}

				if ($exito) {
					$tmp = $this->db
						->select("a.detalle_comanda, b.articulo, a.cantidad")
						->join("articulo b", "a.articulo = b.articulo")
						->where("a.detalle_comanda_id", $this->getPK())
						->get("detalle_comanda a")
						->result();

					foreach ($tmp as $row) {
						$param = $args;
						$art = new Articulo_model($row->articulo);
						$rec = $art->getReceta([
							"_principal" => true,
							"receta" => $this->articulo
						]);
						if ($args['cantidad'] == $this->cantidad) {
							$param['cantidad'] = $row->cantidad;
						} else {
							if (count($rec) > 0) {
								$param['cantidad'] = $args['cantidad'] * $rec[0]->cantidad;
							}
						}

						$det = new Dcomanda_model($row->detalle_comanda);
						$exito = $det->distribuir_cuenta($param);
						if (!$exito) {
							$this->setMensaje(implode("", $det->getMensaje()));
						}
					}

					return $exito;
				} else {
					$this->setMensaje("Nada que actualizar");
				}
			}
		} else {
			$this->setMensaje("Hacen falta datos obligatorios para poder continuar");
		}

		return true;
	}

	public function getDetalleImpresionCombo($path = '')
	{
		$this->load->model('Impresora_model');
		if ($path !== '') {
			$path .= '|';
		}
		$articulosImpresion = [];
		$tmp = $this->db
			->select("a.detalle_comanda, b.descripcion, a.cantidad, b.multiple, b.esreceta, b.articulo, c.impresora, a.notas, a.notas_predefinidas")
			->join("articulo b", "a.articulo = b.articulo")
			->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
			->where("a.detalle_comanda_id", $this->getPK())
			->get("detalle_comanda a")
			->result();

		foreach ($tmp as $row) {
			$det = new Dcomanda_model($row->detalle_comanda);
			if ($row->multiple == 0 && !empty($row->impresora)) {
				$articulosImpresion[] = (object)[
					'Id' => $row->articulo,
					'Nombre' => $path . $row->descripcion,
					'Cantidad' => $row->cantidad,
					'Total' => 0,
					'Notas' => !empty($row->notas) ? $row->notas : '',
					'Notas Predefinidas' => !empty($row->notas_predefinidas) ? $row->notas_predefinidas : '',
					'Detalle' => [],
					'Impresora' => $this->Impresora_model->buscar(['impresora' => $row->impresora, '_uno' => true])
				];
				// $path = '';
			} else if ((int)$row->multiple === 1) {
				$path .= $row->descripcion;
			}

			if ((int)$row->esreceta === 0) {
				$articulosImpresion = array_merge($articulosImpresion, $det->getDetalleImpresionCombo($path));
				$path = '';
			}
		}

		return $articulosImpresion;
	}

	public function get_detalle($args = [])
	{
		$campos = $this->getCampos(false, 'a.');

		if (isset($args['_categoria_grupo'])) {
			$this->db->where("b.categoria_grupo IN({$args['_categoria_grupo']})");
		}

		if (isset($args['articulo'])) {
			$this->db->where('a.articulo', $args['articulo']);
		}

		if (isset($args['numero'])) {
			$this->db->where('a.numero', $args['numero']);
		}

		if (isset($args['detalle_comanda'])) {
			$this->db->where('a.detalle_comanda', $args['detalle_comanda']);
		}

		if (isset($args['detalle_comanda_id'])) {
			$this->db->where('a.detalle_comanda_id', $args['detalle_comanda_id']);
		}

		if (isset($args['comanda'])) {
			$this->db->where('a.comanda', $args['comanda']);
		}

		return $this->db
			->select("{$campos}, b.mostrar_inventario, b.multiple, b.descripcion, b.combo, b.esextra")
			->join('articulo b', 'b.articulo = a.articulo')
			->get('detalle_comanda a')
			->result();
	}

	public function get_detalle_comanda_and_childs($args)
	{
		$detalle = $this->get_detalle($args);
		foreach($detalle as $det) {
			$detalle = array_merge($detalle, $this->get_detalle_comanda_and_childs(['detalle_comanda_id' => $det->detalle_comanda]));
		}		
		return $detalle;
	}

	public function get_detalle_comanda($args = [])
	{
		if(!isset($args['_solo_sin_factura'])) {
			return $this->buscar($args);
		} else {
			if (isset($args['comanda']) && (int)$args['comanda'] > 0) {
				$this->db->where('a.comanda', $args['comanda']);
			}
			return $this->db
				->select('a.*')
				->join('detalle_cuenta b', 'a.detalle_comanda = b.detalle_comanda')
				->join('cuenta_forma_pago c', 'c.cuenta = b.cuenta_cuenta')
				->join('forma_pago d', 'd.forma_pago = c.forma_pago')
				->where('d.sinfactura', 1)
				->group_by('a.detalle_comanda')
				->get("{$this->_tabla} a")
				->result();
		}

	}

	public function add_eliminacion_producto (array $args)
	{
		$this->db->insert('articulo_eliminado_comanda', $args);
	}
}

/* End of file Dcomanda_model.php */
/* Location: ./application/restaurante/models/Dcomanda_model.php */