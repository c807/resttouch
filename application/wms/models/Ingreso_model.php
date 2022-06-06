<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ingreso_model extends General_Model
{

	public $ingreso;
	public $tipo_movimiento;
	public $fecha;
	public $bodega;
	public $usuario;
	public $bodega_origen;
	public $comentario;
	public $proveedor;
	public $estatus_movimiento;
	public $ajuste = 0;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("ingreso");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getTipoMovimiento()
	{
		return $this->db
			->where("tipo_movimiento", $this->tipo_movimiento)
			->get("tipo_movimiento")
			->row();
	}

	public function getProveedor()
	{
		return $this->db
			->where("proveedor", $this->proveedor)
			->get("proveedor")
			->row();
	}

	public function getBodega()
	{
		return $this->db
			->where("bodega", $this->bodega)
			->get("bodega")
			->row();
	}

	public function getBodegaOrigen()
	{
		return $this->db
			->where("bodega", $this->bodega_origen)
			->get("bodega")
			->row();
	}

	public function getUsuario()
	{
		return $this->db
			->where("usuario", $this->usuario)
			->get("usuario")
			->row();
	}

	public function setDetalle(array $args, $id = "")
	{
		$det = new IDetalle_Model($id);
		$args['ingreso'] = $this->ingreso;

		if (is_object($args['presentacion'])) {
			$args['presentacion'] = $args['presentacion']->presentacion;
		}

		$result = $det->guardar($args);

		if ($result) {
			return $det;
		}

		$this->mensaje = $det->getMensaje();

		return $result;
	}

	public function getDetalle($args = [])
	{
		$args['ingreso'] = $this->ingreso;
		$det = $this->IDetalle_Model->buscar($args);
		$datos = [];
		if (is_array($det)) {
			foreach ($det as $row) {
				// if ($row->cantidad != 0) {
				$detalle = new IDetalle_Model($row->ingreso_detalle);
				$row->articulo = $detalle->getArticulo();
				$row->presentacion = $detalle->getPresentacion();

				if (verDato($args, "_costo")) {
					$row->precio_total = round($row->precio_total + $row->precio_costo_iva, 2);
					$row->precio_unitario = round((float)$row->cantidad === 0.00 ? 0.00 : ($row->precio_total / $row->cantidad), 4);
				}
				$datos[] = $row;
				// }

			}
		} else if ($det) {
			$detalle = new IDetalle_Model($det->ingreso_detalle);
			$det->articulo = $detalle->getArticulo();
			$det->presentacion = $detalle->getPresentacion();

			$datos[] = $det;
		}

		usort($datos, function ($a, $b) {
			return strcmp(trim(strtoupper($a->articulo->descripcion)), trim(strtoupper($b->articulo->descripcion)));
		});

		return $datos;
	}

	public function get_ultima_compra($args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('b.sede', $args['sede']);
			} else {
				$this->db->where('b.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('a.bodega', $args['bodega']);
			} else {
				$this->db->where('a.bodega', $args['bodega']);
			}
			
		}

		return $this->db
			->select("
						max(c.ingreso_detalle) ingreso_detalle, 
						c.articulo, 
						(c.precio_unitario / e.cantidad) as precio_unitario, 
						max(a.fecha) as fecha")
			->join("bodega b", "a.bodega = b.bodega")
			->join("ingreso_detalle c", "a.ingreso = c.ingreso")
			->join("articulo d", "c.articulo = d.articulo")
			->join("presentacion e", "c.presentacion = e.presentacion")
			->where("date(a.fecha) <= '{$args['fecha']}'")
			->where("d.mostrar_inventario", 1)
			->group_by("c.articulo")
			->get("ingreso a")
			->result();
	}

	public function get_costo_promedio($args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('b.sede', $args['sede']);
			} else {
				$this->db->where('b.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('a.bodega', $args['bodega']);
			} else {
				$this->db->where('a.bodega', $args['bodega']);
			}
			
		}

		return $this->db
			->select("
						sum(c.precio_total)/sum(c.cantidad*e.cantidad) as precio_unitario, 
						c.articulo, 
						a.fecha")
			->join("bodega b", "a.bodega = b.bodega")
			->join("ingreso_detalle c", "a.ingreso = c.ingreso")
			->join("articulo d", "c.articulo = d.articulo")
			->join("presentacion e", "c.presentacion = e.presentacion")
			->where("date(a.fecha) <= '{$args['fecha']}'")
			->where("d.mostrar_inventario", 1)
			->group_by("c.articulo")
			->get("ingreso a")
			->result();
	}

	public function get_articulos_sin_costo($args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('c.sede', $args['sede']);
			} else {
				$this->db->where('c.sede', $args['sede']);
			}
		}

		$bodega = implode(",", $args['bodega']);

		return $this->db
			->select("
						a.articulo, 
						0 as precio_unitario")
			->join("categoria_grupo b", "a.categoria_grupo = b.categoria_grupo")
			->join("categoria c", "c.categoria = b.categoria")
			->join("bodega_articulo_costo d", "d.articulo = a.articulo and d.bodega in ({$bodega})", "left")
			->where("a.mostrar_inventario", 1)
			->where("d.bodega_articulo_costo is null")

			->get("articulo a")
			->result();
	}

	private function articulos_ingresos($args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('b.sede', $args['sede']);
			} else {
				$this->db->where('b.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('a.bodega', $args['bodega']);
			} else {
				$this->db->where('a.bodega', $args['bodega']);
			}			
		}

		$ai = $this->db
		->select("c.articulo, max(a.fecha) as fecha, 0 as precio_unitario")
		->join("bodega b", "a.bodega = b.bodega")
		->join("ingreso_detalle c", "a.ingreso = c.ingreso")
		->join("articulo d", "c.articulo = d.articulo")
		->join("presentacion e", "c.presentacion = e.presentacion")
		->join("categoria_grupo f", "f.categoria_grupo = d.categoria_grupo")
		->join("categoria g", "g.categoria = f.categoria")
		->where("a.fecha <= '{$args['fecha']}'")
		->where("d.mostrar_inventario", 1)
		->group_by("c.articulo")
		->order_by("g.descripcion, f.descripcion, d.descripcion")
		->get("ingreso a")
		->result();

		$q1 = $this->db->last_query();

		return $ai;
	}

	private function articulos_no_costo($args = [])
	{
		if (isset($args['sede'])) {
			if (is_array($args['sede'])) {
				$this->db->where_in('c.sede', $args['sede']);
			} else {
				$this->db->where('c.sede', $args['sede']);
			}
		}

		if (isset($args['bodega'])) {
			if (is_array($args['bodega'])) {
				$this->db->where_in('b.bodega', $args['bodega']);
			} else {
				$this->db->where('b.bodega', $args['bodega']);
			}			
		}

		$anc = $this->db
			->select("a.articulo, NULL as fecha, NULL as precio_unitario", false)
			->join("categoria_grupo b", "a.categoria_grupo = b.categoria_grupo")
			->join("categoria c", "c.categoria = b.categoria")
			->join("bodega_articulo_costo d", "d.articulo = a.articulo", "left")
			->where("a.mostrar_inventario", 1)
			->where("d.bodega_articulo_costo is null")
			->order_by("c.descripcion, b.descripcion, a.descripcion")
			->get("articulo a")
			->result();

		$q1 = $this->db->last_query();

		return $anc;
	}

	public function get_articulos_con_ingresos($args)
	{

		$arts_ing = $this->articulos_ingresos($args);
		$arts_noc = $this->articulos_no_costo($args);

		$cntArtsIng = count($arts_ing);
		$cntArtsNoc = count($arts_noc);
		$nuevo = array();

		foreach($arts_noc as $k => $v)
		{
			$nuevo[$k] = clone $v;
		}

		for ($i = 0; $i < $cntArtsIng; $i++)
		{
			for ($j = 0; $j < $cntArtsNoc; $j++)
			{
				if ((int)$nuevo[$j]->articulo === (int)$arts_ing[$i]->articulo)
				{
					unset($arts_noc[$j]);
				}
			}
		}

		return array_merge($arts_ing, $arts_noc);
	}

	public function actualiza_ultima_compra($ingreso, $detalle, $ultimo_costo_ingresado)
	{
		$this->load->model(['Articulo_ultima_compra_model']);
		$aucSrch = $this->Articulo_ultima_compra_model->buscar([
			'articulo' => $detalle->articulo,
			'presentacion' => $detalle->presentacion,
			'ultimo_proveedor' => $ingreso->proveedor,
			'_uno' => true
		]);
		
		$auc = null;
		if ($aucSrch) {
			$auc = new Articulo_ultima_compra_model($aucSrch->articulo_ultima_compra);
			$auc->ultimo_proveedor = $ingreso->proveedor;
			$auc->ultimo_costo = $ultimo_costo_ingresado;
		} else {
			$auc = new Articulo_ultima_compra_model();
			$auc->articulo = $detalle->articulo;
			$auc->presentacion = $detalle->presentacion;
			$auc->ultimo_proveedor = $ingreso->proveedor;
			$auc->ultimo_costo = $ultimo_costo_ingresado;
		}
		$auc->guardar();
	}

}

/* End of file Ingreso_model.php */
/* Location: ./application/wms/models/Ingreso_model.php */