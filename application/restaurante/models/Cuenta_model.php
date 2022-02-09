<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cuenta_model extends General_Model
{

	public $cuenta;
	public $comanda;
	public $nombre;
	public $numero = null;
	public $propina_monto = 0;
	public $propina_porcentaje = 0;
	public $cerrada = 0;
	private $cobro = null;


	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("cuenta");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function setCobro($value)
	{
		$this->cobro = $value;
		return $this;
	}

	public function getEmpresa()
	{
		return $this->db
			->select("c.*, a.sede")
			->from("comanda a")
			->join("sede b", "a.sede = b.sede")
			->join("empresa c", "b.empresa = c.empresa")
			->where("a.comanda", $this->comanda)
			->get()
			->row();
	}

	public function getNumeroDetalle($comanda)
	{
		$tmp = $this->db
			->select("(ifnull(max(numero), 0) +1) as correlativo")
			->where("comanda", $comanda)
			->get('detalle_comanda')
			->row();

		return $tmp->correlativo;
	}

	public function imprimirDetalle()
	{
		$com = new Comanda_model($this->comanda);
		$det = $this->getDetalle(['impreso' => 0, '_for_print' => true]);
		$numero = $this->getNumeroDetalle($com->getPK());
		foreach ($det as $row) {
			$args = [
				'detalle_comanda' => $row->detalle_comanda,
				'impreso' => 1
			];

			if ($row->impreso == 0) {
				$args['numero'] = $numero;
				$args['fecha_impresion'] = Hoy(3);
			}

			$com->guardarDetalle($args);
		}
	}

	public function guardarCuenta($args = [])
	{
		if (is_array($args) && count($args) > 0) {
			if ($this->numero === null) {
				$args['numero'] = $this->getNumero($args);
			} else {
				$args['numero'] = $this->numero;
			}

			if ($args['numero'] !== null && !empty($args['numero'])) {
				return $this->guardar($args);
			}
		} else {
			$this->setMensaje("Datos invalidos");
		}

		return false;
	}

	public function guardarDetalle(array $args, $id = '', $esUnificacion = false)
	{
		$det = new Dcuenta_model($id);

		if (!$esUnificacion) {
			$args['cuenta_cuenta'] = $this->cuenta;
		}

		$result = $det->guardar($args);

		if (!$result) {
			$this->mensaje = $det->getMensaje();
		}

		return $result;
	}

	private function getNumero($args = [])
	{
		$tmp = $this->db
			->select("(ifnull(max(numero), 0) +1) as correlativo")
			->where("comanda", $args['comanda'])
			->get("cuenta")
			->row();

		return $tmp->correlativo;
	}

	public function facturada()
	{
		$tmp = $this->db
			->select("count(a.detalle_cuenta) det, count(b.detalle_cuenta) fact")
			->from("detalle_cuenta a")
			->join("detalle_factura_detalle_cuenta b", "a.detalle_cuenta = b.detalle_cuenta", "left")
			->where("cuenta_cuenta", $this->getPK())
			->get()
			->row();

		return $tmp->det == $tmp->fact;
	}

	public function getDetalle($args = [])
	{
		$datos = [];

		if (isset($args['descuento'])) {
			$this->db->where('d.descuento', $args['descuento']);
		}

		if (isset($args['impreso'])) {
			$this->db->where('b.impreso', $args['impreso']);
		}

		if (isset($args["cocinado"])) {
			$this->db->where('b.cocinado', $args['cocinado']);
		}

		if (!isset($args['_totalCero'])) {
			$this->db->where("b.total >", 0);
		}

		if (isset($args['numero'])) {
			$this->db->where("b.numero", $args['numero']);
		}

		if (isset($args['articulo'])) {
			$this->db->where("b.articulo", $args['articulo']);
		}

		if (isset($args['detalle_comanda'])) {
			$this->db->where("b.detalle_comanda", $args['detalle_comanda']);
		}

		if (isset($args['_categoria_grupo'])) {
			$this->db->where("c.categoria_grupo", $args['_categoria_grupo']);
		}

		if (!isset($args['_es_unificacion'])) {
			$this->db
				->where('c.mostrar_pos', 1)
				->where('b.cantidad >', 0)
				->where('b.detalle_comanda_id is null');
		}

		$tmp = $this->db
			->select('b.*, d.descuento, a.detalle_cuenta, a.cuenta_cuenta')
			->join('detalle_comanda b', 'a.detalle_comanda = b.detalle_comanda')
			->join('articulo c', 'b.articulo = c.articulo')
			->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo')
			->where('a.cuenta_cuenta', $this->cuenta)
			->get('detalle_cuenta a')
			->result();

		// $q1 = $this->db->last_query();

		if (isset($args['_for_print'])) {
			foreach ($tmp as $row) {
				$det = new Dcomanda_model($row->detalle_comanda);
				$row->monto_extra = $det->getPrecioExtraCombo();
				$datos[] = $row;
			}
			return $datos;
		}

		if (isset($args['_for_prnt_recibo'])) {
			foreach ($tmp as $row) {
				$row->numero_cuenta = $this->numero;
				$det = new Dcomanda_model($row->detalle_comanda);
				$row->articulo = $det->getArticulo();
				$row->monto_extra = $det->getPrecioExtraCombo();
				$datos[] = $row;
			}
			return $datos;
		}

		foreach ($tmp as $row) {
			$row->numero_cuenta = $this->numero;
			$det = new Dcomanda_model($row->detalle_comanda);
			$row->articulo = $det->getArticulo();
			$row->detalle = (int)$row->articulo->combo === 0 ? [] : explode('|', $det->getDescripcionCombo());
			$row->monto_extra = $det->getPrecioExtraCombo();
			$row->detalle_impresion = (int)$row->articulo->combo === 0 ? [] : $det->getDetalleImpresionCombo();
			$row->impresoras_combo = [];

			foreach ($row->detalle_impresion as $detimp) {
				if (!in_array($detimp->Impresora, $row->impresoras_combo)) {
					$row->impresoras_combo[] = $detimp->Impresora;
				}
			}


			if (isset($args['_categoria_grupo'])) {
				if (is_array($args['_categoria_grupo'])) {
					if (in_array($row->articulo->categoria_grupo, $args['_categoria_grupo'])) {
						$datos[] = $row;
					}
				} else if ($row->articulo->categoria_grupo == $args['_categoria_grupo']) {
					$datos[] = $row;
				}
			} else {
				$datos[] = $row;
			}
		}

		return $datos;
	}

	public function getDetalleSimplified($args = [])
	{
		$datos = [];

		if (isset($args['descuento'])) {
			$this->db->where('d.descuento', $args['descuento']);
		}

		if (isset($args["impreso"])) {
			$this->db->where('b.impreso', $args['impreso']);
		}

		if (isset($args["cocinado"])) {
			$this->db->where('b.cocinado', $args['cocinado']);
		}

		if (!isset($args['_totalCero'])) {
			$this->db->where("b.total >", 0);
		}

		if (isset($args['numero'])) {
			$this->db->where("b.numero", $args['numero']);
		}

		if (isset($args['articulo'])) {
			$this->db->where("b.articulo", $args['articulo']);
		}

		if (isset($args['detalle_comanda'])) {
			$this->db->where("b.detalle_comanda", $args['detalle_comanda']);
		}

		if (isset($args['_categoria_grupo'])) {
			$this->db->where("c.categoria_grupo IN({$args['_categoria_grupo']})");
		}

		$tmp = $this->db
			->select('b.*, d.descuento, a.detalle_cuenta, a.cuenta_cuenta, c.combo, c.categoria_grupo')
			->join('detalle_comanda b', 'a.detalle_comanda = b.detalle_comanda')
			->join('articulo c', 'b.articulo = c.articulo')
			->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo')
			->where('a.cuenta_cuenta', $this->cuenta)
			->where('c.mostrar_pos', 1)
			->where('b.cantidad >', 0)
			->where('b.detalle_comanda_id is null')
			->get('detalle_cuenta a')
			->result();

		$q1 = $this->db->last_query();

		if (isset($args['_for_print'])) {
			return $tmp;
		}

		if (isset($args['_for_prnt_recibo'])) {
			foreach ($tmp as $row) {
				$row->numero_cuenta = $this->numero;
				$det = new Dcomanda_model($row->detalle_comanda);
				$row->articulo = $det->getArticulo();
				$row->detalle = (int)$row->combo === 0 ? [] : explode('|', $det->getDescripcionCombo());
				$row->monto_extra = $det->getPrecioExtraCombo();
				$datos[] = $row;
			}
			return $datos;
		}

		foreach ($tmp as $row) {
			$row->numero_cuenta = $this->numero;
			$det = new Dcomanda_model($row->detalle_comanda);
			$row->articulo = $det->getArticulo();
			$row->detalle = (int)$row->combo === 0 ? [] : explode('|', $det->getDescripcionCombo());
			$row->monto_extra = $det->getPrecioExtraCombo();
			$row->detalle_impresion = (int)$row->combo === 0 ? [] : $det->getDetalleImpresionCombo();
			$row->impresoras_combo = [];

			foreach ($row->detalle_impresion as $detimp) {
				if (!in_array($detimp->Impresora, $row->impresoras_combo)) {
					$row->impresoras_combo[] = $detimp->Impresora;
				}
			}


			if (isset($args['_categoria_grupo'])) {
				if (is_array($args['_categoria_grupo'])) {
					if (in_array($row->categoria_grupo, $args['_categoria_grupo'])) {
						$datos[] = $row;
					}
				} else if ($row->categoria_grupo == $args['_categoria_grupo']) {
					$datos[] = $row;
				}
			} else {
				$datos[] = $row;
			}
		}
		return $datos;
	}

	public function cobrar($pago)
	{
		if (is_object($pago) && isset($pago->forma_pago) && isset($pago->monto)) {

			$fpago = $this->Catalogo_model->getFormaPago([
				"forma_pago" => $pago->forma_pago,
				"_uno" => true
			]);

			//if (strtolower($fpago->descripcion) == "tarjeta") {
			if ($this->cobro !== null) {
				$this->cobro->setReferencia($this->getPK());
				$this->cobro->setTotal($pago->monto);

				try {
					$tmp = $this->cobro->cobrar();

					if (empty($tmp)) {
						$this->setMensaje("Error al realizar cobro, por favor intente nuevamente.");
						return false;
					} else {
						if ($tmp->decision == 'ACCEPT') {
							$this->db->set("tarjeta_respuesta", json_encode($tmp));
						} else {
							$this->setMensaje("{$tmp->reasonCode} - {$tmp->decision}");
							return false;
						}
					}
				} catch (Exception $e) {
					$this->setMensaje("Error en procesar la tarjeta, " . $e->getMessege());
					return false;
				}
			}
			//}

			if (isset($pago->documento)) {
				$this->db->set("documento", $pago->documento);
			}

			if (isset($pago->observaciones)) {
				$this->db->set("observaciones", $pago->observaciones);
			}

			if (isset($pago->propina)) {
				$this->db->set("propina", $pago->propina);
			}

			if (isset($pago->comision_monto)) {
				$this->db->set("comision_monto", $pago->comision_monto);
			}

			if (isset($pago->retencion_monto)) {
				$this->db->set("retencion_monto", $pago->retencion_monto);
			}

			if (isset($pago->vuelto_para)) {
				$this->db->set("vuelto_para", $pago->vuelto_para);
			}

			if (isset($pago->vuelto)) {
				$this->db->set("vuelto", $pago->vuelto);
			}

			$this->db
				->set("cuenta", $this->cuenta)
				->set("forma_pago", $pago->forma_pago)
				->set("monto", $pago->monto)
				->insert("cuenta_forma_pago");

			return $this->db->affected_rows() > 0;
		}

		return false;
	}

	public function get_descuento()
	{
		$total = $this->db
			->select("sum(monto) as total")
			->where("cuenta", $this->getPK())
			->get("cuenta_forma_pago")
			->row();

		$desc = $this->db
			->select("sum(monto) as descuento")
			->join("forma_pago b", "a.forma_pago = b.forma_pago")
			->where("cuenta", $this->getPK())
			->where("b.descuento", 1)
			->get("cuenta_forma_pago a")
			->row();

		if ($desc->descuento) {
			return $desc->descuento / $total->total;
		}

		return 0;
	}

	public function get_forma_pago($args = [])
	{
		if (isset($args["_sinFactura"])) {
			$this->db
				->join("forma_pago b", "a.forma_pago = b.forma_pago")
				->where("b.sinfactura", $args['_sinFactura']);
		}

		return $this->db
			->where("a.cuenta", $this->getPK())
			->get("cuenta_forma_pago a")
			->result();
	}

	public function obtener_detalle($args = [])
	{
		if (!isset($args['comanda'])) {
			if (!isset($args['cuenta'])) {
				$this->db->where('a.cuenta_cuenta', $this->getPK());
			} else {
				$this->db->where('a.cuenta_cuenta', $args['cuenta']);
			}
		} else {
			$this->db->where('b.comanda', $args['comanda']);
			$this->db->order_by('a.cuenta_cuenta, b.fecha');
		}

		if (!isset($args['detalle_comanda_id'])) {
			$this->db->where('b.total >', 0)->where('c.mostrar_pos', 1)->where('b.detalle_comanda_id IS NULL');
			$this->db->order_by('b.impreso, b.fecha');
		} else {
			$this->db->where('b.detalle_comanda_id', $args['detalle_comanda_id']);
		}

		if (isset($args['impreso'])) {
			$this->db->where('b.impreso', $args['impreso']);
		}

		if (isset($args['_extras'])) {
			$this->db->where('c.esextra', 1);
		}

		$detalles = $this->db
			->select(
				'b.comanda, b.detalle_comanda, b.articulo, d.descuento, a.detalle_cuenta, a.cuenta_cuenta, b.cantidad, b.impreso, b.precio, b.total, b.notas, 
				c.combo, c.categoria_grupo, c.descripcion, c.multiple, c.combo, c.esreceta, c.cantidad_gravable, c.precio_sugerido, c.cobro_mas_caro,
				e.numero as numero_cuenta, b.detalle_comanda_id, f.impresora, f.sede, f.nombre AS nombre_impresora, f.direccion_ip, f.ubicacion, f.bluetooth, f.bluetooth_mac_address, f.modelo, 
				f.pordefecto, c.esextra, b.presentacion'
			)
			->join('detalle_comanda b', 'a.detalle_comanda = b.detalle_comanda', isset($args['_esreceta']) ? 'right' : '')
			->join('articulo c', 'c.articulo = b.articulo', isset($args['_esreceta']) ? 'left' : '')
			->join('categoria_grupo d', 'd.categoria_grupo = c.categoria_grupo', isset($args['_esreceta']) ? 'left' : '')
			->join('cuenta e', 'e.cuenta = a.cuenta_cuenta', isset($args['_esreceta']) ? 'left' : '')
			->join('impresora f', 'f.impresora = d.impresora', 'left')
			->where('b.cantidad >', 0)
			->get('detalle_cuenta a')
			->result();

		foreach ($detalles as $detalle) {
			$detalle->detalle = [];
			if ((int)$detalle->combo === 1 || (int)$detalle->multiple === 1) {
				$args['detalle_comanda_id'] = $detalle->detalle_comanda;
				$detalle->detalle = $this->obtener_detalle($args);
			} else if ((int)$detalle->esreceta === 1 && isset($args['comanda'])) {
				if (isset($args['_extras'])) {
					unset($args['_extras']);
				}
				$args['detalle_comanda_id'] = $detalle->detalle_comanda;
				$args['_esreceta'] = true;
				$detalle->detalle = $this->obtener_detalle($args);
				unset($args['_esreceta']);

				$args['_extras'] = true;
				$detalle->detalle_extras = $this->obtener_detalle($args);		
				unset($args['_extras']);		

			} else {
				if (isset($args['_esreceta'])) {
					unset($args['_esreceta']);
				}
				$args['detalle_comanda_id'] = $detalle->detalle_comanda;
				$args['_extras'] = true;
				$losExtras = $this->obtener_detalle($args);
				unset($args['_extras']);
				$detalle->detalle = $losExtras;
				$detalle->detalle_extras = $losExtras;
			}
		}

		return $detalles;
	}

	public function get_plain_detalle_cuenta($args = [])
	{
		if (!isset($args['cuenta'])) {
			$this->db->where('a.cuenta_cuenta', $this->getPK());
		} else {
			$this->db->where('a.cuenta_cuenta', $args['cuenta']);
		}

		return $this->db->get('detalle_cuenta a')->result();
	}
}

/* End of file Cuenta_model.php */
/* Location: ./application/restaurante/models/Cuenta_model.php */