<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Bitacora_model extends General_model {

	public $accion;
	public $usuario;
	public $fecha;
	public $tabla;
	public $registro;
	public $comentario;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla("bitacora");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscarBitacora($args = [])
	{
		if (isset($args['comentario'])) {
			$this->db->like("comentario", $args['comentario']);
			unset($args['comentario']);
		}

		return $this->buscar($args);
	}

	public function get_tablas_bitacora() 
	{
		return $this->db->select('tabla')->group_by('tabla')->get('bitacora')->result();
	}

	public function reporte($args = [])
	{
		if (isset($args['comentario'])) {
			$this->db->like('a.comentario', $args['comentario']);			
		}

		if (isset($args['fdel'])) {
			$this->db->where('DATE(a.fecha) >=', $args['fdel']);			
		}

		if (isset($args['fal'])) {
			$this->db->where('DATE(a.fecha) <=', $args['fal']);			
		}

		if (isset($args['fecha'])) {
			$this->db->where('DATE(a.fecha)', $args['fecha']);			
		}

		if (isset($args['accion'])) {
			$this->db->where('a.accion', $args['accion']);
		}

		if (isset($args['tabla'])) {
			$this->db->like('a.tabla', $args['tabla']);
		}

		if (isset($args['registro'])) {
			$this->db->where('a.registro', $args['registro']);
		}

		if (isset($args['usrname'])) {
			$this->db->like('c.usrname', $args['usrname']);
		}

		if (isset($args['bitacora'])) {
			$this->db->where('a.bitacora', $args['bitacora']);
		}

		if (isset($args['ultimos'])) {
			$this->db->limit($args['ultimos']);
		}

		if (isset($args['sede'])) {
			$this->db->where("d.sede IN({$args['sede']})");
		}

		return $this->db
			->select('a.bitacora, d.nombre AS sede, c.usrname AS usuario, b.descripcion AS accion, DATE_FORMAT(a.fecha, "%d/%m/%Y %H:%i:%s") as fecha, a.tabla, a.registro, a.comentario')
			->join('accion b', 'b.accion = a.accion')
			->join('usuario c', 'c.usuario = a.usuario')
			->join('sede d', 'd.sede = c.sede')			
			->order_by('a.fecha DESC')
			->get("{$this->_tabla} a")
			->result();
	}

}

/* End of file Bitacora_model.php */
/* Location: ./application/admin/models/Bitacora_model.php */