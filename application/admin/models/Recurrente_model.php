<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Recurrente_model extends General_model
{
	public $recurrente;
	public $llave_publica;
    public $llave_privada;
    public $url_base;
    public $crear_usuario;
    public $crear_producto;
    public $crear_checkout;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('administracion.recurrente');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_recurrente($args = [])
	{
		$campos = 'recurrente, llave_publica, llave_privada, url_base, crear_usuario, crear_producto, crear_checkout';

		if (isset($args['recurrente']) && (int)$args['recurrente'] > 0) {
			$this->db->where('recurrente', (int)$args['recurrente']);
		}

		$tmp = $this->db->select($campos)->get('administracion.recurrente');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}
