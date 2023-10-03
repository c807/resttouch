<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Webhook_model extends General_model
{
	public $evento;
	public $link;
	public $token;
	public $tipo_llamada;
	public $metodo;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("webhook");

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function buscar_webhook($args = [])
	{
		$campos = $this->getCampos(false, '', 'webhook');

		if (isset($args['webhook']) && (int)$args['webhook'] > 0) {
			$this->db->where('webhook', $args['webhook']);
		}

		if (isset($args['evento']) && is_string($args['evento'])) {
			$this->db->where('evento', $args['evento']);
		}

		$tmp = $this->db->select($campos)->get('webhook');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}
}

/* End of file Webhook_model.php */
/* Location: ./application/admin/models/Webhook_model.php */