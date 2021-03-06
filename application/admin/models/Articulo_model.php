<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Articulo_model extends General_model {

	public $articulo;
	public $categoria_grupo;
	public $presentacion;
	public $descripcion;
	public $precio;
	public $bien_servicio;
	public $existencias = 0;
	public $shopify_id;
	public $codigo = '';
	public $produccion = 0;
	public $presentacion_reporte;
	public $mostrar_pos = 1;
	public $impuesto_especial;	
	public $combo = 0;
	public $multiple = 0;
	public $cantidad_minima = 1;
	public $cantidad_maxima = 1;
	public $rendimiento = 1;
	public $costo = 0;
	public $mostrar_inventario = 0;
	public $esreceta = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("articulo");

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getCategoriaGrupo()
	{
		return $this->db
					->select("a.*, b.descripcion as ncategoria")
					->where("categoria_grupo", $this->categoria_grupo)
					->join("categoria b", "a.categoria = b.categoria")
					->get("categoria_grupo a")
					->row();
	}

	public function getPresentacion()
	{
		return $this->db
					->where("presentacion", $this->presentacion)
					->get("presentacion")
					->row();
	}

	public function getPresentacionReporte()
	{
		return $this->db
					->where("presentacion", $this->presentacion_reporte)
					->get("presentacion")
					->row();
	}

	public function getBodega()
	{
		return $this->db->select('b.bodega')
			->from('articulo a')
			->join('categoria_grupo b', 'b.categoria_grupo = a.categoria_grupo')
			->where('a.articulo', $this->articulo)
			->get()->row();
	}

	public function guardarReceta(Array $args, $id = '')
	{
		$rec = new Receta_model($id);
		$args['receta'] = $this->articulo;
		$result = $rec->guardar($args);

		if($result) {
			return $rec;
		}

		$this->mensaje = $rec->getMensaje();

		return $result;
	}

	public function getReceta($args = [])
	{
		if (isset($args['_principal'])) {
			$args['articulo'] = $this->articulo;
		} else {
			$args['receta'] = $this->articulo;
		}
		$args['anulado'] = 0;
		$rec = new Receta_model();
		$det = $rec->buscar($args);
		$datos = [] ;
		if(is_array($det)) {
			foreach ($det as $row) {
				$detalle = new Receta_model($row->articulo_detalle);
				$row->articulo = $detalle->getArticulo();
				$row->medida = $detalle->getMedida();
				$datos[] = $row;
			}
		} else if($det) {
			$detalle = new Receta_model($det->articulo_detalle);
			$det->articulo = $detalle->getArticulo();
			$det->medida = $detalle->getMedida();
			$datos[] = $det;
		}

		return $datos;
	}

	public function getVentaReceta($art = null, $args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('a.bodega', $args['bodega']);
			} else {
				$this->db->where('a.bodega', $args['bodega']);
			}
		}

		if (verDato($args, 'fecha')) {
			$this->db->where('date(e.fhcreacion) <=', $args['fecha']);
		}

		$articulo = $this->articulo;
		if ($art !== null) {
			$articulo = $art;
		}

		$comandas = $this->db
						 ->select("sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as total")
						 ->join("articulo b", "a.articulo = b.articulo")
						 ->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						 ->join("categoria d", "d.categoria = c.categoria")
						 ->join("comanda e", "e.comanda = a.comanda")
						 ->join("turno f", "e.turno = f.turno and f.sede = d.sede")
						 ->join("presentacion p", "a.presentacion = p.presentacion")
						 ->where("a.articulo", $articulo)
						 ->get("detalle_comanda a")
						 ->row();//total ventas comanda

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (verDato($args, 'fecha')) {
			$this->db->where('date(f.fecha_factura) <=', $args['fecha']);
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('a.bodega', $args['bodega']);
			} else {
				$this->db->where('a.bodega', $args['bodega']);
			}
		}

		$facturas = $this->db
						 ->select("sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as total")
						 ->join("articulo b", "a.articulo = b.articulo")
						 ->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						 ->join("categoria d", "d.categoria = c.categoria")
						 ->join("detalle_factura_detalle_cuenta e", "a.detalle_factura = e.detalle_factura", "left")
						 ->join("factura f", "a.factura = f.factura and f.sede = d.sede")
						 ->join("presentacion p", "a.presentacion = p.presentacion")
						 ->where("a.articulo", $articulo)
						 ->where("e.detalle_factura_detalle_cuenta is null")
						 ->get("detalle_factura a")
						 ->row();//total ventas factura manual
		return $comandas->total + $facturas->total;
	}

	function getVentaRecetas($art, $args = [])
	{
		$rec = new Articulo_model($art);
		$principal = $rec->getReceta(["_principal" => true]);
		$exist = 0;

		foreach ($principal as $row) {
			if ($row->receta != $this->getPK()) {
				$exist += $rec->getVentaReceta($row->receta) * $row->cantidad;
			}
		}

		return $exist;
	}

	function actualizarExistencia($args = [])
	{
		if ($this->getPK()) {
			$receta = $this->getReceta();
			$principal = $this->getReceta(["_principal" => true]);
			if (count($receta) > 0 && $this->produccion == 0) {
				$grupos = [];
				//$venta = $this->getVentaReceta();
				foreach ($receta as $row) {		
					$art = new Articulo_model($row->articulo->articulo);
					$art->actualizarExistencia($args);		
					$existR = $art->existencias;

					$grupos[] = (int)($art->existencias / $row->cantidad);
				}

				$exist = min($grupos);
			} else {
				$exist = $this->obtenerExistencia($args, $this->articulo);
			}

			return $this->guardar(['existencias' => $exist]);
		}
	}

	public function obtenerExistencia($args = [], $articulo, $receta = false)
	{
		$pres = $this->getPresentacionReporte();
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('f.bodega', $args['bodega']);
			} else {
				$this->db->where('f.bodega', $args['bodega']);
			}
		} else {
			$this->db->where("f.merma", 0);
		}

		if (verDato($args, 'fecha')) {
			$this->db->where('date(e.fecha) <=', $args['fecha']);
		}

		$ingresos = $this->db
						 ->select("
						 	round(sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2))/pr.cantidad, 2) as total")
						 ->join("articulo b", "a.articulo = b.articulo")
						 ->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						 ->join("categoria d", "d.categoria = c.categoria")
						 ->join("ingreso e", "e.ingreso = a.ingreso")
						 ->join("bodega f", "f.bodega = e.bodega and f.sede = d.sede")
						 ->join("presentacion p", "a.presentacion = p.presentacion")
						 ->join("presentacion pr", "b.presentacion_reporte = pr.presentacion")
						 ->where("a.articulo", $articulo)
						 ->get("ingreso_detalle a")
						 ->row(); //total ingresos

		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('f.bodega', $args['bodega']);
			} else {
				$this->db->where('f.bodega', $args['bodega']);
			}
		}

		if (verDato($args, 'fecha')) {
			$this->db->where('date(e.fecha) <=', $args['fecha']);
		}

		$egresos = $this->db
						->select("round(sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2))/pr.cantidad, 2) as total")
						->join("articulo b", "a.articulo = b.articulo")
						->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						->join("categoria d", "d.categoria = c.categoria")
						->join("egreso e", "e.egreso = a.egreso")
						->join("bodega f", "f.bodega = e.bodega and f.sede = d.sede")
						->join("presentacion p", "a.presentacion = p.presentacion")
						->join("presentacion pr", "b.presentacion_reporte = pr.presentacion")
						->where("a.articulo", $articulo)
						->get("egreso_detalle a")
						->row();//total egresos wms

		//if (!$receta) {
		$venta = $this->getVentaReceta(null, $args);

		//} else {
			//$venta = 0;
		//}


		return ($ingresos->total - ($egresos->total + $venta/$pres->cantidad)) * $pres->cantidad;
	}

	function getIngresoEgreso($articulo, $args=[])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('f.bodega', $args['bodega']);
			} else {
				$this->db->where('f.bodega', $args['bodega']);
			}
		}

		if ($args['tipo'] == 1) {
			$ingresos = $this->db
						 ->select("
						 	sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as total")
						 ->join("articulo b", "a.articulo = b.articulo")
						 ->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						 ->join("categoria d", "d.categoria = c.categoria")
						 ->join("ingreso e", "e.ingreso = a.ingreso")
						 ->join("bodega f", "f.bodega = e.bodega and f.sede = d.sede")
						 ->join("presentacion p", "a.presentacion = p.presentacion")
						 ->where("a.articulo", $articulo)
						 ->where("date(e.fecha) <= ", $args['fecha'])
						 ->get("ingreso_detalle a")
						 ->row(); //total ingresos

			return $ingresos->total;
		} else {
			$egresos = $this->db
						->select("sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as total")
						->join("articulo b", "a.articulo = b.articulo")
						->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						->join("categoria d", "d.categoria = c.categoria")
						->join("egreso e", "e.egreso = a.egreso")
						->join("bodega f", "f.bodega = e.bodega and f.sede = d.sede")
						->join("presentacion p", "a.presentacion = p.presentacion")
						->where("a.articulo", $articulo)
						->where("date(e.fecha) <= ", $args['fecha'])
						->get("egreso_detalle a")
						->row();//total egresos wms

			return $egresos->total;
		}
	}

	function getComandaFactura($articulo, $args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('f.sede', $args['sede']);
			} else {
				$this->db->where('f.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('a.bodega', $args['bodega']);
			} else {
				$this->db->where('a.bodega', $args['bodega']);
			}
		}

		if ($args['tipo'] == 1) {
			if (verDato($args, 'fecha')) {
				$this->db->where('date(e.fhcreacion) <=', $args['fecha']);
			}

			$comandas = $this->db
						 ->select("sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as total")
						 ->join("articulo b", "a.articulo = b.articulo")
						 ->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
						 ->join("categoria d", "d.categoria = c.categoria")
						 ->join("comanda e", "e.comanda = a.comanda")
						 ->join("turno f", "e.turno = f.turno and f.sede = d.sede")
						 ->join("presentacion p", "a.presentacion = p.presentacion")
						 ->where("a.articulo", $articulo)
						 ->get("detalle_comanda a")
						 ->row();//total ventas comanda	

			return $comandas->total;
		} else {
			if (verDato($args, 'fecha')) {
				$this->db->where('date(f.fecha_factura) <=', $args['fecha']);
			}

			$facturas = $this->db
							 ->select("sum(round(ifnull(a.cantidad, 0) * p.cantidad, 2)) as total")
							 ->join("articulo b", "a.articulo = b.articulo")
							 ->join("categoria_grupo c", "c.categoria_grupo = b.categoria_grupo")
							 ->join("categoria d", "d.categoria = c.categoria")
							 ->join("detalle_factura_detalle_cuenta e", "a.detalle_factura = e.detalle_factura", "left")
							 ->join("factura f", "a.factura = f.factura and f.sede = d.sede")
							 ->join("presentacion p", "a.presentacion = p.presentacion")
							 ->where("a.articulo", $articulo)
							 ->where("e.detalle_factura_detalle_cuenta is null")
							 ->get("detalle_factura a")
							 ->row();//total ventas factura manual

			return $facturas->total;
		}
	}

	public function getExistencias($args)
	{
		$this->load->model('Presentacion_model');
		$receta = $this->getReceta();
		$principal = $this->getReceta(["_principal" => true]);
		$ingresos = 0;
		$egresos = 0;
		$comandas = 0;
		$facturas = 0;

		if (count($receta) > 0 && $this->produccion == 0) {
			$grupos = [];
			$args['tipo'] = 1;
			$comandas = $this->getComandaFactura($this->getPK(), $args);
			$args['tipo'] = 2;
			$facturas = $this->getComandaFactura($this->getPK(), $args);
				foreach ($receta as $row) {				
					$args['tipo'] = 1;
					$ingr = $this->getIngresoEgreso($row->articulo->articulo, $args);
					$args['tipo'] = 2;
					$egr = $this->getIngresoEgreso($row->articulo->articulo, $args);

					$grupos[] = (int)($ingr / $row->cantidad);
				}

				$ingresos = 0;
		} else {
			$args['tipo'] = 1;
			$ingresos = $this->getIngresoEgreso($this->getPK(), $args);
			$comandas = $this->getComandaFactura($this->getPK(), $args);
			$args['tipo'] = 2;
			$egresos = $this->getIngresoEgreso($this->getPK(), $args);
			$facturas = $this->getComandaFactura($this->getPK(), $args);
		}

		return (object)[
			"articulo" => $this,
			"presentacion" => new Presentacion_model($this->presentacion_reporte),
			"ingresos" => $ingresos,
			"egresos" => $egresos,
			"comandas" => $comandas,
			"facturas" => $facturas,
			"total_egresos" => $comandas + $facturas + $egresos,
			"existencia" => $this->existencias 
		];
	}

	public function buscarArticulo($args = [])
	{
		if (isset($args['codigo'])) {
			$this->db->where('a.codigo', $args['codigo']);
		}

		if(isset($args['sede'])){
			$this->db->where('c.sede', $args['sede']);
		}

		$tmp = $this->db
					->select("a.*")
					->from("articulo a")
					->join("categoria_grupo b", "a.categoria_grupo = b.categoria_grupo")
					->join("categoria c","b.categoria = c.categoria")
					->get();

		if ($tmp && $tmp->num_rows() > 0) {
			return $tmp->row();
		}

		return false;
	}

	public function getImpuestoEspecial() {
		$impesp = null;
		if ((int)$this->impuesto_especial > 0) {
			$this->load->model('ImpuestoEspecial_model');
			$impesp = $this->ImpuestoEspecial_model->buscar(['impuesto_especial' => $this->impuesto_especial, '_uno' => true]);
		}
		return $impesp;
	}

	public function getCosto($args = [])
	{
		$sede = $this->db
					 ->select("c.sede")
					 ->join("categoria_grupo b", "a.categoria_grupo = b.categoria_grupo")
					 ->join("categoria c", "c.categoria = b.categoria")
					 ->where("a.articulo", $this->getPK())
					 ->get("articulo a")
					 ->row();

		$sede = new Sede_model($sede->sede);
		$emp = $sede->getEmpresa();

		if (isset($args['bodega'])) {
			$this->db->where('b.bodega', $args['bodega']);
		}

		if(isset($args['metodo_costeo'])) {
			$emp->metodo_costeo = $args['metodo_costeo'];
		}

		if ($emp->metodo_costeo == 1) {
			$det = $this->db
						->select("max(c.ingreso_detalle) as id")
						->join("bodega b", "a.bodega = b.bodega")
						->join("ingreso_detalle c", "a.ingreso = c.ingreso")
						->where("c.articulo", $this->getPK())
						->where("b.sede", $sede->getPK())
						->where("a.ajuste", 0)
						->group_by("c.articulo")
						->get("ingreso a")
						->row();

			if ($det) {
				$tmp = $this->db
							->select("c.ingreso_detalle, 
								c.articulo, 
								(c.precio_total/c.cantidad) / d.cantidad as precio_unitario, 
								a.fecha,
								c.presentacion", false)
							->join("bodega b", "a.bodega = b.bodega")
							->join("ingreso_detalle c", "a.ingreso = c.ingreso")
							->join("presentacion d", "c.presentacion = d.presentacion")
							->where("c.articulo", $this->getPK())
							->where("b.sede", $sede->getPK())
							->where("c.ingreso_detalle", $det->id)
							->group_by("c.articulo")
							->get("ingreso a")
							->row();
			} else {
				$tmp = false;
			}
		} else if ($emp->metodo_costeo == 2) {
			$tmp = $this->db
						->select("
							sum(c.precio_total) / sum(c.cantidad*d.cantidad) as precio_unitario,
							c.articulo, 
							a.fecha,
							c.presentacion")
						->join("bodega b", "a.bodega = b.bodega")
						->join("ingreso_detalle c", "a.ingreso = c.ingreso")
						->join("presentacion d", "c.presentacion = d.presentacion")
						->where("c.articulo", $this->getPK())	
						->where("a.ajuste", 0)					
						->group_by("c.articulo")
						->get("ingreso a")
						->row();

		} else {
			$tmp = false;
		}

		if ($tmp) {
			if (verDato($args, "_presentacion")) {
				return (object) [
					"costo" => $tmp->precio_unitario, 
					"presentacion" => $tmp->presentacion
				];
			}
			return $tmp->precio_unitario;
		}

		return 0;
	}

	public function getCostoReceta($args = [])
	{		
		$this->actualizarExistencia();
		$receta = $this->getReceta();
		$costo = 0;
		if (count($receta) > 0) {

			foreach ($receta as $row) {				
				$art = new Articulo_model($row->articulo->articulo);				
				$tmp = $art->getCostoReceta($args);
				$costo += $tmp * ($row->cantidad);
			}

		} else {
			if (isset($args['bodega']) && isset($args['presentacion'])) {
				$bac = $this->BodegaArticuloCosto_model->buscar([
					"articulo" => $this->getPK(),
					"bodega" => $args['bodega'],
					"_uno" => true
				]);
				$bac = new BodegaArticuloCosto_model($bac->bodega_articulo_costo);
				$costo = $bac->get_costo($args['bodega'], $this->getPK(), $args['presentacion']);
			} else {
				$costo = $this->getCosto($args);
			}
			
		}

		return $costo;
	}

	public function copiar($sede)
	{
		$art = new Articulo_model();
		$tmp = $this->buscarArticulo([
			"sede" => $sede,
			"codigo" => $this->codigo
		]);
		if ($tmp) {
			$art->cargar($tmp->articulo);
		}

		$grupo = $this->getCategoriaGrupo();

		$cgrupo = $this->db
					   ->select("a.*")
					   ->join("categoria b", "a.categoria = b.categoria")
					   ->where("a.descripcion", $grupo->descripcion)
					   ->where("b.sede", $sede)
					   ->get("categoria_grupo a");
		if ($cgrupo->num_rows() > 0) {
			$cgrupo = $cgrupo->row();
			$categoria_grupo = $cgrupo->categoria_grupo;

		} else {
			$cat = $this->db
							  ->where("descripcion", $grupo->ncategoria)
							  ->where("sede", $sede)
							  ->get("categoria");
			if ($cat->num_rows() > 0) {
				$cat = $cat->row();
				$categoria = $cat->categoria;
			} else {
				$cat = new Categoria_model();
				$cat->guardar([
					"descripcion" => $grupo->ncategoria,
					"sede" => $sede
				]);
				$categoria = $cat->getPK();
			}

			$cgrupo = new Cgrupo_model();
			$cgrupo->guardar([
				"descripcion" => $grupo->descripcion,
				"categoria" => $categoria,
				"categoria_grupo_grupo" => $grupo->categoria_grupo_grupo,
				"receta" => $grupo->receta,
				"impresora" => null,
				"descuento" => $grupo->descuento
			]);

			$categoria_grupo = $cgrupo->getPK();
		}


		$datos = [
			"categoria_grupo" => $categoria_grupo,
			"presentacion" => $this->presentacion,
			"descripcion" => $this->descripcion,
			"precio" => $this->precio,
			"bien_servicio" => $this->bien_servicio,
			"existencias" => 0.00,
			"shopify_id" => $this->shopify_id,
			"codigo" => $this->codigo,
			"produccion" => $this->produccion,
			"presentacion_reporte" => $this->presentacion_reporte,
			"mostrar_pos" => $this->mostrar_pos,
			"impuesto_especial" => $this->impuesto_especial,
			"combo" => $this->combo,
			"multiple" => $this->multiple,
			"cantidad_minima" => $this->cantidad_minima,
			"cantidad_maxima" => $this->cantidad_maxima,
			"rendimiento" => $this->rendimiento,
			"costo" => $this->costo,
			"mostrar_inventario" => $this->mostrar_inventario,
			"esreceta" => $this->esreceta
		];

		$art->guardar($datos);
	}

	public function copiarDetalle($sede)
	{
		$receta = $this->getReceta();
		$articulo = $this->buscarArticulo([
			"sede" => $sede,
			"codigo" => $this->codigo
		]);

		if ($articulo) {
			$art = new Articulo_model($articulo->articulo);
			$art->eliminarDetalle();

			foreach ($receta as $row) {
				$detalle = $this->buscarArticulo([
					"sede" => $sede,
					"codigo" => $row->articulo->codigo
				]);
				if (!$detalle) {
					$rec = new Articulo_model($row->articulo->articulo);
					$rec->copiar($sede);
					$detalle = $this->buscarArticulo([
						"sede" => $sede,
						"codigo" => $rec->codigo
					]);
				}

				$art->guardarReceta([
					"racionable" => $row->racionable,
					"articulo" => $detalle->articulo,
					"cantidad" => $row->cantidad,
					"medida" => $row->medida->medida,
					"anulado" => $row->anulado,
					"precio_extra" => $row->precio_extra,
					"precio" => $row->precio,
				]);
			}
		}
	}

	public function eliminarDetalle()
	{
		$this->db
			 ->where("receta", $this->getPK())
			 ->delete("articulo_detalle");
	}	

	private function getSubcatgorias($sede = null, $padre = null)
	{
		if($sede) {
			$this->db->where("a.sede", $sede);
		}

		if($padre) {
			$this->db->where("b.categoria_grupo_grupo", $padre);			
		} else {
			$this->db->where("b.categoria_grupo_grupo IS NULL");			
		}

		$subcategorias = $this->db
			->select("b.categoria, b.categoria_grupo, b.descripcion, b.categoria_grupo_grupo")
			->join("categoria a", "a.categoria = b.categoria")
			->join("articulo c", "b.categoria_grupo = c.categoria_grupo")			
			->where("c.mostrar_pos", 1)			
			->group_by("b.categoria, b.categoria_grupo, b.descripcion")
			->order_by("b.descripcion")
			->get("categoria_grupo b")
			->result();

		foreach($subcategorias as $sc) {
			$sc->subcategorias = $this->getSubcatgorias($sede, $sc->categoria_grupo);
		}

		return $subcategorias;
	}

	public function articulosParaPOS($args = [])
	{
		$this->load->model('Catalogo_model');

		if(isset($args['sede'])) {
			$this->db->where("a.sede", $args['sede']);
		}

		$categorias = $this->db
			->select("a.categoria, a.descripcion")
			->join("categoria_grupo b", "a.categoria = b.categoria")
			->join("articulo c", "b.categoria_grupo = c.categoria_grupo")
			->where("c.mostrar_pos", 1)
			->group_by("a.categoria, a.descripcion")
			->order_by("a.descripcion")
			->get("categoria a")
			->result();
	
		$subcategorias = $this->getSubcatgorias((isset($args['sede']) ? $args['sede'] : null));	
		
		if(isset($args['sede'])) {
			$this->db->where("a.sede", $args['sede']);
		}

		$articulos = $this->db
			->select("c.articulo")
			->join("categoria_grupo b", "b.categoria_grupo = c.categoria_grupo")
			->join("categoria a", "a.categoria = b.categoria")
			->where("c.mostrar_pos", 1)
			->order_by("c.descripcion")
			->get("articulo c")
			->result();

		$arts = [];
		foreach($articulos as $art) 
		{
			$arts[] = $this->Catalogo_model->getArticulo(['articulo' => $art->articulo, '_uno' => true]);
		}

		return [
			'categorias' => $categorias,
			'subcategorias' => $subcategorias,
			'articulos' => $arts
		];

	}

	public function tiene_movimientos()
	{
		$ingresos = $this->db->select('COUNT(ingreso_detalle) AS conteo')->from('ingreso_detalle')->where('articulo', $this->_pk)->get()->row();
		$egresos = $this->db->select('COUNT(egreso_detalle) AS conteo')->from('egreso_detalle')->where('articulo', $this->_pk)->get()->row();
		$comandas = $this->db->select('COUNT(detalle_comanda) AS conteo')->from('detalle_comanda')->where('articulo', $this->_pk)->get()->row();
		$facturas = $this->db
			->select('COUNT(a.detalle_factura) AS conteo')
			->from('detalle_factura a')
			->join('factura b', 'b.factura = a.factura')
			->where('b.fel_uuid_anulacion IS NULL')
			->where('a.articulo', $this->_pk)
			->get()->row();
			
		if((int)$ingresos->conteo > 0 || (int)$egresos->conteo > 0 || (int)$comandas->conteo > 0 || (int)$facturas->conteo > 0) {
			return true;
		}
		return false;
	}

	public function get_sede_articulo($args = [])
	{
		if(!isset($args['_uno'])) {
			$args['_uno'] = true;			
		}
		$art = $this->buscar($args);
		if($art) {
			return $this->db
				->select('a.sede')
				->from('categoria a')
				->join('categoria_grupo b', 'a.categoria = b.categoria')
				->join('articulo c', 'b.categoria_grupo = c.categoria_grupo')				
				->where('c.articulo', $art->articulo)
				->get()->row();
		}

		return null;
	}

}

/* End of file Articulo_model.php */
/* Location: ./application/admin/models/Articulo_model.php */