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
	public $notas;
	public $cocinado = 0;
	public $presentacion;
	public $numero;
	public $fecha;
	public $tiempo_preparacion;
	public $fecha_impresion;
	public $fecha_proceso;
	public $detalle_comanda_id;
	public $bodega;
	public $cantidad_inventario = null;

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
			if ($row->multiple == 0 && (float)$row->cantidad > 1) {
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
			->select("a.detalle_comanda, a.precio, a.cantidad")
			->join("articulo b", "a.articulo = b.articulo")
			->where("a.detalle_comanda_id", $this->getPK())
			->get("detalle_comanda a")
			->result();

		foreach ($tmp as $row) {
			$det = new Dcomanda_model($row->detalle_comanda);
			// $montoExtra += $row->precio ? (float)$row->precio * $row->cantidad : 0.00;
			$montoExtra += $row->precio ? (float)$row->precio * (float)$this->cantidad : 0.00;
			$montoExtra += $det->getPrecioExtraCombo();
		}

		return $montoExtra;
	}

	public function actualizarCantidadHijos($regresa_inventario = true)
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

			$args = ['cantidad' => $this->cantidad * $rec[0]->cantidad];

			if ($regresa_inventario) {
				$args['cantidad_inventario'] = $this->cantidad_inventario * $rec[0]->cantidad;
			}
			
			$det->guardar($args);

			$det->actualizarCantidadHijos();
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
			->select("a.detalle_comanda, b.descripcion, a.cantidad, b.multiple, b.esreceta, b.articulo, c.impresora, a.notas")
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
			->select("{$campos}, b.mostrar_inventario, b.multiple, b.descripcion, b.combo")
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


}

/* End of file Dcomanda_model.php */
/* Location: ./application/restaurante/models/Dcomanda_model.php */