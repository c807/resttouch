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

		if (isset($args['descuento'])) {
			$this->db->where('descuento', $args['descuento']);
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

		if (isset($args['ingreso'])) {
			$this->db->where('ingreso', $args['ingreso']);
		}

		if (isset($args['egreso'])) {
			$this->db->where('egreso', $args['egreso']);
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
					if (is_array($row)) {
						$this->db->where_in($key, $row);
					} else {
						$this->db->where($key, $row);
					}
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

	public function obtenerReceta($articulo)
	{
		$this->load->model('Articulo_model');
		$datos = [];
		$tmp = $this->db
					->where("receta", $articulo)
					->where("anulado", 0)
					->get('articulo_detalle')
					->result();

		foreach ($tmp as $row) {
			$art = new Articulo_model($row->articulo);
			$art->receta = [];
			if($art->multiple == 1) {
				$art->receta = $this->obtenerReceta($art->getPK());
			}

			$art->con_precio_extra = $row->precio_extra;
			$art->monto_extra = $row->precio;

			$datos[] = $art;
		}

		return $datos;
	}

	public function getArticuloCombo($args = [])
	{
		$uno = false;

		if (isset($args['articulo'])) {
			$this->db->where('articulo', $args['articulo']);
			$uno = true;
		}

		$datos = [];

		$tmp = $this->db
					->get("articulo");

		if ($uno) {
			$art = $tmp->row();
			$art->receta = $this->obtenerReceta($art->articulo);
			$datos = $art;
		} else {
			$art = $tmp->result();
			foreach ($art as $row) {
				$row->receta = $this->obtenerReceta($row->articulo);
				$datos[] = $row;
			}
		}

		return $datos;

	}

	public function getArticulo($args = [])
	{
		$sede = isset($args['sede']) ? $args['sede'] : false;
		$ingreso = isset($args['ingreso']) ? $args['ingreso'] : false;
		unset($args['ingreso']);
		unset($args['sede']);
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where("a.{$key}", $row);
				}
			}
		}

		if ($sede) {
			if (is_array($sede)) {
				$this->db->where_in('c.sede', $sede);
			} else {
				$this->db->where('c.sede', $sede);
			}
		}

		if ($ingreso) {
			$this->db->where("mostrar_inventario", 1);
		}

		$qry = $this->db
		->select("a.*, c.sede")
		->join("categoria_grupo b", "a.categoria_grupo = b.categoria_grupo")
		->join("categoria c", "c.categoria = b.categoria")
		->order_by("a.articulo")
		->get("articulo a");

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

				$row->presentacion = $this->db
					->where("presentacion", $row->presentacion)
					->get("presentacion")
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

			$tmp->presentacion = $this->db
				->where("presentacion", $tmp->presentacion)
				->get("presentacion")
				->row();
		}

		return ordenar_array_objetos($tmp, "descripcion");
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
		$sede = isset($args['sede']) ? $args['sede'] : false;
		$todo = isset($args['_todo']);
		unset($args['raiz']);
		unset($args['sede']);
		unset($args['_todo']);
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where("a.{$key}", $row);
				}
			}
		}
		if ($sede) {
			$this->db->where('b.sede', $sede);
		}

		$buscarArt = [];
		if (!$todo) {
			$buscarArt["mostrar_pos"] = "1";
		}
		
		$qry = $this->db
		->select("a.*")
		->join("categoria b", "b.categoria = a.categoria")
		->order_by("categoria_grupo")
		->group_by("a.categoria_grupo")
		->get("categoria_grupo a");

		$grupo = $this->getCatalogo($qry, $args);

		$datos = [];
		if (is_array($grupo)) {
			foreach ($grupo as $row) {
				if ($raiz) {
					$data = [
						"categoria_grupo" => $row->categoria_grupo_grupo,
						"raiz" => true
					];

					if ($todo) {
						$data['_todo'] = true;
					}
					$row->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
				} else {
					$data = [
						"categoria_grupo_grupo" => $row->categoria_grupo
					];

					if ($todo) {
						$data['_todo'] = true;
					}
					$row->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
				}				
				$buscarArt['categoria_grupo'] = $row->categoria_grupo;

				$row->articulo = $this->Catalogo_model->getArticulo($buscarArt);
				$row->categoria = $this->Categoria_model->buscar([
					"categoria" => $row->categoria,
					"_uno" => true
				]);
				$datos[] = $row;
			}
		} else if(is_object($grupo)) {
			$data = [];
			if ($todo) {
				$data['_todo'] = true;
			}
			if ($raiz) {
				$data['categoria_grupo'] = $grupo->categoria_grupo_grupo;
				$data['raiz'] = true;

				$grupo->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
			} else {
				$data['categoria_grupo_grupo'] = $grupo->categoria_grupo;

				$grupo->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
			}

			$buscarArt["categoria_grupo"] = $grupo->categoria_grupo;
				
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

	public function getEmpresa($args = [])
	{
		if (isset($args['empresa'])) {
			$this->db->where('empresa', $args['empresa']);
		}

		$qry = $this->db
		->order_by("a.nombre")
		->get("empresa a");

		return $this->getCatalogo($qry, $args);
	}

	public function getSede($args=[])
	{

		if (isset($args['sede'])) {
			$this->db->where('sede', $args['sede']);
		}

		if (isset($args['empresa'])) {
			$this->db->where('empresa', $args['empresa']);
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

		if (isset($args['codigo'])) {
			$this->db->where('codigo', $args['codigo']);	
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

	public function getComandaOrigenEndpoint($args = []) {
		if (isset($args['comanda_origen'])) {
			$this->db->where('comanda_origen', $args['comanda_origen']);
		}

		if (isset($args['tipo_endpoint'])) {
			$this->db->where('tipo_endpoint', $args['tipo_endpoint']);
		}

		$qry = $this->db
		->order_by("comanda_origen_endpoint")
		->get("comanda_origen_endpoint");

		return $this->getCatalogo($qry, $args);
	}

	public function getDetalleConfigComandaOrigen($args = []) {
		if(count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
		->order_by("comanda_origen, configuracion_comanda_origen")
		->get("detalle_configuracion_comanda_origen");

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

	public function getCredenciales($args = [])
	{
		if (isset($args['dominio'])) {
			$this->db->where("dominio", $args['dominio']);
		}

		if (isset($args['llave'])) {
			$this->db->where("llave", $args['llave']);	
		}

		$tmp = $this->db
					->select("
						db_hostname,
						db_username,
						db_password,
						db_database")
					->from('cliente_corporacion')
					->get();
//return $this->getCatalogo($tmp, $args);
		if($tmp && $tmp->num_rows() > 0) {
			return $tmp->row();
		} 

		return false;
	}

	public function getJerarquia($args=[])
	{
		$qry = $this->db
		->get("jerarquia");

		return $this->getCatalogo($qry, $args);
	}

	public function getCajaCorteTipo($args=[])
	{
		$qry = $this->db
		// ->order_by("descripcion")
		->get("caja_corte_tipo");

		return $this->getCatalogo($qry, $args);
	}

	public function getCajaCorteNominacion($args=[])
	{
		$qry = $this->db
		->order_by('orden')
		->get("caja_corte_nominacion");

		return $this->getCatalogo($qry, $args);
	}

	public function notificacionesCliente()
	{
		$qry = $this->db
            ->where("DATE(NOW()) >= a.mostrar_del")
            ->where("DATE(NOW()) <= a.mostrar_al")
			->order_by("prioridad DESC, mostrar_del ASC")
			->get("administracion.notificacion_cliente a");

		return $this->getCatalogo($qry, []);
	}
}

/* End of file Catalogo_model.php */
/* Location: ./application/admin/models/Catalogo_model.php */