<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ajuste_costo_promedio_model extends General_model {

	public $ajuste_costo_promedio;
	public $sede;
	public $usuario;
	public $categoria_grupo = null;
	public $bodega;
	public $articulo;
	public $fhcreacion;
	public $fecha;
	public $notas;
	public $confirmado = 0;
	public $confirmado_fecha;	

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('ajuste_costo_promedio');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar($args = [])
	{
		if (isset($args['ajuste_costo_promedio']) && (int)$args['ajuste_costo_promedio'] > 0) {
			$this->db->where('a.ajuste_costo_promedio', $args['ajuste_costo_promedio']);
		}

		if (isset($args['fdel']) && !empty($args['fdel'])) {
			$this->db->where('a.fecha >=', $args['fdel']);
		}

		if (isset($args['fal']) && !empty($args['fal'])) {
			$this->db->where('a.fecha <=', $args['fal']);
		}

		if (isset($args['sede']) && (int)$args['sede'] > 0) {
			$this->db->where('a.sede', $args['sede']);
		}

		$campos = 'a.ajuste_costo_promedio, a.sede, TRIM(CONCAT(b.nombre, " ", CONCAT("(", IFNULL(b.alias, ""), ")"))) AS descripcion_sede, a.usuario, c.usrname AS usuario_creacion, ';
		$campos.= 'a.categoria_grupo, CONCAT(e.descripcion, " (", f.descripcion, ")") AS subcategoria, a.bodega, d.descripcion AS descripcion_bodega, a.fhcreacion, a.fecha, a.notas, ';
		$campos.= 'a.confirmado, a.confirmado_fecha, a.articulo, g.descripcion AS descripcion_articulo, f.categoria';
		$ajustes = $this->db
			->select($campos)
			->join('sede b', 'b.sede = a.sede')
			->join('usuario c', 'c.usuario = a.usuario')
			->join('bodega d', 'd.bodega = a.bodega')
			->join('categoria_grupo e', 'e.categoria_grupo = a.categoria_grupo', 'left')
			->join('categoria f', 'f.categoria = e.categoria', 'left')
			->join('articulo g', 'g.articulo = a.articulo', 'left')
			->order_by('a.fecha DESC, a.ajuste_costo_promedio DESC')
			->get('ajuste_costo_promedio a');

		if (isset($args['_uno']) && $args['_uno']) {
			return $ajustes->row();
		}

		return $ajustes->result();
	}

	public function genera_detalle($args)
	{
		$id_acp = isset($args['ajuste_costo_promedio']) && (int)$args['ajuste_costo_promedio'] > 0 ? (int)$args['ajuste_costo_promedio'] : $this->getPK();

		$this->db->where('ajuste_costo_promedio', $id_acp)->delete('detalle_ajuste_costo_promedio');
		
		$artModel = new Articulo_model();
		$args['_todos'] = true;
		$articulos = $artModel->buscarArticulo($args);

		if (!empty($articulos)) {			
			foreach ($articulos as $articulo) {
				$art = new Articulo_model($articulo->articulo);
				$pres = $art->getPresentacionReporte();

				$bcosto = $this->BodegaArticuloCosto_model->buscar([
					'bodega' => $args['bodega'],
					'articulo' => $articulo->articulo,
					'_uno' => true
				]);

				if ($bcosto) {
					$costo_promedio = $bcosto->costo_promedio;
				} else {
					$costo_promedio = $art->getCosto(['bodega' => $args['bodega']]);
				}
				
				$cp = (float)$costo_promedio;

				$dacp = new Detalle_ajuste_costo_promedio_model();
				$dacp->guardar([
					'ajuste_costo_promedio' => $id_acp,
					'articulo' => $articulo->articulo,
					'presentacion' => $pres->presentacion,
					'costo_promedio_sistema' => (($cp * $args['por_iva']) * (float)$pres->cantidad),
					'costo_promedio_correcto' => null
				]);
			}
		}
	}
}