<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Detalle_ajuste_costo_promedio_model extends General_model
{

	public $detalle_ajuste_costo_promedio;
	public $ajuste_costo_promedio;
	public $articulo;
	public $presentacion;
	public $costo_promedio_sistema = 0.00000;
	public $costo_promedio_correcto = 0.00000;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("detalle_ajuste_costo_promedio");
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_detalle($args)
	{
		if (isset($args['detalle_ajuste_costo_promedio']) && (int)$args['detalle_ajuste_costo_promedio'] > 0) {
			$this->db->where('a.detalle_ajuste_costo_promedio', $args['detalle_ajuste_costo_promedio']);
		}
		
		if (isset($args['ajuste_costo_promedio']) && (int)$args['ajuste_costo_promedio'] > 0) {
			$this->db->where('a.ajuste_costo_promedio', $args['ajuste_costo_promedio']);
		}

		$campos = 'a.detalle_ajuste_costo_promedio, a.ajuste_costo_promedio, a.articulo, e.descripcion AS categoria, d.descripcion as subcategoria, ';
		$campos .= 'b.descripcion AS descripcion_articulo, a.presentacion, c.descripcion AS descripcion_presentacion, a.costo_promedio_sistema, ';
		$campos .= 'a.costo_promedio_correcto, f.confirmado, f.confirmado_fecha';
		$detalle = $this->db
			->select($campos)
			->join('articulo b', 'b.articulo = a.articulo')
			->join('presentacion c', 'c.presentacion = a.presentacion')
			->join('categoria_grupo d', 'd.categoria_grupo = b.categoria_grupo')
			->join('categoria e', 'e.categoria = d.categoria')
			->join('ajuste_costo_promedio f', 'f.ajuste_costo_promedio = a.ajuste_costo_promedio')
			->order_by('b.descripcion')
			->get('detalle_ajuste_costo_promedio a')
			->result();

		return $detalle;
	}
}
