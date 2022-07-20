<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_rt_model extends General_model {

	public $id;
	public $nombre;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('administracion.cliente');        
        $this->setLlave('id');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_esquemas_clientes($args = [])
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where($key, $row);
				}
			}
		}

		$lista = $this->db
			->select('a.id, a.nombre, b.id AS idclientecorporacion, b.llave, b.dominio, b.db_database')
			->join('administracion.cliente_corporacion b', 'a.id = b.cliente_id')
			->join('information_schema.schemata c', 'c.SCHEMA_NAME = b.db_database')
			->order_by('a.nombre, b.dominio, b.db_database')
			->get('administracion.cliente a');

		if (isset($args['_uno'])) {
			return $lista->row();
		}

		return $lista->result();
	}

	public function get_configuracion_corporacion($equema)
	{
		return $this->db
			->select('configuracion, campo, tipo, TRIM(valor) AS valor, fhcreacion, descripcion')
			->order_by('descripcion, campo')
			->get("{$equema}.configuracion")
			->result();
	}

	public function guardar_configuracion_corporacion($args)
	{
		$this->db
		->where('configuracion', $args['configuracion'])
		->update("{$args['esquema']}.configuracion", ['valor' => $args['valor']]);
		return $this->db->affected_rows() > 0;
	}
}