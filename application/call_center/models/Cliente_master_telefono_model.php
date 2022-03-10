<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cliente_master_telefono_model extends General_model {

	public $cliente_master_telefono;
	public $cliente_master;
    public $telefono;
	public $desasociado = 0;

	public function __construct($id = '')
	{
		parent::__construct();
		$this->setTabla('cliente_master_telefono');
		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_lista_telefonos($args = [])
	{
		if(isset($args['cliente_master'])) {
			$this->db->where('a.cliente_master', $args['cliente_master']);
		}

		if(isset($args['telefono'])) {
			$this->db->where('a.telefono', $args['telefono']);
		}

		if(isset($args['numero'])) {
			if(isset($args['_parecido'])) {
				$this->db->like('c.numero', $args['numero'], 'both', false);
			} else {
				$this->db->where('c.numero', $args['numero']);
			}
		}

		$telefonos = $this->db
			->select('a.cliente_master_telefono, b.cliente_master, b.nombre, b.correo, b.fecha_nacimiento, c.telefono, c.numero')
			->join('cliente_master b', 'b.cliente_master = a.cliente_master')
			->join('telefono c', 'c.telefono = a.telefono')
			->where('a.desasociado', 0)
			->get('cliente_master_telefono a')
			->result();

		if(isset($args['_notas'])) {
			$this->load->model('Cliente_master_nota_model');
			foreach ($telefonos as $tel) {
				$tel->notas = $this->Cliente_master_nota_model->buscar(['cliente_master' => $tel->cliente_master, 'debaja' => 0]);
			}
		}

		if(isset($args['_direcciones'])) {
			$this->load->model('Cliente_master_direccion_model');
			foreach ($telefonos as $tel) {
				$tel->direcciones = $this->Cliente_master_direccion_model->buscar(['cliente_master' => $tel->cliente_master, 'debaja' => 0]);
				if ($tel->direcciones && count($tel->direcciones) > 0) {
					foreach ($tel->direcciones as $d) {
						$d->cliente_master = $this->db->select('cliente_master, nombre, correo, fecha_nacimiento')->where('cliente_master', $d->cliente_master)->get('cliente_master')->row();
						$d->tipo_direccion = $this->db->select('tipo_direccion, descripcion')->where('tipo_direccion', $d->tipo_direccion)->get('tipo_direccion')->row();
						$d->sede = $this->db->select('sede, nombre')->where('sede', $d->sede)->get('sede')->row();
						$d->direccion_completa = $this->Cliente_master_direccion_model->get_full_address($d);
					}
				}
			}
		}

		if(isset($args['_facturacion'])) {
			$this->load->model('Cliente_master_cliente_model');
			foreach ($telefonos as $tel) {
				$tel->datos_facturacion = $this->Cliente_master_cliente_model->buscar(['cliente_master' => $tel->cliente_master, 'debaja' => 0]);
				if ($tel->datos_facturacion && count($tel->datos_facturacion) > 0) {
					foreach ($tel->datos_facturacion as $d) {						
						$d->cliente = $this->db->select('cliente, nombre, direccion, nit, telefono, correo, codigo_postal, municipio, departamento, pais_iso_dos, observaciones, tipo_cliente')->where('cliente', $d->cliente)->get('cliente')->row();
					}
				}
			}
		}

		return $telefonos;
	}
}
