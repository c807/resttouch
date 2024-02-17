<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ajuste_costo_promedio extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model([
            'Catalogo_model',
            'Ajuste_costo_promedio_model',
            'Detalle_ajuste_costo_promedio_model',
            'Articulo_model',
            'Receta_model',
            'Proveedor_model',
            'Tipo_movimiento_model',
            'Egreso_model',
            'EDetalle_model',
            'Ingreso_model',
            'IDetalle_Model',
            'Presentacion_model',
            'BodegaArticuloCosto_model',
            'Sede_model',
            'Empresa_model',
            'Usuario_model',
            'Bitacora_model',
            'Bodega_model',
            'Accion_model'
        ]);

        $this->load->helper(['jwt', 'authorization']);

        $headers = $this->input->request_headers();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }

        $this->output->set_content_type('application/json');
    }

    public function buscar()
    {
        if (!isset($_GET['sede'])) {
            $_GET['sede'] = $this->data->sede;
        }

        $data = $this->Ajuste_costo_promedio_model->buscar($_GET);
        $this->output->set_output(json_encode($data));
    }

    public function guardar($id = '')
    {
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $acp = new Ajuste_costo_promedio_model($id);
            if (empty($id) || (int)$acp->confirmado === 0) {
                $datos['exito'] = $acp->guardar($req);

                if ($datos['exito']) {
                    $sede = new Sede_model($req['sede']);
                    $empresa = $sede->getEmpresa();

                    $args = [
                        'ajuste_costo_promedio' => $acp->getPK(),
                        'sede' => $req['sede'],
                        'bodega' => $req['bodega'],
                        'mostrar_inventario' => 1,
                        'debaja' => 0,
                        'por_iva' => (float)1 + (float)$empresa->porcentaje_iva
                    ];

                    if (isset($req['categoria_grupo']) && (int)$req['categoria_grupo'] > 0) {
                        $args['categoria_grupo'] = $req['categoria_grupo'];
                    }

                    if (isset($req['articulo']) && (int)$req['articulo'] > 0) {
                        $args['articulo'] = $req['articulo'];
                    }

                    $acp->genera_detalle($args);
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                    $datos['ajuste_costo_promedio'] = $acp;
                } else {
                    $datos['mensaje'] = implode('<br>', $acp->getMensaje());
                }
            } else {
                $datos['mensaje'] = 'Solo puede editar ajustes de costo promedio sin confirmar.';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }

    public function buscar_detalle()
    {
        $data = $this->Detalle_ajuste_costo_promedio_model->buscar_detalle($_GET);
        $this->output->set_output(json_encode($data));
    }

    public function guardar_detalle($id = '')
    {
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $dacp = new Detalle_ajuste_costo_promedio_model($id);
            if (empty($id) || (int)$req['confirmado'] === 0) {
                $datos['exito'] = $dacp->guardar($req);

                if ($datos['exito']) {
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                    $datos['detalle_ajuste_costo_promedio'] = $dacp;
                } else {
                    $datos['mensaje'] = implode('<br>', $dacp->getMensaje());
                }
            } else {
                $datos['mensaje'] = 'Solo puede editar ajustes de costo promedio sin confirmar.';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }

    public function confirmar($id)
    {
        $acp = new Ajuste_costo_promedio_model($id);
        $datos = ['exito' => false];
        if ((int)$acp->confirmado === 0) {
            $detalle = $this->Detalle_ajuste_costo_promedio_model->buscar_detalle(['ajuste_costo_promedio' => $acp->getPK()]);
            if ($detalle && is_array($detalle) && count($detalle) > 0) {
                set_time_limit(3600);
                ini_set('memory_limit', '512M');
                // Creación del ingreso
                $tm = $this->Tipo_movimiento_model->buscar(['ingreso' => 1, 'esajuste_cp' => 1, '_uno' => true]);
                if ($tm && (int)$tm->tipo_movimiento > 0) {

                    $prov = $this->Proveedor_model->buscar(['razon_social' => 'Interno', '_uno' => true]);
                    if (!$prov) {
                        $obj = new Proveedor_model();
                        $obj->guardar([
                            'razon_social' => 'Interno',
                            'nit' => 'CF',
                            'corporacion' => 1
                        ]);
                        $idProv = $obj->getPK();
                    } else {
                        $idProv = $prov->proveedor;
                    }

                    $usuario = $this->Usuario_model->buscar(['usuario' => $this->data->idusuario, '_uno' => true]);
                    $nombreUsuario = trim("{$usuario->nombres} {$usuario->apellidos}");

                    $ingreso = new Ingreso_model();
                    $dataIng = [
                        'tipo_movimiento' => $tm->tipo_movimiento,
                        'fecha' => date('Y-m-d'),
                        'bodega' => $acp->bodega,
                        'usuario' => $this->data->idusuario,
                        'proveedor' => $idProv,
                        'estatus_movimiento' => 2,
                        'ajuste' => 0,
                        'comentario' => "Ingreso automático generado por el proceso de ajuste de costo promedio No. {$acp->ajuste_costo_promedio}., usuario: {$nombreUsuario}, {$usuario->usrname}."
                    ];
                    if ($ingreso->guardar($dataIng)) {
                        $sede = new Sede_model($acp->sede);
                        $empresa = $sede->getEmpresa();
                        $porIva = $empresa ? ((float)$empresa->porcentaje_iva ?? (float)0.12) : (float)0.12;
                        $idsArticulos = [];
                        foreach ($detalle as $d) {
                            $art = new Articulo_model($d->articulo);
                            $art->actualizarExistencia_v2(['fecha' => $ingreso->fecha, 'sede' => $acp->sede, 'bodega' => $acp->bodega, '_sinconfirmar' => 0]);
                            $pres = $art->getPresentacionReporte();
                            $art->existencias = (float)$art->existencias / (float)$pres->cantidad;
                            $precioUnitarioConIVA = ((float)$d->costo_promedio_correcto * ($art->existencias + (float)1)) - ($art->existencias * (float)$d->costo_promedio_sistema);
                            $precioUnitarioSinIVA = $precioUnitarioConIVA / ((float)1 + $porIva);

                            $det = [
                                'articulo' => $d->articulo,
                                'cantidad' => 1,
                                'presentacion' => $d->presentacion,
                                'precio_unitario' => $precioUnitarioSinIVA,
                                'precio_total' => $precioUnitarioSinIVA,
                                'precio_costo_iva' => $precioUnitarioConIVA - $precioUnitarioSinIVA,
                            ];

                            $detIngreso = $ingreso->setDetalle($det);

                            $datos_costo = $this->BodegaArticuloCosto_model->get_datos_costo($acp->bodega, $d->articulo);
                            if ($datos_costo) {
                                $cantidad_presentacion = round((float)$pres->cantidad, 2);
                                $precio_unitario = $precioUnitarioSinIVA;
                                $existencia_anterior = round((float)$datos_costo->existencia, 2);
                                $cp_unitario_anterior = round((float)$datos_costo->costo_promedio, 5);
                                $costo_total_anterior = round($existencia_anterior * $cp_unitario_anterior, 5);
                                $existencia_nueva = $existencia_anterior + ((float)1 * $cantidad_presentacion);
                                $costo_total_nuevo = $costo_total_anterior + $precioUnitarioSinIVA;

                                $nvaData = [
                                    'bodega' => (int)$acp->bodega,
                                    'articulo' => (int)$d->articulo,
                                    'cuc_ingresado' => 0,
                                    'costo_ultima_compra' => round($precio_unitario / $cantidad_presentacion, 5),
                                    'cp_ingresado' => 0,
                                    'costo_promedio' => round($costo_total_nuevo / $existencia_nueva, 5),
                                    'existencia_ingresada' => 0,
                                    'existencia' => $existencia_nueva,
                                    'fecha' => date('Y-m-d H:i:s')
                                ];

                                $nvoBac = new BodegaArticuloCosto_model();
                                $nvoBac->guardar($nvaData);
                            } else {
                                if ($detIngreso) {
                                    $idsArticulos[] = (int)$d->articulo;
                                }
                            }
                        }

                        // Recálculo de costos de los artículos...
                        foreach ($idsArticulos as $idArticulo) {
                            $this->Articulo_model->recalcular_costos((int)$acp->sede, $idArticulo, (int)$acp->bodega);
                        }

                        //Creación del egreso para ajuste de existencia
                        $egreso = new Egreso_model();
                        $dataEgreso = [
                            'tipo_movimiento' => $tm->tipo_movimiento,
                            'fecha' => date('Y-m-d'),
                            'bodega' => $acp->bodega,
                            'usuario' => $this->data->idusuario,
                            'estatus_movimiento' => 2,
                            'ajuste' => 0,
                            'comentario' => "Egreso automático generado por el proceso de ajuste de costo promedio No. {$acp->ajuste_costo_promedio}., usuario: {$nombreUsuario}, {$usuario->usrname}."
                        ];

                        if ($egreso->guardar($dataEgreso)) {
                            $idsArticulos = [];
                            foreach ($detalle as $d) {
                                $art = new Articulo_model($d->articulo);
                                $pres = $art->getPresentacionReporte();

                                $costo_promedio = (float)0;
                                $datos_costo = $this->BodegaArticuloCosto_model->get_datos_costo($acp->bodega, $d->articulo);
                                if ($datos_costo) {
                                    $costo_promedio = $datos_costo->costo_promedio;
                                } else {
                                    $bcosto = $this->BodegaArticuloCosto_model->buscar([
                                        'bodega' => $acp->bodega,
                                        'articulo' => $d->articulo,
                                        '_uno' => true
                                    ]);

                                    if ($bcosto) {
                                        $costo_promedio = $bcosto->costo_promedio;
                                    } else {
                                        $costo_promedio = $art->getCosto(['bodega' => $acp->bodega]);
                                    }
                                }

                                $cp = (float)$costo_promedio;
                                $precioUnitario = $cp * (float)$pres->cantidad;

                                $det = [
                                    'cantidad' => 1,
                                    'articulo' => $d->articulo,
                                    'presentacion' => $d->presentacion,
                                    'precio_unitario' => $precioUnitario,
                                    'precio_total' => $precioUnitario,
                                ];
                                $detEgreso = $egreso->setDetalle($det);
                                if ($datos_costo) {
                                    $nvaData = [
                                        'bodega' => (int)$acp->bodega,
                                        'articulo' => (int)$d->articulo,
                                        'cuc_ingresado' => 0,
                                        'costo_ultima_compra' => round((float)$datos_costo->costo_ultima_compra, 5),
                                        'cp_ingresado' => 0,
                                        'costo_promedio' => round((float)$datos_costo->costo_promedio, 5),
                                        'existencia_ingresada' => 0,
                                        'existencia' => round((float)$datos_costo->existencia - ((float)1 * (float)$pres->cantidad), 2),
                                        'fecha' => date('Y-m-d H:i:s')
                                    ];
                                    $nvoBac = new BodegaArticuloCosto_model();
                                    $nvoBac->guardar($nvaData);
                                } else {
                                    if ($detEgreso) {
                                        $idsArticulos[] = (int)$d->articulo;
                                    }
                                }
                            }

                            // Recálculo de costos de los artículos...
                            foreach ($idsArticulos as $idArticulo) {
                                $this->Articulo_model->recalcular_costos((int)$acp->sede, $idArticulo, (int)$acp->bodega);
                            }

                            $datos['exito'] = $acp->guardar([
                                'confirmado' => 1,
                                'confirmado_fecha' => date('Y-m-d H:i:s'),
                            ]);

                            if ($datos['exito']) {

                                $bit = new Bitacora_model();
                                $acc = $this->Accion_model->buscar([
                                    'descripcion' => 'Modificacion',
                                    '_uno' => true
                                ]);

                                $comentario = "El usuario {$nombreUsuario}, {$usuario->usrname}, realizó un ajuste en los costos de los artículos, ";
                                $comentario .= "generando un ingreso automático No. {$ingreso->getPK()} y un egreso automático No. {$egreso->getPK()} ";
                                $comentario .= "en la sede {$sede->nombre} ($sede->alias)";

                                $objBodega = $this->Bodega_model->buscar(['bodega' => $acp->bodega, '_uno' => true]);

                                $comentario .= ($objBodega && $objBodega->descripcion ? " en la bodega {$objBodega->descripcion}" : '') . '.';

                                $bit->guardar([
                                    'accion' => $acc->accion,
                                    'usuario' => $this->data->idusuario,
                                    'tabla' => 'ajuste_costo_promedio',
                                    'registro' => $acp->getPK(),
                                    'comentario' => $comentario
                                ]);

                                $datos['mensaje'] = 'El ajuste de costo promedio fue confirmado con éxito.';
                                $datos['ajuste_costo_promedio'] = $this->Ajuste_costo_promedio_model->buscar(['ajuste_costo_promedio' => $acp->ajuste_costo_promedio, '_uno' => true]);
                            } else {
                                $datos['mensaje'] = implode(';', $acp->getMensaje());
                            }
                        } else {
                            $datos['mensaje'] = implode(';', $egreso->getMensaje());
                        }
                    } else {
                        $datos['mensaje'] = implode(';', $ingreso->getMensaje());
                    }
                } else {
                    $datos['mensaje'] = 'No hay un tipo de movimiento de ingreso definido para ajustes de costo promedio. Por favor créelo e intente nuevamente.';
                }
            } else {
                $datos['mensaje'] = 'El ajuste de costo promedio debe tener por lo menos una línea de detalle.';
            }
        } else {
            $datos['mensaje'] = 'El ajuste de costo promedio ya fue confirmado.';
        }
        $this->output->set_output(json_encode($datos));
    }
}
