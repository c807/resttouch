<?php
defined('BASEPATH') or exit('No direct script access allowed');

class General_model extends CI_Model
{

	protected $_tabla = "";
	protected $_llave = "id";
	protected $_pk = null;
	protected $mensaje = [];
	protected $_lista_campos = [];

	public function __construct()
	{
		parent::__construct();
		$this->_tabla = $this->getTabla();
	}

	public function getPK()
	{
		return $this->_pk;
	}

	public function getMensaje()
	{
		return $this->mensaje;
	}

	public function setMensaje($mensaje)
	{
		$this->mensaje[] = $mensaje;
		return $this;
	}

	public function setTabla($nombre)
	{
		$this->_tabla = $nombre;

		$tmp = explode(".", $nombre);

		$this->_llave = count($tmp) > 1 ? $tmp[1] : $nombre;

		$this->setCampos();
	}

	public function setLlave($nombre)
	{
		$this->_llave = $nombre;
	}

	private function getTabla()
	{
		return str_replace("_model", "", strtolower(get_class($this)));
	}

	public function setDatos($args)
	{
		foreach ($args as $campo => $valor) {
			if (property_exists($this, $campo)) {
				$this->$campo = $valor;
			}
		}
	}

	public function cargar($valor)
	{
		$this->db->where($this->_llave, $valor);

		$tmp = $this->db
			->get($this->_tabla)
			->row();

		if ($tmp) {
			$var = $this->_llave;
			$this->_pk = $tmp->$var;
			$this->setDatos($tmp);
		}
	}

	public function guardar($args = [])
	{
		if (count($args) > 0) {
			$this->setDatos($args);
		}

		$exito = FALSE;

		if ($this->_pk === null) {

			$this->db->insert($this->_tabla, $this);

			$exito = $this->db->affected_rows() > 0;

			if ($exito) {
				$this->_pk = $this->db->insert_id();
			} else {
				$this->setMensaje("No pude guardar los datos, por favor intente nuevamente.");
			}
		} else {
			$this->db
				->where($this->_llave, $this->_pk)
				->update($this->_tabla, $this);

			$exito = $this->db->affected_rows() > 0;

			if (!$exito) {
				$this->setMensaje("Nada que actualizar.");
			}
		}

		if ($this->_pk !== null) {
			$this->cargar($this->_pk);
		}

		return $exito;
	}

	public function buscar($args = [])
	{
		if (isset($args["_like"])) {
			if (!isset($args['_sin_escape'])) {
				foreach ($args["_like"] as $campo => $valor) {
					$this->db->like($campo, $valor);
				}
			} else {
				foreach ($args["_like"] as $campo => $valor) {
					$this->db->like($campo, $valor, 'both', false);
				}
			}
		}

		if (isset($args["_in"])) {
			foreach ($args["_in"] as $campo => $valor) {
				$this->db->where_in($campo, $valor);
			}
		}

		if (isset($args["_not_in"])) {
			foreach ($args["_not_in"] as $campo => $valor) {
				$this->db->where_not_in($campo, $valor);
			}
		}

		if (isset($args["_fdel"])) {
			foreach ($args["_fdel"] as $campo => $valor) {
				$this->db->where("{$campo} >=", $valor);
			}
		}

		if (isset($args["_fal"])) {
			foreach ($args["_fal"] as $campo => $valor) {
				$this->db->where("{$campo} <=", $valor);
			}
		}

		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where($key, $row);
				}
			}
		}

		$tmp = $this->db->get($this->_tabla);
		// $tmp = $this->db->get_compiled_select($this->_tabla);

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}

	public function getCampos_deprecated($asArray = true, $prefijo = '', $tabla = null)
	{
		if (is_null($tabla) || !is_string($tabla) || empty(trim($tabla))) {
			$tabla = $this->_tabla;
		}

		$query = "SELECT column_name AS campo FROM information_schema.columns WHERE table_schema = '{$this->db->database}' AND table_name = '{$tabla}' ORDER BY ordinal_position";
		$campos = $this->db->query($query)->result();

		if ($asArray) {
			return $campos;
		} else {
			$lista = '';
			$prefijo = trim($prefijo);
			foreach ($campos as $valor) {
				if ($lista !== '') {
					$lista .= ', ';
				}
				$lista .= "{$prefijo}{$valor->campo}";
			}
			return $lista;
		}
	}

	public function getCampos($asArray = true, $prefijo = '', $tabla = null)
	{
		$tablasAdministracion = ['cliente', 'cliente_corporacion', 'cliente_corporacion_has_modulo', 'conocimiento', 'modulo', 'notificacion_cliente', 'solicitud_registro'];

		if (is_null($tabla) || !is_string($tabla) || empty(trim($tabla))) {
			$tabla = $this->_tabla;
		}

		$database = $this->db->database;
		$isAdministracion = strcasecmp('administracion', $database) == 0 && in_array($tabla, $tablasAdministracion);
		$isRtDatabase = (strcasecmp('administracion', $database) != 0 && strcasecmp(substr($database, 0, 3), 'rt_') == 0);

		if ($isAdministracion || $isRtDatabase) {
			if (!$isAdministracion && $isRtDatabase) {
				if(strcasecmp(substr($database, 0, 3), 'rt_') == 0 && strcasecmp(substr($tabla, 0, 14), 'administracion') == 0) {
					$database = '';
				}
			}
			$query = 'SHOW COLUMNS FROM '.$database.(!empty($database) ? '.' : '').$tabla;
			$columnas = $this->db->query($query)->result();
			$campos = [];

			foreach ($columnas as $col) {
				$campos[] = (object)['campo' => $col->Field];
			}

			if (!$asArray) {
				$lista = implode(',', array_map(function ($valor) use ($prefijo) {
					return $prefijo . $valor->campo;
				}, $campos));
				return $lista;
			}

			return $campos;
		}

		return $asArray ? [] : '';
	}

	public function __toString()
	{
		$columnas = $this->getCampos();

		if ($columnas) {
			$registro = '';
			foreach ($columnas as $valor) {
				if (property_exists($this, $valor->campo)) {
					if ($registro !== '') {
						$registro .= ', ';
					}
					$registro .= "{$valor->campo}: " . (!empty($this->{$valor->campo}) ? $this->{$valor->campo} : 'null');
				}
			}
			return $registro;
		}

		return '';
	}

	public function eliminar()
	{
		return $this->db->delete($this->_tabla, array($this->_llave => $this->_pk));
	}

	public function setCampos()
	{
		$this->_lista_campos = $this->getCampos();
	}

	public function getCamposTabla($asArray = true)
	{
		return $asArray ? array_column($this->_lista_campos, 'campo') : implode(',', array_column($this->_lista_campos, 'campo'));
	}
}

/* End of file General_model.php */
/* Location: ./application/admin/models/General_model.php */