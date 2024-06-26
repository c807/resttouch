<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Catalogo_model extends CI_Model
{

	private function getCatalogo($datos, $args)
	{
		return isset($args['_uno']) ? $datos->row() : $datos->result();
	}

	public function getFormaPago($args = [])
	{
		if (isset($args['forma_pago'])) {
			$this->db->where('forma_pago', $args['forma_pago']);
		} else {
			$this->db->where('activo', 1);
		}

		if (isset($args['descuento'])) {
			$this->db->where('descuento', $args['descuento']);
		}

		if (isset($args['esefectivo'])) {
			$this->db->where('esefectivo', $args['esefectivo']);
		}

		$qry = $this->db->order_by('descripcion')->get('forma_pago');

		return $this->getCatalogo($qry, $args);
	}

	public function getSerieFactura($args = [])
	{
		if (isset($args['factura_serie'])) {
			$this->db->where('factura_serie', $args['factura_serie']);
		} else {
			$this->db->where('activo', 1);
		}

		$qry = $this->db
			->order_by('serie')
			->get('factura_serie');

		return $this->getCatalogo($qry, $args);
	}

	public function getTipoMovimiento($args = [])
	{
		if (isset($args['tipo_movimiento'])) {
			$this->db->where('tipo_movimiento', $args['tipo_movimiento']);
		}

		if (isset($args['ingreso'])) {
			$this->db->where('ingreso', $args['ingreso']);
		}

		if (isset($args['egreso'])) {
			$this->db->where('egreso', $args['egreso']);
		}

		if (isset($args['requisicion']) && (int)$args['requisicion'] === 1) {
			$this->db->where('requisicion', $args['requisicion']);
		}

		$qry = $this->db
			->order_by('descripcion')
			->get('tipo_movimiento');

		return $this->getCatalogo($qry, $args);
	}

	public function getDocumentoTipo($args = [])
	{
		if (isset($args['documento_tipo'])) {
			$this->db->where('documento_tipo', $args['documento_tipo']);
		}

		$qry = $this->db
			//->order_by()
			->get('documento_tipo');

		return $this->getCatalogo($qry, $args);
	}

	public function getBodega($args = [])
	{
		if (count($args) > 0) {
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
			->order_by('descripcion')
			->get('bodega');

		return $this->getCatalogo($qry, $args);
	}

	public function getProveedor($args = [])
	{
		if (isset($args['proveedor'])) {
			$this->db->where('proveedor', $args['proveedor']);
		}

		$qry = $this->db
			->order_by('razon_social')
			->get('proveedor');

		return $this->getCatalogo($qry, $args);
	}

	public function obtenerReceta($articulo)
	{
		$this->load->model('Articulo_model');
		$datos = [];
		$tmp = $this->db
			->where('receta', $articulo)
			->where('anulado', 0)
			->get('articulo_detalle')
			->result();

		foreach ($tmp as $row) {
			$art = new Articulo_model($row->articulo);
			$art->receta = [];
			if ($art->multiple == 1) {
				$art->receta = $this->obtenerReceta($art->getPK());
			}

			$art->con_precio_extra = $row->precio_extra;
			$art->monto_extra = $row->precio;

			$datos[] = $art;
		}

		$datos = ordenar_array_objetos($datos, 'descripcion');
		return $datos;
	}

	public function getArticuloCombo($args = [])
	{
		$uno = false;

		if (isset($args['articulo'])) {
			$this->db->where('articulo', $args['articulo']);
			$uno = true;
		}

		if (isset($args['debaja'])) {
			$this->db->where('debaja', $args['debaja']);
		}

		$datos = [];

		$tmp = $this->db
			->get('articulo');

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

	public function getArticulo($args = [], $listaImpresoras = null, $listaPresentaciones = null)
	{
		$sede = isset($args['sede']) ? $args['sede'] : false;
		$bodega = isset($args['bodega']) ? $args['bodega'] : false;
		$ingreso = isset($args['ingreso']) ? $args['ingreso'] : false;
		$activos = isset($args['_activos']) ? true : false;
		$categoria = isset($args['categoria']) ? (int)$args['categoria'] : false;
		$sinPropina = isset($args['_sin_propina']);
		unset($args['ingreso']);
		unset($args['sede']);
		unset($args['bodega']);
		unset($args['_activos']);
		unset($args['categoria']);
		unset($args['_sin_propina']);
		
		if (!$listaImpresoras) {
			$this->load->model('Impresora_model');
			if ($sede) {
				$listaImpresoras = $this->Impresora_model->get_lista_impresoras(['sede' => $sede]);
			} else {
				$listaImpresoras = $this->Impresora_model->get_lista_impresoras();
			}
		}

		if(!$listaPresentaciones) {
			$this->load->model('Presentacion_model');
			$listaPresentaciones = $this->Presentacion_model->get_lista_presentaciones();
		}

		$campos = $this->get_campos_tabla('articulo', 'a.');

		if (count($args) > 0) {
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

		if ($bodega) {
			if (is_array($bodega)) {
				$this->db->where_in('b.bodega', $bodega);
			} else {
				$this->db->where('b.bodega', $bodega);
			}
		}

		if ($ingreso) {
			$this->db->where('a.mostrar_inventario', 1);
		}

		if (!$activos) {
			$this->db->where('a.debaja', 0);
		}

		if (isset($args['produccion']) && (int)$args['produccion'] === 1) {
			$this->db->join('articulo_detalle d', 'a.articulo = d.receta');
			$this->db->where('d.anulado', 0);
			$this->db->group_by('a.articulo');
		}

		if ($categoria) {
			$this->db->where('c.categoria', $categoria);
		}

		if ($sinPropina) {
			$this->db->not_like('TRIM(a.descripcion)', 'propin', 'after', NULL);
		}

		$qry = $this->db
			->select("{$campos}, c.sede, b.impresora AS impresora_subcategoria")
			->join('categoria_grupo b', 'a.categoria_grupo = b.categoria_grupo')
			->join('categoria c', 'c.categoria = b.categoria')
			->order_by('a.articulo')
			->get('articulo a');

		$tmp = $this->getCatalogo($qry, $args);

		if (is_array($tmp)) {
			$datos = [];
			foreach ($tmp as $row) {				
				$row->impresora = array_key_exists((int)$row->impresora_subcategoria, $listaImpresoras) ? $listaImpresoras[(int)$row->impresora_subcategoria] : null;				
				$row->presentacion = $listaPresentaciones[(int)$row->presentacion];

				$datos[] = $row;
			}
			$tmp = $datos;
		} else if ($tmp) {			
			$tmp->impresora = array_key_exists((int)$tmp->impresora_subcategoria, $listaImpresoras) ? $listaImpresoras[(int)$tmp->impresora_subcategoria] : null;					
			$tmp->presentacion = $listaPresentaciones[(int)$tmp->presentacion];
		}

		return ordenar_array_objetos($tmp, 'descripcion');
	}

	public function getUsuario($args = [])
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
			->order_by('nombres')
			->get('usuario');

		return $this->getCatalogo($qry, $args);
	}

	public function getCategoriaGrupo($args = [], $itemCategoria = null, $listaImpresoras = null, $listaPresentaciones = null)
	{
		// $raiz = isset($args['raiz']);
		$sede = isset($args['sede']) ? $args['sede'] : false;
		$todo = isset($args['_todo']);
		$mostrarDebaja = isset($args['_mostrar_debaja']);
		$sinPropina = isset($args['_sin_propina']);
		// unset($args['raiz']);
		unset($args['sede']);
		unset($args['_todo']);
		unset($args['_mostrar_debaja']);
		unset($args['_sin_propina']);

		
		if (!$listaImpresoras) {
			$this->load->model('Impresora_model');
			if ($sede) {
				$listaImpresoras = $this->Impresora_model->get_lista_impresoras(['sede' => $sede]);
			} else {
				$listaImpresoras = $this->Impresora_model->get_lista_impresoras();
			}
		}

		if (!$listaPresentaciones) {
			$this->load->model('Presentacion_model');
			$listaPresentaciones = $this->Presentacion_model->get_lista_presentaciones();
		}

		$campos = $this->get_campos_tabla('categoria_grupo', 'a.');

		if (count($args) > 0) {
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
			$buscarArt['mostrar_pos'] = '1';
		}

		if ($mostrarDebaja) {
			$buscarArt['_activos'] = true;
		}

		if ($sinPropina) {
			$buscarArt['_sin_propina'] = true;
		}

		$qry = $this->db
			// ->select('a.*')
			->select($campos)
			->join('categoria b', 'b.categoria = a.categoria')
			->order_by('categoria_grupo')
			->group_by('a.categoria_grupo')
			->get('categoria_grupo a');

		$grupo = $this->getCatalogo($qry, $args);

		$datos = [];
		if (is_array($grupo)) {
			foreach ($grupo as $row) {
				$row->categoria_grupo_grupo = [];
				// if ($raiz) {
				// 	$data = ['categoria_grupo' => $row->categoria_grupo_grupo, 'raiz' => true];

				// 	if ($todo) {
				// 		$data['_todo'] = true;
				// 	}
				// 	$row->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
				// } else {
				// 	$data = ['categoria_grupo_grupo' => $row->categoria_grupo];

				// 	if ($todo) {
				// 		$data['_todo'] = true;
				// 	}
				// 	$row->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
				// }

				$buscarArt['categoria_grupo'] = $row->categoria_grupo;

				// $row->articulo = $this->Catalogo_model->getArticulo($buscarArt, $listaImpresoras, $listaPresentaciones);
				$row->articulo = $this->getArticulo($buscarArt, $listaImpresoras, $listaPresentaciones);

				if ($itemCategoria) {
					$row->categoria = clone $itemCategoria;
				} else {
					$row->categoria = $this->Categoria_model->buscar(['categoria' => $row->categoria, '_uno' => true]);
				}

				$datos[] = $row;
			}
		} else if (is_object($grupo)) {
			$data = [];
			if ($todo) {
				$data['_todo'] = true;
			}
			$grupo->categoria_grupo_grupo = [];

			// if ($raiz) {
			// 	$data['categoria_grupo'] = $grupo->categoria_grupo_grupo;
			// 	$data['raiz'] = true;

			// 	$grupo->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
			// } else {
			// 	$data['categoria_grupo_grupo'] = $grupo->categoria_grupo;

			// 	$grupo->categoria_grupo_grupo = $this->getCategoriaGrupo($data);
			// }

			$buscarArt['categoria_grupo'] = $grupo->categoria_grupo;

			// $grupo->articulo = $this->Catalogo_model->getArticulo(['categoria_grupo' => $grupo->categoria_grupo], $listaImpresoras, $listaPresentaciones);
			$grupo->articulo = $this->getArticulo(['categoria_grupo' => $grupo->categoria_grupo], $listaImpresoras, $listaPresentaciones);

			if ($itemCategoria) {
				$grupo->categoria = clone $itemCategoria;
			} else {
				$grupo->categoria = $this->Categoria_model->buscar(['categoria' => $grupo->categoria, '_uno' => true]);
			}

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
			->order_by('a.nombre')
			->get('empresa a');

		return $this->getCatalogo($qry, $args);
	}

	public function getSede($args = [])
	{

		if (isset($args['sede'])) {
			$this->db->where('sede', $args['sede']);
		}

		if (isset($args['empresa'])) {
			$this->db->where('empresa', $args['empresa']);
		}

		if (isset($args['admin_llave'])) {
			$this->db
				->join('empresa b', 'a.empresa = b.empresa')
				->join('corporacion c', 'b.corporacion = c.corporacion')
				->where('c.admin_llave', $args['admin_llave']);
		}

		$qry = $this->db
			->select('a.*')
			->order_by('a.nombre')
			->get('sede a');

		return $this->getCatalogo($qry, $args);
	}

	public function getSedeForAPI($args = [])
	{

		if (isset($args['sede'])) {
			$this->db->where('sede', $args['sede']);
		}

		if (isset($args['empresa'])) {
			$this->db->where('empresa', $args['empresa']);
		}

		if (isset($args['admin_llave'])) {
			$this->db
				->join('empresa b', 'a.empresa = b.empresa')
				->join('corporacion c', 'b.corporacion = c.corporacion')
				->where('c.admin_llave', $args['admin_llave']);
		}

		$qry = $this->db
			->select('a.*')
			->order_by('a.sede')
			->get('sede a');

		return $this->getCatalogo($qry, $args);
	}

	public function getTipoUsuario($args = [])
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
			->order_by('descripcion')
			->get('usuario_tipo');

		return $this->getCatalogo($qry, $args);
	}

	public function getModulo($args = [])
	{
		if (isset($args['modulo'])) {
			$this->db->where('modulo', $args['modulo']);
		}

		$qry = $this->db
			->order_by('descripcion')
			->get('modulo');

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
			->order_by('moneda')
			->get('moneda');

		return $this->getCatalogo($qry, $args);
	}

	public function getFacturaSerie($args = [])
	{
		if (isset($args['factura_serie'])) {
			$this->db->where('factura_serie', $args['factura_serie']);
		}

		$qry = $this->db
			->select('
			factura_serie,
			serie,
			correlativo,
			tipo')
			->where('activo', 1)
			->order_by('factura_serie')
			->get('factura_serie');

		return $this->getCatalogo($qry, $args);
	}

	public function getCertificadorFel($args = [])
	{
		if (isset($args['certificador_fel'])) {
			$this->db->where('certificador_fel', $args['certificador_fel']);
		}

		$qry = $this->db
			->order_by('certificador_fel')
			->get('certificador_fel');

		return $this->getCatalogo($qry, $args);
	}

	public function getComandaOrigen($args = [])
	{
		if (isset($args['comanda_origen'])) {
			$this->db->where('comanda_origen', $args['comanda_origen']);
		}

		if (isset($args['descripcion'])) {
			$this->db->where('descripcion', $args['descripcion']);
		}

		$qry = $this->db
			->order_by('comanda_origen')
			->get('comanda_origen');

		return $this->getCatalogo($qry, $args);
	}

	public function getComandaOrigenEndpoint($args = [])
	{
		if (isset($args['comanda_origen'])) {
			$this->db->where('comanda_origen', $args['comanda_origen']);
		}

		if (isset($args['tipo_endpoint'])) {
			$this->db->where('tipo_endpoint', $args['tipo_endpoint']);
		}

		$qry = $this->db
			->order_by('comanda_origen_endpoint')
			->get('comanda_origen_endpoint');

		return $this->getCatalogo($qry, $args);
	}

	public function getDetalleConfigComandaOrigen($args = [])
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
			->order_by('comanda_origen, configuracion_comanda_origen')
			->get('detalle_configuracion_comanda_origen');

		return $this->getCatalogo($qry, $args);
	}

	public function getCorporacion($args = [])
	{
		if (count($args) > 0) {
			foreach ($args as $key => $row) {
				if ($key != '_uno') {
					$this->db->where($key, $row);
				}
			}
		}

		$qry = $this->db
			->order_by('corporacion')
			->get('corporacion');

		return $this->getCatalogo($qry, $args);
	}

	public function getCredenciales($args = [])
	{
		if (isset($args['dominio'])) {
			$this->db->where('dominio', $args['dominio']);
		}

		if (isset($args['llave'])) {
			$this->db->where('llave', $args['llave']);
		}

		if (isset($args['db_database'])) {
			$this->db->where('db_database', $args['db_database']);
		}

		$tmp = $this->db
			->select('db_hostname, db_username, db_password, db_database, bloqueado')
			->from('administracion.cliente_corporacion')
			->get();
		//return $this->getCatalogo($tmp, $args);
		if ($tmp && $tmp->num_rows() > 0) {
			return $tmp->row();
		}

		return false;
	}

	public function getJerarquia($args = [])
	{
		$qry = $this->db
			->get('jerarquia');

		return $this->getCatalogo($qry, $args);
	}

	public function getCajaCorteTipo($args = [])
	{
		if (isset($args['caja_corte_tipo'])) {
			$this->db->where('caja_corte_tipo', $args['caja_corte_tipo']);
		}

		$qry = $this->db
			->get('caja_corte_tipo');

		return $this->getCatalogo($qry, $args);
	}

	public function getCajaCorteNominacion($args = [])
	{
		$qry = $this->db
			->order_by('orden')
			->get('caja_corte_nominacion');

		return $this->getCatalogo($qry, $args);
	}

	public function notificacionesCliente($dominio = '', $todas = true)
	{
		if ($todas) {
			$this->db->where("(a.cliente_corporacion IS NULL OR TRIM(b.dominio) = '{$dominio}')");
		} else {
			$this->db->where("TRIM(b.dominio) = '{$dominio}'");
		}

		$qry = $this->db
			->select('a.notificacion_cliente, a.notificacion, a.mostrar_del, a.mostrar_al, a.prioridad, a.intensidad')
			->join('administracion.cliente_corporacion b', 'b.id = a.cliente_corporacion', 'left')
			->where('DATE(NOW()) >= a.mostrar_del')
			->where('DATE(NOW()) <= a.mostrar_al')			
			->order_by('a.prioridad DESC, a.mostrar_del ASC')
			->get('administracion.notificacion_cliente a');

		return $this->getCatalogo($qry, []);
	}

	public function get_fields_from_table($tabla, $cs = true)
	{
		$query = $this->db
			->select($cs ? 'GROUP_CONCAT(column_name ORDER BY ordinal_position SEPARATOR ",") AS campo' : 'column_name AS campo')
			->where('table_schema', $this->db->database)
			->where('table_name', $tabla)
			->order_by('ordinal_position')
			->get('information_schema.columns');

		return $this->getCatalogo($query, []);
	}

	public function get_contenido_combo($idarticulo)
	{
		$articulos = $this->db
			->select('b.articulo, b.presentacion, b.descripcion, b.precio, b.combo, b.multiple, b.cantidad_minima, b.cantidad_maxima, b.esreceta, a.cantidad, a.medida, a.precio AS precio_extra')
			->join('articulo b', 'b.articulo = a.articulo')
			->where('a.anulado', 0)
			->where('a.receta', $idarticulo)
			->order_by('b.multiple, b.descripcion')
			->get('articulo_detalle a')
			->result();

		foreach ($articulos as $art) {
			$art->opciones = [];
			if ((int)$art->multiple === 1) {
				$art->opciones = $this->get_contenido_combo($art->articulo);
			}
		}

		return $articulos;
	}

	// DEPRECATED 25/09/2023
	// private function get_campos_tabla($tabla, $prefijo = '')
	// {
	// 	$lista = $this->db
	// 		->select('GROUP_CONCAT(CONCAT("' . $prefijo . '", column_name) ORDER BY ordinal_position SEPARATOR ",") AS campos')
	// 		->where('table_schema', $this->db->database)
	// 		->where('table_name', $tabla)
	// 		->get('information_schema.columns')
	// 		->row();
	// 	return $lista ? $lista->campos : '';
	// }

	private function get_campos_tabla($tabla, $prefijo = '')
	{
		$database = $this->db->database;
		$isRtDatabase = (strcasecmp('administracion', $database) != 0 && strcasecmp(substr($database, 0, 3), 'rt_') == 0);

		if ($isRtDatabase) {
			$query = "SHOW COLUMNS FROM $database.$tabla";
			$columnas = $this->db->query($query)->result();
			$campos = [];

			foreach ($columnas as $col) {
				$campos[] = (object)['campo' => $col->Field];
			}

			$lista = implode(',', array_map(function ($valor) use ($prefijo) {
				return $prefijo . $valor->campo;
			}, $campos));
			return $lista;
		}

		return '';
	}

	private function loadImpresorasPorSubcategoria()
	{
		$campos = $this->get_campos_tabla('impresora', 'a.');
		return $this->db
			->select("{$campos}, b.categoria_grupo")
			->join('categoria_grupo b', 'a.impresora = b.impresora')
			->get('impresora a')
			->result();
	}

	private function loadPresentaciones()
	{
		$campos = $this->get_campos_tabla('presentacion');
		return $this->db->select($campos)->get('presentacion')->result();
	}

	private function loadSubcategorias()
	{
		$campos = $this->get_campos_tabla('categoria_grupo');
		return $this->db->select($campos)->get('categoria_grupo')->result();
	}

	private function buscarObjetoEnLista($lista, $campo, $valor)
	{
		foreach ($lista as $item) {
			if ((int)$item->{$campo} === (int)$valor) {
				return $item;
			}
		}
		return null;
	}

	public function getArticulo_v2($args = [])
	{
		$camposTablaArticulo = $this->get_campos_tabla('articulo', 'a.');
		$sede = isset($args['sede']) ? $args['sede'] : false;
		$ingreso = isset($args['ingreso']) ? $args['ingreso'] : false;
		$activos = isset($args['_activos']) ? true : false;
		unset($args['ingreso']);
		unset($args['sede']);
		unset($args['_activos']);
		if (count($args) > 0) {
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
			$this->db->where('a.mostrar_inventario', 1);
		}

		if (!$activos) {
			$this->db->where('a.debaja', 0);
		}

		if (isset($args['produccion']) && (int)$args['produccion'] === 1) {
			$this->db->join('articulo_detalle d', 'a.articulo = d.receta');
			$this->db->where('d.anulado', 0);
			$this->db->group_by('a.articulo');
		}

		$qry = $this->db
			// ->select('a.*, c.sede')
			->select("{$camposTablaArticulo}, c.sede")
			->join('categoria_grupo b', 'a.categoria_grupo = b.categoria_grupo')
			->join('categoria c', 'c.categoria = b.categoria')
			->order_by('a.articulo')
			->get('articulo a');

		$tmp = $this->getCatalogo($qry, $args);

		$listaImpresoras = $this->loadImpresorasPorSubcategoria();
		$listaPresentaciones = $this->loadPresentaciones();
		$listaSubcategorias = $this->loadSubcategorias();

		if (is_array($tmp)) {
			$datos = [];
			foreach ($tmp as $row) {
				$row->impresora = $this->buscarObjetoEnLista($listaImpresoras, 'categoria_grupo', $row->categoria_grupo);
				$row->presentacion = $this->buscarObjetoEnLista($listaPresentaciones, 'presentacion', $row->presentacion);
				$row->subcategoria = $this->buscarObjetoEnLista($listaSubcategorias, 'categoria_grupo', $row->categoria_grupo);
				$datos[] = $row;
			}
			$tmp = $datos;
		} else if ($tmp) {
			$tmp->impresora = $this->buscarObjetoEnLista($listaImpresoras, 'categoria_grupo', $tmp->categoria_grupo);
			$tmp->presentacion = $this->buscarObjetoEnLista($listaPresentaciones, 'presentacion', $tmp->presentacion);
			$tmp->subcategoria = $this->buscarObjetoEnLista($listaSubcategorias, 'categoria_grupo', $tmp->categoria_grupo);
		}

		return ordenar_array_objetos($tmp, 'descripcion');
	}
}

/* End of file Catalogo_model.php */
/* Location: ./application/admin/models/Catalogo_model.php */