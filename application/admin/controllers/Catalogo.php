<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Catalogo extends CI_Controller {

	private $php_self = '';

	public function __construct()
	{
		parent::__construct();
		$this->php_self = $_SERVER['PHP_SELF'];
		$this->load->model([
			'Catalogo_model',
			'Cgrupo_model',
			'Bitacora_model'
		]);
		$headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']); 
		$this->output->set_content_type("application/json", "UTF-8");
	}

	public function index()
	{
		die("Forbidden");
	}

	public function get_forma_pago()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getFormaPago($_GET)));
	}

	public function get_serie_factura()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getSerieFactura($_GET)));
	}

	public function get_tipo_movimiento()
	{
		$this->output->set_output(json_encode($this->Catalogo_model->getTipoMovimiento($_GET)));
	}

	public function get_documento_tipo()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getDocumentoTipo($_GET)));
	}

	public function get_bodega()
	{
		$todas = false;
		if (!$this->input->get('sede') && !$this->input->get('_todas')) {
			$_GET['sede'] = $this->data->sede;
		}
		
		if ($this->input->get('_todas')) {
			unset($_GET['_todas']);
			$todas = true;
		}

		$lasBodegas = $this->Catalogo_model->getBodega($_GET);

		if ($todas) {
			foreach($lasBodegas as $bodega) {
				$bodega->datos_sede = $this->Catalogo_model->getSede(['sede' => $bodega->sede, '_uno' => true]);
				$bodega->order_by = "{$bodega->datos_sede->nombre}-{$bodega->descripcion}";
				$usuarioBaja = $bodega->usuariodebaja ? $this->Catalogo_model->getUsuario(['usuario' => $bodega->usuariodebaja, '_uno' => true]) : null;
				$bodega->usrnamebaja = $usuarioBaja ? trim("{$usuarioBaja->nombres} {$usuarioBaja->apellidos}") : null;
			}
			$lasBodegas = ordenar_array_objetos($lasBodegas, 'order_by');
		} else {
			foreach($lasBodegas as $bodega) {				
				$usuarioBaja = $bodega->usuariodebaja ? $this->Catalogo_model->getUsuario(['usuario' => $bodega->usuariodebaja, '_uno' => true]) : null;
				$bodega->usrnamebaja = $usuarioBaja ? trim("{$usuarioBaja->nombres} {$usuarioBaja->apellidos}") : null;
			}			
		}

		$this->output->set_output(json_encode($lasBodegas));
	}

	public function get_proveedor()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getProveedor($_GET)));
	}	

	public function get_articulo()
	{
		$this->Bitacora_model->log_to_file(Hoy(5).",{$this->data->dominio},".$this->php_self.','.get_mem_usage().',inicio');
		set_time_limit(0);
		ini_set('memory_limit', '-1');
		$_GET['sede'] = $this->data->sede;
		// $datos = ordenar_array_objetos($this->Catalogo_model->getArticulo($_GET), 'descripcion');
		$datos = $this->Catalogo_model->getArticulo($_GET);

		if (is_array($datos)) {
			foreach($datos as $d) {
				$d->subcategoria = $this->Cgrupo_model->buscar(['categoria_grupo' => $d->categoria_grupo, '_uno' => true]);
			}
		} else {
			$datos->subcategoria = $this->Cgrupo_model->buscar(['categoria_grupo' => $datos->categoria_grupo, '_uno' => true]);
		}

		$this->Bitacora_model->log_to_file(Hoy(5).",{$this->data->dominio},".$this->php_self.','.get_mem_usage().',fin');
		$this->output->set_output(json_encode($datos));
	}

	public function get_articulo_ingreso()
	{
		$this->Bitacora_model->log_to_file(Hoy(5).",{$this->data->dominio},".$this->php_self.','.get_mem_usage().',inicio');
		if (!$this->input->get('sede')) {
			$_GET['sede'] = $this->data->sede;
		}
		// $_GET['sede'] = $this->data->sede;
		$_GET['ingreso'] = true;
		$datos = $this->Catalogo_model->getArticulo($_GET);

		$this->Bitacora_model->log_to_file(Hoy(5).",{$this->data->dominio},".$this->php_self.','.get_mem_usage().',fin');
		$this->output->set_output(json_encode($datos));
	}

	public function get_articulo_combo()
	{
		$_GET['sede'] = $this->data->sede;
		$this->output->set_output(json_encode($this->Catalogo_model->getArticuloCombo($_GET)));
	}

	public function get_usuario()
	{
		$_GET['sede'] = $this->data->sede;
		$this->output
		->set_output(json_encode($this->Catalogo_model->getUsuario($_GET)));
	}

	public function get_sede()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getSede($_GET)));
	}

	public function get_tipo_usuario()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getTipoUsuario($_GET)));
	}

	public function get_lista_articulo($sede)
	{
		$this->Bitacora_model->log_to_file(Hoy(5).",{$this->data->dominio},".$this->php_self.','.get_mem_usage().',inicio');

		$this->load->model('Categoria_model');
		$_GET['sede'] = $sede;

		if (!isset($_GET['_activos'])) { $_GET['debaja'] = 0; }

		$cat = $this->Categoria_model->buscar($_GET);		
		$datos = [];
		foreach ($cat as $row) {
			$data = [
				"categoria" => $row->categoria,
				"categoria_grupo_grupo" => null	
			];
			if (isset($_GET["_todo"])) {
				$data['_todo'] = true;
			}

			if (!isset($_GET['_activos'])) { $data['debaja'] = 0; }

			$grupo = $this->Catalogo_model->getCategoriaGrupo($data);
			$row->categoria_grupo = $grupo;

			$datos[] = $row;
		}

		$this->Bitacora_model->log_to_file(Hoy(5).",{$this->data->dominio},".$this->php_self.','.get_mem_usage().',fin');

		$this->output->set_output(json_encode($datos));
	}

	public function get_modulo()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getModulo($_GET)));
	}

	public function get_sub_modulo($modulo)
	{		
		$menu = $this->config->item("menu");
		$datos = $menu[$modulo]['submodulo'];

		$this->output
		->set_output(json_encode($datos));
	}

	public function get_opcion($modulo, $submodulo)
	{
		$menu = $this->config->item("menu");
		$datos = [];
		if (isset($menu[$modulo]) && isset($menu[$modulo]['submodulo'][$submodulo])) {
			$datos = $menu[$modulo]['submodulo'][$submodulo]['opciones'];	
		}
		
		$this->output->set_output(json_encode($datos));
	}

	public function get_moneda()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getMoneda($_GET)));
	}

	public function get_factura_serie()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getFacturaSerie($_GET)));
	}

	public function get_mesero()
	{
		$this->load->model(['Turno_model', 'Usuario_model']);
		$datos = [];
		
		$tmp = $this->Turno_model->getTurno([
			"sede" => $this->data->sede,
			'abierto' => true, 
			"_uno" => true
		]);
		
		if ($tmp) {
			$turno = new Turno_model($tmp->turno);

			foreach ($turno->getUsuarios() as $key => $value) {
				if (strtolower(trim($value->usuario_tipo->descripcion)) == 'mesero') {
					$datos[] = $value;
				}
			}
		}

		$this->output
		->set_output(json_encode($datos));
	}

	public function get_jerarquia()
	{
		$this->output
		->set_output(json_encode($this->Catalogo_model->getJerarquia($_GET)));
	}

	public function get_campos()
	{
		$campo = $this->config->item("campos");
		$datos = [];
		if (empty($_GET)) {
			$datos = $campo;
		} else {
			foreach ($campo as $row) {
				if (isset($_GET['por_fecha']) && $row['por_fecha'] == 1) {
					$datos[] = $row;
				} else if(isset($_GET['ordenar_por']) && $row['ordenar_por'] == 1){
					$datos[] = $row;
				}
			}
		}

		$this->output
			 ->set_output(json_encode($datos));
	}

	public function get_caja_corte_tipo()
	{
		$this->output
		->set_output(json_encode(
			$this->Catalogo_model->getCajaCorteTipo($_GET)
		));
	}

	public function get_caja_corte_nominacion()
	{
		$this->output->set_output(json_encode(
			$this->Catalogo_model->getCajaCorteNominacion($_GET)
		));
	}

	public function test()
	{
		$this->load->model('Receta_model');
		$this->load->model('Articulo_model');

		$art = new Articulo_model(5124);
		$art->actualizarExistencia();
		echo "<pre>";
		print_r ($art);
		echo "</pre>";
	}

	public function get_notificaciones_cliente()
	{
		$this->output->set_output(json_encode($this->Catalogo_model->notificacionesCliente()));		
	}

	public function get_comanda_origen()
	{
		$datos = $this->Catalogo_model->getComandaOrigen($_GET);
		$datos = ordenar_array_objetos($datos, 'descripcion');
		$this->output->set_output(json_encode($datos));
	}

	public function get_contenido_combo($idarticulo)
	{
		$datos = $this->Catalogo_model->get_contenido_combo($idarticulo);
		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Catalogo.php */
/* Location: ./application/admin/controllers/Catalogo.php */