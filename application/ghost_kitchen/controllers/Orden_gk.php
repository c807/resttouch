<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Orden_gk extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Catalogo_model',
            'Orden_gk_model',
            'Estatus_orden_gk_model',
            'Usuario_model',
            'Bitacora_model',
            'Accion_model',
            'Turno_model',
            'Articulo_model',
            'Articulo_vendor_tercero_model',
            'Comanda_model',
            'Cuenta_model',
            'Dcomanda_model',
            'Dcuenta_model',
            'Receta_model',
            'Cliente_model',
            'Factura_model',
            'Dfactura_model',
            'Configuracion_model',
            'Fpago_model',
            'Estatus_orden_gk_sede_model',
            'Categoria_model',
            'Cgrupo_model',
            'Bodega_model',
            'Impresora_model'
        ]);

        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);

        $this->output->set_content_type("application/json", "UTF-8");
    }

    private function getOrdenesGk($args = [])
    {

        if(!isset($args['orden_gk']) && !isset($args['estatus_orden_gk']))
        {
            $args['_not_in'] = [
                'estatus_orden_gk' => [2, 6]
            ];
        }

        $datos = $this->Orden_gk_model->buscar($args);
        if (is_array($datos)) {
            foreach ($datos as $d) {
                $d->corporacion = $this->Catalogo_model->getCorporacion(['corporacion' => $d->corporacion, '_uno' => true]);
                $d->comanda_origen = $this->Catalogo_model->getComandaOrigen(['comanda_origen' => $d->comanda_origen, '_uno' => true]);
                $d->estatus_orden_gk = $this->Estatus_orden_gk_model->buscar(['estatus_orden_gk' => $d->estatus_orden_gk, '_uno' => true]);
                $d->orden_rt = json_decode($d->orden_rt);
                unset($d->raw_orden);
            }
        } else {
            if ($datos) {
                $datos->corporacion = $this->Catalogo_model->getCorporacion(['corporacion' => $datos->corporacion, '_uno' => true]);
                $datos->comanda_origen = $this->Catalogo_model->getComandaOrigen(['comanda_origen' => $datos->comanda_origen, '_uno' => true]);
                $datos->estatus_orden_gk = $this->Estatus_orden_gk_model->buscar(['estatus_orden_gk' => $datos->estatus_orden_gk, '_uno' => true]);
                $datos->orden_rt = json_decode($datos->orden_rt);
                unset($datos->raw_orden);
            }
        }
        return $datos;
    }

    public function seguimiento()
    {        
        $this->output->set_output(json_encode($this->getOrdenesGk($_GET)));
    }

    public function anular_orden_gk()
    {
        $datos = new stdClass();
        $datos->exito = false;

        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'));
            $bitComanda = new Bitacora_model();
            $usuario = new Usuario_model($this->data->idusuario);
            $accion = $this->Accion_model->buscar(["descripcion" => "Modificacion", "_uno" => true]);
            $ordenGk = new Orden_gk_model($req->orden_gk);
            $ordenGk->guardar(['estatus_orden_gk' => 2]);

            $comentario = "Anulación: El usuario {$usuario->nombres} {$usuario->apellidos} anuló la orden {$ordenGk->numero_orden} de {$req->origen}. Motivo: {$req->comentario}";

            $bitComanda->guardar([
                "accion" => $accion->accion,
                "usuario" => $this->data->idusuario,
                "tabla" => "orden_gk",
                "registro" => $req->orden_gk,
                "comentario" => $comentario
            ]);

            $datos->exito = true;
            $datos->mensaje = 'Orden anulada con éxito.';
            $datos->estatus_orden_gk = $this->Estatus_orden_gk_model->buscar(['estatus_orden_gk' => 2, '_uno' => true]);
        } else {
            $datos->mensaje = 'El método de llamada no es válido.';
        }
        $this->output->set_output(json_encode($datos));
    }

    private function get_distinct_sedes($articulos = [])
    {
        $sedes = [];
        foreach ($articulos as $art) {
            if (!in_array($art->atiende, $sedes)) {
                $sedes[] = $art->atiende;
            }
        }
        return $sedes;
    }

    private function get_turnos_sedes($sedes)
    {
        $datos = new stdClass();
        $datos->faltantes = '';
        $datos->exito = true;
        foreach ($sedes as $sede) {
            $turno = $this->Turno_model->getTurno(['sede' => $sede->sede, 'abierto' => true, '_uno' => true]);
            if ($turno) {
                $sede->turno = $turno;
            } else {
                $datos->exito = false;
                if ($datos->faltantes !== '') {
                    $datos->faltantes .= ', ';
                }
                $datos->faltantes .= $sede->nombre;
            }
        }
        $datos->sedes = $sedes;
        return $datos;
    }

    private function get_meseros_turnos($sedes)
    {
        $datos = new stdClass();
        $datos->faltantes = '';
        $datos->exito = true;

        foreach ($sedes as $sede) {
            $tmp = new Turno_model($sede->turno->turno);
            $usrs_turno = $tmp->getUsuarios();
            $found = false;
            foreach ($usrs_turno as $usr) {
                if (strtolower(trim($usr->usuario_tipo->descripcion)) == 'mesero') {
                    $sede->turno->mesero = $usr;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $datos->exito = false;
                if ($datos->faltantes !== '') {
                    $datos->faltantes .= ', ';
                }
                $datos->faltantes .= $sede->nombre;
            }
        }
        $datos->sedes = $sedes;
        return $datos;
    }

    private function get_fpago_descuento()
    {
        $fp_descuento = $this->Fpago_model->buscar([
            'UPPER(TRIM(descripcion))' => 'DESCUENTO',
            'activo' => 1,
            'descuento' => 1,
            '_uno' => true
        ]);

        if (!$fp_descuento) {
            $fp_descuento = new Factura_model();
            $fp_descuento->descripcion = 'Descuento';
            $fp_descuento->activo = 1;
            $fp_descuento->descuento = 1;
            $fp_descuento->pedirautorizacion = 1;
            $fp_descuento->guardar();
        }

        return $fp_descuento;
    }

    private function buscar_agregar_cliente($datosCliente)
    {
        $conf_corpo = $this->Configuracion_model->buscar();
        $cliente = $this->Cliente_model->buscar(['TRIM(nit)' => $datosCliente->nit, '_uno' => true]);
        if ($cliente) {
            if (strtoupper(trim($cliente->nit)) !== 'CF' || get_configuracion($conf_corpo, 'RT_ACTUALIZA_CORREO_CF', 3)) {
                $encontrado = new Cliente_model($cliente->cliente);
                $encontrado->guardar([
                    'direccion' => $datosCliente->direccion,
                    'correo' => $datosCliente->email
                ]);
                $cliente = $encontrado;
            }
        } else {
            $cliente = new Cliente_model();
            $cliente->nit = $datosCliente->nit;
            $cliente->nombre = $datosCliente->nombre;
            $cliente->direccion = $datosCliente->direccion;
            $cliente->correo = $datosCliente->email;
            $cliente->guardar();
        }

        return $cliente;
    }

    private function genera_factura_comanda($sede, $ordenrt, $cuenta, $descuentoArticulo)
    {
        $cliente = $this->buscar_agregar_cliente($ordenrt->datos_factura);

        $facturaHeader = [
            'usuario' => $sede->turno->mesero->usuario->usuario,
            'factura_serie' => 1,
            'sede' => $sede->sede,
            'certificador_fel' => $sede->certificador_fel,
            'cliente' => $cliente->cliente,
            'fecha_factura' => date('Y-m-d'),
            'moneda' => 1,
            'correo_receptor' => filter_var($ordenrt->datos_factura->email, FILTER_VALIDATE_EMAIL) ? $ordenrt->datos_factura->email : null,
        ];

        $factura = new Factura_model();
        $factura->guardar($facturaHeader);
        $factura->cargarEmpresa();
        $pimpuesto = $factura->empresa->porcentaje_iva + 1;
        foreach ($cuenta->getDetalle() as $det) {
            $det->bien_servicio = $det->articulo->bien_servicio;
            $det->articulo = $det->articulo->articulo;
            $det->total_ext = $det->total;

            if (count($descuentoArticulo) > 0) {
                $det->descuento = 0;
                $det->descuento_ext = 0;
                foreach ($descuentoArticulo as $desc) {
                    if ($det->detalle_comanda == $desc["detalle"]) {
                        $det->descuento += $desc["descuento"];
                        $det->descuento_ext += $desc["descuento"];
                    }
                }
            } else {
                $det->descuento = 0;
                $det->descuento_ext = 0;
            }

            $det->precio_unitario = $det->precio;
            $det->precio_unitario_ext = $det->precio;
            $total = $det->total - $det->descuento;
            $total_ext = $det->total_ext - $det->descuento_ext;
            if ($factura->exenta) {
                $det->monto_base = $total;
                $det->monto_base_ext = $total_ext;
            } else {
                $det->monto_base = $total / $pimpuesto;
                $det->monto_base_ext = $total_ext / $pimpuesto;
            }

            $det->monto_iva = $total - $det->monto_base;
            $det->monto_iva_ext = $total_ext - $det->monto_base_ext;
            $factura->setDetalle((array) $det);
        }
    }

    private function agregar_articulo_tercero($ordenrt, $articulo, $reemplazos = [])
    {
        $idArticulo = 0;
        $endpoint = $this->Catalogo_model->getComandaOrigenEndpoint(['comanda_origen' => $ordenrt->comanda_origen, 'tipo_endpoint' => 1, '_uno' => true]);
        if($endpoint && $endpoint->verbo && $endpoint->endpoint && $articulo->atiende && isset($articulo->atiende->sede))
        {
            $url = $endpoint->endpoint;
            foreach($reemplazos as $key => $value)
            {                
                $url = str_replace(('{{'.$key.'}}'), $value, $url);
            }

            if (strtoupper(trim($endpoint->verbo)) === 'GET')
            {
                $respuesta = json_decode(get_request($url));
                if ($respuesta)
                {
                    $sede = $articulo->atiende;
                    $ordenGk = new Orden_gk_model($ordenrt->orden_gk);

                    $rutasArticulo = [
                        'categoria' => $ordenGk->get_ruta(23),
                        'subcategoria' => $ordenGk->get_ruta(24),
                        'descripcion_producto' => $ordenGk->get_ruta(25),
                        'variantes' => $ordenGk->get_ruta(26),
                        'id_variante' => $ordenGk->get_ruta(27),
                        'descripcion_variante' => $ordenGk->get_ruta(28),
                        'precio_variante' => $ordenGk->get_ruta(29)
                    ];
                    $infoArticulo = [];
                    foreach($rutasArticulo as $key => $value)
                    {
                        if (!in_array($key, array('id_variante', 'descripcion_variante', 'precio_variante')))
                        {
                            $infoArticulo[$key] = $value ? get_dato_from_paths($respuesta, $value) : null;
                        }
                    }

                    if ($infoArticulo['variantes'] && count($infoArticulo['variantes']) > 0)
                    {
                        foreach($infoArticulo['variantes'] as $variante)
                        {
                            $idVariante = $rutasArticulo['id_variante'] ? get_dato_from_paths($variante, $rutasArticulo['id_variante']) : null;
                            if ($idVariante && trim($idVariante) === trim($articulo->id_tercero))
                            {
                                $infoArticulo['descripcion_variante'] = $rutasArticulo['descripcion_variante'] ? get_dato_from_paths($variante, $rutasArticulo['descripcion_variante']) : 0.00;
                                if($infoArticulo['descripcion_variante'] && strtoupper(trim($infoArticulo['descripcion_variante'])) === 'DEFAULT TITLE') 
                                {
                                    $infoArticulo['descripcion_variante'] = null;
                                }
                                $infoArticulo['precio_variante'] = $rutasArticulo['precio_variante'] ? get_dato_from_paths($variante, $rutasArticulo['precio_variante']) : 0.00;
                            }
                        }
                    }
                    $infoArticulo = (object)$infoArticulo;

                    $infoArticulo->categoria = !empty($infoArticulo->categoria) ? $infoArticulo->categoria : 'Otros';                    
                    $categoria = $this->Categoria_model->buscar(['UPPER(TRIM(descripcion))' => strtoupper(trim($infoArticulo->categoria)), 'sede' => $sede->sede, '_uno' => true]);

                    if (!$categoria)
                    {
                        $categoria = new Categoria_model();
                        $categoria->descripcion = trim($infoArticulo->categoria);
                        $categoria->sede = $sede->sede;
                        $categoria->guardar();
                    }

                    if ($categoria && $categoria->categoria)
                    {
                        $infoArticulo->subcategoria = !empty($infoArticulo->subcategoria) ? $infoArticulo->subcategoria : 'Otros';
                        $subcategoria = $this->Cgrupo_model->buscar(['categoria' => $categoria->categoria, 'UPPER(TRIM(descripcion))' => strtoupper(trim($infoArticulo->subcategoria)), '_uno' => true]);

                        if (!$subcategoria)
                        {
                            $impresora = $this->Impresora_model->buscar(['sede' => $sede->sede, 'pordefecto' => 1, '_uno' => true]);
                            $bodega = $this->Bodega_model->buscar(['sede' => $sede->sede, 'pordefecto' => 1, '_uno' => true]);
                            $subcategoria = new Cgrupo_model();
                            $subcategoria->categoria = $categoria->categoria;
                            $subcategoria->descripcion = trim($infoArticulo->subcategoria);
                            $subcategoria->impresora = $impresora && $impresora->impresora ? $impresora->impresora : null;
                            $subcategoria->bodega = $bodega && $bodega->bodega ? $bodega->bodega : null;
                            $subcategoria->guardar();
                        }

                        if ($subcategoria && $subcategoria->categoria_grupo)
                        {
                            $art = new Articulo_model();
                            $art->categoria_grupo = $subcategoria->categoria_grupo;
                            $art->presentacion = 1;
                            $art->descripcion = trim($infoArticulo->descripcion_producto).($infoArticulo->descripcion_variante ? (' / '.trim($infoArticulo->descripcion_variante)) : '');
                            $art->precio = (float)$infoArticulo->precio_variante;
                            $art->bien_servicio = 'B';
                            $art->shopify_id = trim($articulo->id_tercero);
                            $art->codigo = trim($articulo->id_tercero);
                            $art->presentacion_reporte = 1;
                            $art->mostrar_pos = 1;
                            $art->guardar();

                            if ($art && $art->articulo)
                            {
                                $idArticulo = $art->articulo;
                                $this->Articulo_vendor_tercero_model->get_articulo_vendor($articulo->vendor->vendor_tercero, $articulo->id_tercero);
                            }
                        }
                    }
                }
            }
        }
        return (int)$idArticulo;
    }

    private function existen_articulos($ordenrt)
    {
        $datos = new stdClass();
        $datos->exito = true;        
        $datos->articulosFaltantes = '';
        foreach ($ordenrt->articulos as $articulo) {
            $idArticulo = $this->Articulo_vendor_tercero_model->get_articulo_vendor($articulo->vendor->vendor_tercero, $articulo->id_tercero);                
            if ($idArticulo <= 0) {
                $idArticulo = $this->agregar_articulo_tercero($ordenrt, $articulo, [
                    'articulo' => (!empty($articulo->id_padre_tercero) ? $articulo->id_padre_tercero : $articulo->id_tercero)
                ]);
                if ($idArticulo <= 0)
                {
                    $datos->exito = false;
                    if ($datos->articulosFaltantes !== '') {
                        $datos->articulosFaltantes .= ', ';
                    }
                    $datos->articulosFaltantes .= "{$articulo->descripcion} de {$articulo->vendor->nombre}";
                }
            }
        }
        return $datos;
    }

    public function test_articulos($idOrdenGK = '')
    {
        $ordengk = new Orden_gk_model((int)$idOrdenGK > 0 ? (int)$idOrdenGK : 1);
        $ordenrt = $ordengk->get_orden_rt();
        $ordenrt->orden_gk = $ordengk->orden_gk;
        $datos = $this->existen_articulos($ordenrt);
        $this->output->set_output(json_encode($datos));        
    }

    private function genera_comanda_sede($sede, $ordenrt)
    {
        $datos = new stdClass();
        $datos->exito = false;
        $datos->mensaje = '';

        $comandaHeader = [
            'usuario' => $sede->turno->mesero->usuario->usuario,
            'sede' => $sede->sede,
            'estatus' => 1,
            'turno' => $sede->turno->turno,
            'domicilio' => 1,
            'comanda_origen' => $ordenrt->comanda_origen,
            'comanda_origen_datos' => json_encode($ordenrt),
            'mesero' => $sede->turno->mesero->usuario->usuario,
            'notas_generales' => "Pedido #{$ordenrt->numero_orden}",
            'orden_gk' => $ordenrt->orden_gk
        ];

        $cuentaHeader = [
            'comanda' => null,
            'nombre' => $ordenrt->datos_entrega->nombre ? $ordenrt->datos_entrega->nombre : 'Unica',
            'numero' => 1
        ];


        $articulos = [];
        $datos->articulosFaltantes = '';
        $totales = new stdClass();
        $totales->comanda = 0.00;
        $totales->descuento = 0.00;
        foreach ($ordenrt->articulos as $articulo) {
            if ((int)$articulo->atiende->sede === (int)$sede->sede) {
                $idArticulo = $this->Articulo_vendor_tercero_model->get_articulo_vendor($articulo->vendor->vendor_tercero, $articulo->id_tercero);
                $totales->comanda += ((float)$articulo->precio * (float)$articulo->cantidad);
                $totales->descuento += (float)$articulo->descuento;
                if ($idArticulo > 0) {
                    $art = new Articulo_model($idArticulo);
                    $articulos[] = [
                        'articulo' => $idArticulo,
                        'cantidad' => $articulo->cantidad,
                        'precio' => $articulo->precio,
                        'impreso' => 0,
                        'total' => (float)$articulo->precio * (float)$articulo->cantidad,
                        'notas' => '',
                        'bodega' => $art->getBodega(),
                        'descuento' => (float)$articulo->descuento
                    ];
                } else {
                    if ($datos->articulosFaltantes !== '') {
                        $datos->articulosFaltantes .= ', ';
                    }
                    $datos->articulosFaltantes .= "{$articulo->descripcion} de {$articulo->vendor->nombre}";
                }
            }
        }

        if ($datos->articulosFaltantes !== '') {
            $datos->exito = false;

            if ($datos->mensaje !== '') {
                $datos->mensaje .= '; ';
            }

            $datos->mensaje .= "No se encontraron los siguientes artículos: {$datos->articulosFaltantes}.";

            return $datos;
        }


        $comanda = new Comanda_model();

        if ($comanda->guardar($comandaHeader)) {
            $cuentaHeader['comanda'] = $comanda->comanda;
            $cuenta = new Cuenta_model();
            if ($cuenta->guardar($cuentaHeader)) {
                $descuentoArticulo = [];
                foreach ($articulos as $articulo) {
                    $det = $comanda->guardarDetalle($articulo);
                    if ($det) {
                        if ($articulo['descuento'] > 0) {
                            $descuentoArticulo[] = [
                                'detalle' => $det->detalle_comanda,
                                'descuento' => $articulo['descuento']
                            ];
                        }
                        $cuenta->guardarDetalle(['detalle_comanda' => $det->detalle_comanda]);
                        $datos->exito = true;
                        $datos->mensaje = "Se generó la comanda #{$comanda->comanda} de {$sede->nombre}.";
                    } else {
                        $datos->exito = false;
                        $datos->mensaje = $comanda->getMensaje();
                        return $datos;
                    }
                }
                if ($datos->exito) {
                    if (count($ordenrt->formas_pago) === 1) {
                        $pago = ['forma_pago' => $ordenrt->formas_pago[0]->forma_pago, 'monto' => ($totales->comanda - $totales->descuento)];
                        if ($cuenta->cobrar((object)$pago)) {
                            if ($ordenrt->total_descuento > 0) {
                                $fp_descuento = $this->get_fpago_descuento();
                                if ($fp_descuento) {
                                    $pago = ['forma_pago' => $fp_descuento->forma_pago, 'monto' => $ordenrt->total_descuento];
                                    $cuenta->cobrar((object)$pago);
                                }
                            }
                            $cuenta->guardar(['cerrada' => 1]);
                            $this->genera_factura_comanda($sede, $ordenrt, $cuenta, $descuentoArticulo);
                        }
                    }
                }
            } else {
                $datos->exito = false;
                $datos->mensaje = $cuenta->getMensaje();
            }
        } else {
            $datos->exito = false;
            $datos->mensaje = $comanda->getMensaje();
        }

        return $datos;
    }

    public function envio_vendors()
    {
        $datos = new stdClass();
        $datos->exito = false;
        $datos->mensaje = '';

        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'));
            $ordenGk = new Orden_gk_model($req->orden_gk);
            if ((int)$ordenGk->estatus_orden_gk === 1) {

                $ordenrt = json_decode($ordenGk->orden_rt);
                $ordenrt->orden_gk = $ordenGk->orden_gk;

                if (count($ordenrt->articulos) > 0) {
                    if (count($ordenrt->formas_pago) > 0) {
                        $sedes = $this->get_distinct_sedes($ordenrt->articulos);
                        $dataTurnos = $this->get_turnos_sedes($sedes);
                        if ($dataTurnos->exito) {
                            $sedes = $dataTurnos->sedes;
                            $dataMeseros = $this->get_meseros_turnos($sedes);
                            if ($dataMeseros->exito) {
                                $existenTodosLosArticulos = $this->existen_articulos($ordenrt);
                                if ($existenTodosLosArticulos->exito) {
                                    $sedes = $dataMeseros->sedes;
                                    $datos->sedes = $sedes;
                                    foreach ($sedes as $sede) {
                                        $cmdGenerada = $this->genera_comanda_sede($sede, $ordenrt);
                                        $datos->exito = $cmdGenerada->exito;
                                        if ($datos->mensaje !== '') {
                                            $datos->mensaje .= '. ';
                                        }
                                        $datos->mensaje .= $cmdGenerada->mensaje;
                                        if (!$cmdGenerada->exito) {
                                            $datos->exito = false;
                                            break;
                                        } else {
                                            $estatus_sede = new Estatus_orden_gk_sede_model();
                                            $estatus_sede->orden_gk = $ordenGk->orden_gk;
                                            $estatus_sede->sede = $sede->sede;
                                            $estatus_sede->estatus_orden_gk = 4;
                                            $estatus_sede->comentario = $cmdGenerada->mensaje;
                                            $estatus_sede->guardar();
                                        }
                                    }
                                    if ($datos->exito) {
                                        $ordenGk->guardar(['estatus_orden_gk' => 4]);
                                        $datos->estatus_orden_gk = $this->Estatus_orden_gk_model->buscar(['estatus_orden_gk' => 4, '_uno' => true]);
                                        $urlWs = 'http://localhost:8988/api/updlstpedidos';
                                        // $urlWs = 'https://resttouch.c807.com:8988/api/updlstpedidos';
                                        $corporacion = $this->Catalogo_model->getCorporacion(['corporacion' => $ordenGk->corporacion, '_uno' => true]);
                                        if ($corporacion) {
                                            $urlWs .= "/{$corporacion->admin_llave}";
                                        }
                                        get_request($urlWs, []);
                                    }
                                } else {
                                    $datos->mensaje = "No se encontraron los siguientes artículos: {$existenTodosLosArticulos->articulosFaltantes}.";
                                }
                            } else {
                                $datos->mensaje = "Los siguientes vendors no tienen meseros en su turno: {$dataMeseros->faltantes}.";
                            }
                        } else {
                            $datos->mensaje = "Los siguientes vendors no han abierto turno: {$dataTurnos->faltantes}.";
                        }
                    } else {
                        $datos->mensaje = 'La orden no tiene formas de pago reconocibles por Rest-Touch Pro.';
                    }
                } else {
                    $datos->mensaje = 'La orden debe tener 1 artículo por lo menos.';
                }
            } else if ((int)$ordenGk->estatus_orden_gk === 2) {
                $datos->mensaje = 'Esta orden ya fue anulada.';
            } else {
                $datos->mensaje = 'Esta orden ya fue enviada a los vendors.';
            }
        } else {
            $datos->mensaje = 'El método de llamada no es válido.';
        }
        $this->output->set_output(json_encode($datos));
    }

    private function update_status_branch($idOrdenGk = null)
    {
        $datos = new stdClass();
        $datos->exito = false;
        $datos->mensaje = '';

        if ((int)$idOrdenGk > 0) {
            $ordengk = new Orden_gk_model($idOrdenGk);
            $ordenrt = json_decode($ordengk->orden_rt);

            foreach($ordenrt->articulos as $articulo)
            {
                $articulo->estatus_sede = $this->Estatus_orden_gk_sede_model->ultimo_estatus_sede($ordengk->orden_gk, $articulo->atiende->sede);
            }
            $ordengk->orden_rt = json_encode($ordenrt);
            $datos->exito = $ordengk->guardar();
            $datos->orden = null;
            if($datos->exito)
            {
                $datos->orden = $this->getOrdenesGk(['orden_gk' => $idOrdenGk, '_uno' => true]);
                $datos->mensaje = 'Se actualizó el estatus de cada sede con éxito.';
            } else {
                $datos->mensaje = implode('. ', $ordengk->getMensaje());                
            }
        } else {
            $datos->mensaje = "El #{$idOrdenGk} no es válido.";
        }

        return $datos;
    }

    public function cambiar_estatus()
    {
        $datos = new stdClass();
        $datos->exito = false;
        $datos->mensaje = '';

        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'));

            if (isset($req->orden_gk) && isset($req->estatus_orden_gk) && isset($req->sede)) {
                $ordenGk = new Orden_gk_model($req->orden_gk);

                $existe = $this->Estatus_orden_gk_sede_model->buscar(['orden_gk' => $ordenGk->orden_gk, 'sede' => $req->sede, 'estatus_orden_gk' => $req->estatus_orden_gk, '_uno' => true]);

                if (!$existe) {
                    $estatus_sede = new Estatus_orden_gk_sede_model();
                    $estatus_sede->orden_gk = $ordenGk->orden_gk;
                    $estatus_sede->sede = $req->sede;
                    $estatus_sede->estatus_orden_gk = $req->estatus_orden_gk;
                    $estatus_sede->comentario = isset($req->comentario) && trim($req->comentario) !== '' ? trim($req->comentario) : null;
                    $estatus_sede->guardar();
                }

                $estatus = $ordenGk->actualiza_estatus($req->estatus_orden_gk);                

                $datos->exito = true;
                $datos->mensaje = "Se actualizó el estatus de la orden #{$ordenGk->orden_gk} de Ghost Kitchen.";
                $datos->estatus_orden_gk = $this->Estatus_orden_gk_model->buscar([
                    'estatus_orden_gk' => $estatus ? $estatus : $ordenGk->estatus_orden_gk,
                    '_uno' => true
                ]);                
            } else {
                $datos->mensaje = "Faltan datos para cambiar el estatus de la orden #{$req->orden_gk} de Ghost Kitchen.";
            }
        } else {
            $datos->mensaje = 'El método de llamada no es válido.';
        }
        $this->output->set_output(json_encode($datos));
    }

    public function regenera_orden_rt($idOrdenGk = null)
    {
        $datos = new stdClass();
        $datos->exito = false;
        $datos->mensaje = '';

        if ((int)$idOrdenGk > 0) {
            $ordengk = new Orden_gk_model($idOrdenGk);
            $ordenrt = $ordengk->get_orden_rt();
            if ($ordenrt) {
                $ordengk->estatus_orden_gk = $ordenrt->completa ? 1 : 3;
                $ordengk->orden_rt = json_encode($ordenrt);
            }
            $datos->exito = $ordengk->guardar();
            if ($datos->exito)
            {
                $ogk = $this->getOrdenesGk(['orden_gk' => $idOrdenGk, '_uno' => true]);
                $datos->orden = $ogk;
                $datos->mensaje = 'Datos actualizados con éxito.';
            } else 
            {
                $datos->mensaje = $ordengk->getMensaje();
            }
        } else {
            $datos->mensaje = "El #{$idOrdenGk} no es válido.";
        }

        $this->output->set_output(json_encode($datos));
    }

    public function actualiza_estatus_sede($idOrdenGk = null)
    {
        $datos = $this->update_status_branch($idOrdenGk);
        $this->output->set_output(json_encode($datos));        
    }
}
