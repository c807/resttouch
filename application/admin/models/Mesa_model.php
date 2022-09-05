<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Mesa_model extends General_Model {

	public $mesa;
	public $area;
	public $numero;
	public $posx;
	public $posy;
	public $tamanio;
	public $estatus;
	public $ancho = 72.0000;
	public $alto = 72.0000;
	public $esmostrador = 0;
	public $vertical = 0;
	public $impresora = 0;
	public $debaja = 0;
	public $etiqueta = null;
	public $escallcenter = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('mesa');

		if(!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_comanda($args = []){

		if(isset($args['estatus'])) {
			$this->db->where('b.estatus', 1);
		}

		if(isset($args['sede'])) {
			$this->db->where('b.sede', $args['sede']);
		}

		return $this->db
		->select('
			b.comanda,
			b.usuario,
			b.sede,
			b.estatus')
		->join('comanda b', 'a.comanda = b.comanda')
		->where('a.mesa', $this->mesa)		
		->get('comanda_has_mesa a')
		->row();
	}

	public function getDisponibles($sede, $soloDisponibles = false) {
		if ($soloDisponibles) {
			$this->db->where('a.estatus', 1);
		}

		return $this->db
		->select('a.*')
		->join('area b', 'b.area = a.area')		
		->where('a.esmostrador', 0)
		->where('a.escallcenter', 0)
		->where('b.sede', $sede)
		->order_by('b.nombre, a.numero')
		->get('mesa a')
		->result();
	}

	public function liberar_mesa()
	{
		$datos = new stdClass();
		$datos->comandas_relacionadas = '';
		$datos->comandas_cerradas = 0;
		$comandas = $this->db
			->select('GROUP_CONCAT(DISTINCT c.comanda ORDER BY c.comanda SEPARATOR ",") AS comandas')
			->join('comanda_has_mesa b', 'a.mesa = b.mesa')
			->join('comanda c', 'c.comanda = b.comanda')
			->where('a.mesa', $this->mesa)
			->where('c.estatus', 1)
			->get('mesa a')
			->row();
		
		if ($comandas && isset($comandas->comandas)) {
			$datos->comandas_relacionadas = $comandas->comandas;
			$this->db->where("comanda IN({$datos->comandas_relacionadas})")->update('cuenta', ['cerrada' => 1]);
			$this->db->where("comanda IN({$datos->comandas_relacionadas})")->update('comanda', ['estatus' => 2]);
			$datos->comandas_cerradas = $this->db->affected_rows();
		}

		$datos->exito = $this->guardar(['estatus' => 1]);
		return (array)$datos;
	}
}

/* End of file Mesa_model.php */
/* Location: ./application/admin/models/Mesa_model.php */