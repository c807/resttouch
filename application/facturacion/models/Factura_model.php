<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Factura_model extends General_model
{

	public $factura;
	public $usuario;
	public $factura_serie;
	public $cliente;
	public $numero_factura;
	public $serie_factura;
	public $fecha_factura;
	public $fel_uuid;
	public $fel_uuid_anulacion;
	public $moneda;
	public $certificador_fel;
	public $exenta = false;
	public $notas;
	public $sede;
	public $correo_receptor;
	private $namespaceURI = "http://www.sat.gob.gt/dte/fel/0.2.0";
	private $esAnulacion;
	private $certificador;
	public $razon_anulacion;
	public $comentario_anulacion;
	public $enviar_descripcion_unica = 0;
	public $descripcion_unica = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("factura");

		if (!empty($id)) {
			$this->cargar($id);
		}
		$this->load->library('AsyncTasks');
	}

	public function getDetalleImpuestos()
	{
		return $this->db
			->select("b.descripcion, sum(a.valor_impuesto_especial) as total")
			->from("detalle_factura a")
			->join("impuesto_especial b", "b.impuesto_especial = a.impuesto_especial")
			->where("a.factura", $this->getPK())
			->group_by("b.impuesto_especial")
			->get()
			->result();
	}

	public function setDetalle($args, $id = "")
	{
		$config = $this->Configuracion_model->buscar();
		$vnegativo = get_configuracion($config, "RT_VENDE_NEGATIVO", 3);
		$det = new Dfactura_model($id);
		$args['factura'] = $this->factura;
		$menu = $this->Catalogo_model->getModulo(["modulo" => 4, "_uno" => true]);
		$validar = (!isset($args['detalle_cuenta']) || !empty($menu));
		$cantidad = 0;
		$articulo = null;
		if (empty($id)) {
			$articulo = $args['articulo'];
			$cantidad = $args['cantidad'];
		} else {
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
		$art = new Articulo_model($articulo);
		$pres = $art->getPresentacion();
		$oldart = new Articulo_model($det->articulo);

		$at = new AsyncTasks();
		if ($vnegativo) {			
			$art->actualizarExistencia();
		} else {
			$at->actualizar_existencias_articulo($art->getPK());
		}

		if ($vnegativo || isset($args['detalle_cuenta']) || empty($menu) || !$validar || $art->existencias >= $cantidad * $pres->cantidad || $art->mostrar_pos == 0) {
			$nuevo = ($det->getPK() == null);
			$result = $det->guardar($args);
			$idx = $det->getPK();

			$receta = $art->getReceta();

			if (count($receta) > 0 && $art->combo == 0 && $art->multiple == 0 && $nuevo && !isset($args['detalle_cuenta'])) {
				foreach ($receta as $rec) {
					$presR = $this->Presentacion_model->buscar([
						"medida" => $rec->medida->medida,
						"cantidad" => 1,
						"_uno" => true
					]);

					if (!$presR) {
						$presR = new Presentacion_model();
						$presR->guardar([
							"medida" => $rec->medida->medida,
							"descripcion" => $rec->medida->descripcion,
							"cantidad" => 1
						]);

						$presR->presentacion = $presR->getPK();
					}

					$detr = new Dfactura_model();
					$dato = [
						"factura" => $this->getPK(),
						"articulo" => $rec->articulo->articulo,
						"cantidad" => $rec->cantidad,
						"precio_unitario" => 0,
						"total" => 0,
						"monto_base" => 0,
						"monto_iva" => 0,
						"bien_servicio" => $det->bien_servicio,
						"presentacion" => $presR->presentacion,
						"detalle_factura_id" => $idx
					];
					$detr->guardar($dato);
				}
			}

			if ($det->getPK() && $art->combo == 0 && $art->multiple == 0) {
				$det->actualizarCantidadHijos();
			}


			if ($result) {
				if (isset($args['detalle_cuenta'])) {
					$this->db
						->set("detalle_factura", $det->detalle_factura)
						->set("detalle_cuenta", $args['detalle_cuenta'])
						->insert("detalle_factura_detalle_cuenta");
				}
				if ($vnegativo) {
					$at->actualizar_existencias_articulo($art->getPK());
				} else {
					$art->actualizarExistencia();
				}

				if ($oldart->articulo) {
					if ($vnegativo) {
						$at->actualizar_existencias_articulo($oldart->getPK());
					} else {
						$oldart->actualizarExistencia();
					}
				}
				return $det;
			} else {
				$this->mensaje = $det->getMensaje();

				return false;
			}
		} else {
			$this->setMensaje("No hay existencias suficientes para este articulo, existencia {$art->existencias}");
		}

		return false;
	}

	public function getTotal()
	{
		return $this->db
			->select("factura, sum(total) as total")
			->where("factura", $this->factura)
			->group_by("factura")
			->get("detalle_factura")
			->row()
			->total;
	}

	public function getDetalle($args = [], $redondeaMontos = true)
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where($key, $row);
				}
			}
		}

		$datos = [];
		$tmp = $this->db
			->where("factura", $this->factura)
			->where("total > 0")
			->get("detalle_factura")
			->result();

		foreach ($tmp as $row) {
			$det = new Dfactura_model($row->detalle_factura);
			$row->articulo = $det->getArticulo();
			$row->subtotal = $redondeaMontos ? $row->total : $row->total_ext;
			$row->total = $redondeaMontos ? ($row->total - $row->descuento) : ($row->total_ext - $row->descuento_ext);
			if ($row->impuesto_especial) {
				$imp = $this->db
					->where("impuesto_especial", $row->impuesto_especial)
					->get("impuesto_especial")
					->row();

				$row->impuesto = $imp;
			}
			$datos[] = $row;
		}
		return $datos;
	}

	public function copiarDetalle($factura)
	{
		$fac = new Factura_model($factura);
		$det = $this->db
			->where("factura", $this->factura)
			->get("detalle_factura")
			->result();

		foreach ($det as $row) {
			$this->db
				->set("factura", $factura)
				->set("articulo", $row->articulo)
				->set("cantidad", $row->cantidad)
				->set("precio_unitario", $row->precio_unitario)
				->set("total", $row->total)
				->set("monto_base", $row->monto_base)
				->set("monto_iva", $row->monto_iva)
				->set("bien_servicio", $row->bien_servicio)
				->set("descuento", $row->descuento)
				->insert("detalle_factura");

			$id = $this->db->insert_id();
			$det = $this->db
				->where("detalle_factura", $row->detalle_factura)
				->get("detalle_factura_detalle_cuenta");

			if ($det->num_rows() > 0) {
				$det = $det->row();
				$this->db
					->set("detalle_factura", $id)
					->set("detalle_cuenta", $det->detalle_cuenta)
					->insert("detalle_factura_detalle_cuenta");
			}
		}
	}

	public function getMesa($sinEtiqueta = true)
	{
		if ($sinEtiqueta) {
			$this->db->select('g.numero as mesa');
		} else {
			$this->db->select('IFNULL(g.etiqueta, g.numero) as mesa');
		}

		$tmp = $this->db			
			->join("detalle_factura b", "a.factura = b.factura")
			->join("detalle_factura_detalle_cuenta c", "c.detalle_factura = b.detalle_factura")
			->join("detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta")
			->join("cuenta e", "d.cuenta_cuenta = e.cuenta")
			->join("comanda_has_mesa f", "e.comanda = f.comanda")
			->join("mesa g", "f.mesa = g.mesa")
			->where("a.factura", $this->getPK())
			->group_by(["a.factura", "g.numero"])
			->get("factura a");

		if ($tmp && $tmp->num_rows() > 0) {
			return $tmp->row();
		}

		return false;
	}

	public function getComanda()
	{
		$tmp = $this->db
			->select("e.comanda")
			->from("factura a")
			->join("detalle_factura b", "a.factura = b.factura")
			->join("detalle_factura_detalle_cuenta c", "c.detalle_factura = b.detalle_factura")
			->join("detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta")
			->join("cuenta e", "d.cuenta_cuenta = e.cuenta")
			->where("a.factura", $this->getPK())
			->group_by("e.comanda")
			->get()
			->row();

		if ($tmp) {
			return new Comanda_model($tmp->comanda);
		}

		return new Comanda_model();
	}

	public function cargarCertificadorFel()
	{
		$this->certificador = $this->db
			->where("certificador_fel", $this->certificador_fel)
			->get("certificador_fel")
			->row();
	}

	public function getCertificador()
	{
		return $this->certificador;
	}

	public function cargarFacturaSerie()
	{
		$this->serie = $this->db
			->where("factura_serie", $this->factura_serie)
			->get("factura_serie")
			->row();
	}

	public function cargarEmpresa()
	{
		$this->empresa = $this->db
			->select("b.*")
			->join("empresa b", "b.empresa = a.empresa")
			->where("a.sede", $this->sede)
			->get("sede a")
			->row();
	}

	public function cargarSede()
	{
		$this->sedeFactura = $this->db
			->where("sede", $this->sede)
			->get("sede")
			->row();
	}

	public function cargarReceptor()
	{
		$this->receptor = $this->db
			->where("cliente", $this->cliente)
			->get("cliente")
			->row();
	}

	public function cargarMoneda()
	{
		$this->moneda = $this->db
			->where("moneda", $this->moneda)
			->get("moneda")
			->row();
	}

	public function getXmlWebhook($raw = false)
	{

		$doc = new stdClass();
		$config = $this->Configuracion_model->buscar();
		$dfac = $this->getDetalle();
		$sumIva = suma_field($dfac, "monto_iva");
		$sumTotal = suma_field($dfac, "total");
		$conceptoMayor = get_configuracion($config, "RT_CONCEPTO_MAYOR_VENTA", 2);
		/*Datos encabezado*/
		$enca = new stdClass();
		$enca->idempresa = $this->empresa->codigo;
		$enca->idtipofactura = 1;
		$enca->idproyecto = $this->sedeFactura->codigo;
		$enca->idcontrato = 0;
		$enca->idcliente = 0;
		$enca->nit = $this->receptor->nit;
		$enca->nombre = $this->receptor->nombre;
		$enca->serie = $this->serie_factura;
		$enca->numero = $this->numero_factura;
		$enca->fechaingreso = $this->fecha_factura;
		$enca->mesiva = formatoFecha($this->fecha_factura, 4);
		$enca->fecha = $this->fecha_factura;
		$enca->idtipoventa = 1;
		$enca->conceptomayor = $conceptoMayor;
		$enca->iva = $sumIva;
		$enca->subtotal = $sumTotal;
		$enca->total = $sumTotal;
		$enca->idmoneda = 1;
		$enca->tipocambio = 1;
		$enca->pagada = 1;
		$enca->fechapago = $this->fecha_factura;
		$enca->esinsertada = 1;
		$enca->anulada = empty($this->fel_uuid_anulacion) ? 0 : 1;
		$enca->idrazonanulafactura = 0;
		$enca->idfox = $this->getPK();
		/**************************************************************/
		/*Datos detalle*/
		$det = new stdClass();


		$cliente = new stdClass();
		$cliente->codigo = $this->sedeFactura->cuenta_contable;
		$cliente->conceptomayor = $conceptoMayor;
		$cliente->haber = 0;
		$cliente->debe = $sumTotal;

		$iva = new stdClass();
		$iva->codigo = get_configuracion($config, "RT_CUENTA_CONTABLE_IVA_VENTA", 2);
		$iva->conceptomayor = $conceptoMayor;
		$iva->haber = $sumIva;
		$iva->debe = 0;
		$det->cuenta = [];
		array_push($det->cuenta, (array) $cliente);
		$tmpTotal = [];

		/*Propina*/
		$propIva = new stdClass();
		$propBase = new stdClass();
		$propIva->haber = 0;
		$propIva->codigo = get_configuracion($config, "RT_CUENTA_CONTABLE_IVA_PROPINA", 2);
		$propIva->conceptomayor = $conceptoMayor;
		$propIva->debe = 0;

		$propBase->haber = 0;
		$propBase->codigo = get_configuracion($config, "RT_CUENTA_CONTABLE_PROPINA", 2);
		$propBase->conceptomayor = $conceptoMayor;
		$propBase->debe = 0;

		foreach ($dfac as $row) {
			$cgrupo = $this->db
				->where("categoria_grupo", $row->articulo->categoria_grupo)
				->get("categoria_grupo")
				->row();
			if (strpos(strtolower($row->articulo->descripcion), "propina") === false) {
				if (isset($tmpTotal[$cgrupo->cuenta_contable])) {
					$tmpTotal[$cgrupo->cuenta_contable] += $row->monto_base;
				} else {
					$tmpTotal[$cgrupo->cuenta_contable] = $row->monto_base;
				}
			} else {
				$propIva->haber += $row->monto_iva;
				$propBase->haber += $row->monto_base;
			}
		}

		$iva->haber = $iva->haber - $propIva->haber;

		foreach ($tmpTotal as $key => $row) {
			$cuenta = new stdClass();
			$cuenta->codigo = $key;
			$cuenta->conceptomayor = $conceptoMayor;
			$cuenta->haber = $row;
			$cuenta->debe = 0;
			array_push($det->cuenta, (array)$cuenta);
		}

		array_push($det->cuenta, (array) $iva);

		if ($propBase->haber > 0) {
			array_push($det->cuenta, (array) $propBase);
		}

		if ($propIva->haber > 0) {
			array_push($det->cuenta, (array) $propIva);
		}

		$doc->encabezado = (array) $enca;
		$doc->detalle = (array) $det->cuenta;

		if (!$raw) {
			$requestDOM = new DOMDocument('1.0');
			$requestDOM->loadXML(arrayToXml((array)$doc, "<documento/>"));

			return $requestDOM->saveXML();
		} else {
			return $doc;
		}
	}

	public function set_datos_generales($args = array())
	{
		$datosGenerales = $this->xml->getElementsByTagName('DatosGenerales')->item(0);
		$datosGenerales->setAttribute('CodigoMoneda', $this->moneda->codigo);

		$fecha = $this->fecha_factura;


		$datosGenerales->setAttribute('FechaHoraEmision', $fecha . date("\TH:i:s-06:00"));

		//$datosGenerales->setAttribute('NumeroAcceso', '100000000');		

		if ($this->serie !== null) {
			$datosGenerales->setAttribute('Tipo', $this->serie->tipo);
		}

		/*if ($this->exenta) {
			if ($this->ncredito === null) {
				$datosGenerales->setAttribute('Exp', 'SI');
				$this->Exportacion();
			}
		}*/
	}

	public function iniciar_xml($tipo = '')
	{
		$this->xml = new DOMDocument();
		$this->xml->validateOnParse = true;

		switch ($tipo) {
			case 2: # Anulación 
				$this->xml->loadXML($this->serie->xmldte_anulacion);
				break;

			default:
				$this->xml->loadXML($this->serie->xmldte);
				break;
		}
	}

	public function set_emisor($args = array())
	{
		$emisor = $this->xml->getElementsByTagName('Emisor')->item(0);
		$emisor->setAttribute('AfiliacionIVA', 'GEN');

		$emisor->setAttribute('CodigoEstablecimiento', $this->sedeFactura->fel_establecimiento);

		if (!empty($this->empresa->correo_emisor)) {
			$emisor->setAttribute('CorreoEmisor', $this->empresa->correo_emisor);
		}

		$emisor->setAttribute('NITEmisor', str_replace('-', '', $this->empresa->nit));
		// $emisor->setAttribute('NombreComercial', $this->empresa->nombre_comercial);
		$emisor->setAttribute('NombreComercial', $this->sedeFactura->nombre);
		$emisor->setAttribute('NombreEmisor', $this->empresa->nombre);
		
		$laDireccion = !empty($this->sedeFactura->direccion) ? $this->sedeFactura->direccion : $this->empresa->direccion;

		$direccionEmisor = $this->xml->getElementsByTagName('DireccionEmisor')->item(0);
		$direccionEmisor->appendChild($this->crearElemento('dte:Direccion', $laDireccion, array(), true));
		$direccionEmisor->appendChild($this->crearElemento('dte:CodigoPostal', $this->empresa->codigo_postal));
		$direccionEmisor->appendChild($this->crearElemento('dte:Municipio', $this->empresa->municipio));
		$direccionEmisor->appendChild($this->crearElemento('dte:Departamento', $this->empresa->departamento));
		$direccionEmisor->appendChild($this->crearElemento('dte:Pais', $this->empresa->pais_iso_dos));

		/*if ($this->serie->tipo === 'FCAM') {
			$this->AbonosFacturaCambiaria();
		}*/
	}

	public function set_receptor($args = array())
	{
		# $correos = explode(",", $this->cliente->correo_factura);
		$receptor = $this->xml->getElementsByTagName('Receptor')->item(0);
		# $receptor->setAttribute('CorreoReceptor', $correos[0]);
		$receptor->setAttribute('CorreoReceptor', str_replace(" ", "", str_replace(",", ";", $this->correo_receptor)));


		$receptor->setAttribute('IDReceptor', str_replace('-', '', ($this->exenta ? 'CF' : $this->receptor->nit)));


		$receptor->setAttribute('NombreReceptor', $this->receptor->nombre);

		$direccionReceptor = $this->xml->getElementsByTagName('DireccionReceptor')->item(0);
		$direccionReceptor->appendChild($this->crearElemento('dte:Direccion', $this->receptor->direccion, array(), true));
		$direccionReceptor->appendChild($this->crearElemento('dte:CodigoPostal', 01012));
		$direccionReceptor->appendChild($this->crearElemento('dte:Municipio', 'Guatemala'));
		$direccionReceptor->appendChild($this->crearElemento('dte:Departamento', 'Guatemala'));
		$direccionReceptor->appendChild($this->crearElemento('dte:Pais', 'GT'));
	}

	private function add_detalle_xml(&$items, $row, $key, $redondeaMontos, &$montoIva, &$montoTotal, &$impuestosEsp)
	{
		$item = $this->crearElemento('dte:Item', '', array(
			'BienOServicio' => $row->bien_servicio,
			'NumeroLinea'   => $key + 1
		));

		$item->appendChild($this->crearElemento('dte:Cantidad', $row->cantidad));
		$item->appendChild($this->crearElemento('dte:UnidadMedida', 'PZA'));
		$item->appendChild($this->crearElemento('dte:Descripcion', $row->articulo->descripcion, array(), true));
		$item->appendChild($this->crearElemento('dte:PrecioUnitario', $redondeaMontos ? round(($row->precio_unitario), 6) : $row->precio_unitario_ext));
		$item->appendChild($this->crearElemento('dte:Precio', $row->subtotal));
		$item->appendChild($this->crearElemento('dte:Descuento', $redondeaMontos ? $row->descuento : $row->descuento_ext));

		$impuestos = $this->crearElemento('dte:Impuestos');
		$impuesto = $this->crearElemento('dte:Impuesto');
		$impuesto->appendChild($this->crearElemento('dte:NombreCorto', 'IVA'));
		$impuesto->appendChild($this->crearElemento('dte:CodigoUnidadGravable', ($this->exenta == 1 ? 2 : 1)));


		if ($this->exenta) {
			$valorBase = $row->total;
			$valorIva = 0;
		} else {
			$valorBase = $redondeaMontos ? $row->monto_base : $row->monto_base_ext;
			$valorIva = $redondeaMontos ?  $row->monto_iva : $row->monto_iva_ext;
		}

		$montoIva += $valorIva;

		$impuesto->appendChild($this->crearElemento('dte:MontoGravable', $valorBase));
		$impuesto->appendChild($this->crearElemento('dte:MontoImpuesto', $valorIva));

		$impuestos->appendChild($impuesto);

		foreach ($row->impuesto_especial as $rie) {
			$imp = $this->ImpuestoEspecial_model->buscar([
				"impuesto_especial" => $rie->impuesto_especial,
				"_uno" => true
			]);

			$impuesto = $this->crearElemento('dte:Impuesto');
			$impuesto->appendChild($this->crearElemento('dte:NombreCorto', $imp->descripcion));
			$impuesto->appendChild($this->crearElemento('dte:CodigoUnidadGravable', ($this->exenta == 1 ? 2 : (isset($imp->codigo_sat) && !empty($imp->codigo_sat) ? $imp->codigo_sat : 1))));

			$valorImp = $redondeaMontos ? $rie->valor_impuesto_especial : $rie->valor_impuesto_especial_ext;

			if ($this->exenta) {
				$valorBase = $row->total;
			} else {
				$valorBase = $redondeaMontos ? $row->monto_base : $row->monto_base_ext;
			}

			$row->total += $redondeaMontos ? $rie->valor_impuesto_especial : $rie->valor_impuesto_especial_ext;

			$impuesto->appendChild($this->crearElemento('dte:MontoGravable', (isset($rie->precio_sugerido) && (float)$rie->precio_sugerido > 0 ? ($redondeaMontos ? $rie->precio_sugerido : $rie->precio_sugerido_ext) : $valorBase)));

			if (isset($rie->cantidad_gravable) && (float)$rie->cantidad_gravable > 0) {
				$impuesto->appendChild($this->crearElemento('dte:CantidadUnidadesGravables', $rie->cantidad_gravable));
			}

			$impuesto->appendChild($this->crearElemento('dte:MontoImpuesto', $valorImp));
			$impuestos->appendChild($impuesto);
			if (isset($impuestosEsp[$rie->impuesto_especial])) {
				$impuestosEsp[$rie->impuesto_especial]['monto'] += $redondeaMontos ? $rie->valor_impuesto_especial : $rie->valor_impuesto_especial_ext;
			} else {
				$impuestosEsp[$rie->impuesto_especial] = [
					"descripcion" => $imp->descripcion,
					"monto" => $redondeaMontos ? $rie->valor_impuesto_especial : $rie->valor_impuesto_especial_ext
				];
			}
		}


		$item->appendChild($impuestos);

		$item->appendChild($this->crearElemento('dte:Total', $row->total));
		$items->appendChild($item);
		$montoTotal += $row->total;
	}

	public function set_servicios_propios($args = array(), $redondeaMontos = true)
	{
		$items = $this->xml->getElementsByTagName('Items')->item(0);

		$montoIva = 0;
		$montoTotal = 0;
		$impuestosEsp = [];
		$detFactura = $this->getDetalle([], $redondeaMontos);

		if ((int)$this->enviar_descripcion_unica === 1 && !is_null($this->descripcion_unica) && trim($this->descripcion_unica) !== '') {
			
			$row = (object)[
				'bien_servicio' => 'B',
				'cantidad' => 1,
				'articulo' => (object)['descripcion' => $this->descripcion_unica],
				'precio_unitario' => 0.00,
				'precio_unitario_ext' => 0.00,
				'subtotal' => 0.00,
				'descuento' => 0.00,
				'descuento_ext' => 0.00,
				'total' => 0.00,
				'monto_base' => 0.00,
				'monto_base_ext' => 0.00,
				'monto_iva' => 0.00,
				'monto_iva_ext' => 0.00,
				'impuesto_especial' => []
			];

			foreach($detFactura as $det) {
				$row->precio_unitario += $det->subtotal;
				$row->precio_unitario_ext += $det->subtotal;
				$row->subtotal += $det->subtotal;
				$row->descuento += $det->descuento;
				$row->descuento_ext += $det->descuento_ext;
				$row->total += $det->total;
				$row->monto_base += $det->monto_base;
				$row->monto_base_ext += $det->monto_base_ext;
				$row->monto_iva += $det->monto_iva;
				$row->monto_iva_ext += $det->monto_iva_ext;
				if (!is_null($det->impuesto_especial) && (int)$det->impuesto_especial > 0) {
					$cntImpEsp = count($row->impuesto_especial);
					$idx = -1;
					for($i = 0; $i < $cntImpEsp; $i++) {
						if ((int)$row->impuesto_especial[$i]->impuesto_especial === (int)$det->impuesto_especial) {
							$idx = $i;
							break;
						}
					}

					if($idx < 0) {
						$row->impuesto_especial[] = (object)[
							'impuesto_especial' => $det->impuesto_especial,
							'valor_impuesto_especial' => (float)$det->valor_impuesto_especial,
							'valor_impuesto_especial_ext' => (float)$det->valor_impuesto_especial_ext,
							'precio_sugerido' => (float)$det->precio_sugerido,
							'precio_sugerido_ext' => (float)$det->precio_sugerido_ext,
							'cantidad_gravable' => (float)$det->cantidad_gravable,
						];
					} else {
						$row->impuesto_especial[$idx]->valor_impuesto_especial += $det->valor_impuesto_especial;
						$row->impuesto_especial[$idx]->valor_impuesto_especial_ext += $det->valor_impuesto_especial_ext;
						$row->impuesto_especial[$idx]->cantidad_gravable += $det->cantidad_gravable;
					}
				}
			}
			
			$this->add_detalle_xml($items, $row, 0, false, $montoIva, $montoTotal, $impuestosEsp);
			
		} else {
			foreach ($detFactura as $key => $row) {
				if ($row->impuesto_especial) {
					$ie = $row->impuesto_especial;
					$row->impuesto_especial = [];
					$row->impuesto_especial[] = (object)[
						'impuesto_especial' => $ie,
						'valor_impuesto_especial' => (float)$row->valor_impuesto_especial,
						'valor_impuesto_especial_ext' => (float)$row->valor_impuesto_especial_ext,
						'precio_sugerido' => (float)$row->precio_sugerido,
						'precio_sugerido_ext' => (float)$row->precio_sugerido_ext,
						'cantidad_gravable' => (float)$row->cantidad_gravable,
					];
				} else {
					$row->impuesto_especial = [];
				}
				$this->add_detalle_xml($items, $row, $key, $redondeaMontos, $montoIva, $montoTotal, $impuestosEsp);
				// $item = $this->crearElemento('dte:Item', '', array(
				// 	'BienOServicio' => $row->bien_servicio,
				// 	'NumeroLinea'   => $key + 1
				// ));
	
				// $item->appendChild($this->crearElemento('dte:Cantidad', $row->cantidad));
				// $item->appendChild($this->crearElemento('dte:UnidadMedida', 'PZA'));
				// $item->appendChild($this->crearElemento('dte:Descripcion', $row->articulo->descripcion, array(), true));
				// $item->appendChild($this->crearElemento('dte:PrecioUnitario', $redondeaMontos ? round(($row->precio_unitario), 6) : $row->precio_unitario_ext));
				// $item->appendChild($this->crearElemento('dte:Precio', $row->subtotal));
				// $item->appendChild($this->crearElemento('dte:Descuento', $redondeaMontos ? $row->descuento : $row->descuento_ext));
	
				// $impuestos = $this->crearElemento('dte:Impuestos');
				// $impuesto = $this->crearElemento('dte:Impuesto');
				// $impuesto->appendChild($this->crearElemento('dte:NombreCorto', 'IVA'));
				// $impuesto->appendChild($this->crearElemento('dte:CodigoUnidadGravable', ($this->exenta == 1 ? 2 : 1)));
	
	
				// if ($this->exenta) {
				// 	$valorBase = $row->total;
				// 	$valorIva = 0;
				// } else {
				// 	$valorBase = $redondeaMontos ? $row->monto_base : $row->monto_base_ext;
				// 	$valorIva = $redondeaMontos ?  $row->monto_iva : $row->monto_iva_ext;
				// }
	
				// $montoIva += $valorIva;
	
				// $impuesto->appendChild($this->crearElemento('dte:MontoGravable', $valorBase));
				// $impuesto->appendChild($this->crearElemento('dte:MontoImpuesto', $valorIva));
	
				// $impuestos->appendChild($impuesto);
				// if ($row->impuesto_especial) {
				// 	$imp = $this->ImpuestoEspecial_model->buscar([
				// 		"impuesto_especial" => $row->impuesto_especial,
				// 		"_uno" => true
				// 	]);
	
				// 	$impuesto = $this->crearElemento('dte:Impuesto');
				// 	$impuesto->appendChild($this->crearElemento('dte:NombreCorto', $imp->descripcion));
				// 	$impuesto->appendChild($this->crearElemento('dte:CodigoUnidadGravable', ($this->exenta == 1 ? 2 : (isset($imp->codigo_sat) && !empty($imp->codigo_sat) ? $imp->codigo_sat : 1))));
	
				// 	$valorImp = $redondeaMontos ? $row->valor_impuesto_especial : $row->valor_impuesto_especial_ext;
	
				// 	if ($this->exenta) {
				// 		$valorBase = $row->total;
				// 	} else {
				// 		$valorBase = $redondeaMontos ? $row->monto_base : $row->monto_base_ext;
				// 	}
	
				// 	$row->total += $redondeaMontos ? $row->valor_impuesto_especial : $row->valor_impuesto_especial_ext;
	
				// 	$impuesto->appendChild($this->crearElemento('dte:MontoGravable', (isset($row->precio_sugerido) && (float)$row->precio_sugerido > 0 ? ($redondeaMontos ? $row->precio_sugerido : $row->precio_sugerido_ext) : $valorBase)));
	
				// 	if (isset($row->cantidad_gravable) && (float)$row->cantidad_gravable > 0) {
				// 		$impuesto->appendChild($this->crearElemento('dte:CantidadUnidadesGravables', $row->cantidad_gravable));
				// 	}
	
				// 	$impuesto->appendChild($this->crearElemento('dte:MontoImpuesto', $valorImp));
				// 	$impuestos->appendChild($impuesto);
				// 	if (isset($impuestosEsp[$row->impuesto_especial])) {
				// 		$impuestosEsp[$row->impuesto_especial]['monto'] += $redondeaMontos ? $row->valor_impuesto_especial : $row->valor_impuesto_especial_ext;
				// 	} else {
				// 		$impuestosEsp[$row->impuesto_especial] = [
				// 			"descripcion" => $imp->descripcion,
				// 			"monto" => $redondeaMontos ? $row->valor_impuesto_especial : $row->valor_impuesto_especial_ext
				// 		];
				// 	}
				// }
	
	
				// $item->appendChild($impuestos);
	
				// $item->appendChild($this->crearElemento('dte:Total', $row->total));
				// $items->appendChild($item);
				// $montoTotal += $row->total;
			} // Fin de for de detalle cuando sí es detallada la factura.
		}

		$totalImpuestos = $this->xml->getElementsByTagName('TotalImpuestos')->item(0);
		$totalIva = $this->xml->getElementsByTagName('TotalImpuesto')->item(0);
		$totalIva->setAttribute('NombreCorto', 'IVA');
		$totalIva->setAttribute('TotalMontoImpuesto', ($this->exenta ? '0.00' : $montoIva));
		foreach ($impuestosEsp as $row) {
			$totalImp = $this->crearElemento('dte:TotalImpuesto');
			$totalImp->setAttribute('NombreCorto', $row['descripcion']);
			$totalImp->setAttribute('TotalMontoImpuesto', $row['monto']);
			$totalImpuestos->appendChild($totalImp);
		}
		$granTotal = $this->xml->getElementsByTagName('GranTotal')->item(0);
		$granTotal->nodeValue = $montoTotal;
	}

	public function set_frases($args = array())
	{
		$frases = $this->xml->getElementsByTagName('Frases')->item(0);

		# Esto es para agregar frase de Exento de IVA
		if ($this->factura) {
			if ($this->exenta) {
				$frases->appendChild($this->crearElemento('dte:Frase', '', array(
					'TipoFrase'       => 4,
					'CodigoEscenario' => 1 # Por defecto se está colocando que es por exportación
				)));
			}

			if ($this->empresa->agente_retenedor == 1) {
				$frases->appendChild($this->crearElemento('dte:Frase', '', array(
					'TipoFrase'       => 2,
					'CodigoEscenario' => $this->certificador->frase_retencion_iva
				)));
			}

			if (in_array($this->serie->tipo, array('FCAM', 'FACT'))) {
				$frases->appendChild($this->crearElemento('dte:Frase', '', array(
					'TipoFrase'       => 1,
					'CodigoEscenario' => $this->certificador->frase_retencion_isr
				)));
			}
		}
	}

	public function crearElemento($nombre, $valor = '', $attr = array(), $cdata = false)
	{
		if ($cdata) {
			$txt = $this->xml->createCDATASection($valor);
			$valor = '';
		}

		# Sin NS
		if (isset($attr['SNS'])) {
			$nodo = $this->xml->createElement($nombre, $valor);
			unset($attr['SNS']);
		} else {
			$nodo = $this->xml->createElementNS($this->namespaceURI, $nombre, $valor);
		}

		if (is_array($attr) && count($attr) > 0) {
			foreach ($attr as $key => $value) {
				$nodo->setAttribute($key, $value);
			}
		}

		if ($cdata) {
			$nodo->appendChild($txt);
		}

		return $nodo;
	}

	public function procesar_factura($redondeaMontos = true)
	{
		$this->iniciar_xml();
		$this->set_datos_generales();
		$this->set_emisor();
		$this->set_receptor();
		$this->set_servicios_propios([], $redondeaMontos);
		$this->set_frases();
		$this->esAnulacion = 'N';
	}

	public function procesarAnulacion($args = [])
	{
		$comentario = 'ERROR DE EMISIÓN';

		if (isset($args['comentario'])) {
			$comentario = $args['comentario'];
		}

		$this->esAnulacion = "S";

		$xml = $this->getFelXml();
		$datos = $xml->getElementsByTagName('DatosGenerales')->item(0);

		$fecha = $datos->getAttribute('FechaHoraEmision');

		$receptor = $xml->getElementsByTagName('Receptor')->item(0);
		$IDReceptor = $receptor->getAttribute('IDReceptor');

		$emisor = $xml->getElementsByTagName('Emisor')->item(0);
		$NITEmisor = $emisor->getAttribute('NITEmisor');

		$this->iniciar_xml(2);
		$this->fecha_factura .= date("\TH:i:s");
		$DatosGenerales = $this->xml->getElementsByTagName('DatosGenerales')->item(0);
		$DatosGenerales->setAttribute('FechaEmisionDocumentoAnular', $fecha);
		$DatosGenerales->setAttribute('FechaHoraAnulacion', date("Y-m-d\TH:i:s"));

		$DatosGenerales->setAttribute('IDReceptor', $IDReceptor);
		$DatosGenerales->setAttribute('MotivoAnulacion', substr($comentario, 0, 255));
		$DatosGenerales->setAttribute('NITEmisor', $NITEmisor);
		$DatosGenerales->setAttribute('NumeroDocumentoAAnular', $this->fel_uuid);
	}

	public function anularInfile()
	{
	}

	public function getXml()
	{
		return $this->xml->saveXML();
	}

	public function enviar($args = array())
	{
		$secs = 600;
		set_time_limit($secs + 30);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->certificador->vinculo_firma);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0); //Agregado el 15/08/2021 15:53.
		curl_setopt($ch, CURLOPT_TIMEOUT, $secs); //Agregado el 15/08/2021 15:53.
		$datos = array(
			"llave" => $this->certificador->firma_llave,
			"archivo" => base64_encode(html_entity_decode($this->xml->saveXML())),
			"codigo" => $this->certificador->firma_codigo,
			"alias" => $this->certificador->firma_alias,
			"es_anulacion" => $this->esAnulacion
		);

		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));

		$respuesta = curl_exec($ch);

		// $jsonFirma = json_decode(curl_exec($ch));
		$jsonFirma = null;
		$error_curl = '';
		if ($respuesta === false) {
			$error_curl = curl_error($ch);
		} else {
			$jsonFirma = json_decode($respuesta);
		}

		curl_close($ch);
		# para imprimir errores

		if (is_object($jsonFirma)) {
			if ($jsonFirma->resultado) {
				$datos = array(
					"nit_emisor"   => str_replace('-', '', $this->empresa->nit),
					"xml_dte"      => $jsonFirma->archivo
				);

				$prefijo = $this->esAnulacion === 'S' ? 'AN' : 'VT';
				$identificador = "{$prefijo}-{$this->factura}";

				$url = $this->esAnulacion === 'N' ? $this->certificador->vinculo_factura : $this->certificador->vinculo_anulacion;

				$ch = curl_init();
				curl_setopt($ch, CURLOPT_URL, $url);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
				curl_setopt($ch, CURLOPT_POST, 1);
				curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
				curl_setopt($ch, CURLOPT_HTTPHEADER, array(
					"Content-Type: application/json",
					"Usuario: " . $this->certificador->usuario,
					"llave: " . $this->certificador->llave,
					"identificador: " . $identificador
				));

				curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0); //Agregado el 15/08/2021 15:53.
				curl_setopt($ch, CURLOPT_TIMEOUT, $secs); //Agregado el 15/08/2021 15:53.

				$query = curl_exec($ch);

				if ($query === false) {
					if ($error_curl !== '') {
						$error_curl .= '; ';
					}
					$error_curl = curl_error($ch);
				}

				curl_close($ch);

				$res = json_decode($query);

				if (isset($res->resultado) && $res->resultado) {
					if ($this->esAnulacion === 'S') {
						$this->fel_uuid_anulacion = $res->uuid;
					} else {
						$this->numero_factura = $res->numero;
						$this->serie_factura = $res->serie;
						$this->fel_uuid = $res->uuid;
					}

					$this->guardar();
				} else if (isset($res->descripcion_errores)) {
					foreach ($res->descripcion_errores as $row) {
						$error = explode('|', $row->mensaje_error);
						$this->setMensaje($error[count($error) - 1]);
					}
				} else {
					$this->setMensaje("No se obtuvo respuesta del certificador INFILE. Intente nuevamente, por favor. {$error_curl}");
				}

				return $res;
			} else {
				$this->setMensaje($jsonFirma->descripcion);
			}
		} else {
			$this->setMensaje("Error al firmar documento. Intente nuevamente. {$error_curl}");
		}

		return null;
	}

	public function enviarDigiFact($args = [])
	{
		$this->load->helper('api');
		$link = $this->certificador->vinculo_factura;
		$nit = str_repeat("0", 12 - strlen($this->empresa->nit)) . $this->empresa->nit;
		$datos = array(
			"Username" => "{$this->empresa->pais_iso_dos}.{$nit}.{$this->certificador->usuario}",
			"Password" => $this->certificador->llave
		);

		$jsonToken = json_decode(post_request($link, json_encode($datos)));

		if (isset($jsonToken->Token)) {
			$url = $this->esAnulacion === 'N' ? $this->certificador->vinculo_firma : $this->certificador->vinculo_anulacion;
			$link = $url . $nit;
			$header = ["Authorization: {$jsonToken->Token}"];
			$datos = html_entity_decode($this->xml->saveXML());
			$res = json_decode(post_request($link, $datos, $header));

			if ($res->Codigo == 1 && $this->esAnulacion === 'N') {
				$this->numero_factura = $res->NUMERO;
				$this->serie_factura = $res->Serie;
				$this->fel_uuid = $res->Autorizacion;
			} else if ($this->esAnulacion === 'S') {
				$this->fel_uuid_anulacion = $res->Autorizacion;
			}

			$this->guardar();

			return $res;
		}

		return $jsonToken;
	}

	public function enviarCofidi($args = [])
	{
		$link = $this->certificador->vinculo_factura;
		$nit = str_repeat("0", 12 - strlen($this->empresa->nit)) . $this->empresa->nit;
		$datos = array(
			"Requestor" => $this->certificador->llave,
			"Transaction" => $this->certificador->firma_codigo,
			"Country" => $this->empresa->pais_iso_dos,
			"Entity" => $nit,
			"User" => $this->certificador->llave,
			"UserName" => $this->certificador->usuario,
			"Data1" => $this->esAnulacion == "S" ? $this->certificador->vinculo_anulacion : $this->certificador->vinculo_firma,
			"Data2" => base64_encode(html_entity_decode($this->xml->saveXML())),
			"Data3" => $this->getPK()
		);

		$client = new SoapClient($link);

		$res = $client->RequestTransaction($datos);
		$res = $res->RequestTransactionResult;

		if (isset($res->Response->Result) || $res->Response->Code == 9) {
			if ($res->Response->Code == 9) {

				$client = new SoapClient($link);

				$datos = array(
					"Requestor" => $this->certificador->llave,
					"Transaction" => $this->certificador->firma_alias,
					"Country" => $this->empresa->pais_iso_dos,
					"Entity" => $nit,
					"User" => $this->certificador->llave,
					"UserName" => $this->certificador->usuario,
					"Data1" => $this->getPK(),
					"Data2" => "",
					"Data3" => ""
				);

				$res = $client->RequestTransaction($datos);
				$res = $res->RequestTransactionResult;

				if ($res->Response->Result == 1 && $this->esAnulacion === 'N') {
					$data = simplexml_load_string(base64_decode($res->ResponseData->ResponseData2));
					$data = json_decode(json_encode($data->doc));

					$this->numero_factura = $data->serial;
					$this->serie_factura = $data->batch;
					$this->fel_uuid = $data->uuid;
				}
			} else if ($res->Response->Result == 1) {
				if ($this->esAnulacion === 'N') {
					$this->numero_factura = $res->Response->Identifier->Serial;
					$this->serie_factura = $res->Response->Identifier->Batch;
					$this->fel_uuid = $res->Response->Identifier->DocumentGUID;
				} else {
					$this->fel_uuid_anulacion = $this->fel_uuid;
				}

				$res->resultado = true;
				$res->xml_certificado = $res->ResponseData->ResponseData1;
				$res->fecha = $res->Response->TimeStamp;
			}

			$this->guardar();

			return $res;
		}

		return $res->RequestTransactionResult->Response;
	}

	public function enviarCorposistemas($args = [])
	{
		$link = $this->certificador->vinculo_factura;
		$nit = str_repeat("0", 12 - strlen($this->empresa->nit)) . $this->empresa->nit;
		$datos = array(
			"Requestor" => $this->certificador->llave,
			"Transaction" => $this->certificador->firma_codigo,
			"Country" => $this->empresa->pais_iso_dos,
			"Entity" => $nit,
			"User" => $this->certificador->llave,
			"UserName" => $this->certificador->usuario,
			"Data1" => $this->esAnulacion == "S" ? $this->certificador->vinculo_anulacion : $this->certificador->vinculo_firma,
			"Data2" => base64_encode(html_entity_decode($this->xml->saveXML())),
			"Data3" => $this->getPK()
		);

		$client = new SoapClient($link);
		
		$res = $client->RequestTransaction($datos);
		$res = $res->RequestTransactionResult;

		if (isset($res->Response->Result) || $res->Response->Code == 9) {
			if ($res->Response->Code == 9) {

				$client = new SoapClient($link);

				$datos = array(
					"Requestor" => $this->certificador->llave,
					"Transaction" => $this->certificador->firma_alias,
					"Country" => $this->empresa->pais_iso_dos,
					"Entity" => $nit,
					"User" => $this->certificador->llave,
					"UserName" => $this->certificador->usuario,
					"Data1" => $this->getPK(),
					"Data2" => "",
					"Data3" => ""
				);

				$res = $client->RequestTransaction($datos);
				$res = $res->RequestTransactionResult;

				if ($res->Response->Result == 1 && $this->esAnulacion === 'N') {
					$data = simplexml_load_string(base64_decode($res->ResponseData->ResponseData2));
					$data = json_decode(json_encode($data->doc));

					$this->numero_factura = $data->serial;
					$this->serie_factura = $data->batch;
					$this->fel_uuid = $data->uuid;
				} 
			} else if ($res->Response->Result == 1) {
				if ($this->esAnulacion === 'N') {
					$this->numero_factura = $res->Response->Identifier->Serial;
					$this->serie_factura = $res->Response->Identifier->Batch;
					$this->fel_uuid = $res->Response->Identifier->DocumentGUID;	
				} else {
					$this->fel_uuid_anulacion = $this->fel_uuid;
				}

				$res->resultado = true;
				$res->xml_certificado = $res->ResponseData->ResponseData1;
				$res->fecha = $res->Response->TimeStamp;
			}

			$this->guardar();

			return $res;
		}

		return $res->RequestTransactionResult->Response;
	}

	public function pdfInfile()
	{
		return [
			'documento' => $this->certificador->vinculo_grafo . $this->fel_uuid,
			'tipo' => 'link'
		];
	}

	public function pdfDigiFact()
	{
		$this->load->helper('api');
		$link = $this->certificador->vinculo_factura;
		$nit = str_repeat("0", 12 - strlen($this->empresa->nit)) . $this->empresa->nit;
		$datos = array(
			"Username" => "{$this->empresa->pais_iso_dos}.{$nit}.{$this->certificador->usuario}",
			"Password" => $this->certificador->llave
		);

		$jsonToken = json_decode(post_request($link, json_encode($datos)));

		if (isset($jsonToken->Token)) {
			$link = $this->certificador->vinculo_grafo . "&NIT=$nit&GUID=" . $this->fel_uuid;
			$header = ["Authorization: {$jsonToken->Token}"];
			$res = json_decode(get_request($link, $header));
			if ($res->Codigo == 1) {
				return [
					'documento' => $res->ResponseDATA3,
					'tipo' => 'pdf'
				];
			}
		}
		return ['documento' => null, 'tipo' => null];
	}	

	public function pdfCofidi()
	{
		$link = $this->certificador->vinculo_factura;
		$nit = str_repeat("0", 12 - strlen($this->empresa->nit)) . $this->empresa->nit;
		$datos = array(
			"Requestor" => $this->certificador->llave,
			"Transaction" => $this->certificador->vinculo_grafo,
			"Country" => $this->empresa->pais_iso_dos,
			"Entity" => $nit,
			"User" => $this->certificador->llave,
			"UserName" => $this->certificador->usuario,
			"Data1" => $this->fel_uuid,
			"Data2" => "",
			"Data3" => "PDF"
		);

		$client = new SoapClient($link);

		$res = $client->RequestTransaction($datos);
		$res = $res->RequestTransactionResult;
		if ($res->Response->Result == 1) {

			return [
				'documento' => $res->ResponseData->ResponseData3,
				'tipo' => 'pdf'
			];
		}
	}

	public function pdfCorposistemas()
	{
		$link = $this->certificador->vinculo_factura;
		$nit = str_repeat("0", 12 - strlen($this->empresa->nit)) . $this->empresa->nit;
		$datos = array(
			"Requestor" => $this->certificador->llave,
			"Transaction" => $this->certificador->vinculo_grafo,
			"Country" => $this->empresa->pais_iso_dos,
			"Entity" => $nit,
			"User" => $this->certificador->llave,
			"UserName" => $this->certificador->usuario,
			"Data1" => $this->fel_uuid,
			"Data2" => "",
			"Data3" => "PDF"
		);

		$client = new SoapClient($link);
		
		$res = $client->RequestTransaction($datos);
		$res = $res->RequestTransactionResult;
		if ($res->Response->Result == 1) {
			
			return [
				'documento' => $res->ResponseData->ResponseData3,
				'tipo' => 'pdf'
			];
			
		}
	}

	public function getRazonAnulacion()
	{
		return $this->db
			->where("razon_anulacion", $this->razon_anulacion)
			->get("razon_anulacion")
			->row();
	}

	public function setBitacoraFel($args = [])
	{
		$this->db->set('factura', $this->factura)
			->set('resultado', $args['resultado'])
			->set('usuario', $this->usuario)
			->insert('factura_fel');

		return $this->db->affected_rows() > 0;
	}

	public function getFelRespuesta()
	{
		$tmp = $this->db
			->where('factura', $this->factura)
			->where('resultado is not ', 'null', false)
			->order_by('factura_fel', 'desc')
			->get('factura_fel')
			->result();

		foreach ($tmp as $row) {
			$json = json_decode($row->resultado);

			if ((isset($json->resultado) && $json->resultado) || (isset($json->Codigo) && $json->Codigo == 1)) {
				return $json;
			}
		}

		return null;
	}

	public function getFelXml()
	{
		$res = $this->getFelRespuesta();
		if (!isset($res->xml_certificado) && isset($res->ResponseDATA1)) {
			$res->xml_certificado = $res->ResponseDATA1;
		}
		$xml = new DOMDocument();
		$xml->validateOnParse = true;
		$xml->loadXML(base64_decode($res->xml_certificado));
		return $xml;
	}

	public function get_facturas($args = [])
	{
		if (isset($args["_facturadas"])) {
			$this->db->where("a.numero_factura is not null");
		}

		if (verDato($args, '_anuladas') && filter_var($args['_anuladas'], FILTER_VALIDATE_BOOLEAN)) {
			$this->db
				->where("a.numero_factura is not null")
				->where("a.fel_uuid_anulacion is not null");
		}

		if (isset($args["_vivas"])) {
			$this->db
				->where("a.numero_factura is not null")
				->where("a.fel_uuid_anulacion is null");
		}

		if (isset($args['fdel']) && isset($args['fal'])) {
			$this->db
				->where("a.fecha_factura >=", $args['fdel'])
				->where("a.fecha_factura <=", $args['fal']);
			unset($args['fdel']);
			unset($args['fal']);
		}

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in("a.sede", $args['sede']);
			} else {
				$this->db->where("a.sede", $args['sede']);
			}
			unset($args['sede']);
		}

		if (isset($args['turno_tipo'])) {
			$this->db->where("(g.turno_tipo = {$args['turno_tipo']} OR g.turno_tipo IS NULL)");
			unset($args['turno_tipo']);
		}

		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where("a.{$key}", $row);
				}
			}
		}

		return $this->db
			->select("a.*")
			->join("detalle_factura b", "a.factura = b.factura")
			->join("detalle_factura_detalle_cuenta c", "c.detalle_factura = b.detalle_factura", "left")
			->join("detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta", "left")
			->join("cuenta e", "d.cuenta_cuenta = e.cuenta", "left")
			->join("comanda f", "e.comanda = f.comanda", "left")
			->join("turno g", "g.turno = f.turno", "left")
			->group_by("a.factura")
			->get("factura a")
			->result();
	}

	public function get_ventas_sin_factura($args = [])
	{
		if (isset($args['fdel'])) {
			$this->db->where('DATE(d.fhcreacion) >=', $args['fdel']);				
		}

		if (isset($args['fal'])) {
			$this->db->where('DATE(d.fhcreacion) <=', $args['fal']);				
		}

		$ventas = 0;
		$mnt = $this->db->select_sum('a.monto')
			->join('forma_pago b', 'b.forma_pago = a.forma_pago')
			->join('cuenta c', 'c.cuenta = a.cuenta')
			->join('comanda d', 'd.comanda = c.comanda')
			->where('b.sinfactura', 1)
			->where('d.razon_anulacion IS NULL')
			->get('cuenta_forma_pago a')
			->row();
		
		if ($mnt) {
			$ventas = (float)$mnt->monto;
		}
		return $ventas;
	}

	public function getPropina()
	{
		return $this->db
			->select("e.propina as propina_monto, f.nombre")
			->from("factura a")
			->join("detalle_factura b", "a.factura = b.factura")
			->join("detalle_factura_detalle_cuenta c", "c.detalle_factura = b.detalle_factura")
			->join("detalle_cuenta d", "c.detalle_cuenta = d.detalle_cuenta")
			->join("cuenta_forma_pago e", "d.cuenta_cuenta = e.cuenta")
			->join("cliente f", "f.cliente = a.cliente")
			->where("a.factura", $this->factura)
			->group_by("e.cuenta_forma_pago")
			->get()
			->result();
	}

	public function anularComandas()
	{
		$com = $this->getComanda();
		$com->estatus = 1;
		$com->guardar();
	}

	public function filtrar_facturas($args = [])
	{
		if (!isset($args['_todas'])) {
			$this->db->where('a.fel_uuid IS NULL AND fel_uuid_anulacion IS NULL');
		}

		if (isset($args['_fdel'])) {
			$this->db->where('a.fecha_factura >=', $args['_fdel']);
		}

		if (isset($args['_fal'])) {
			$this->db->where('a.fecha_factura <=', $args['_fal']);
		}

		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where("a.{$key}", $row);
				}
			}
		}

		if (isset($args['_turno'])) {
			$this->db
				->join("detalle_factura b", "b.factura = a.factura")
				->join("detalle_factura_detalle_cuenta c", "b.detalle_factura = c.detalle_factura")
				->join("detalle_cuenta d", "d.detalle_cuenta = c.detalle_cuenta")
				->join("detalle_comanda e", "d.detalle_comanda = e.detalle_comanda")
				->join("comanda f", "e.comanda = f.comanda")
				->where("f.turno", $args['_turno'])
				->group_by("a.factura");
		}

		$this->db->order_by('a.fecha_factura DESC');

		$tmp = $this->db->get('factura a');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}

	function firmar($redondeaMontos = true)
	{
		$this->cargarFacturaSerie();
		$this->cargarMoneda();
		$this->cargarReceptor();
		$this->cargarSede();
		$this->cargarCertificadorFel();
		$this->procesar_factura($redondeaMontos);

		$funcion = $this->getCertificador()->metodo_factura;
		$resp = $this->$funcion();
		$this->setBitacoraFel(['resultado' => json_encode($resp)]);
	}

	public function enviarInfile($args = array())
	{
		$secs = 600;
		set_time_limit($secs + 30);
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->certificador->vinculo_firma);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
		curl_setopt($ch, CURLOPT_TIMEOUT, $secs);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch, CURLOPT_POSTFIELDS, html_entity_decode($this->xml->saveXML()));

		$prefijo = $this->esAnulacion === 'S' ? 'AN' : 'VT';
		$identificador = "{$prefijo}-{$this->factura}";

		curl_setopt(
			$ch,
			CURLOPT_HTTPHEADER,
			array(
				'Content-Type: application/xml',
				"UsuarioFirma: {$this->certificador->usuario}",
				"LlaveFirma: {$this->certificador->firma_llave}",
				"UsuarioApi: {$this->certificador->usuario}",
				"LlaveApi: {$this->certificador->llave}",
				"identificador: {$identificador}"
			)
		);

		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);		

		$respuesta = curl_exec($ch);

		// $jsonFirma = json_decode(curl_exec($ch));
		$jsonFirma = null;
		$error_curl = '';
		if ($respuesta === false) {
			$error_curl = curl_error($ch);
		} else {
			$jsonFirma = json_decode($respuesta);
		}

		curl_close($ch);

		if (is_object($jsonFirma)) {
			$res = $jsonFirma;
			if (isset($res->resultado) && $res->resultado) {
				if ($this->esAnulacion === 'S') {
					$this->fel_uuid_anulacion = $res->uuid;
				} else {
					$this->numero_factura = $res->numero;
					$this->serie_factura = $res->serie;
					$this->fel_uuid = $res->uuid;
				}

				$this->guardar();
			} else if (isset($res->descripcion_errores)) {
				foreach ($res->descripcion_errores as $row) {
					$error = explode('|', $row->mensaje_error);
					$this->setMensaje($error[count($error) - 1]);
				}
			} else {
				$this->setMensaje("No se obtuvo respuesta del certificador INFILE. Intente nuevamente, por favor. {$error_curl}");
			}
			return $res;
		} else {
			$this->setMensaje("Error al firmar documento. Intente nuevamente. {$error_curl}");
		}
		return null;
	}
}

/* End of file Factura_model.php */
/* Location: ./application/restaurante/models/Factura_model.php */