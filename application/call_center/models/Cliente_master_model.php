<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Cliente_master_model extends General_model
{

	public $cliente_master;
	public $nombre;
	public $correo = null;
	public $fecha_nacimiento = null;
	public $tipo_documento = null;
	public $numero_documento = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('cliente_master');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_lista_telefonos($args = [])
	{
		if (isset($args['cliente_master'])) {
			$this->db->where('a.cliente_master', $args['cliente_master']);
		}

		return $this->db
			->select('a.cliente_master_telefono')			
			->where('a.debaja', 0)			
			->result();
	}

	public function get_historico($args = [], $soloDetalle = false, $conReceta = true)
	{
		if (isset($args['cliente_master'])) {
			$this->db->where('a.cliente_master', $args['cliente_master']);
		}

		if (isset($args['comanda'])) {
			$this->db->where('a.comanda', $args['comanda']);
		}

		if ($soloDetalle) {
			$this->db->select('b.cantidad, b.articulo, c.descripcion, b.notas, b.detalle_comanda_id, c.multiple');
		} else {
			$this->db->select('a.comanda, a.fhcreacion, a.detalle_comanda_original');
			$this->db->group_by('a.comanda');
			$this->db->order_by('a.fhcreacion', 'DESC');
			$this->db->limit(5);
		}

		$data = $this->db
			->join('detalle_comanda b', 'a.comanda = b.comanda')
			->join('articulo c', 'c.articulo = b.articulo')
			->where('b.cantidad >', 0)
			->get('comanda a')
			->result();

		if (!$soloDetalle) {
			foreach ($data as $cmd) {
				$args['comanda'] = $cmd->comanda;
				if ($conReceta) {
					$cmd->detalle = $this->get_historico($args, true);					
				} else {
					$cmd->detalle = $this->get_detalle_comanda_seguimiento($args);
				}
			}
		}

		return $data;
	}

	public function get_detalle_comanda_seguimiento($args)
	{
		$datos = [];

		if (isset($args['detalle_comanda_id'])) {
			$this->db->where('a.detalle_comanda_id', $args['detalle_comanda_id']);
		} else {
			$this->db->where('a.detalle_comanda_id IS NULL');
		}

		if (isset($args['esextra'])) {
			$this->db->where('b.esextra', $args['esextra']);
		}

		$detalle = $this->db
			->select('a.detalle_comanda, a.cantidad, a.articulo, b.descripcion, a.notas, a.detalle_comanda_id, b.multiple, b.esreceta')
			->join('articulo b', 'b.articulo = a.articulo')
			->where('a.comanda', $args['comanda'])
			->where('a.cantidad >', 0)
			->get('detalle_comanda a')
			->result();

		foreach ($detalle as $det) {
			if (empty($det->detalle_comanda_id)) {
				$datos[] = $det;
				$datos = array_merge($datos, $this->get_detalle_comanda_seguimiento(['comanda' => $args['comanda'], 'detalle_comanda_id' => $det->detalle_comanda]));
			} else if((int)$det->multiple === 1) {
				$datos = array_merge($datos, $this->get_detalle_comanda_seguimiento(['comanda' => $args['comanda'], 'detalle_comanda_id' => $det->detalle_comanda]));
			} else {
				$datos[] = $det;				
				$datos = array_merge($datos, $this->get_detalle_comanda_seguimiento(['comanda' => $args['comanda'], 'detalle_comanda_id' => $det->detalle_comanda, 'esextra' => 1]));
			}
		}

		return $datos;
	}
}
