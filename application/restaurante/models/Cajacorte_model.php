<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cajacorte_model extends General_Model {

	public $caja_corte;	
	public $usuario;
	public $turno;
	public $confirmado = null;
	public $anulado = 0;
	public $caja_corte_tipo;
	public $serie = null;
	public $numero = null;
	public $fecha = null;
	public $total = 0;
	public $descripcion_documento = null;
	
	public function __construct($id='')
	{
		parent::__construct();
		$this->setTabla('caja_corte');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function getCajaCorte($args=[])
	{
		if (isset($args['caja_corte'])) {
			$this->db->where('a.caja_corte', $args['caja_corte']);
		}

		if (isset($args['caja_tipo'])) {
			$this->db->where('a.caja_corte_tipo', $args['caja_tipo']);
		}

		if (isset($args['turno'])) {
			$this->db->where('a.turno', $args['turno']);
		}

		return $this->db
		->select('a.*')		
		->join('caja_corte_tipo b','b.caja_corte_tipo = a.caja_corte_tipo')
		->where('a.anulado', 0)
		->order_by('a.creacion')
		->get('caja_corte a')
		->result();
	}

	public function getDetalleCajaCorte($args=[])
	{
		return $this->db
		->select('a.*,b.nombre')
		->from('caja_corte_detalle a')
		->join('caja_corte_nominacion b','b.caja_corte_nominacion = a.caja_corte_nominacion')
		->where('a.anulado', 0)
		->where('a.caja_corte', $this->getPk())
		->get()
		->result();
	}
}

/* End of file Cajacorte_model.php */
/* Location: ./application/restaurante/models/Cajacorte_model.php */