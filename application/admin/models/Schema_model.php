<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Schema_model extends General_model
{

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla('information_schema.schemata');
		$this->setLlave('schema_name');

		if (!empty($id)) {
			$this->cargar($id);
		}
	}

	public function get_schemas($args = [])
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if (substr($key, 0, 1) != "_") {
					$this->db->where($key, $row);
				}
			}
		} else {
			$this->db->like('schema_name', 'rt_', 'after');
		}

		$tmp = $this->db->order_by('schema_name')->get('information_schema.schemata');

		if (isset($args['_uno'])) {
			return $tmp->row();
		}

		return $tmp->result();
	}

	public function get_datos_server_db()
	{
		if (in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1'])) {
			return ['db_hostname' => 'localhost', 'db_username' => 'root', 'db_password' => 'PoChoco2016'];
		} else if (in_array($_SERVER['HTTP_HOST'], ['qa.resttouch.com'])) {
			return ['db_hostname' => '10.0.83.4', 'db_username' => 'devlm', 'db_password' => 'D3vLM2020!'];
		}		
		return ['db_hostname' => '10.0.0.5', 'db_username' => 'devlm', 'db_password' => 'D3vLM2020!'];
	}

	private function ejecuta_sql($sql)
	{
		$sql = trim(preg_replace('/\s+/', ' ', $sql));
		$queries = explode(';', $sql);

		$fallos = [];

		foreach ($queries as $query) {
			$line = trim($query);
			if (substr($line, 0, 2) == '--' || $line == '')
				continue;

			try {
				$this->db->query($line);
			} catch (\Exception $e) {
				$fallos[] = "{$line}. {$e->getMessage()}";
			}

			// if (!$this->db->query($line)) {
			// 	$fallos[] = $line;
			// }
		}

		if (count($fallos) === 0) {
			return ['exito' => true, 'mensaje' => 'SQL ejecutado con éxito.'];
		} else {
			return ['exito' => false, 'mensaje' => 'Fallaron algunas instrucciones.', 'fallos' => $fallos];
		}
	}

	public function nuevo_esquema($obj)
	{
		try {
			$sql = file_get_contents(APPPATH . 'sql/resttouch_structure.sql');
			$sql = str_replace('RT_DATABASE_NAME', $obj->esquema, $sql);
			$sql = str_replace('RT_CORPORACION_ADMIN_LLAVE', $obj->uuid, $sql);
			$sql = str_replace('RT_CORPORACION_NOMBRE', $obj->corporacion, $sql);
			$sql = str_replace('RT_EMPRESA_NOMBRE', $obj->empresa, $sql);
			$sql = str_replace('RT_SEDE_NOMBRE', $obj->sede, $sql);
			$sql = str_replace('RT_USUARIO_NOMBRE', $obj->nombres, $sql);
			$sql = str_replace('RT_USUARIO_APELLIDO', $obj->apellidos, $sql);
			$sql = str_replace('RT_USUARIO_USUARIO', $obj->usuario, $sql);

			return $this->ejecuta_sql($sql);
		} catch (Exception $e) {
			return ['exito' => false, 'mensaje' => $e->getMessage()];
		}
	}

	public function actualiza_esquemas($sql)
	{
		$esquemas = $this->get_schemas();
		$resultados = [];

		foreach ($esquemas as $schema) {
			$query = str_replace('RT_DATABASE_NAME', $schema->SCHEMA_NAME, $sql);
			$resultado = $this->ejecuta_sql($query);
			$resultados[] = ['esquema' => $schema->SCHEMA_NAME, 'resultado' => $resultado];
		}

		return $resultados;
	}
}
