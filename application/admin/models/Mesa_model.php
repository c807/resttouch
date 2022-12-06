<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Mesa_model extends General_Model
{

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
	public $esreservable = 0;
	public $eshabitacion = 0;
	public $tipo_habitacion = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('mesa');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_comanda($args = [])
	{

		if (isset($args['estatus'])) {
			$this->db->where('b.estatus', 1);
		}

		if (isset($args['sede'])) {
			$this->db->where('b.sede', $args['sede']);
		}

		return $this->db
			->select('
			b.comanda,
			b.usuario,
			b.sede,
			b.estatus')
			->join('comanda b', 'b.comanda = a.comanda')
			->where('a.mesa', $this->mesa)
			->where('(SELECT count(cuenta) FROM cuenta WHERE comanda = b.comanda) <> (SELECT count(cuenta) FROM cuenta WHERE comanda = b.comanda AND cerrada = 1)')
			->get('comanda_has_mesa a')
			->row();
	}

	public function getDisponibles($sede, $soloDisponibles = false, $fltrHabitacion = null)
	{
		$campos = $this->getCampos(false, 'a.', 'mesa');

		if ($soloDisponibles) {
			$this->db->where('a.estatus', 1);
		}

		if (!is_null($fltrHabitacion) && is_numeric($fltrHabitacion)) {
			$this->db->where('a.eshabitacion', $fltrHabitacion);
		}

		$md = $this->db
			->select($campos)
			->join('area b', 'b.area = a.area')
			->join('reserva c', 'a.mesa = c.mesa', 'left')
			->where('a.debaja', 0)
			->where('a.esmostrador', 0)
			->where('a.escallcenter', 0)
			->where('b.sede', $sede)
			->where('(c.estatus_reserva = 2 OR (c.estatus_reserva IS NULL AND a.eshabitacion = 0))')
			->order_by('b.nombre, a.numero')
			->get('mesa a')
			->result();

		return $md;
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

	public function get_reservas($vigentes = true, $idMesa = null) {
		$campos = $this->getCampos(false, '', 'reserva');

		if (!$idMesa) {
			$idMesa = $this->getPK();
		}

		if ($vigentes) {
			$this->db->where_in('estatus_reserva', [1, 2]);
		}

		return $this->db->select($campos)->where('mesa', $idMesa)->get('reserva')->result();
	}
}

/* End of file Mesa_model.php */
/* Location: ./application/admin/models/Mesa_model.php */