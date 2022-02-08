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
	public $comandaenuso = 0;
	public $fhcreacion;
	public $numero_pedido;
	public $notas_generales;
	public $orden_gk = null;
	public $razon_anulacion = null;
	public $cliente_master = null;
	public $detalle_comanda_original = null;
	public $tiempo_entrega = null;
	public $estatus_callcenter = null;
	public $tipo_domicilio = null;
	public $repartidor = null;
	public $fhtomapedido = null;
	public $comensales = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("comanda");

		if (!empty($id)) {
			$this->cargar($id);
		} else {
			$this->fhcreacion = date('Y-m-d H:i:s');
		}

		$this->load->library('AsyncTasks');

	}

	public function getMesas()
	{
		return $this->db
			->select('
			b.mesa,
			b.area,
			b.numero,
			b.posx,
			b.posy,
			b.tamanio,
			b.estatus, b.esmostrador, b.etiqueta, b.escallcenter,
			b.impresora,
			c.nombre as narea')
			->join('mesa b', 'b.mesa = a.mesa')
			->join('area c', 'c.area = b.area')
			->where('a.comanda', $this->comanda)
			->get('comanda_has_mesa a')
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

	public function setDetalle($articulo, $idcta, $padre = null, $precio = null, $cantidad = 1, $cantidadPadre = null)
	{
		$cuenta = new Cuenta_model($idcta);
		$combo = new Articulo_model($articulo);
		$precio = ($precio !== null) ? $precio : $combo->precio;
		$bodega = $combo->getBodega();

		$args = [
			"articulo" => $combo->getPK(),
			"cantidad" => $cantidad,
			"notas" => "",
			"precio" => $precio,
			"total" => is_null($cantidadPadre) ? (float)$precio * $cantidad : (float)$precio * (float)$cantidadPadre,
			"detalle_comanda_id" => $padre,
			"bodega" => $bodega ? $bodega->bodega : null
		];
		$det = $this->guardarDetalle($args);
		if ($det) {
			$cuenta->guardarDetalle([
				'detalle_comanda' => $det->detalle_comanda
			]);
			return $det;
		} else {
			$datos['exito'] = false;
		}

		return false;
	}

	private function get_highest_price($opciones = [])
	{
		$precio = null;
		foreach ($opciones as $seleccion) {
			$recetaSelec = new Articulo_model($seleccion['articulo']);
			if ((int)$recetaSelec->multiple === 0){
				if ((float)$recetaSelec->precio > (float)$precio) {
					$precio = (float)$recetaSelec->precio;
				}
			} else {
				$precio = $this->get_highest_price($seleccion['receta']);
			}
		}
		return $precio;
	}

	public function guardarDetalleCombo($args = [], $cuenta)
	{
		// set_time_limit(600);
		$art = new Articulo_model($args['articulo']);
		if (!isset($args['cantidad'])) {
			$args['cantidad'] = 1;
		}
		
		$precioMasAlto = null;
		if((int)$art->combo === 1 && (int)$art->cobro_mas_caro === 1 && isset($args['receta']) && count($args['receta']) > 0) {
			$precioMasAlto = $this->get_highest_price($args['receta']);
		}

		$combo = $this->setDetalle($args['articulo'], $cuenta, null, $precioMasAlto, (float)$args['cantidad']);
		// $args['cantidad'] = 1;

		if ($combo) {
			foreach ($args['receta'] as $rec) {
				$receta = $art->getReceta(["articulo" => $rec['articulo'], "_uno" => true]);

				$artMulti = new Articulo_model($rec['articulo']);
				$multi = $this->setDetalle($rec['articulo'], $cuenta, $combo->detalle_comanda, $receta[0]->precio, (float)$args['cantidad'] * (float)$receta[0]->cantidad);

				$rec['receta'] = get_unicos($rec['receta']);
				foreach ($rec['receta'] as $seleccion) {
					$recetaSelec = $artMulti->getReceta(["articulo" => $seleccion['articulo'], "_uno" => true]);

					// $precio = $recetaSelec[0]->precio * (float)$seleccion['cantidad'];
					$precio = $recetaSelec[0]->precio;

					// setDetalle($articulo, $idcta, $padre = null, $precio = null, $cantidad = 1, $cantidadPadre = null)
					$opcSelect = $this->setDetalle($seleccion['articulo'], $cuenta, $multi->detalle_comanda, $precio, (float)$seleccion['cantidad'] * (float)$recetaSelec[0]->cantidad, $multi->cantidad);

					// Para agregar los extras de cada seleccion
					if (isset($seleccion['extras']) && count($seleccion['extras']) > 0) {
						foreach ($seleccion['extras'] as $extra) {
							// $this->setDetalle($extra['articulo'], $cuenta, $opcSelect->detalle_comanda, $extra['precio'], (float)$opcSelect->cantidad * (float)$recetaSelec[0]->cantidad, $opcSelect->cantidad);
							$this->setDetalle($extra['articulo'], $cuenta, $opcSelect->detalle_comanda, $extra['precio'], (float)$opcSelect->cantidad, $opcSelect->cantidad);
						}
					}
				}
			}
			return $combo;
		}
		return false;
	}

	public function guardarDetalle(array $args)
	{
		$config = $this->Configuracion_model->buscar();
		$vnegativo = get_configuracion($config, 'RT_VENDE_NEGATIVO', 3);
		$id = isset($args['detalle_comanda']) ? $args['detalle_comanda'] : '';
		$det = new Dcomanda_model($id);
		$args['comanda'] = $this->comanda;
		$menu = $this->Catalogo_model->getModulo(['modulo' => 4, '_uno' => true]);
		$validar = true;
		$cantidad = 0;
		$articulo = $det->articulo;
		// $at = new AsyncTasks();
		if (empty($id)) {
			$articulo = $args['articulo'];
			$cantidad = $args['cantidad'];
			$args['fecha'] = Hoy(3);
			if(isset($args['cantidad'])) {
				$args['cantidad_inventario'] = $args['cantidad'];
			}
		} else {
			$args['fecha'] = $det->fecha;
			if (isset($args['articulo'])) {
				if ($det->articulo == $args['articulo'] && $det->cantidad < $args['cantidad']) {
					$articulo = $det->articulo;
					$cantidad = $args['cantidad'] - $det->cantidad;					
					if(isset($args['cantidad'])) {
						$args['cantidad_inventario'] = $args['cantidad'];						
					}
				} else if ($det->articulo != $args['articulo']) {
					$articulo = $args['articulo'];
					$cantidad = $args['cantidad'];					
					$args['cantidad_inventario'] = $cantidad;
				} else {
					$articulo = $args['articulo'];
					$validar = false;
					if(isset($args['regresa_inventario']) && $args['regresa_inventario']) {
						$cantResta = (float)$det->cantidad - (float)$args['cantidad'];
						$args['cantidad_inventario'] = (float)$det->cantidad_inventario - $cantResta;
					}
				}
			}
		}
		$art = new Articulo_model($articulo);
		$pres = $art->getPresentacion();
		$args['presentacion'] = $art->presentacion;
		$bodega = $art->getBodega();
		$args['bodega'] = $bodega ? $bodega->bodega : null;
		$cantPres = ($pres) ? $pres->cantidad : 0;
		
		$oldart = new Articulo_model($det->articulo);

		if (!empty($menu) && !$vnegativo) {
			$art->actualizarExistencia(['bodega' => $args['bodega']]);
			// $art->existencias = $art->get_existencia_bodega(['bodega' => $args['bodega']]);
		}	

		if ($vnegativo || empty($menu) || (!$validar || (float)$art->existencias >= ((float)$cantidad * (float)$cantPres))) {
			$nuevo = ($det->getPK() == null);
			$result = $det->guardar($args);
			$idx = $det->getPK();
			$receta = $art->getReceta();

			// if(!empty($menu) && (int)$art->mostrar_inventario === 1) {
			// 	$art->existencias = (float)$art->existencias - ((float)$cantidad * (float)$cantPres);
			// 	$art->guardar();
			// 	$art->actualiza_existencia_bodega_articulo_costo($args['bodega']);
			// }

			if (count($receta) > 0 && (int)$art->combo === 0 && (int)$art->multiple === 0 && $nuevo && (int)$art->produccion === 0) {
			// if ((int)$art->combo === 0 && (int)$art->multiple === 0 && $nuevo && (int)$art->produccion === 0) {
				// $at->guardar_receta_en_comanda($this->getPK(), $idx, $art->getPK(), isset($args['regresa_inventario']) ? ($args['regresa_inventario'] ? 1 : 0) : 1);				
				foreach ($receta as $rec) {
					$presR = $this->Presentacion_model->buscar([
						'medida' => $rec->medida->medida,
						'cantidad' => 1,
						'_uno' => true
					]);

					if (!$presR) {
						$presR = new Presentacion_model();
						$presR->guardar([
							'medida' => $rec->medida->medida,
							'descripcion' => $rec->medida->descripcion,
							'cantidad' => 1
						]);

						$presR->presentacion = $presR->getPK();
					}

					$artR = new Articulo_model($rec->articulo->articulo);
					$bodegaR = $artR->getBodega();

					$detr = new Dcomanda_model();
					$dato = [
						'comanda' => $this->getPK(),
						'articulo' => $rec->articulo->articulo,
						'cantidad' => $rec->cantidad,
						'precio' => 0,
						'total' => 0,
						'impreso' => 0,
						'presentacion' => $presR->presentacion,
						'detalle_comanda_id' => $idx,
						'bodega' => $bodegaR ? $bodegaR->bodega : null,
						'cantidad_inventario' => $rec->cantidad
					];
					$detr->guardar($dato);
				}				
			}
			if ($det->getPK() && (int)$art->combo === 0 && (int)$art->multiple === 0) {
				$det->actualizarCantidadHijos(isset($args['regresa_inventario']) ? $args['regresa_inventario'] : true);
				// $at->actualiza_cantidad_hijos($det->getPK(), isset($args['regresa_inventario']) ? ($args['regresa_inventario'] ? 1 : 0) : 1);
			}
			if ($result) {
				if (!empty($menu) && !$vnegativo) {
					$art->actualizarExistencia(['bodega' => $args['bodega']]);					
				}
				if (isset($args['articulo'])) {
					if ($oldart->articulo) {
						if (!empty($menu) && !$vnegativo) {
							$oldart->actualizarExistencia(['bodega' => $args['bodega']]);							
						}
					}
				}
				return $det;
			}
			$this->mensaje = $det->getMensaje();

			return $result;
		} else {
			$this->setMensaje('No hay existencias suficientes para este articulo');
		}
	}

	public function guardarDetalleMejorado(array $args)
	{
		// $inicia = time();
		$config = $this->Configuracion_model->buscar();
		$vnegativo = get_configuracion($config, 'RT_VENDE_NEGATIVO', 3);
		$id = isset($args['detalle_comanda']) ? $args['detalle_comanda'] : '';
		$det = new Dcomanda_model($id);
		$args['comanda'] = $this->comanda;
		$menu = $this->Catalogo_model->getModulo(['modulo' => 4, '_uno' => true]);
		$validar = true;
		$cantidad = 0;
		$articulo = $det->articulo;		
		$oldart = null;
		if (empty($id)) {
			$articulo = $args['articulo'];
			$cantidad = $args['cantidad'];
			$args['fecha'] = Hoy(3);
			if(isset($args['cantidad'])) {
				$args['cantidad_inventario'] = $args['cantidad'];
			}
		} else {
			$args['fecha'] = $det->fecha;
			if (isset($args['articulo'])) {
				if ((int)$det->articulo === (int)$args['articulo'] && (float)$det->cantidad < (float)$args['cantidad']) {
					$articulo = $det->articulo;
					$cantidad = $args['cantidad'] - $det->cantidad;					
					if(isset($args['cantidad'])) {
						$args['cantidad_inventario'] = $args['cantidad'];						
					}
				} else if ($det->articulo != $args['articulo']) {
					$oldart = new Articulo_model($det->articulo);
					$articulo = $args['articulo'];
					$cantidad = $args['cantidad'];					
					$args['cantidad_inventario'] = $cantidad;
				} else {
					$articulo = $args['articulo'];
					$validar = false;
					if(isset($args['regresa_inventario']) && $args['regresa_inventario']) {
						$cantResta = (float)$det->cantidad - (float)$args['cantidad'];
						$args['cantidad_inventario'] = (float)$det->cantidad_inventario - $cantResta;
					}
				}
			}
		}
		$art = new Articulo_model($articulo);
		// $pres = $art->getPresentacion();
		$dataForDC = $art->getDataForDetalleComanda();
		$args['presentacion'] = $art->presentacion;
		// $bodega = $art->getBodega();
		$args['bodega'] = $dataForDC ? $dataForDC->bodega : null;
		$cantPres = ($dataForDC) ? $dataForDC->cant_pres_reporte : 0;
		
		if (!empty($menu) && !$vnegativo) {
			$art->actualizarExistencia(['bodega' => $args['bodega']]);
		}

		if ($vnegativo || empty($menu) || (!$validar || $art->existencias >= ($cantidad * $cantPres))) {
			$nuevo = ($det->getPK() == null);
			$result = $det->guardar($args);
			$idx = $det->getPK();
			$receta = $art->getReceta();

			if (count($receta) > 0 && (int)$art->combo === 0 && (int)$art->multiple === 0 && $nuevo && (int)$art->produccion === 0) {
				foreach ($receta as $rec) {
					$presR = $this->Presentacion_model->buscar([
						'medida' => $rec->medida->medida,
						'cantidad' => 1,
						'_uno' => true
					]);

					if (!$presR) {
						$presR = new Presentacion_model();
						$presR->guardar([
							'medida' => $rec->medida->medida,
							'descripcion' => $rec->medida->descripcion,
							'cantidad' => 1
						]);

						$presR->presentacion = $presR->getPK();
					}

					$artR = new Articulo_model($rec->articulo->articulo);
					$bodegaR = $artR->getBodega();

					$detr = new Dcomanda_model();
					$dato = [
						'comanda' => $this->getPK(),
						'articulo' => $rec->articulo->articulo,
						'cantidad' => $rec->cantidad,
						'precio' => 0,
						'total' => 0,
						'impreso' => 0,
						'presentacion' => $presR->presentacion,
						'detalle_comanda_id' => $idx,
						'bodega' => $bodegaR ? $bodegaR->bodega : null,
						'cantidad_inventario' => $rec->cantidad
					];
					$detr->guardar($dato);
				}
			}
			if ($det->getPK() && (int)$art->combo === 0 && (int)$art->multiple === 0) {
				$det->actualizarCantidadHijos(isset($args['regresa_inventario']) ? $args['regresa_inventario'] : true);
			}
			if ($result) {
				if (!empty($menu) && !$vnegativo) {
					$art->actualizarExistencia(['bodega' => $args['bodega']]);					
				}

				if ($oldart && isset($oldart->articulo) && !empty($menu) && !$vnegativo) {
					$oldart->actualizarExistencia(['bodega' => $args['bodega']]);					
				}
				return $det;
			}
			$this->mensaje = $det->getMensaje();			
			return $result;
		} else {
			$this->setMensaje('No hay existencias suficientes para este articulo');
		}
	}

	public function getDetalle($args = [])
	{
		$args['comanda'] = $this->comanda;
		// $det = $this->Dcomanda_model->buscar($args);
		$det = $this->Dcomanda_model->get_detalle_comanda($args);
		$datos = [];
		if (is_array($det)) {
			foreach ($det as $row) {
				$detalle = new Dcomanda_model($row->detalle_comanda);
				$row->articulo = $detalle->getArticulo();
				if (isset($args['_categoria_grupo'])) {

					if (in_array($row->articulo->categoria_grupo, $args['_categoria_grupo'])) {
						$datos[] = $row;
					}
				} else {
					$datos[] = $row;
				}
			}
		} else if ($det) {
			$detalle = new Dcomanda_model($det->detalle_comanda);
			$det->articulo = $detalle->getArticulo();
			$datos[] = $det;
		}

		return $datos;
	}

	public function getDetalleComandaSimplified($args = []) {
		$args['comanda'] = $this->comanda;
		// $det = $this->Dcomanda_model->buscar($args);
		$det = $this->Dcomanda_model->get_detalle($args);
		// $datos = [];
		// if (is_array($det)) {
		// 	foreach ($det as $row) {
		// 		$detalle = new Dcomanda_model($row->detalle_comanda);
		// 		$row->articulo = $detalle->getArticulo();
		// 		if (isset($args['_categoria_grupo'])) {

		// 			if (in_array($row->articulo->categoria_grupo, $args['_categoria_grupo'])) {
		// 				$datos[] = $row;
		// 			}
		// 		} else {
		// 			$datos[] = $row;
		// 		}
		// 	}
		// } else if ($det) {
		// 	$detalle = new Dcomanda_model($det->detalle_comanda);
		// 	$det->articulo = $detalle->getArticulo();
		// 	$datos[] = $det;
		// }

		return $det;		
	}

	public function getCuentas($args = [])
	{
		if (isset($args['_cuenta'])) {
			$this->db->where('cuenta', $args['_cuenta']);
		}
		$cuentas = [];
		$tmp = $this->db
			->where("comanda", $this->comanda)
			->get("cuenta")
			->result();

		foreach ($tmp as $row) {
			$cta = new Cuenta_model($row->cuenta);
			$buscar = $args;
			if (isset($args["_numero"])) {
				$buscar['numero'] = $args['_numero'];
			}

			if (isset($args['_categoria_grupo'])) {
				if (is_array($args['_categoria_grupo'])) {
					$buscar['_categoria_grupo'] = implode(',', $args['_categoria_grupo']);
				} else if (is_string($args['_categoria_grupo'])) {
					$buscar['_categoria_grupo'] = $args['_categoria_grupo'];
				}
			}

			// $row->productos = $cta->getDetalle($buscar);			
			$row->productos = isset($args['_sin_detalle']) ? [] : $cta->getDetalleSimplified($buscar);
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

	private function get_estatus_callcenter($idEstatusCC = null)
	{
		if(!$idEstatusCC || !((int)$idEstatusCC > 0)) {
			$idEstatusCC = (int)$this->estatus_callcenter > 0 ? $this->estatus_callcenter : 0;
		}
		return $this->db->select('estatus_callcenter, descripcion, color, orden, pedir_repartidor, esultimo')->where('estatus_callcenter', $idEstatusCC)->get("estatus_callcenter")->row();
	}

	public function getComanda($args = [])
	{
		$tmp = $this->getTurno();
		$mesa = $this->getMesas();
		$tmp->orden_gk = $this->orden_gk;

		if ($mesa) {
			$area = $this->Area_model->buscar(["area" => $mesa->area, "_uno" => true]);
			$area->impresora = $this->Impresora_model->buscar(['impresora' => $area->impresora, "_uno" => true]);
			$area->impresora_factura = $this->Impresora_model->buscar(['impresora' => $area->impresora_factura, "_uno" => true]);
			$mesa->area = $area;
			$mesa->impresora = $this->Impresora_model->buscar(['impresora' => $mesa->impresora, "_uno" => true]);
			$tmp->mesa = $mesa;
		}
		$buscar = $args;
		if (isset($args["_numero"])) {
			$buscar['numero'] = $args['_numero'];
			$tmp->numero = $args['_numero'];
		}

		if (isset($args['_categoria_grupo'])) {
			if (is_array($args['_categoria_grupo'])) {
				$buscar['_categoria_grupo'] = implode(',', $args['_categoria_grupo']);
			} else if (is_string($args['_categoria_grupo'])) {
				$buscar['_categoria_grupo'] = $args['_categoria_grupo'];
			}
		}

		// $det = $this->getDetalle($buscar); 
		$det = $this->getDetalleComandaSimplified($buscar);
		
		$tmp->impresa = 0;
		foreach($det as $d) {
			if((int)$d->impreso === 1) {
				$tmp->impresa = 1;
				break;
			}
		}

		if (count($det) > 0) {
			$tmp->tiempo_preparacion = $det[0]->tiempo_preparacion;
			$tmp->fecha_proceso = $det[0]->fecha_proceso;
		} else {
			$tmp->tiempo_preparacion = "00:00:00";
			$tmp->fecha_proceso = "00:00:00";
		}

		$turno = new Turno_model($tmp->turno);

		$tmpMesero = new Usuario_model($this->mesero);
		$tmp->mesero = [
			"usuario" => $tmpMesero->getPK(),
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
		if ($this->comanda_origen == 1) {
			$args['_totalCero'] = true;
		}

		$tmp->impresora_defecto = $this->db->where('sede', $this->sede)->where('pordefecto', 1)->get('impresora')->row();
		$tmp->cuentas = $this->getCuentas($args);
		$tmp->factura = $this->getFactura();
		$tmp->origen_datos = $this->getOrigenDatos();
		$tmp->fhcreacion = empty($tmp->origen_datos['fhcreacion']) ?  $this->fhcreacion : $tmp->origen_datos['fhcreacion'];
		$tmp->numero_pedido = $this->numero_pedido;
		$tmp->notas_generales = $this->notas_generales;
		$estatusCC = $this->get_estatus_callcenter();
		$tmp->estatus_callcenter = $estatusCC ? $estatusCC : (object)['color' => 'none'];
		$tmp->formas_pago = $this->get_forma_pago();
		return $tmp;
	}

	public function getComandas($args = [])
	{
		if (isset($args['fdel']) && isset($args['fal'])) {
			$this->db
				->where('t.inicio >=', $args['fdel'])
				->where('t.fin <= ', $args['fal']);
		}

		if (isset($args['turno'])) {
			$this->db->where('t.turno', $args['turno']);
		}

		if (isset($args['estatus'])) {
			$this->db->where('a.estatus', $args['estatus']);
		}

		if (isset($args['comanda'])) {
			$this->db->where('a.comanda', $args['comanda']);
		}

		$this->db
			->select('a.comanda')
			->from('comanda a')
			->join('turno t', 'a.turno = t.turno')
			->where('t.sede', $args['sede'])
			->group_by('a.comanda');

		if (isset($args['domicilio']) || isset($args['cocinado'])) {
			if (!isset($args['callcenter'])) {
				$this->db->where('f.fel_uuid is null');
			}

			if (isset($args['callcenter'])) {
				// $this->db->select('f.fel_uuid');
				$this->db->join('estatus_callcenter h', 'h.estatus_callcenter = a.estatus_callcenter', 'left');
				$this->db->where('(h.esultimo IS NULL or h.esultimo = 0)');
				$this->db->where('IF(h.estatus_callcenter IS NULL, f.fel_uuid IS NULL, (f.fel_uuid_anulacion IS NULL AND (f.fel_uuid IS NULL OR f.fel_uuid IS NOT NULL)))');
			}

			$this->db
				->join('detalle_comanda b', 'a.comanda = b.comanda')
				->join('detalle_cuenta c', 'b.detalle_comanda = c.detalle_comanda')
				->join('detalle_factura_detalle_cuenta d', 'c.detalle_cuenta = d.detalle_cuenta', 'left')
				->join('detalle_factura e', 'e.detalle_factura = d.detalle_factura', (isset($args['cocinado']) ? 'left' : ''))
				->join('factura f', 'f.factura = e.factura', 'left')
				->join('articulo g', 'b.articulo = g.articulo');				

			if (isset($args['domicilio'])) {
				$this->db->where('a.domicilio', $args['domicilio']);
			}

			if (isset($args['cocinado'])) {
				if (isset($args['categoria_grupo'])) {
					if (is_array($args['categoria_grupo'])) {
						if (count($args['categoria_grupo']) == 0) {
							$args['categoria_grupo'][] = null;
						}
						$this->db->where_in('g.categoria_grupo', $args['categoria_grupo']);						
						$this->db->join('usuario_tipo_categoria_grupo h', 'g.categoria_grupo = h.categoria_grupo', 'left');
						$this->db->where('(b.fecha IS NULL OR b.fecha >= h.desde)');
					}
				}

				if (verDato($args, 'order_by')) {
					$this->db->order_by($args['order_by'],);
				}

				$this->db
					->select('b.numero')
					->where('b.cocinado', $args['cocinado'])
					->where('b.numero is not null')
					->group_by('b.numero');
			}
		}

		$lista = [];

		foreach ($this->db->get()->result() as $row) {
			$com = new Comanda_model($row->comanda);
			if (isset($row->numero)) {
				$com->numero = $row->numero;
			}

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

			if ((int)$this->orden_gk > 0) {
				$datos['numero_orden'] = $json->numero_orden;
				$datos['metodo_pago'][] = $json->formas_pago[0]->descripcion;
				$datos['direccion_entrega']->Nombre = isset($json->datos_entrega->nombre) ? $json->datos_entrega->nombre : '';
				$datos['direccion_entrega']->Direccion = isset($json->datos_entrega->direccion1) ? ($json->datos_entrega->direccion1 . ', ') : '';
				$datos['direccion_entrega']->Direccion .= isset($json->datos_entrega->direccion2) ? ($json->datos_entrega->direccion2 . ', ') : '';
				$datos['direccion_entrega']->Direccion .= isset($json->datos_entrega->pais) ? ($json->datos_entrega->pais . ', ') : '';
				$datos['direccion_entrega']->Direccion .= isset($json->datos_entrega->departamento) ? ($json->datos_entrega->departamento . ', ') : '';
				$datos['direccion_entrega']->Direccion .= isset($json->datos_entrega->municipio) ? ($json->datos_entrega->municipio) : '';
				$datos['direccion_entrega']->Telefono = isset($json->datos_entrega->telefono) ? ($json->datos_entrega->telefono) : '';
				$datos['direccion_entrega']->Correo = isset($json->datos_entrega->email) ? $json->datos_entrega->email : '';
				$datos['fhcreacion'] = $this->fhcreacion;
			} else {
				$nombre = strtolower(trim($origen->descripcion));
				if ($nombre == 'shopify') {
					$datos["numero_orden"] = isset($json->order_number) ? $json->order_number : '';
					$datos["metodo_pago"] = isset($json->payment_gateway_names) ? $json->payment_gateway_names : '';
					$datos['fhcreacion'] = isset($json->created_at) ? $json->created_at : '';

					$dataCliente = new stdClass();
					if (isset($json->shipping_address)) {
						$dataCliente = $json->shipping_address;
					} else {
						if (isset($json->customer)) {
							if (isset($json->customer->default_address)) {
								$dataCliente = $json->customer->default_address;
							}
						}
					}
					$datos['direccion_entrega']->Nombre = isset($dataCliente->name) ? $dataCliente->name : '';
					$datos['direccion_entrega']->Direccion = isset($dataCliente->address1) ? ($dataCliente->address1 . ', ') : '';
					$datos['direccion_entrega']->Direccion .= isset($dataCliente->address2) ? ($dataCliente->address2 . ', ') : '';
					$datos['direccion_entrega']->Direccion .= isset($dataCliente->city) ? ($dataCliente->city . ', ') : '';
					$datos['direccion_entrega']->Direccion .= isset($dataCliente->province) ? ($dataCliente->province . ', ') : '';
					$datos['direccion_entrega']->Direccion .= isset($dataCliente->country) ? ($dataCliente->country) : '';
					$datos['direccion_entrega']->Telefono = isset($dataCliente->phone) ? ($dataCliente->phone) : '';
					$datos['direccion_entrega']->Correo = isset($json->contact_email) ? $json->contact_email : '';
				} else if ($nombre == 'api') {
					$datos["numero_orden"] = isset($json->numero_orden) ? $json->numero_orden : '';
					$datos["metodo_pago"] = isset($json->metodo_pago) ? $json->metodo_pago : '';
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
			->join("detalle_factura e", "e.detalle_factura = d.detalle_factura", "left")
			->join("factura f", "f.factura = e.factura", "left")
			->where("a.turno", $args['turno'])
			->where("f.factura is null")
			->where("b.cantidad > 0")
			->where("b.total > 0")
			->where("b.precio > 0")
			->group_by("a.comanda")
			->get()
			->result();

		return $tmp;
	}

	public function envioMail()
	{
		$datos = $this->getComanda();
		if (isset($datos->factura->factura)) {
			$fac   = new Factura_model($datos->factura->factura);

			$fac->cargarEmpresa();

			enviarCorreo([
				"de"     => ["noreply@c807.com", "noreply"],
				"para"   => [$fac->empresa->correo_emisor],
				"asunto" => "Notificación de Restouch",
				"texto"  => $this->load->view("correo_comanda", ["datos" => $datos], true)
			]);
		}
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

	public function getSede()
	{
		return new Sede_model($this->sede);
	}

	public function enviarDetalleSede($enviar = true, $sedeDestino = null)
	{		
		$exito = true;
		$faltantes = [];
		// $detCom = $this->getDetalle(); 

		if (!$enviar) {
			$this->db->where('a.cantidad >', 0);
			$this->db->where('a.total >', 0);
		}

		$detCom = $this->db
			->select('a.detalle_comanda, b.codigo, b.descripcion, a.detalle_comanda_id')
			->join('articulo b', 'b.articulo = a.articulo')
			->where('a.comanda', $this->getPK())
			->get('detalle_comanda a')
			->result();

		if (!$sedeDestino) {
			$sedeDestino = $this->sede;
		}

		foreach ($detCom as $row) {
			$fltr = [
				'codigo' => trim($row->codigo),
				'sede' => $sedeDestino
			];

			if (!$enviar && empty($row->detalle_comanda_id)) {
				$fltr['mostrar_pos'] = 1;
			}

			$art = $this->Articulo_model->buscarArticulo($fltr);

			if ($art) {
				if ($enviar) {
					$bodegaDestino = $this->Articulo_model->getBodega($art->articulo);
					$det = new Dcomanda_model($row->detalle_comanda);
					$det->guardar(['articulo' => $art->articulo, 'bodega' => $bodegaDestino && isset($bodegaDestino->bodega) ? $bodegaDestino->bodega : null]);
				}
			} else {
				$exito = false;
				$faltantes[] = "{$row->descripcion} ({$row->codigo})";
			}
			$art = null;
		}

		return (object)['exito' => $exito, 'faltantes' => join(', ', $faltantes)];
	}

	public function get_sin_factura($args = [])
	{
		if (isset($args['fdel']) && isset($args['fal'])) {
			if (isset($args['_rango_turno']) && $args['_rango_turno']) {
				$this->db
					->where("date(c.inicio) >=", $args['fdel'])
					->where("date(c.inicio) <=", $args['fal'])
					->where("date(c.fin) <=", $args['fal'])
					->where("date(c.fin) >=", $args['fdel']);
			} else {
				$this->db
					->where("date(a.fhcreacion) >=", $args['fdel'])
					->where("date(a.fhcreacion) <=", $args['fal']);
			}
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
			$this->db->where("c.turno_tipo", $args['turno_tipo']);
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
			->select("a.comanda")
			->join("cuenta b", "b.comanda = a.comanda")
			->join("turno c", "a.turno = c.turno")
			->join("cuenta_forma_pago d", "d.cuenta = b.cuenta")
			->join("forma_pago e", "e.forma_pago = d.forma_pago")
			->where("e.sinfactura", 1)
			->group_by("a.comanda")
			->get("comanda a")
			->result();
	}

	public function get_articulos_pendientes()
	{
		return $this->db
			->select('a.*')
			->join('detalle_cuenta b', 'a.detalle_comanda = b.detalle_comanda', 'left')
			->join('cuenta c', 'c.cuenta = b.cuenta_cuenta', 'left')
			->where('a.comanda', $this->getPK())
			->where('a.cantidad >', 0)
			->where('a.detalle_comanda_id IS NULL', null, false)
			->where('(c.cerrada = 0 OR c.cerrada IS NULL)', null, false)
			->get('detalle_comanda a')
			->result();
	}

	public function trasladar_cuentas_a_comanda($cmdDestino)
	{
		$ctasDeOrigen = $this->db
			->select('cuenta')
			->where('comanda', $this->getPK())
			->where('cerrada', 0)
			->get('cuenta')
			->result();
		
		if($ctasDeOrigen) {

			$unicasDestino = $this->db
				->select('COUNT(cuenta) + 1 AS contunicas')
				->where('comanda', $cmdDestino)
				->like('nombre', 'única', 'after')
				->get('cuenta')
				->row();

			$numCtasDestino = $this->db
				->select('IFNULL(MAX(numero) + 1, 1) AS nocuenta')
				->where('comanda', $cmdDestino)
				->get('cuenta')
				->row();

			$this->load->model(['Cuenta_model', 'Dcomanda_model']);
			$errores = [];
			$cntUnicas = $unicasDestino ? (int)$unicasDestino->contunicas : 1;
			$noCta = $numCtasDestino ? (int)$numCtasDestino->nocuenta : 1;
			foreach($ctasDeOrigen as $ctaOrigen) {
				$cta = new Cuenta_model($ctaOrigen->cuenta);
				$campos = ['comanda' => $cmdDestino, 'numero' => $noCta];
				if (strcasecmp(strtolower(trim($cta->nombre)), 'Única') === 0) {
					$campos['nombre'] = "{$cta->nombre} ({$cntUnicas})";
					$cntUnicas++;
				}
				$exito = $cta->guardar($campos);
				if (!$exito) {
					$errores[] = implode(';', $cta->getMensaje());
				} else {
					$detsComanda = $this->db
						->select('b.detalle_comanda')
						->join('detalle_comanda b', 'b.detalle_comanda = a.detalle_comanda')
						->where('a.cuenta_cuenta', $ctaOrigen->cuenta)
						->get('detalle_cuenta a')
						->result();
					if ($detsComanda) {
						foreach($detsComanda as $detc) {
							$det = new Dcomanda_model($detc->detalle_comanda);
							$exito = $det->guardar(['comanda' => $cmdDestino]);
							if(!$exito) {
								$errores[] = implode(';', $cta->getMensaje());								
							}
						}
					}
				}
				$noCta++;
			}
			if(empty($errores)) {
				return true;
			} else {
				$this->mensaje[] = implode(';', $errores);
			}
		} else {
			$this->mensaje[] = 'No hay cuentas abiertas para trasladar.';
		}

		return false;
	}

	public function get_total_descuento($comanda = 0) 
	{
		if ((int)$comanda === 0) {
			$comanda = $this->getPK();
		}

		$descuentos = 0;
        $mnt = $this->db->select_sum('a.monto')
            ->join('forma_pago b', 'b.forma_pago = a.forma_pago')
            ->where('b.descuento', 1)
            ->where("cuenta IN(SELECT cuenta FROM cuenta WHERE comanda = {$comanda})", NULL, FALSE)
            ->get('cuenta_forma_pago a')
            ->row();
        
        if ($mnt) {
            $descuentos = (float)$mnt->monto;
        }
        return $descuentos;		
	}

	public function get_forma_pago($idComanda = null)
	{
		if(!$idComanda) {
			$idComanda = $this->getPK();
		}

		return $this->db
			->select('d.forma_pago, d.descripcion AS descripcion_forma_pago, c.monto, c.propina, c.documento')
			->join('cuenta b', 'a.comanda = b.comanda')
			->join('cuenta_forma_pago c', 'b.cuenta = c.cuenta')
			->join('forma_pago d', 'd.forma_pago = c.forma_pago')
			->where('a.comanda', $idComanda)
			->get('comanda a')
			->result();
	}

}

/* End of file Comanda_model.php */
/* Location: ./application/restaurante/models/Comanda_model.php */