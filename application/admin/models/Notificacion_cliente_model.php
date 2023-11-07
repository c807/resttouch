<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Notificacion_cliente_model extends General_model {

	public $notificacion_cliente;
    public $asunto;
	public $notificacion;
    public $mostrar_del;
    public $mostrar_al;
    public $prioridad = 1;
    public $cliente_corporacion = null;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('administracion.notificacion_cliente');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

    public function get_lista_clientes()
    {
        return $this->db
            ->select('a.id, b.nombre AS cliente, a.dominio, a.bloqueado')
            ->join('administracion.cliente b', 'b.id = a.cliente_id')
            ->order_by('b.nombre, a.dominio')
            ->get('administracion.cliente_corporacion a')
            ->result();
    }

}