<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Comanda_model extends General_Model
{

	public $comanda;
	public $usuario;
	public $sede;
	public $estatus;
	public $turno;
	public $domicilio = 0;
	public $comanda_origen;
	public $comanda_origen_datos;
	public $mesero;
	//public $comandaenuso = 0;
	public $fhcreacion;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("comanda");

		if (!empty($id)) {
			$this->cargar($id);
		} else {
			$this->fhcreacion = date('Y-m-d H:i:s');
		}
	}

	public function getMesas()
	{
		return $this->db
			->select("
			b.mesa,
			b.area,
			b.numero,
			b.posx,
			b.posy,
			b.tamanio,
			b.estatus, b.esmostrador, b.impresora")
			->join("mesa b", "a.mesa = b.mesa")
			->where("a.comanda", $this->comanda)
			->get("comanda_has_mesa a")
			->row();
	}

	public function setMesa($mesa)
	{
		$this->db
			->set("comanda", $this->comanda)
			->set("mesa", $mesa)
			->insert("comanda_has_mesa");

		return $this->db->affected_rows() > 0;
	}

	public function guardarDetalle(array $args)
	{
		$id = isset($args['detalle_comanda']) ? $args['detalle_comanda'] : '';
		$det = new Dcomanda_model($id);
		$args['comanda'] = $this->comanda;
		$menu = $this->Catalogo_model->getModulo(["modulo" => 4, "_uno" => true]);
		$validar = true;
		$cantidad = 0;
		$articulo = null;
		if (empty($id)) {
			$articulo = $args['articulo'];
			$cantidad = $args['cantidad'];
		} else {
			if (isset($args['articulo'])) {
				if ($det->articulo == $args['articulo'] && $det->cantidad < $args['cantidad']) {
					$articulo = $det->articulo;
					$cantidad = $args['cantidad'] - $det->cantidad;
				} else if ($det->articulo != $args['articulo']) {
					$articulo = $args['articulo'];
					$cantidad = $args['cantidad'];
				} else {
					$articulo = $args['articulo'];
					$validar = false;
				}
			}
		}
		$art = new Articulo_model($articulo);
		$oldart = new Articulo_model($det->articulo);
		$art->actualizarExistencia();
		if (empty($menu) || (!$validar || $art->existencias >= $cantidad)) {
			$result = $det->guardar($args);
			$receta = $art->getReceta();

			if ($result) {
				$art->actualizarExistencia();
				if (isset($args['articulo'])) {
					if ($oldart->articulo) {
						$oldart->actualizarExistencia();
					}
				}
				return $det;
			}
			$this->mensaje = $det->getMensaje();

			return $result;
		} else {
			$this->setMensaje("No hay existencias suficientes para este articulo, existencia {$art->existencias}");
		}
	}

	public function getDetalle($args = [])
	{
		$args['comanda'] = $this->comanda;
		$det = $this->Dcomanda_model->buscar($args);
		$datos = [];
		if (is_array($det)) {
			foreach ($det as $row) {
				$detalle = new Dcomanda_model($row->detalle_comanda);
				$row->articulo = $detalle->getArticulo();
				$datos[] = $row;
			}
		} else if ($det) {
			$detalle = new Dcomanda_model($det->detalle_comanda);
			$det->articulo = $detalle->getArticulo();
			$datos[] = $det;
		}

		return $datos;
	}

	public function getCuentas()
	{
		$cuentas = [];
		$tmp = $this->db
			->where("comanda", $this->comanda)
			->get("cuenta")
			->result();

		foreach ($tmp as $row) {
			$cta = new Cuenta_model($row->cuenta);
			$row->productos = $cta->getDetalle();
			$cuentas[] = $row;
		}

		return $cuentas;
	}

	public function getTurno()
	{
		return $this->db
			->select("
		a.comanda,
		a.usuario,
		a.sede,
		a.estatus,
		a.domicilio,
		t.*")
			->where("a.comanda", $this->comanda)
			->join("turno t", "a.turno = t.turno")
			->get("comanda a")
			->row();
	}

	public function getComanda($args = [])
	{
		$tmp = $this->getTurno();
		$mesa = $this->getMesas();

		if ($mesa) {
			$area = $this->Area_model->buscar(["area" => $mesa->area, "_uno" => true]);
			//$area->impresora = $this->Impresora_model->buscar(['impresora' => $area->impresora, "_uno" => true]);
			$mesa->area = $area;
			$mesa->impresora = $this->Impresora_model->buscar(['impresora' => $mesa->impresora, "_uno" => true]);
			$tmp->mesa = $mesa;
		}

		$det = $this->getDetalle($args);
		$turno = new Turno_model($tmp->turno);

		$tmpMesero = new Usuario_model($this->mesero);
		$tmp->mesero = [
			"nombres" => $tmpMesero->nombres,
			"apellidos" => $tmpMesero->apellidos
		];

		$tmp->turno_rol = [];

		if (isset($args["_usuario"])) {
			foreach ($turno->getUsuarios() as $row) {
				if ($row->usuario->usuario == $args["_usuario"]) {
					$tmp->turno_rol[] = $row->usuario_tipo->descripcion;
				}
			}
		}

		$tmp->total = suma_field($det, 'total');
		$tmp->cuentas = $this->getCuentas();
		$tmp->factura = $this->getFactura();
		$tmp->origen_datos = $this->getOrigenDatos();
		$tmp->fhcreacion = empty($tmp->origen_datos['fhcreacion']) ?  $this->fhcreacion : $tmp->origen_datos['fhcreacion'];

		return $tmp;
	}

	public function getComandas($args = [])
	{
		if (isset($args['fdel']) && isset($args['fal'])) {
			$this->db
				->where('t.inicio >=', $args['fdel'])
				->where('t.fin <= ', $args['fal']);
		}

		$this->db
			->select("a.comanda")
			->from("comanda a")
			->join("turno t", "a.turno = t.turno")
			->where("t.sede", $args['sede'])
			->group_by("a.comanda");

		if (isset($args["domicilio"])) {
			$this->db
				->join("detalle_comanda b", "a.comanda = b.comanda")
				->join("detalle_cuenta c", "b.detalle_comanda = c.detalle_comanda")
				->join("detalle_factura_detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta", "left")
				->join("detalle_factura e", "e.detalle_factura = d.detalle_factura")
				->join("factura f", "f.factura = e.factura", "left")
				->where('a.domicilio', $args['domicilio'])
				->where("f.fel_uuid is null");
		}

		$lista = [];

		foreach ($this->db->get()->result() as $row) {
			$com = new Comanda_model($row->comanda);
			$com->origen_datos = $com->getOrigenDatos();

			$lista[] = $com;
		}

		return $lista;
	}

	public function getFactura()
	{
		$tmp = $this->db
			->select("a.factura")
			->from("factura a")
			->join("detalle_factura b", "a.factura = b.factura")
			->join("detalle_factura_detalle_cuenta c", "b.detalle_factura = c.detalle_factura")
			->join("detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta")
			->join("cuenta e", "e.cuenta = d.cuenta_cuenta")
			->where("e.comanda", $this->getPK())
			->group_by("a.factura")
			->get()
			->row();

		if ($tmp) {
			$fac = new Factura_model($tmp->factura);
			$fac->total = $fac->getTotal();
			return $fac;
		}

		return null;
	}

	public function getComandaOrigen()
	{
		return $this->Catalogo_model->getComandaOrigen([
			"_uno" => true,
			"comanda_origen" => $this->comanda_origen
		]);
	}

	public function getOrigenDatos()
	{
		$datos = [
			"nombre" => "",
			"numero_orden" => "",
			"metodo_pago" => [],
			"direccion_entrega" => new StdClass,
			'fhcreacion' => ''
		];

		if ($this->comanda_origen_datos) {
			$json = json_decode($this->comanda_origen_datos);
			$origen = $this->getComandaOrigen();

			$datos["nombre"] = $origen->descripcion;

			$nombre = strtolower(trim($origen->descripcion));

			if ($nombre == 'shopify') {
				$datos["numero_orden"] = isset($json->order_number) ? $json->order_number : '';
				$datos["metodo_pago"] = isset($json->payment_gateway_names) ? $json->payment_gateway_names : '';
				$datos['fhcreacion'] = isset($json->created_at) ? $json->created_at : '';
			} else if ($nombre == 'api') {
				$datos["numero_orden"] = $json->numero_orden;
				$datos["metodo_pago"] = $json->metodo_pago;
				if (isset($json->transferencia)) {
					$datos['transferencia'] = $json->transferencia;
				}

				if (isset($json->direccion_entrega)) {
					if ($json->direccion_entrega) {
						$json->cliente->direccion = $json->direccion_entrega;
						$datos['direccion_entrega'] = $json->cliente;
					}
				}
			}
		}

		return $datos;
	}

	public function getComandasAbiertas($args = [])
	{
		$tmp = $this->db
			->select("a.comanda")
			->from("comanda a")
			->join("detalle_comanda b", "a.comanda = b.comanda")
			->join("detalle_cuenta c", "b.detalle_comanda = c.detalle_comanda")
			->join("detalle_factura_detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta", "left")
			->join("detalle_factura e", "e.detalle_factura = d.detalle_factura")
			->join("factura f", "f.factura = e.factura", "left")
			->where("a.turno", $args['turno'])
			->where("f.fel_uuid is null")
			->group_by("a.comanda")
			->get();

		return $tmp->num_rows() > 0;
	}

	public function envioMail()
	{
		$datos = $this->getComanda();
		$fac   = new Factura_model($datos->factura->factura);

		$fac->cargarEmpresa();

		enviarCorreo([
			"de"     => ["noreply@c807.com", "noreply"],
			"para"   => [$fac->empresa->correo_emisor],
			"asunto" => "Notificación de Restouch",
			"texto"  => $this->load->view("correo_comanda", ["datos" => $datos], true)
		]);
	}

	public function cierra_estacion($comanda)
	{
		$query = "UPDATE comanda SET comandaenuso = 0 WHERE comanda = $comanda";
		return $this->db->simple_query($query);
	}

	public function trasladar_mesa($mesa, $comanda)
	{
		$query = "UPDATE comanda_has_mesa SET mesa = $mesa WHERE comanda = $comanda";
		return $this->db->simple_query($query);
	}
}

/* End of file Comanda_model.php */
/* Location: ./application/restaurante/models/Comanda_model.php */