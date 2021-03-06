<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cuenta_model extends General_Model {

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

		if(!empty($id)) {
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
		$det = $this->getDetalle();
		$numero = $this->getNumeroDetalle($com->getPK());
		foreach ($det as $row) {
			$args = [
				'detalle_comanda' => $row->detalle_comanda,
				'impreso' => 1
			];

			if ($row->impreso == 0) {
				$args['numero'] = $numero;
				$args["fecha_impresion"] = Hoy(3);
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

	public function guardarDetalle(Array $args, $id = '', $esUnificacion = false)
	{
		$det = new Dcuenta_model($id);

		if (!$esUnificacion) {
			$args['cuenta_cuenta'] = $this->cuenta;
		}

		$result = $det->guardar($args);

		if(!$result) {
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

		$tmp = $this->db
		->select("b.*, d.descuento, a.*")
		->join("detalle_comanda b", "a.detalle_comanda = b.detalle_comanda")
		->join("articulo c", "b.articulo = c.articulo")
		->join("categoria_grupo d", "d.categoria_grupo = c.categoria_grupo")
		->where("a.cuenta_cuenta", $this->cuenta)
		->where("c.mostrar_pos", 1)
		->where("b.cantidad >", 0)
		->where("b.detalle_comanda_id is null")
		->get("detalle_cuenta a")
		->result();

		foreach ($tmp as $row) {
			$row->numero_cuenta = $this->numero;
			$det = new Dcomanda_model($row->detalle_comanda);
			$row->articulo = $det->getArticulo();
			$tmp = $det->getDescripcionCombo();
			$row->detalle = explode("|", $tmp);
			$row->monto_extra = $det->getPrecioExtraCombo();
			if (isset($args['_categoria_grupo'])) {
				if (is_array($args["_categoria_grupo"])) {
					if (in_array($row->articulo->categoria_grupo, $args['_categoria_grupo'])) {
						$datos[] = $row;
					}	
				} else if($row->articulo->categoria_grupo == $args["_categoria_grupo"]){
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
					$this->setMensaje("Error en procesar la tarjeta, ".$e->getMessege());
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
}

/* End of file Cuenta_model.php */
/* Location: ./application/restaurante/models/Cuenta_model.php */