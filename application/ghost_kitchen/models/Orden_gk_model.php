<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Orden_gk_model extends General_model
{

	public $orden_gk;
	public $corporacion;
	public $protocolo = null;
	public $host = null;
	public $ip = null;
	public $url_original = null;
	public $encabezados = null;
	public $comanda_origen;
	public $fhcreacion;
	public $numero_orden;
	public $estatus_orden_gk;
	public $raw_orden;
	public $orden_rt = null;

	public function __construct($id = "")
	{
		parent::__construct();
		$this->setTabla("orden_gk");
		if (!empty($id)) {
			$this->cargar($id);
		}
		$this->load->model([
			'Catalogo_model',
			'Vendor_tercero_model',
			'Sede_vendor_tercero_model',
			'Articulo_model',
			'Sede_model',
			'Articulo_vendor_tercero_model',
			'Forma_pago_comanda_origen_model'
		]);
	}

	public function get_ruta($configuracion)
	{
		$ruta = $this->Catalogo_model->getDetalleConfigComandaOrigen([
			'configuracion_comanda_origen' => $configuracion,
			'comanda_origen' => $this->comanda_origen,
			'_uno' => true
		]);

		if ($ruta) {
			return $ruta->ruta;
		}

		return null;
	}

	public function get_orden_rt()
	{
		$ordenrt = new stdClass();
		$ordenrt->numero_orden = $this->numero_orden;
		$ordenrt->total_orden = 0.00;
		$ordenrt->total_descuento = 0.00;
		$ordenrt->comanda_origen = $this->comanda_origen;
		$ordenrt->total_propina = 0.00;
		$orden_original = json_decode($this->raw_orden);
		$ordenrt->completa = true;
		$ordenrt->pendiente = '';

		$rutasEntrega = [
			'nombre' => $this->get_ruta(9),
			'direccion1' => $this->get_ruta(10),
			'direccion2' => $this->get_ruta(11),
			'pais' => $this->get_ruta(12),
			'departamento' => $this->get_ruta(13),
			'municipio' => $this->get_ruta(14),
			'telefono' => $this->get_ruta(15),
			'email' => $this->get_ruta(16)
		];

		$ordenrt->datos_entrega = new stdClass();
		$ordenrt->datos_entrega->nombre = $rutasEntrega['nombre'] ? get_dato_from_paths($orden_original, $rutasEntrega['nombre']) : null;
		$ordenrt->datos_entrega->direccion1 = $rutasEntrega['direccion1'] ? get_dato_from_paths($orden_original, $rutasEntrega['direccion1']) : null;
		$ordenrt->datos_entrega->direccion2 = $rutasEntrega['direccion2'] ? get_dato_from_paths($orden_original, $rutasEntrega['direccion2']) : null;
		$ordenrt->datos_entrega->pais = $rutasEntrega['pais'] ? get_dato_from_paths($orden_original, $rutasEntrega['pais']) : null;
		$ordenrt->datos_entrega->departamento = $rutasEntrega['departamento'] ? get_dato_from_paths($orden_original, $rutasEntrega['departamento']) : null;
		$ordenrt->datos_entrega->municipio = $rutasEntrega['municipio'] ? get_dato_from_paths($orden_original, $rutasEntrega['municipio']) : null;
		$ordenrt->datos_entrega->telefono = $rutasEntrega['telefono'] ? get_dato_from_paths($orden_original, $rutasEntrega['telefono']) : null;
		$ordenrt->datos_entrega->telefono = !empty($ordenrt->datos_entrega->telefono) ? $ordenrt->datos_entrega->telefono : '';
		$ordenrt->datos_entrega->email = $rutasEntrega['email'] ? get_dato_from_paths($orden_original, $rutasEntrega['email']) : null;
		$ordenrt->datos_entrega->email = !empty($ordenrt->datos_entrega->email) ? $ordenrt->datos_entrega->email : '';

		$rutasFacturacion = [
			'nit' => $this->get_ruta(17),
			'nombre' => $this->get_ruta(18),
			'direccion' => $this->get_ruta(19),
			'email' => $this->get_ruta(20)
		];

		$rutaFormasDePago = $this->get_ruta(21);
		$ordenrt->formas_pago = [];
		if ($rutaFormasDePago) {
			$formasDePago = get_dato_from_paths($orden_original, $rutaFormasDePago);
			if ($formasDePago) {
				if (is_array($formasDePago)) {
					foreach ($formasDePago as $fdp) {
						$fp = $this->Forma_pago_comanda_origen_model->buscar_agregar(['comanda_origen' => $ordenrt->comanda_origen, 'codigo' => trim($fdp), '_uno' => true]);
						if ($fp && $fp->forma_pago) {
							$ordenrt->formas_pago[] = $fp->forma_pago;
						}
					}
				} else if (is_string($formasDePago)) {
					$fp = $this->Forma_pago_comanda_origen_model->buscar_agregar(['comanda_origen' => $ordenrt->comanda_origen, 'codigo' => trim($formasDePago), '_uno' => true]);
					if ($fp && $fp->forma_pago) {
						$ordenrt->formas_pago[] = $fp->forma_pago;
					}
				}
			}
		}

		if (count($ordenrt->formas_pago) === 0) {
			$ordenrt->completa = false;
			if (trim($ordenrt->pendiente) !== '') {
				$ordenrt->pendiente .= ' ';
			}
			$ordenrt->pendiente .= 'RT no encontró una forma de pago que corresponda al origen de la orden.';
		}

		$ordenrt->datos_factura = new stdClass();
		$ordenrt->datos_factura->nit = $rutasFacturacion['nit'] ? get_dato_from_paths($orden_original, $rutasFacturacion['nit']) : 'CF';
		if (!$ordenrt->datos_factura->nit) {
			$ordenrt->datos_factura->nit = 'CF';
		} else {
			$ordenrt->datos_factura->nit = strtoupper(preg_replace("/[^0-9KkCcFf?!]/", '', $ordenrt->datos_factura->nit));
		}


		$ordenrt->datos_factura->nombre = $rutasFacturacion['nombre'] ? get_dato_from_paths($orden_original, $rutasFacturacion['nombre']) : 'Consumidor Final';
		if (!$ordenrt->datos_factura->nombre) {
			$ordenrt->datos_factura->nombre = 'Consumidor Final';
		}
		$ordenrt->datos_factura->direccion = $rutasFacturacion['direccion'] ? get_dato_from_paths($orden_original, $rutasFacturacion['direccion']) : 'Ciudad';
		if (!$ordenrt->datos_factura->direccion) {
			$ordenrt->datos_factura->direccion = 'Ciudad';
		}
		$ordenrt->datos_factura->email = $rutasFacturacion['email'] ? get_dato_from_paths($orden_original, $rutasFacturacion['email']) : null;

		$descripcionesPropina = $this->get_ruta(30);
		if (!$descripcionesPropina || strlen(trim($descripcionesPropina)) == 0)
		{
			$descripcionesPropina = 'tip,propina';
		}

		$ordenrt->articulos = [];
		$rutaArticulos = $this->get_ruta(2);
		if ($rutaArticulos) {
			$listaArticulos = get_dato_from_paths($orden_original, $rutaArticulos);
			if ($listaArticulos) {
				$rutas = [
					'id_tercero' => $this->get_ruta(3),
					'descripcion' => $this->get_ruta(4),
					'vendor' => $this->get_ruta(5),
					'precio' => $this->get_ruta(6),
					'cantidad' => $this->get_ruta(7),
					'descuento' => $this->get_ruta(8),
					'id_padre_tercero' => $this->get_ruta(22)
				];
				$rutas = (object)$rutas;
				$sedesNoEncontradas = [];
				foreach ($listaArticulos as $art) {
					$descripcionArticulo = $rutas->descripcion ? get_dato_from_paths($art, $rutas->descripcion) : '';
					$pos = stripos($descripcionesPropina, $descripcionArticulo);
					if($pos === false)
					{
						$obj = new stdClass();
						$nombreVendor = $rutas->vendor ? get_dato_from_paths($art, $rutas->vendor) : null;
						$vendor = null;
						$sede = null;
						$obj->id_tercero = $rutas->id_tercero ? get_dato_from_paths($art, $rutas->id_tercero) : null;
						$obj->id_padre_tercero = $rutas->id_padre_tercero ? get_dato_from_paths($art, $rutas->id_padre_tercero) : null;
	
						if ($nombreVendor) {
							$vendor = $this->Vendor_tercero_model->buscar_agregar($nombreVendor, $this->comanda_origen);
							if ($vendor) {
								$svt = $this->Sede_vendor_tercero_model->full_search(['vendor_tercero' => $vendor->vendor_tercero, '_uno' => true]);
								if ($svt) {
									$sede = $svt->sede;
									if (!empty($obj->id_tercero)) {
										$this->Articulo_vendor_tercero_model->get_articulo_vendor($vendor->vendor_tercero, $obj->id_tercero);
									}
								} else if (!empty($obj->id_tercero)) {
									$idArticulo = $this->Articulo_vendor_tercero_model->get_articulo_vendor($vendor->vendor_tercero, $obj->id_tercero);
									$sede_articulo = $idArticulo > 0 ? $this->Articulo_model->get_sede_articulo(['articulo' => $idArticulo]) : null;
	
									if ($sede_articulo) {
										$nsvt = new Sede_vendor_tercero_model();
										$nsvt->sede = $sede_articulo->sede;
										$nsvt->vendor_tercero = $vendor->vendor_tercero;
										$nsvt->guardar();
										$sede = $this->Sede_model->buscar(['sede' => $sede_articulo->sede, '_uno' => true]);
									}
								}
							}
						}
	
						if (!$sede) {
							$nombreVendor = !empty($nombreVendor) ? trim($nombreVendor) : 'Artículo sin vendor';
							if (!in_array($nombreVendor, $sedesNoEncontradas)) {
								$sedesNoEncontradas[] = $nombreVendor;
							}
						}
	
						$obj->descripcion = !empty(trim($descripcionArticulo)) ? trim($descripcionArticulo) : null;
						$obj->vendor = $vendor;
						$obj->atiende = $sede;
						$obj->precio = $rutas->precio ? get_dato_from_paths($art, $rutas->precio) : null;
						$obj->cantidad = $rutas->cantidad ? get_dato_from_paths($art, $rutas->cantidad) : null;
						$obj->descuento = $rutas->descuento ? get_dato_from_paths($art, $rutas->descuento) : 0.00;
						$obj->total = 0.00;
	
						if ($obj->precio && $obj->cantidad) {
							$obj->total = (float)$obj->precio * (float)$obj->cantidad;
							if ($obj->descuento) {
								$obj->total -= (float)$obj->descuento;
							}
						}
	
						if ($obj->descuento && (float)$obj->descuento > 0) {
							$ordenrt->total_descuento += (float)$obj->descuento;
						}
	
						$ordenrt->total_orden += $obj->total;
	
						$ordenrt->articulos[] = $obj;
						$obj = null;
					} else {
						$montoPropina = $rutas->precio ? get_dato_from_paths($art, $rutas->precio) : 0.00;
						$ordenrt->total_propina += (float)$montoPropina;
					}					
				}

				if (count($sedesNoEncontradas) > 0) {
					$ordenrt->completa = false;
					if (trim($ordenrt->pendiente) !== '') {
						$ordenrt->pendiente .= ' ';
					}
					$ordenrt->pendiente .= 'Rest-Touch Pro no encontró una sede que corresponda a: '.implode(', ', $sedesNoEncontradas).'.';
				}
			}
		}

		return $ordenrt;
	}

	public function actualiza_estatus($estatus, $orden_gk = null)
	{
		if (!$orden_gk)
		{
			$orden_gk = $this->getPK();
		}

		$cantidadSedes = $this->db->select('COUNT(DISTINCT(sede)) AS cantidad')->from('estatus_orden_gk_sede')->where('orden_gk', $orden_gk)->get()->row();
		$cantidadSedesEstatus = $this->db->select('COUNT(DISTINCT(sede)) AS cantidad')->from('estatus_orden_gk_sede')->where('orden_gk', $orden_gk)->where('estatus_orden_gk', $estatus)->get()->row();

		if((int)$cantidadSedes->cantidad === (int)$cantidadSedesEstatus->cantidad)
		{
			$ord = new Orden_gk_model($orden_gk);
			$ord->guardar(['estatus_orden_gk' => $estatus]);
			return (int)$estatus;
		}
		return null;
	}

	public function get_distinct_sedes($articulos = [])
    {
        $sedes = [];
        foreach ($articulos as $art) {
            if (!in_array($art->atiende, $sedes)) {
                $sedes[] = $art->atiende;
            }
        }
        return $sedes;
    }
}
