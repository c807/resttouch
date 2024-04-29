<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fpago_model extends General_model {

	public $forma_pago;
	public $descripcion;
	public $activo = 1;
	public $permitir_propina = 1;
	public $descuento = 0;
	public $aumento_porcentaje = 0.00;
	public $comision_porcentaje = 0.00;
	public $retencion_porcentaje = 0.00;
	public $pedirdocumento = 0;
	public $adjuntararchivo = 0;
	public $pedirautorizacion = 0;
	public $sinfactura = 0;
	public $esefectivo = 0;
	public $escobrohabitacion = 0;
	public $esabono = 0;
	public $porcentaje_maximo_descuento = 0.00;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('forma_pago');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_formaspago($args = [])
	{
		$campos = $this->getCampos(false, '', 'forma_pago');

		if (isset($args['forma_pago']) && (int)$args['forma_pago'] > 0) {
			$this->db->where('forma_pago', $args['forma_pago']);
		}

		if (isset($args['descripcion']) && is_string($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}

		if (isset($args['activo']) && in_array((int)$args['activo'], [0, 1])) {
			$this->db->where('activo', $args['activo']);
		}

		if (isset($args['permitir_propina']) && in_array((int)$args['permitir_propina'], [0, 1])) {
			$this->db->where('permitir_propina', $args['permitir_propina']);
		}

		if (isset($args['descuento']) && in_array((int)$args['descuento'], [0, 1])) {
			$this->db->where('descuento', $args['descuento']);
		}

		if (isset($args['pedirdocumento']) && in_array((int)$args['pedirdocumento'], [0, 1])) {
			$this->db->where('pedirdocumento', $args['pedirdocumento']);
		}

		if (isset($args['adjuntararchivo']) && in_array((int)$args['adjuntararchivo'], [0, 1])) {
			$this->db->where('adjuntararchivo', $args['adjuntararchivo']);
		}
		
		if (isset($args['pedirautorizacion']) && in_array((int)$args['pedirautorizacion'], [0, 1])) {
			$this->db->where('pedirautorizacion', $args['pedirautorizacion']);
		}

		if (isset($args['sinfactura']) && in_array((int)$args['sinfactura'], [0, 1])) {
			$this->db->where('sinfactura', $args['sinfactura']);
		}

		if (isset($args['esefectivo']) && in_array((int)$args['esefectivo'], [0, 1])) {
			$this->db->where('esefectivo', $args['esefectivo']);
		}

		if (isset($args['escobrohabitacion']) && in_array((int)$args['escobrohabitacion'], [0, 1])) {
			$this->db->where('escobrohabitacion', $args['escobrohabitacion']);
		}

		if (isset($args['esabono']) && in_array((int)$args['esabono'], [0, 1])) {
			$this->db->where('esabono', $args['esabono']);
		}

		$tmp = $this->db->select($campos)->get('forma_pago');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
	
	public function get_lista($args = [])
	{
		$lista = [];

		if (isset($args['_uno'])) {
			unset($args['_uno']);
		}

		$tmp = $this->buscar_formaspago($args);
		foreach($tmp as $fp) {
			$lista[(int)$fp->forma_pago] = clone $fp;
		}
		return $lista;
	}

}

/* End of file Fpago_model.php */
/* Location: ./application/admin/models/Fpago_model.php */