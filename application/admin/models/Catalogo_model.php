<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Catalogo_model extends CI_Model {

	private function getCatalogo($datos, $args)
	{
		//if ($datos->num_rows() > 0) {
		return isset($args["_uno"]) ? $datos->row() : $datos->result();
		//}

		//return false;
	}

	public function getFormaPago($args=[])
	{
		if (isset($args["forma_pago"])) {
			$this->db->where("forma_pago", $args["forma_pago"]);
		} else {
			$this->db->where("activo", 1);
		}

		$qry = $this->db
		->order_by("descripcion")
		->get("forma_pago");

		return $this->getCatalogo($qry, $args);
	}

	public function getSerieFactura($args=[])
	{
		if (isset($args["factura_serie"])) {
			$this->db->where("factura_serie", $args["factura_serie"]);
		} else {
			$this->db->where("activo", 1);
		}

		$qry = $this->db
		->order_by("serie")
		->get("factura_serie");

		return $this->getCatalogo($qry, $args);
	}

	public function getTipoMovimiento($args=[])
	{
		if (isset($args["tipo_movimiento"])) {
			$this->db->where("tipo_movimiento", $args["tipo_movimiento"]);
		}

		$qry = $this->db
		->order_by("descripcion")
		->get("tipo_movimiento");

		return $this->getCatalogo($qry, $args);
	}

	public function getDocumentoTipo($args=[])
	{
		if (isset($args["documento_tipo"])) {
			$this->db->where("documento_tipo", $args["documento_tipo"]);
		}

		$qry = $this->db
		//->order_by()
		->get("documento_tipo");

		return $this->getCatalogo($qry, $args);
	}

	public function getBodega($args = []){
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("descripcion")
		->get("bodega");

		return $this->getCatalogo($qry, $args);
	}

	public function getProveedor($args = [])
	{
		if (isset($args["proveedor"])) {
			$this->db->where("proveedor", $args["proveedor"]);
		}

		$qry = $this->db
		->order_by("razon_social")
		->get("proveedor");

		return $this->getCatalogo($qry, $args);
	}

	public function getArticulo($args = [])
	{
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("articulo")
		->get("articulo");

		$tmp = $this->getCatalogo($qry, $args);

		if (is_array($tmp)) {
			$datos = [];
			foreach ($tmp as $row) {
				$row->impresora = $this->db
					->select("b.*")
					->join("impresora b", "b.impresora = a.impresora")
					->where("a.categoria_grupo", $row->categoria_grupo)
					->get("categoria_grupo a")
					->row();
				$datos[] = $row;
			}
			$tmp = $datos;
		} else if($tmp) {
			$tmp->impresora = $this->db
				->select("b.*")
				->join("impresora b", "b.impresora = a.impresora")
				->where("a.categoria_grupo", $tmp->categoria_grupo)
				->get("categoria_grupo a")
				->row();
		}

		return $tmp;
	}

	public function getUsuario($args = [])
	{
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("nombres")
		->get("usuario");

		return $this->getCatalogo($qry, $args);
	}

	public function getCategoriaGrupo($args = [])
	{
		$raiz = isset($args['raiz']);
		unset($args['raiz']);
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("categoria_grupo")
		->get("categoria_grupo");

		$grupo = $this->getCatalogo($qry, $args);

		$datos = [];
		if (is_array($grupo)) {
			foreach ($grupo as $row) {
				
				if ($raiz) {
					$row->categoria_grupo_grupo = $this->getCategoriaGrupo([
						"categoria_grupo" => $row->categoria_grupo_grupo,
						"raiz" => true
					]);
				} else {
					$row->categoria_grupo_grupo = $this->getCategoriaGrupo([
						"categoria_grupo_grupo" => $row->categoria_grupo
					]);
				}				
				
				$row->articulo = $this->Catalogo_model->getArticulo([
					'categoria_grupo' => $row->categoria_grupo
				]);
				$row->categoria = $this->Categoria_model->buscar([
					"categoria" => $row->categoria,
					"_uno" => true
				]);
				$datos[] = $row;
			}
		} else if(is_object($grupo)) {
			if ($raiz) {
				$grupo->categoria_grupo_grupo = $this->getCategoriaGrupo([
					"categoria_grupo" => $grupo->categoria_grupo_grupo,
					"raiz" => true
				]);
			} else {
				$grupo->categoria_grupo_grupo = $this->getCategoriaGrupo([
					"categoria_grupo_grupo" => $grupo->categoria_grupo
				]);
			}
				
			$grupo->articulo = $this->Catalogo_model->getArticulo([
				'categoria_grupo' => $grupo->categoria_grupo
			]);
			$grupo->categoria = $this->Categoria_model->buscar([
				"categoria" => $grupo->categoria,
				"_uno" => true
			]);
			$datos = $grupo;
		}

		return $datos;
	}

	public function getSede($args=[])
	{

		if (isset($args['sede'])) {
			$this->db->where('sede', $args['sede']);
		}

		if(isset($args['admin_llave'])) {
			$this->db
				 ->join("empresa b", "a.empresa = b.empresa")
				 ->join("corporacion c", "b.corporacion = c.corporacion")
				 ->where("c.admin_llave", $args['admin_llave']);
		}

		$qry = $this->db
		->select("a.*")
		->order_by("a.nombre")
		->get("sede a");

		return $this->getCatalogo($qry, $args);
	}

	public function getTipoUsuario($args=[])
	{
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("descripcion")
		->get("usuario_tipo");

		return $this->getCatalogo($qry, $args);
	}

	public function getModulo($args = [])
	{
		if (isset($args['modulo'])) {
			$this->db->where('modulo', $args['modulo']);
		}

		$qry = $this->db
		->order_by("descripcion")
		->get("modulo");

		return $this->getCatalogo($qry, $args);
	}

	public function getMoneda($args = [])
	{
		if (isset($args['moneda'])) {
			$this->db->where('moneda', $args['moneda']);
		}

		$qry = $this->db
		->order_by("moneda")
		->get("moneda");

		return $this->getCatalogo($qry, $args);
	}

	public function getFacturaSerie($args = [])
	{
		if (isset($args['factura_serie'])) {
			$this->db->where('factura_serie', $args['factura_serie']);
		}

		$qry = $this->db
		->select("
			factura_serie,
			serie,
			correlativo,
			tipo")
		->where("activo", 1)
		->order_by("factura_serie")
		->get("factura_serie");

		return $this->getCatalogo($qry, $args);
	}

	public function getCertificadorFel($args = []) {
		if (isset($args['certificador_fel'])) {
			$this->db->where('certificador_fel', $args['certificador_fel']);
		}

		$qry = $this->db
		->order_by("certificador_fel")
		->get("certificador_fel");

		return $this->getCatalogo($qry, $args);
	}

	public function getComandaOrigen($args = []) {
		if (isset($args['comanda_origen'])) {
			$this->db->where('comanda_origen', $args['comanda_origen']);
		}

		if (isset($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}

		$qry = $this->db
		->order_by("comanda_origen")
		->get("comanda_origen");

		return $this->getCatalogo($qry, $args);
	}

	public function getCorporacion($args=[])
	{
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("corporacion")
		->get("corporacion");

		return $this->getCatalogo($qry, $args);
	}

	public function getCredenciales($dominio)
	{
		$tmp = $this->db
					->select("
						db_hostname,
						db_username,
						db_password,
						db_database")
					->from('cliente_corporacion')
					->where("dominio", $dominio)
					->get();

		if($tmp && $tmp->num_rows() > 0) {
			return $tmp->row();
		} 

		return false;
	}
}

/* End of file Catalogo_model.php */
/* Location: ./application/admin/models/Catalogo_model.php */