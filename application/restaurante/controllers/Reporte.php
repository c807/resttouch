<?php
defined('BASEPATH') or exit('No direct script access allowed');

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

ini_set('memory_limit', -1);
set_time_limit(0);


class Reporte extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->add_package_path('application/facturacion');
        $this->load->model([
            'Reporte_model',
            'Factura_model',
            'Dfactura_model',
            'Comanda_model',
            'Area_model',
            'Dcomanda_model',
            'Cuenta_model',
            'Usuario_model',
            'TurnoTipo_model',
            'Catalogo_model',
            'Configuracion_model',
            'Tipo_domicilio_model',
            'Sede_model'
        ]);

        $this->load->helper(['jwt', 'authorization']);

        $headers = $this->input->request_headers();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }
    }

    private function getEsRangoPorFechaDeTurno()
    {
        $config = $this->Configuracion_model->buscar();
        return get_configuracion($config, 'RT_REPORTES_FECHAS_TURNOS', 3);
    }

    private function agrupa_lista_comandas($data, $lista = '')
    {
        foreach ($data as $value) {
            if ($lista !== '') {
                $lista .= ',';
            }
            $lista .= $value->comanda;
        }
        return $lista;
    }

    private function get_info_corte_caja($data)
    {
        ini_set('pcre.backtrack_limit', '15000000');

        $ingresos = $this->Catalogo_model->getFormaPago(['descuento' => 0]);
        $descuentos = $this->Catalogo_model->getFormaPago(['descuento' => 1]);

        $data['_rango_turno'] = $this->getEsRangoPorFechaDeTurno();

        if (!verDato($data, 'sede')) {
            $data['sede'] = [$this->data->sede];
        }
        $data['_facturadas'] = true;

        $data['descuento'] = 0;
        $data['ingresos'] = $this->Reporte_model->get_ingresos($data);
        $data['comandas'] = true;
        $tmp = $this->Reporte_model->get_ingresos($data);
        unset($data['comandas']);
        $data['ingresos'] = array_merge($data['ingresos'], $tmp);
        $listaComandas = $this->agrupa_lista_comandas($data['ingresos']);

        // Modificación para agregar el saldo inicial en caso de que haya. 14/09/2023
        if (isset($data['_saldo_actual']) && !isset($data['tipo_domicilio'])) {
            $efectivoNoEncontrado = true;
            $saldo_actual = (float)$data['_saldo_actual'];
            foreach ($data['ingresos'] as $res) {
                if ((int)$res->esefectivo === 1) {
                    $efectivoNoEncontrado = false;
                    break;
                }
            }

            if ($efectivoNoEncontrado) {
                $fp_efectivo = $this->Catalogo_model->getFormaPago(['esefectivo' => 1, '_uno' => true]);
                if ($fp_efectivo) {
                    $data['ingresos'][] = (object)[
                        'forma_pago' => $fp_efectivo->forma_pago,
                        'documento' => null,
                        'descripcion' => $fp_efectivo->descripcion,
                        'monto' => $saldo_actual,
                        'propina' => (float)0,
                        'fecha_factura' => $data['fdel'],
                        'numero_factura' => null,
                        'sede' => $data['ingresos'] && count($data['ingresos']) > 0 ? $data['ingresos'][0]->sede : null,
                        'nsede' => $data['ingresos'] && count($data['ingresos']) > 0 ? $data['ingresos'][0]->nsede : null,
                        'serie_factura' => null,
                        'estatus_comanda' => null,
                        'esefectivo' => 1,
                        'comanda' => 0
                    ];
                }
            }
        }
        //Fin de modificación para agregar el saldo inicial en caso de que haya. 14/09/2023

        $ingr = array_result($data['ingresos'], 'forma_pago');
        $data['ingreso_sin_fact'] = [];
        foreach ($ingresos as $row) {
            if (!in_array($row->forma_pago, $ingr)) {
                $data['ingreso_sin_fact'][] = $row;
            }
        }

        //$data['ingreso_sin_fact'] = $this->Reporte_model->get_ingresos_sin_fac($data);
        $data['descuento'] = 1;
        $data['descuentos'] = $this->Reporte_model->get_ingresos($data);
        $data['comandas'] = true;
        $tmp = $this->Reporte_model->get_ingresos($data);
        unset($data['comandas']);
        $data['descuentos'] = array_merge($data['descuentos'], $tmp);
        $listaComandas = $this->agrupa_lista_comandas($data['descuentos'], $listaComandas);

        $desc = array_result($data['descuentos'], 'forma_pago');
        $data['descuento_sin_fact'] = [];
        if (!empty($desc)) {
            foreach ($descuentos as $row) {
                if (!in_array($row->forma_pago, $desc)) {
                    $data['descuento_sin_fact'][] = $row;
                }
            }
        }

        if (isset($data['_grupo']) && $data['_grupo'] == 2) {
            $tmpIngreso = [];
            foreach ($data['ingresos'] as $row) {
                $tmpIngreso[$row->sede][] = $row;
            }
            $data['ingresos'] = $tmpIngreso;

            $tmpDescuento = [];
            foreach ($data['descuentos'] as $row) {
                $tmpDescuento[$row->sede][] = $row;
            }

            $data['descuentos'] = $tmpDescuento;
        }

        $data['comanda'] = $this->Reporte_model->getRangoComandas($data);

        if (isset($data['_detalle']) && filter_var($data['_detalle'], FILTER_VALIDATE_BOOLEAN)) {
            $data['detalle'] = 1;
            unset($data['descuento']);
            $det = $this->Reporte_model->get_ingresos($data);
            $data['comandas'] = true;
            $tmp = $this->Reporte_model->get_ingresos($data);
            $det = array_merge($det, $tmp);
            $data['detalle'] = [];
            foreach ($det as $row) {
                if (isset($_GET['_grupo']) && $_GET['_grupo'] == 2) {
                    $data['detalle'][$row->sede][trim($row->descripcion)][] = $row;
                } else {
                    $data['detalle'][trim($row->descripcion)][] = $row;
                }
            }
        }

        // var_dump($data['detalle']['Efectivo']);

        if (isset($data['_validar']) && $data['_validar'] !== 'false') {
            $data['pagos'] = [];
            foreach ($data['_pagos'] as $row) {
                if (isset($row['monto'])) {
                    $data['pagos'][$row['forma_pago']] = $row['monto'];
                }
            }
        } else {
            $data['_validar'] = false;
        }

        if (isset($data['turno_tipo']) && (int)$data['turno_tipo'] > 0) {
            $data['turno'] = new TurnoTipo_model($data['turno_tipo']);
        }

        $sede = $this->Catalogo_model->getSede(['sede' => $this->data->sede, '_uno' => true]);

        $tmp = [];
        foreach ($data['sede'] as $row) {
            $sede = $this->Catalogo_model->getSede(['sede' => $row, '_uno' => true]);
            $tmp[] = $sede->nombre;
        }

        if ($sede) {
            $emp = $this->Catalogo_model->getEmpresa(['empresa' => $sede->empresa, '_uno' => true]);
            if ($emp) {
                $data['empresa'] = $emp;
                $data['nsede'] = implode(', ', $tmp);
            }
        }

        $data['facturas_sin_comanda'] = $this->Reporte_model->get_ingresos_sin_comanda($data);

        if (count($data['facturas_sin_comanda']) > 0) {
            $totalMonto = 0;
            $totalPropina = 0;
            foreach ($data['facturas_sin_comanda'] as $fsc) {
                $totalMonto += (float)$fsc->monto;
                $totalPropina += (float)$fsc->propina;
            }
            $data['ingresos'][] = (object)[
                'forma_pago' => null,
                'documento' => null,
                'descripcion' => 'Ingresos sin comanda',
                'monto' => $totalMonto,
                'propina' => $totalPropina,
                'fecha_factura' => null,
                'numero_factura' => null,
                'sede' => '3',
                'nsede' => 'La Pista',
                'serie_factura' => null,
                'estatus_comanda' => '2'
            ];

            if (isset($data['_detalle']) && filter_var($data['_detalle'], FILTER_VALIDATE_BOOLEAN)) {
                $data['detalle']['Ingresos sin comanda'] = $data['facturas_sin_comanda'];
            }
        }

        $data['fhimpresion'] = date('d/m/Y H:i:s');

        $data['totalComensales'] = $this->Reporte_model->get_suma_comensales($listaComandas);
        $data['cantidadMesasUtilizadas'] = $this->Reporte_model->get_cantidad_mesas($listaComandas);

        return $data;
    }

    /**
     *
     * Funcion de colaborador de -> get_turno_domicilio_info
     * Esta funcion filtra entre las secciones
     * ingresos , descuentos , factura sin comanda.
     * Es llamada con los parametros anteriores para obtener su propina y su monto
     *
     * @param $json_data
     * @param $type // En que JSON buscar del jsonarray
     * @param $forma_pago // fomra de pago 1 , 2 , 3 , 4 ..
     */
    function inner_search_montos($json_data, $type, $forma_pago)
    {
        $basic_ingreso = new stdClass(); //Respuesta por defecto para simplificar logica
        $basic_ingreso->monto = 0;
        $basic_ingreso->propina = 0;
        foreach ($json_data[$type] as $row) {
            if ($row->forma_pago === $forma_pago) {
                return $row;
            }
        }
        return $basic_ingreso;
    }

    /**
     * Ingresamos -> domicilio , tipo_domicilio
     * Retorna -> array([metodo_pago, monto, propina , total])
     * Para popular una tabla
     */
    private function get_turno_domicilio_info($data)
    {
        // domicilio
        // tipo_domicilio

        $sede = new Sede_model($data['sede'][0]);
        $emp = $sede->getEmpresa();
        $porIva = 1 + (float)$emp->porcentaje_iva;

        $jsonobj = new stdClass();
        $jsonobj->name = $data['tipo_de_ingreso'];
        $ingresos = []; // ARRAY DE LOS METODOS DE PAGO
        $jsonobj->total_comensales = 0;
        $jsonobj->cantidadDeMesasUtilizadas = 0;
        $jsonobj->consumo_total = 0;
        ///EJECUTANDO EL CORTE DE CAJA
        $json_data = $this->get_info_corte_caja($data);
        //Si es ingreso solo en restaurante
        if (isset($data['domicilio']) && $data['domicilio'] === 0) {
            $jsonobj->cantidadDeMesasUtilizadas = $json_data['cantidadMesasUtilizadas'];
        }
        //total de comensales
        $jsonobj->total_comensales = $json_data['totalComensales'];

        // Agregando seccion de descuentos para mejorar logica
        $formas_pago = $data['_pagos'];

        //Itereamos por los metodos de pago y los agregamos al array.
        // Esta seccion crea un objeto para obtner los montos en los distintos metodos de pago como Efectivo , Dolares etc.
        foreach ($formas_pago as $row) {
            $metodo_pago = new stdClass();
            $metodo_pago->metodo_pago = $row['descripcion'];


            //calculando_montos
            //ingresos + descuentos + factura sin comanda == sumarlos todos
            //monto, propina , total
            //Montos Ingres0
            if (isset($data['domicilio'])) {

                //Si estara en descuento skip
                if ((bool)$row['descuento']) {
                    continue;
                }


                $ingresos_mont = $this->inner_search_montos($json_data, 'ingresos', $row['forma_pago']);
                $descuentos_mont = $this->inner_search_montos($json_data, 'facturas_sin_comanda', $row['forma_pago']);
                $facturas_sin_com = $this->inner_search_montos($json_data, 'descuentos', $row['forma_pago']);



                $metodo_pago->monto = $ingresos_mont->monto + $descuentos_mont->monto + $facturas_sin_com->monto;
                $metodo_pago->propina = $ingresos_mont->propina + $descuentos_mont->propina + $facturas_sin_com->propina;
                $metodo_pago->total = $ingresos_mont->monto + $ingresos_mont->propina;
                $metodo_pago->total_base = round((float)$metodo_pago->total / $porIva, 2);

                $jsonobj->consumo_total = $jsonobj->consumo_total + $metodo_pago->total; // se dividira luego
                $jsonobj->consumo_total_base = round((float)$jsonobj->consumo_total / $porIva, 2);
                $metodo_pago->data = json_encode($json_data);
            } else {

                //Si no es descuentos que haga skip
                if (!((bool)$row['descuento'])) {
                    continue;
                }

                $descuentos = $this->inner_search_montos($json_data, 'descuentos', $row['forma_pago']);

                $metodo_pago->monto = $descuentos->monto;
                $metodo_pago->propina = $descuentos->propina;
                $metodo_pago->total = $descuentos->monto + $descuentos->propina;
                $metodo_pago->total_base = round((float)$metodo_pago->total / $porIva, 2);

                $jsonobj->consumo_total = $jsonobj->consumo_total + $metodo_pago->total; // se dividira luego
                $jsonobj->consumo_total_base = round((float)$jsonobj->consumo_total / $porIva, 2);
                $metodo_pago->data = json_encode($json_data);
            }


            array_push($ingresos, $metodo_pago);
        }


        //agregamos el array de metodos de pago y totales al objeto a retornar
        $jsonobj->ingresos = $ingresos;
        return $jsonobj;
    }

    /**
     * Desglose de reporte
     *  -> Total del dia
     *  -> Desglose por turnos
     */
    public function rpt_caja_turno()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!verDato($data, 'sedeRPT')) {
            $data['sede'] = [$this->data->sede];
        } else {
            $data['sede'] = [$data['sedeRPT']]; // Porque vendra un string pero se procesa como array
        }

        $sede = new Sede_model($data['sede'][0]);
        $emp = $sede->getEmpresa();
        $porIva = 1 + (float)$emp->porcentaje_iva;

        // Decode the JSON file
        ///////////////////// Detalles de la sede
        $sede = $this->Catalogo_model->getSede([
            'sede' => $this->data->sede,
            '_uno' => true
        ]);
        $tmp = [];
        foreach ($data['sede'] as $row) {
            $sede = $this->Catalogo_model->getSede([
                'sede' => $row,
                '_uno' => true
            ]);

            $tmp[] = $sede->nombre;
        }
        if ($sede) {
            $emp = $this->Catalogo_model->getEmpresa([
                'empresa' => $sede->empresa,
                '_uno' => true
            ]);
            if ($emp) {
                $data['empresa'] = $emp;
                $data['nsede'] = implode(', ', $tmp);
            }
        }

        ///////////////////// CREADOR DE TURNOS /////////
        $json_data_turnos = [];
        $turnoDia = new stdClass(); // agregando turno total para mejorar logica
        $turnoDia->descripcion = 'TODO EL DIA';
        $turnoDia->turno_tipo = -1;
        $tipos_de_turnos = $this->TurnoTipo_model->buscar();
        array_unshift($tipos_de_turnos, $turnoDia); // adds at begining
        ////////iteration between schedules
        ///

        foreach ($tipos_de_turnos as $turnoDB) {
            $turno = new stdClass();
            $turno->name = ($turnoDB->descripcion === 'TODO EL DIA') ? $turnoDB->descripcion : 'TURNO : ' . $turnoDB->descripcion;

            if ($turnoDB->turno_tipo > -1) {
                $data['turno_tipo'] = $turnoDB->turno_tipo;
            }

            $tipos_domicilio = $this->Tipo_domicilio_model->buscar();
            $data['domicilio'] = 0; // Ingresos por restaurante
            $data['tipo_de_ingreso'] = 'Ingreso en restaurante';
            $ingreso_en_restaurante = $this->get_turno_domicilio_info($data);
            $sample_turno_jsonDataAndTipoD = [];

            // Si el consumo total del es 0 no se muestra
            if ($ingreso_en_restaurante->consumo_total > 0) {
                $sample_turno_jsonDataAndTipoD = [$ingreso_en_restaurante];
            }

            $descuento = new stdClass(); // Agregando descuento al array para mejora logica
            $descuento->tipo_domicilio = -1;
            $descuento->descripcion = 'Descuentos';
            $tipos_domicilio = array_merge($tipos_domicilio, [$descuento]);


            $cantidadDeMesasUtilizadas = $ingreso_en_restaurante->cantidadDeMesasUtilizadas;
            $totalComensalesTurno = $ingreso_en_restaurante->total_comensales;
            $consumoPromedioTotal = 0;
            $granTotal = $ingreso_en_restaurante->consumo_total;

            foreach ($tipos_domicilio as $row) {
                $data['tipo_de_ingreso'] = $row->descripcion; // Esto es el nombre Tarjeta , Efectivo , Dolares

                if ($row->tipo_domicilio > -1) {
                    $data['domicilio'] = 1;
                    $data['tipo_domicilio'] = $row->tipo_domicilio;
                } else {
                    // Aqui pasara Descuentos
                    unset($data['domicilio']);
                    unset($data['tipo_domicilio']);
                }
                $ingreso_en_restaurante_dom = $this->get_turno_domicilio_info($data);

                if ($totalComensalesTurno === 0) {
                    $totalComensalesTurno = $ingreso_en_restaurante_dom->total_comensales;
                }

                $granTotal = $granTotal + $ingreso_en_restaurante_dom->consumo_total;

                if ($ingreso_en_restaurante_dom->consumo_total > 0) {
                    array_push($sample_turno_jsonDataAndTipoD, $ingreso_en_restaurante_dom);
                }
            }

            if ($granTotal > 0 && $totalComensalesTurno > 0) {
                $consumoPromedioTotal = $granTotal / $totalComensalesTurno; // se formatea
            } else {
                $consumoPromedioTotal = 0;
            }

            $turno->cantidadDeMesasUtilizadas = $cantidadDeMesasUtilizadas;
            $turno->consumo_promedio_total = $consumoPromedioTotal;
            $turno->granTotal = $granTotal;
            $turno->granTotal_base = round((float)$turno->granTotal / $porIva, 2);
            $turno->totalComensales = $totalComensalesTurno;
            $turno->data = $sample_turno_jsonDataAndTipoD;
            array_push($json_data_turnos, $turno);
        }


        ///////////////////////////////////////////
        $data['json_data_turnos'] = $json_data_turnos;

        /////// Desplegando informacion
        if (verDato($data, '_excel')) {
            ///EXCEL

            $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
            $excel->getProperties()
                ->setCreator('Restouch')
                ->setTitle('Office 2007 xlsx Articulo')
                ->setSubject('Office 2007 xlsx Articulo')
                ->setKeywords('office 2007 openxml php');

            $excel->setActiveSheetIndex(0);
            $hoja = $excel->getActiveSheet();
            $nombres = [
                'Descripción',
                'Monto',
                'Propina',
                'Total',
                'Total (sin I.V.A.)'
            ];

            /*Encabezado*/
            $hoja->getStyle('A1:A3')->getFont()->setBold(true);
            $hoja->setCellValue('A1', 'Empresa: ');
            $hoja->setCellValue('A2', 'Sede: ');
            $hoja->setCellValue('A3', 'Documento: ');

            $hoja->setCellValue('B1', $data['empresa']->nombre);
            $hoja->setCellValue('B2', $data['nsede']);
            $hoja->setCellValue('B3', 'Reporte de Caja por Turno');

            if (isset($data['detalle'])) {
                $hoja->setCellValue('C4', '--Detalle--');
            } else {
                $hoja->setCellValue('C4', '--Resumen--');
            }

            if (isset($data['turno'])) {
                $hoja->setCellValue('C5', $data['turno']->descripcion);
            }

            $hoja->setCellValue('A6', 'Del: ');
            $hoja->setCellValue('B6', $data['fdel']);
            $hoja->setCellValue('A7', 'Al: ');
            $hoja->setCellValue('B7', $data['fal']);
            $hoja->getStyle('A6:A7')->getFont()->setBold(true);


            $fila = 8;
            /// ITEREAMOS POR LOS TURNOS
            foreach ($json_data_turnos as $row) {
                if (
                    !($row->totalComensales > 0) &&
                    !($row->granTotal > 0) &&
                    !($row->cantidadDeMesasUtilizadas > 0)
                ) {
                    continue;
                }
                // NOMBRE DEL TURNO
                $fila = $fila + 3;
                $hoja->setCellValue('C' . $fila, $row->name);
                //
                ///// DATOS DEL TURNO
                foreach ($row->data as $rowD) {


                    //For style usage
                    $start = 0;
                    $end = 0;

                    $fila = $fila + 3;
                    $start = $fila;
                    $hoja->setCellValue('B' . $fila, 'Descripción');
                    $hoja->setCellValue('C' . $fila, 'Monto');
                    $hoja->setCellValue('D' . $fila, 'Propina');
                    $hoja->setCellValue('E' . $fila, 'Total');
                    $hoja->setCellValue('F' . $fila, 'Total (sin I.V.A.)');

                    // Tipo domicilio y descuento
                    $fila++;
                    $hoja->setCellValue('B' . $fila, $rowD->name);
                    $hoja->getStyle('B' . $fila . ':' . 'E' . $fila)->getFont()->setBold(true);

                    foreach ($rowD->ingresos as $rowDI) {
                        $fila++;
                        $hoja->setCellValue('B' . $fila, $rowDI->metodo_pago);
                        $hoja->setCellValue('C' . $fila, number_format($rowDI->monto, 2, '.', ','));
                        $hoja->setCellValue('D' . $fila, number_format($rowDI->propina, 2, '.', ','));
                        $hoja->setCellValue('E' . $fila, number_format($rowDI->total, 2, '.', ','));
                        $hoja->setCellValue('F' . $fila, number_format($rowDI->total_base, 2, '.', ','));
                        $hoja->getStyle('C' . $fila . ':' . 'F' . $fila)->getAlignment()->setHorizontal('right');
                    }

                    $fila++;
                    $hoja->getStyle('D' . $fila . ':' . 'F' . $fila)->getFont()->setBold(true);
                    // $hoja->getStyle('E' . $fila . ':' . 'E' . $fila)->getFont()->setBold(true);
                    $hoja->setCellValue('D' . $fila, 'Total: ');
                    $hoja->setCellValue('E' . $fila, number_format($rowD->consumo_total, 2, '.', ','));
                    $hoja->getStyle('E' . $fila)->getAlignment()->setHorizontal('right');
                    $hoja->setCellValue('F' . $fila, number_format($rowD->consumo_total_base, 2, '.', ','));
                    $hoja->getStyle('F' . $fila)->getAlignment()->setHorizontal('right');
                    $end = $fila;

                    //Set square style
                    $hoja->getStyle("B{$start}:F{$end}")
                        ->getBorders()
                        ->getAllBorders()
                        ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                        ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));
                }
                $fila++;
                $fila++;
                $hoja->setCellValue('D' . $fila, 'Gran Total: ');
                $hoja->setCellValue('E' . $fila, number_format($row->granTotal, 2, '.', ','));
                $hoja->getStyle('D' . $fila . ':' . 'F' . $fila)->getFont()->setBold(true);
                $hoja->getStyle('E' . $fila . ':' . 'E' . $fila)->getAlignment()->setHorizontal('right');
                $hoja->setCellValue('F' . $fila, number_format($row->granTotal_base, 2, '.', ','));
                $hoja->getStyle('F' . $fila . ':' . 'F' . $fila)->getAlignment()->setHorizontal('right');

                $fila++;
                $fila++;
                $hoja->setCellValue('B' . $fila, 'Total de comensales: ');
                $hoja->setCellValue('C' . $fila, $row->totalComensales);
                $hoja->getStyle('B' . $fila)->getFont()->setBold(true);
                $hoja->getStyle('C' . $fila)->getAlignment()->setHorizontal('right');

                $fila++;
                $hoja->setCellValue('B' . $fila, 'Consumo promedio total: ');
                $hoja->setCellValue('C' . $fila, number_format($row->consumo_promedio_total, 2, '.', ','));
                $hoja->getStyle('B' . $fila)->getFont()->setBold(true);
                $hoja->getStyle('C' . $fila)->getAlignment()->setHorizontal('right');

                $fila++;
                $hoja->setCellValue('B' . $fila, 'Cantidad de mesas utilizadas: ');
                $hoja->setCellValue('C' . $fila, $row->cantidadDeMesasUtilizadas);
                $hoja->getStyle('B' . $fila)->getFont()->setBold(true);
                $hoja->getStyle('C' . $fila)->getAlignment()->setHorizontal('right');

                $fila++;
            }

            foreach (range('A', 'F') as $col) {
                $hoja->getColumnDimension($col)->setAutoSize(true);
            }

            $hoja->setTitle('Reporte de caja por turnos');

            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename=Ventas.xlsx');
            header('Cache-Control: max-age=1');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
            header('Cache-Control: cache, must-revalidate');
            header('Pragma: public');

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
            $writer->save('php://output');
        } else {
            $mpdf = new \Mpdf\Mpdf([
                'tempDir' => sys_get_temp_dir(),
                'format' => 'Legal'
            ]);
            $mpdf->WriteHTML($this->load->view('caja_t_r', $data, true));
            $mpdf->Output('Reporte de Caja Turno.pdf', 'D');
        }
    }

    public function caja()
    {

        // $data = json_decode(file_get_contents('php://input'), true);
        $data = $this->get_info_corte_caja(json_decode(file_get_contents('php://input'), true));
        if (!isset($data['_digital'])) {
            $data['_digital'] = false;
        }

        $data['tipo_venta'] = [];
        if (isset($data['_encomandera']) && (int)$data['_encomandera'] === 1) {
            $data['tipo_venta'] = $this->get_por_tipo_venta($data);
        }


        if (verDato($data, '_excel')) {
            $fdel = formatoFecha($data['fdel'], 2);
            $fal = formatoFecha($data['fal'], 2);

            $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
            $excel->getProperties()
                ->setCreator('Restouch')
                ->setTitle('Office 2007 xlsx Articulo')
                ->setSubject('Office 2007 xlsx Articulo')
                ->setKeywords('office 2007 openxml php');

            $excel->setActiveSheetIndex(0);
            $hoja = $excel->getActiveSheet();
            $nombres = [
                'Descripción',
                'Monto',
                'Propina',
                'Total'
            ];

            /*Encabezado*/
            $hoja->setCellValue('A1', $data['empresa']->nombre);
            $hoja->setCellValue('A2', $data['nsede']);
            $hoja->setCellValue('B3', 'Reporte de Caja');

            if (empty($data['_tipo_cc'])) {
                if (isset($data['detalle'])) {
                    $hoja->setCellValue('B4', '--Detalle--');
                } else {
                    $hoja->setCellValue('B4', '--Resumen--');
                }
            } else {
                $hoja->setCellValue('B4', $data['_tipo_cc']);
            }


            if (isset($data['turno'])) {
                $hoja->setCellValue('B5', $data['turno']->descripcion);
            }

            $hoja->setCellValue('A6', "Del: {$fdel}");
            $hoja->setCellValue('B6', "Al: {$fal}");

            if ($data['_validar']) {
                array_push($nombres, 'Monto Recibido');
                array_push($nombres, 'Diferencia');
            }

            $hoja->fromArray($nombres, null, 'A8');
            $hoja->getStyle('A1:F8')->getFont()->setBold(true);
            $hoja->getStyle('A8:F8')->getAlignment()->setHorizontal('center');

            $fila = 9;
            $recIng = 0;
            $recDesc = 0;

            if (!isset($data['_grupo']) || $data['_grupo'] == 1) {
                $hoja->setCellValue("A{$fila}", 'Ingresos');
                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');
                $hoja->getStyle("A{$fila}")->getFont()->setBold(true);
                $fila++;

                foreach ($data['ingresos'] as $row) {
                    $regs = [
                        $row->descripcion,
                        $row->monto,
                        $row->propina,
                        $row->monto + $row->propina
                    ];

                    if ($data['_validar']) {
                        $rec = verDato($data['pagos'], $row->forma_pago, '0.00');
                        $recIng += $rec;
                        array_push($regs, (float)$rec !== (float)0 ? round($rec, 2) : '0.00');

                        $clase = '';
                        $ing = $row->monto + $row->propina;
                        $dif = $ing - $rec;

                        array_push($regs, (float)$dif !== (float)0 ? round($dif, 2) : '0.00');
                    }

                    $hoja->fromArray($regs, null, "A{$fila}");
                    $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $fila++;
                }

                if ($data['_validar']) {
                    foreach ($data['ingreso_sin_fact'] as $row) {
                        $regs = [
                            $row->descripcion,
                            '0.00',
                            '0.00',
                            '0.00'
                        ];

                        $rec = verDato($data['pagos'], $row->forma_pago, '0.00');
                        $recIng += $rec;
                        array_push($regs, (float)$rec !== (float)0 ? round($rec, 2) : '0.00');

                        $clase = '';
                        $ing = (isset($row->monto) ? $row->monto : '0.00') + (isset($row->propina) ? $row->propina : '0.00');
                        $dif = $ing - $rec;

                        array_push($regs, (float)$dif !== (float)0 ? round($dif, 2) : '0.00');

                        $hoja->fromArray($regs, null, "A{$fila}");
                        $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        $fila++;
                    }
                }

                $hoja->setCellValue("A{$fila}", 'Total ingresos: ');

                $ing = suma_field($data['ingresos'], 'monto');
                $hoja->setCellValue("B{$fila}", round($ing, 2));

                $prop = suma_field($data['ingresos'], 'propina');
                $hoja->setCellValue("C{$fila}", (float)$prop !== (float)0 ? round($prop, 2) : '0.00');

                $hoja->setCellValue("D{$fila}", round($ing + $prop, 2));

                if ($data['_validar']) {
                    $hoja->setCellValue("E{$fila}", round($recIng, 2));

                    $hoja->setCellValue("F{$fila}", round($ing + $prop - $recIng, 2));
                }

                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $fila++;

                $hoja->setCellValue("A{$fila}", 'Descuentos');
                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');
                $hoja->getStyle("A{$fila}")->getFont()->setBold(true);

                foreach ($data['descuentos'] as $row) {
                    $fila++;
                    $hoja->setCellValue("A{$fila}", $row->descripcion);

                    $row->monto = (float)$row->monto;
                    $hoja->setCellValue("B{$fila}", round($row->monto, 2));

                    $row->propina = (float)$row->propina;
                    $hoja->setCellValue("C{$fila}", (float)$row->propina !== (float)0 ? round($row->propina, 2) : '0.00');

                    $hoja->setCellValue("D{$fila}", (float)($row->monto + $row->propina) !== (float)0 ? round($row->monto + $row->propina, 2) : '0.00');

                    if ($data['_validar']) {
                        $rec = verDato($data['pagos'], $row->forma_pago, '0');
                        $recDesc += $rec;
                        $hoja->setCellValue("E{$fila}", (float)$rec !== (float)0 ? round($rec, 2) : '0.00');

                        // $dif = abs($row->monto - $rec);
                        $dif = $row->monto + $row->propina - $rec;
                        $hoja->setCellValue("F{$fila}", (float)$dif !== (float)0 ? round($dif, 2) : '0.00');
                    }
                    $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                }

                if ($data['_validar']) {
                    foreach ($data['descuento_sin_fact'] as $row) {
                        $fila++;
                        $hoja->setCellValue("A{$fila}", $row->descripcion);
                        $hoja->setCellValue("B{$fila}", round('0.00', 2));
                        $hoja->setCellValue("C{$fila}", round('0.00', 2));
                        $hoja->setCellValue("D{$fila}", round('0.00', 2));

                        if ($data['_validar']) {
                            $rec = verDato($data['pagos'], $row->forma_pago, '0');
                            $recDesc += $rec;
                            $hoja->setCellValue("E{$fila}", (float)$rec !== (float)0 ? round($rec, 2) : '0.00');

                            // $dif = abs(0 - $rec);
                            $dif = 0 - $rec;
                            $hoja->setCellValue("F{$fila}", (float)$dif !== (float)0 ? round($dif, 2) : '0.00');
                        }
                        $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    }
                }

                $fila++;

                $hoja->setCellValue("A{$fila}", 'Total Descuentos: ');

                $desc = suma_field($data['descuentos'], 'monto');
                $hoja->setCellValue("B{$fila}", round($desc, 2));

                $prop_desc = suma_field($data['descuentos'], 'propina');
                $hoja->setCellValue("C{$fila}", round($prop_desc, 2));

                $hoja->setCellValue("D{$fila}", round($desc, 2));

                if ($data['_validar']) {
                    $hoja->setCellValue("E{$fila}", round($recDesc, 2));

                    // $hoja->setCellValue("F{$fila}", round(abs($desc - $recDesc), 2));
                    $hoja->setCellValue("F{$fila}", round($desc + $prop_desc - $recDesc, 2));
                }

                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $fila++;

                $hoja->setCellValue("A{$fila}", 'TOTAL: ');
                $hoja->setCellValue("B{$fila}", round(($desc + $ing), 2));
                $hoja->setCellValue("C{$fila}", round($prop + $prop_desc, 2));
                $hoja->setCellValue("D{$fila}", round(($desc + $ing + $prop + $prop_desc), 2));
                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');

                if ($data['_validar']) {
                    $hoja->setCellValue("E{$fila}", round($recIng + $recDesc, 2));
                    // $hoja->setCellValue("F{$fila}", round(abs($ing + $prop + $desc - ($recIng + $recDesc)), 2));
                    $hoja->setCellValue("F{$fila}", round($ing + $prop + $prop_desc + $desc - ($recIng + $recDesc), 2));
                }

                $fila++;
                $hoja->setCellValue("A{$fila}", 'COMENSALES: ');
                $hoja->setCellValue("B{$fila}", $data['totalComensales']);
                $hoja->setCellValue("C{$fila}", 'CONSUMO/COMENSAL:');
                $hoja->setCellValue("D{$fila}", round($data['totalComensales'] > 0 ? (($desc + $ing + $prop + $prop_desc) / $data['totalComensales']) : 0, 2));

                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
            } else {
                $totalIngresos = 0;
                $totalDescuentos = 0;
                $totalPropinas = 0;
                $totalPropDescuentos = 0;

                foreach ($data['ingresos'] as $value) {
                    $hoja->setCellValue("A{$fila}", $value[0]->nsede);
                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');
                    $fila++;

                    $hoja->setCellValue("A{$fila}", 'Ingresos');
                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $fila++;

                    foreach ($value as $row) {
                        $hoja->setCellValue("A{$fila}", $row->descripcion);
                        $hoja->setCellValue("B{$fila}", round($row->monto, 2));
                        $hoja->setCellValue("C{$fila}", round($row->propina, 2));
                        $total = $row->monto + $row->propina;
                        $hoja->setCellValue("D{$fila}", round($total, 2));

                        if ($data['_validar']) {
                            $rec = verDato($data['pagos'], $row->forma_pago, '0');
                            $recIng += $rec;
                            $hoja->setCellValue("E{$fila}", round($rec, 2));

                            // $dif = abs($ing - $rec);
                            $dif = $recIng - $rec;
                            $hoja->setCellValue("F{$fila}", round($dif, 2));
                        }
                        $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        $fila++;
                    }
                    $ing = suma_field($value, 'monto');
                    $prop = suma_field($value, 'propina');
                    $totalIngresos += $ing;
                    $totalPropinas += $prop;

                    $hoja->setCellValue("A{$fila}", 'Total Ingresos ' . $value[0]->nsede);
                    $hoja->setCellValue("B{$fila}", round($ing, 2));
                    $hoja->setCellValue("C{$fila}", round($prop, 2));
                    $hoja->setCellValue("D{$fila}", round($prop + $ing, 2));

                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $fila++;
                }

                $hoja->setCellValue("A{$fila}", 'Total Ingresos: ');
                $hoja->setCellValue("B{$fila}", round($totalIngresos, 2));
                $hoja->setCellValue("C{$fila}", round($totalPropinas, 2));
                $hoja->setCellValue("D{$fila}", round($totalPropinas + $totalIngresos, 2));

                $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $fila++;

                foreach ($data['descuentos'] as $value) {
                    $fila++;
                    $hoja->setCellValue("A{$fila}", $value[0]->nsede);
                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');

                    $fila++;
                    $hoja->setCellValue("A{$fila}", 'Descuentos');
                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);

                    foreach ($value as $row) {
                        $fila++;
                        $hoja->setCellValue("A{$fila}", $row->descripcion);
                        $hoja->setCellValue("B{$fila}", round($row->monto, 2));
                        $hoja->setCellValue("C{$fila}", round($row->propina, 2));
                        $hoja->setCellValue("D{$fila}", round($row->monto + $row->propina, 2));

                        $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    }
                    $fila++;
                    $hoja->setCellValue("A{$fila}", 'Total Descuentos ' . $value[0]->nsede);
                    $desc = suma_field($value, 'monto');
                    $prop_desc = suma_field($value, 'propina');
                    $totalDescuentos += $desc;
                    $totalPropDescuentos += $prop_desc;
                    $hoja->setCellValue("B{$fila}", round($desc, 2));
                    $hoja->setCellValue("C{$fila}", round($prop_desc, 2));
                    $hoja->setCellValue("D{$fila}", round($desc + $prop_desc, 2));

                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                }
                $fila++;
                $hoja->setCellValue("A{$fila}", 'Total Descuentos: ');
                $hoja->setCellValue("B{$fila}", round($totalDescuentos, 2));
                $hoja->setCellValue("C{$fila}", round($totalPropDescuentos, 2));
                $hoja->setCellValue("D{$fila}", round($totalDescuentos + $totalPropDescuentos, 2));

                $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $fila++;
            }

            if (verDato($data, 'detalle')) {
                $fila += 2;
                foreach ($data['detalle'] as $key => $row) {
                    $hoja->setCellValue("A{$fila}", $key);
                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $fila++;

                    $hoja->mergeCells("A{$fila}:B{$fila}");
                    $hoja->setCellValue("A{$fila}", 'Factura');
                    $hoja->setCellValue("C{$fila}", 'Fecha');
                    $hoja->setCellValue("D{$fila}", 'Documento');
                    $hoja->setCellValue("E{$fila}", 'Monto');
                    $hoja->setCellValue("F{$fila}", 'Propina');
                    $hoja->getStyle("A{$fila}:F{$fila}")->getFont()->setBold(true);
                    $fila++;

                    foreach ($row as $det) {
                        $hoja->setCellValue("A{$fila}", $det->serie_factura);
                        $hoja->setCellValue("B{$fila}", $det->numero_factura);
                        $hoja->getStyle("C{$fila}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_DATE_DDMMYYYY);
                        $valFecha = \PhpOffice\PhpSpreadsheet\Shared\Date::PHPToExcel($det->fecha_factura);
                        $hoja->setCellValue("C{$fila}", $valFecha);
                        $hoja->setCellValue("D{$fila}", $det->documento);
                        $hoja->setCellValue("E{$fila}", round($det->monto, 2));
                        $hoja->setCellValue("F{$fila}", round($det->propina, 2));
                        $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('left');
                        $hoja->getStyle("E{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        $hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        if (isset($det->estatus_comanda) && (int)$det->estatus_comanda === 3) {
                            $hoja->getStyle("A{$fila}:F{$fila}")->applyFromArray(array('font' => array('color' => array('rgb' => 'FF0000'))));
                        }
                        $fila++;
                    }
                }
            }

            $fila += 3;

            if ($data['_digital']) {
                $hoja->setCellValue("A{$fila}", 'Este reporte no toma en cuenta los montos de la caja física.');
                $hoja->mergeCells("A{$fila}:D{$fila}");
                $hoja->getStyle("A{$fila}")->getFont()->setBold(true);
                $fila++;
                $hoja->setCellValue("A{$fila}", '(Saldo inicial, Arqueos, Retiros o Saldo final)');
                $hoja->mergeCells("A{$fila}:D{$fila}");
                $hoja->getStyle("A{$fila}")->getFont()->setBold(true);
                $fila += 3;
            }

            $hoja->setCellValue("A{$fila}", "Impresión: {$data['fhimpresion']}");
            // $hoja->getStyle("A{$fila}")->getNumberFormat()->setFormatCode('dd/mm/yyyy h:mm:ss');
            $hoja->getStyle("A{$fila}")->getFont()->setBold(true);

            for ($i = 0; $i <= count($nombres); $i++) {
                $hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
            }

            $hoja->setTitle('Corte de caja');

            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename=Ventas.xlsx');
            header('Cache-Control: max-age=1');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
            header('Cache-Control: cache, must-revalidate');
            header('Pragma: public');

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
            $writer->save('php://output');
        } else if (verDato($data, '_encomandera')) {
            $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($data));
        } else {

            $tmp = sys_get_temp_dir();
            $mpdf = new \Mpdf\Mpdf([
                'tempDir' => $tmp, //sys_get_temp_dir(),
                'format' => 'Legal'
            ]);
            $mpdf->WriteHTML($this->load->view('caja', $data, true));

            if (verDato($data, '_rturno')) {

                $ruta = $tmp . '/reporte_caja_' . rand() . '.pdf';
                $mpdf->Output($ruta, 'F');

                $this->output
                    ->set_content_type('application/json')
                    ->set_output(json_encode(['ruta' => $ruta]));
            } else {
                $mpdf->Output('Reporte de Caja.pdf', 'D');
            }

            // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($data));
        }
    }

    public function factura()
    {
        ini_set('pcre.backtrack_limit', '15000000');
        $_GET['sede'] = isset($_GET['sede']) && (int)$_GET['sede'] > 0 ? $_GET['sede'] : $this->data->sede;
        $_GET['_facturadas'] = true;

        $facts = $this->Factura_model->get_facturas($_GET);

        $data = $_GET;
        $data['impuesto_especial'] = false;

        $data['facturas'] = [];
        foreach ($facts as $row) {
            $fac = new Factura_model($row->factura);
            $fac->mesa = $fac->getMesa(false);
            $fac->cargarReceptor();
            $prop = $fac->getPropina();
            $det = $fac->getDetalle();
            $fac->total = suma_field($det, 'total');
            $fac->propina = suma_field($prop, 'propina_monto');
            $data['facturas'][] = $fac;
            if (isset($_GET['_anuladas']) && filter_var($_GET['_anuladas'], FILTER_VALIDATE_BOOLEAN)) {
                $bit = $this->Bitacora_model->buscarBitacora([
                    'comentario' => 'Anulación',
                    '_uno' => true,
                    'tabla' => 'factura',
                    'registro' => $fac->getPK()
                ]);
                $bit->usuario = $this->Usuario_model->buscar([
                    'usuario' => $bit->usuario,
                    '_uno' => true
                ]);
                $fac->bitacora = $bit;
                $fac->razon_anulacion = $fac->getRazonAnulacion();
            }
            if (suma_field($det, 'valor_impuesto_especial') > 0) {
                $data['impuesto_especial'] = true;
            }
        }

        $sede = $this->Catalogo_model->getSede(['sede' => $_GET['sede'], '_uno' => true]);

        if ($sede) {
            $emp = $this->Catalogo_model->getEmpresa(['empresa' => $sede->empresa, '_uno' => true]);
            if ($emp) {
                $data['empresa'] = $emp;
                $data['sede'] = $sede;
            }
        }

        $data['ventas_sin_factura'] = $this->Factura_model->get_ventas_sin_factura($_GET);
        $data['resumen_tipo_venta'] = $this->Factura_model->get_resumen_tipo_venta($data['facturas']);
        if (verDato($_GET, '_excel')) {
            $fdel = formatoFecha($_GET['fdel'], 2);
            $fal = formatoFecha($_GET['fal'], 2);
            $anuladas = isset($data['_anuladas']) && filter_var($data['_anuladas'], FILTER_VALIDATE_BOOLEAN);
            $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
            $excel->getProperties()
                ->setCreator('Restouch')
                ->setTitle('Office 2007 xlsx Articulo')
                ->setSubject('Office 2007 xlsx Articulo')
                ->setKeywords('office 2007 openxml php');

            $excel->setActiveSheetIndex(0);
            $hoja = $excel->getActiveSheet();
            $nombres = [
                'Factura',
                'Mesa',
                'Fecha',
                'NIT',
                'Cliente'
            ];

            if ($data['impuesto_especial']) {
                $nombres[] = 'Impuesto Especial';
                $hoja->getStyle('F9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('G9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('H9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('I9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('I')->getNumberFormat()->setFormatCode('0.00');
                $hoja->getStyle('I')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('J')->getAlignment()->setHorizontal('center');
            } else {
                $hoja->getStyle('F9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('G9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('H9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('I')->getAlignment()->setHorizontal('center');
            }

            if ($anuladas) {
                array_push($nombres, 'Fecha de anulación');
                array_push($nombres, 'Usuario que anuló');
                array_push($nombres, 'Motivo');
            }

            array_push($nombres, 'Total');
            array_push($nombres, 'Propina');
            array_push($nombres, 'Descuento');
            array_push($nombres, 'Estatus');

            /*Encabezado*/
            $hoja->setCellValue('A1', $data['empresa']->nombre);
            $hoja->setCellValue('A2', "{$data['sede']->nombre} ({$data['sede']->alias})");
            $hoja->setCellValue('A4', 'Detalle de facturas');
            $hoja->setCellValue('A5', "Del: {$fdel} al: {$fal}");

            $hoja->fromArray($nombres, null, 'A9');
            $hoja->getStyle('A1:A8')->getFont()->setBold(true);
            $hoja->getStyle('A9:M9')->getFont()->setBold(true);
            $hoja->setCellValue('A7', 'Facturas');
            $hoja->setCellValue('A8', 'FEL');
            $hoja->getStyle('A')->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_TEXT);
            $hoja->getStyle('E')->getNumberFormat()->setFormatCode('0.00');
            $hoja->getStyle('E')->getNumberFormat()->setFormatCode('0.00');
            $hoja->getStyle('F')->getNumberFormat()->setFormatCode('0.00');
            $hoja->getStyle('G')->getNumberFormat()->setFormatCode('0.00');
            $hoja->getStyle('H')->getNumberFormat()->setFormatCode('0.00');

            $hoja->getStyle('E')->getAlignment()->setHorizontal('right');
            $hoja->getStyle('F')->getAlignment()->setHorizontal('right');
            $hoja->getStyle('G')->getAlignment()->setHorizontal('right');
            $hoja->getStyle('H')->getAlignment()->setHorizontal('right');

            // $hoja->getStyle('A9:M9')->getAlignment()->setHorizontal('center');
            $hoja->getStyle('A9')->getAlignment()->setHorizontal('left');
            $hoja->getStyle('B9')->getAlignment()->setHorizontal('center');
            $hoja->getStyle('C9')->getAlignment()->setHorizontal('center');
            $hoja->getStyle('D9')->getAlignment()->setHorizontal('left');
            $hoja->getStyle('E9')->getAlignment()->setHorizontal('left');

            if (isset($_GET['_anuladas']) && filter_var($_GET['_anuladas'], FILTER_VALIDATE_BOOLEAN)) {
                $hoja->getStyle('F9')->getAlignment()->setHorizontal('left');
                $hoja->getStyle('G9')->getAlignment()->setHorizontal('left');
                $hoja->getStyle('H9')->getAlignment()->setHorizontal('left');
                $hoja->getStyle('I9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('J9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('K9')->getAlignment()->setHorizontal('right');
                $hoja->getStyle('L9')->getAlignment()->setHorizontal('center');
                $hoja->getStyle('I')->getNumberFormat()->setFormatCode('0.00');
                $hoja->getStyle('J')->getNumberFormat()->setFormatCode('0.00');
                $hoja->getStyle('K')->getNumberFormat()->setFormatCode('0.00');
            }

            $fila = 11;
            $totalFactura = 0;
            $totalPropina = 0;
            $totalDescuento = 0;

            foreach ($data['facturas'] as $row) {
                $detalle = $row->getDetalle();
                $desc = suma_field($detalle, 'descuento');
                $total = suma_field($detalle, 'total');
                $imp = suma_field($detalle, 'valor_impuesto_especial');
                $total += (float)$imp;
                if (empty($row->fel_uuid_anulacion) || $anuladas) {
                    $totalPropina += (float)$row->propina;
                    $totalDescuento += (float)$desc;
                    $totalFactura += $total;
                }


                $docReceptor = $row->documento_receptor ?? $row->receptor->nit;
                $reg = [
                    $row->numero_factura,
                    isset($row->mesa->mesa) ? $row->mesa->mesa : '',
                    formatoFecha($row->fecha_factura, 2),
                    // (empty($row->fel_uuid_anulacion) ? $row->receptor->nit : ''),
                    is_numeric($docReceptor) ? '=TEXT(' . $docReceptor . ',"0")' : $docReceptor,
                    // (empty($row->fel_uuid_anulacion) ? $row->receptor->nombre : 'ANULADA')
                    $row->receptor->nombre
                ];

                if ($data['impuesto_especial']) {
                    // $reg[] = (empty($row->fel_uuid_anulacion) ? round($imp, 2) : 0);
                    $reg[] = round($imp, 2);
                }

                if ($anuladas) {
                    array_push($reg, formatoFecha($row->bitacora->fecha));
                    array_push($reg, "{$row->bitacora->usuario->nombres} {$row->bitacora->usuario->apellidos}");
                    array_push($reg, isset($row->razon_anulacion->descripcion) ? $row->razon_anulacion->descripcion : (isset($row->bitacora->comentario) ? $row->bitacora->comentario : ''));
                }

                // array_push($reg, (empty($row->fel_uuid_anulacion) ? round($total, 2) : 0));
                array_push($reg, round($total, 2));
                // array_push($reg, (empty($row->fel_uuid_anulacion) ? round($row->propina, 2) : 0));
                array_push($reg, (float)$row->propina === 0.00 ? '0.00' : round($row->propina, 2));
                // array_push($reg, (empty($row->fel_uuid_anulacion) ? round($desc, 2) : 0));
                array_push($reg, (float)$desc === 0.00 ? '0.00' : round($desc, 2));
                array_push($reg, (empty($row->fel_uuid_anulacion) ? 'ACTIVA' : 'ANULADA'));

                $hoja->fromArray($reg, null, "A{$fila}");
                $hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('left');
                $hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('center');
                $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('center');
                $hoja->getStyle("D{$fila}")->getAlignment()->setHorizontal('left');
                $hoja->getStyle("E{$fila}")->getAlignment()->setHorizontal('left');

                if (isset($_GET['_anuladas']) && filter_var($_GET['_anuladas'], FILTER_VALIDATE_BOOLEAN)) {
                    $hoja->getStyle("F{$fila}")->getAlignment()->setHorizontal('left');
                    $hoja->getStyle("G{$fila}")->getAlignment()->setHorizontal('left');
                    $hoja->getStyle("H{$fila}")->getAlignment()->setHorizontal('left');
                    $hoja->getStyle("I{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("J{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("K{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("L{$fila}")->getAlignment()->setHorizontal('center');
                }

                $fila++;

                if (isset($data['_detalle']) && $data['_detalle'] !== 'false') {
                    $tituloDet = [
                        '',
                        '',
                        '',
                        'Artículo', // Columnas del articulo
                        'Cantidad' // Columnas del articulo
                    ];

                    // if ($data['impuesto_especial']) {
                    // 	$tituloDet[] = 'Impuesto Especial';
                    // }

                    array_push($tituloDet, 'Total');  // Columnas del articulo
                    array_push($tituloDet, 'Descuento'); //Columans del articulo
                    $hoja->fromArray($tituloDet, null, "A{$fila}");
                    $hoja->getStyle("A{$fila}:L{$fila}")->getFont()->setBold(true);
                    $fila++;

                    foreach ($detalle as $det) {
                        $reg = [
                            '',  // Espacio en blanco de columna A
                            '',  // Espacio en blanco de columna B
                            '',  // Espacio en blanco de columna C
                            $det->articulo->descripcion, //Nombre del articulo, Col D
                            $det->cantidad, // Alado cantidad del articulo, Col E
                            round($det->total, 2), // Col F
                            $det->descuento // Col Descuento G
                        ];
                        $hoja->fromArray($reg, null, "A{$fila}");
                        $fila++;
                    }
                }
            }

            $col = 5;

            if ($anuladas) {
                $col += 3;
            }

            if ($data['impuesto_especial']) {
                $col += 1;
            }

            $total = [];
            $total2 = [];
            $total3 = [];
            $total4 = [];
            for ($i = 0; $i < $col - 1; $i++) {
                $total[$i] = '';
                $total2[$i] = '';
                $total3[$i] = '';
                $total4[$i] = '';
            }

            array_push($total, 'Total (con desct., con propina):');
            array_push($total, round($totalFactura, 2));
            array_push($total, round($totalPropina, 2));
            array_push($total, round($totalDescuento, 2));

            $fila++;
            $hoja->fromArray($total, null, "A{$fila}");
            $hoja->getStyle("A{$fila}:L{$fila}")->getFont()->setBold(true);

            // array_push($total2, 'Total (con desct., sin propina):');
            // array_push($total2, round($totalFactura - $totalPropina, 2));
            // array_push($total2, '');
            // array_push($total2, '');

            // $fila++;
            // $hoja->fromArray($total2, null, "A{$fila}");
            // $hoja->getStyle("A{$fila}:L{$fila}")->getFont()->setBold(true);

            array_push($total3, 'Ventas sin factura:');
            array_push($total3, round($data['ventas_sin_factura'], 2));
            array_push($total3, '');
            array_push($total3, '');

            $fila++;
            $hoja->fromArray($total3, null, "A{$fila}");
            $hoja->getStyle("A{$fila}:L{$fila}")->getFont()->setBold(true);

            array_push($total4, 'Total ingresos (con desct.):');
            array_push($total4, round($totalFactura + $data['ventas_sin_factura'], 2));
            array_push($total4, '');
            array_push($total4, '');

            $fila++;
            $hoja->fromArray($total4, null, "A{$fila}");
            $hoja->getStyle("A{$fila}:L{$fila}")->getFont()->setBold(true);

            for ($i = 0; $i <= count($nombres); $i++) {
                $hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
            }

            $fila += 2;
            if (!$anuladas) {
                $hoja->setCellValue("A{$fila}", 'NOTA: Este resumen no toma en cuenta facturas anuladas ni ventas sin factura.');
                $hoja->getStyle("A{$fila}")->getFont()->setBold(true);
                $fila++;
                $hoja->setCellValue("A{$fila}", 'Tipo');
                $hoja->setCellValue("B{$fila}", 'Cantidad');
                $hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->setCellValue("C{$fila}", 'Total');
                $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->setCellValue("D{$fila}", 'IVA');
                $hoja->getStyle("D{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("A{$fila}:D{$fila}")->getFont()->setBold(true);
                $fila++;
                $suma_tipo_venta = 0.0;
                $suma_cantidad_tipo_venta = 0.0;
                $suma_iva = 0.0;
                foreach ($data['resumen_tipo_venta'] as $rtv) {
                    $suma_cantidad_tipo_venta += (float)$rtv->cantidad;
                    $suma_tipo_venta += (float)$rtv->total;
                    $suma_iva += (float)$rtv->iva;
                    $hoja->setCellValue("A{$fila}", $rtv->tipo_venta);
                    $hoja->setCellValue("B{$fila}", (float)$rtv->cantidad);
                    $hoja->setCellValue("C{$fila}", (float)$rtv->total);
                    $hoja->setCellValue("D{$fila}", (float)$rtv->iva);
                    $hoja->getStyle("B{$fila}:D{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("B{$fila}:D{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $fila++;
                }
                $hoja->setCellValue("A{$fila}", 'TOTAL:');
                $hoja->setCellValue("B{$fila}", $suma_cantidad_tipo_venta);
                $hoja->setCellValue("C{$fila}", $suma_tipo_venta);
                $hoja->setCellValue("D{$fila}", $suma_iva);
                $hoja->getStyle("B{$fila}:D{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $hoja->getStyle("A{$fila}:D{$fila}")->getAlignment()->setHorizontal('right');
                $hoja->getStyle("A{$fila}:D{$fila}")->getFont()->setBold(true);
            }

            $hoja->setTitle('Facturas');

            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename=Ventas.xlsx');
            header('Cache-Control: max-age=1');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
            header('Cache-Control: cache, must-revalidate');
            header('Pragma: public');

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
            $writer->save('php://output');
        } else {
            $mpdf = new \Mpdf\Mpdf([
                'tempDir' => sys_get_temp_dir(),
                'format' => 'Legal'
            ]);
            $mpdf->WriteHTML($this->load->view('detalle_factura', $data, true));
            $mpdf->Output('Detalle de Facturas.pdf', 'D');
            // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($data));
        }
        //$mpdf->AddPage();
    }

    public function comanda()
    {
        $_GET['sede'] = $this->data->sede;
        $tmp = $this->Comanda_model->getComandas($_GET);
        $datos = [];
        $data = $_GET;
        $mpdf = new \Mpdf\Mpdf([
            'tempDir' => sys_get_temp_dir(),
            'format' => 'Legal'
        ]);
        foreach ($tmp as $row) {
            $comanda = new Comanda_model($row->comanda);
            $datos[] = $comanda->getComanda();
        }

        $data['comanda'] = $datos;

        $sede = $this->Catalogo_model->getSede([
            'sede' => $this->data->sede,
            '_uno' => true
        ]);

        if ($sede) {
            $emp = $this->Catalogo_model->getEmpresa([
                'empresa' => $sede->empresa,
                '_uno' => true
            ]);
            if ($emp) {
                $data['empresa'] = $emp;
                $data['sede'] = $sede;
            }
        }


        $mpdf->WriteHTML($this->load->view('comanda', $data, true));
        $mpdf->Output('Detalle de Comandas.pdf', 'D');
    }

    public function autoconsulta()
    {
        $req = json_decode(file_get_contents('php://input'), true);
        $req['sede'] = $this->data->sede;
        $datos = $this->Reporte_model->autoconsulta($req);
        $excel = new Spreadsheet();
        $excel->getProperties()
            ->setCreator('Restouch')
            ->setTitle('Office 2007 xlsx Dinamico')
            ->setSubject('Office 2007 xlsx Dinamico')
            ->setKeywords('office 2007 openxml php');

        $excel->setActiveSheetIndex(0);
        $hoja = $excel->getActiveSheet();
        if ($datos) {
            $nombres = array_keys((array)$datos[0]);
            $cntnombres = count($nombres);

            $hoja->fromArray($nombres, null, 'A5');

            $pos = 6;
            foreach ($datos as $key => $row) {
                $hoja->fromArray((array)$row, null, "A{$pos}");
                $pos += 1;
            }

            $hoja->setTitle('Dinamico');

            for ($i = 0; $i <= $cntnombres; $i++) {
                $hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
            }
        }

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename=Dinamico.xlsx');
        header('Cache-Control: max-age=1');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
        header('Cache-Control: cache, must-revalidate');
        header('Pragma: public');

        $writer = new Xlsx($excel);
        $writer->save('php://output');

        #$obwrite = PHPExcel_IOFactory::createWriter($excel, 'Excel5');
        #$obwrite->save('php://output');
    }

    public function distribucion_propina()
    {
        $this->load->model(['Propina_model', 'Tipo_usuario_model']);
        $_GET['sede'] = $this->data->sede;
        $_GET['_vivas'] = true;
        $facts = $this->Factura_model->get_facturas($_GET);
        $distProp = $this->Propina_model->buscar([
            'sede' => $this->data->sede,
            'grupal' => 1,
            'anulado' => 0
        ]);

        $grupos = array_result($distProp, 'usuario_tipo');
        $datos = $_GET;

        $datos['detalle'] = (isset($_GET['_detalle']) && $_GET['_detalle'] != 'false');

        $datos['datos'] = [];

        foreach ($facts as $row) {
            $fac = new Factura_model($row->factura);
            $propina = suma_field($fac->getPropina(), 'propina_monto');
            $comanda = $fac->getComanda();
            $fac->propina = $propina / 1.12;

            if ($comanda->getPK() && $fac->propina > 0) {
                $tmp = $comanda->getTurno();
                $turno = new Turno_model($tmp->turno);
                $usuarios = $turno->getUsuarios(); // obtener usuarios del turno
                foreach ($distProp as $prop) {
                    $tusuario = $this->Tipo_usuario_model->buscar([
                        'usuario_tipo' => $prop->usuario_tipo,
                        '_uno' => true
                    ]);

                    if (isset($datos['datos'][$tusuario->usuario_tipo])) {
                        $datos['datos'][$tusuario->usuario_tipo]['facturas'][] = $fac;
                        $datos['datos'][$tusuario->usuario_tipo]['propina'] += ($propina * $prop->porcentaje / 100) / 1.12;
                        $datos['datos'][$tusuario->usuario_tipo]['grupal'] = (int)$prop->grupal;
                    } else {
                        $datos['datos'][$tusuario->usuario_tipo] = [
                            'descripcion' => $tusuario->descripcion,
                            'facturas' => [$fac],
                            'porcentaje' => $prop->porcentaje,
                            'propina' => ($propina * $prop->porcentaje / 100) / 1.12,
                            'grupal' => (int)$prop->grupal
                        ];
                    }
                }

                foreach ($usuarios as $usu) {
                    $dist = $this->Propina_model->buscar([
                        'sede' => $this->data->sede,
                        'usuario_tipo' => $usu->usuario_tipo->usuario_tipo,
                        'anulado' => 0,
                        '_uno' => true
                    ]);

                    if ($dist) {
                        if (strtolower(trim($usu->usuario_tipo->descripcion)) == 'mesero') {
                            if ($comanda->mesero == $usu->usuario->usuario) {
                                if (!isset($datos['datos'][$usu->usuario_tipo->usuario_tipo])) {
                                    $datos['datos'][$usu->usuario_tipo->usuario_tipo] = [
                                        'descripcion' => $usu->usuario_tipo->descripcion,
                                        'porcentaje' => $dist->porcentaje,
                                        'usuario' => []
                                    ];
                                }
                                if (isset($datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario])) {
                                    $datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario]['facturas'][] = $fac;
                                    $datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario]['propina'] += ($propina * $dist->porcentaje / 100) / 1.12;
                                } else {
                                    $datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario] = [
                                        'nombre' => $usu->usuario->nombres . ' ' . $usu->usuario->apellidos,
                                        'facturas' => [$fac],
                                        'propina' => ($propina * $dist->porcentaje / 100) / 1.12
                                    ];
                                }
                            }
                        } else {
                            if (!isset($datos['datos'][$usu->usuario_tipo->usuario_tipo])) {
                                $datos['datos'][$usu->usuario_tipo->usuario_tipo] = [
                                    'descripcion' => $usu->usuario_tipo->descripcion,
                                    'porcentaje' => $dist->porcentaje,
                                    'usuario' => []
                                ];
                            }

                            if (isset($datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario])) {
                                $datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario]['facturas'][] = $fac;
                                $datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario]['propina'] += ($propina * $dist->porcentaje / 100) / 1.12;
                            } else {
                                $datos['datos'][$usu->usuario_tipo->usuario_tipo]['usuario'][$usu->usuario->usuario] = [
                                    'nombre' => $usu->usuario->nombres . ' ' . $usu->usuario->apellidos,
                                    'facturas' => [$fac],
                                    'propina' => ($propina * $dist->porcentaje / 100) / 1.12
                                ];
                            }
                        }
                    }
                }
            }
        }

        foreach ($datos['datos'] as $i => $tusuario) {
            if (isset($tusuario['grupal']) && $tusuario['grupal'] === 1) {
                if (isset($tusuario['usuario']) && is_array($tusuario['usuario'])) {
                    $cntUsuarios = count($tusuario['usuario']);
                    foreach ($tusuario['usuario'] as $j => $usr) {
                        $datos['datos'][$i]['usuario'][$j]['propina'] = $datos['datos'][$i]['usuario'][$j]['propina'] / $cntUsuarios;
                    }
                }
            }
        }

        $sede = $this->Catalogo_model->getSede([
            'sede' => $this->data->sede,
            '_uno' => true
        ]);

        if ($sede) {
            $emp = $this->Catalogo_model->getEmpresa([
                'empresa' => $sede->empresa,
                '_uno' => true
            ]);
            if ($emp) {
                $datos['empresa'] = $emp;
                $datos['sede'] = $sede;
            }
        }

        if (verDato($_GET, '_excel')) {
            $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
            $excel->getProperties()
                ->setCreator('Restouch')
                ->setTitle('Office 2007 xlsx Existencias')
                ->setSubject('Office 2007 xlsx Existencias')
                ->setKeywords('office 2007 openxml php');

            $excel->setActiveSheetIndex(0);
            $hoja = $excel->getActiveSheet();

            /*Encabezado*/
            $hoja->setCellValue('A1', $emp->nombre);
            $hoja->setCellValue('A2', $sede->nombre);
            $hoja->setCellValue('A3', 'Distribución de Propinas');
            $hoja->setCellValue('B4', 'Del: ' . formatoFecha($datos['fdel']) . ' Al: ' . formatoFecha($datos['fal']));

            $hoja->getStyle('A1:C4')->getFont()->setBold(true);
            $coltotal = 'A';
            $coltotalVal = 'B';
            $totalprop = 0;

            if ($datos['detalle']) {
                $coltotal = 'E';
                $coltotalVal = 'F';

                $nombres = [
                    '',
                    '',
                    'Fecha',
                    'Comanda',
                    'Facturas',
                    'Propina'
                ];

                $hoja->fromArray($nombres, null, 'A6');
                $hoja->getStyle('A6:F6')->getFont()->setBold(true);
                $hoja->getStyle('A6:F6')->getAlignment()->setHorizontal('center');
                $fila = 7;
                foreach ($datos['datos'] as $row) {
                    $hoja->setCellValue("A{$fila}", $row['descripcion']);
                    $hoja->getStyle("A{$fila}")->getFont()->setBold(true);
                    $fila++;
                    if (verDato($row, 'usuario')) {
                        $cntUsuarios = count($row['usuario']);
                        foreach ($row['usuario'] as $key => $usu) {
                            $hoja->setCellValue("A{$fila}", $usu['nombre']);
                            $fila++;

                            foreach ($usu['facturas'] as $fac) {
                                $reg = [
                                    '',
                                    '',
                                    $fac->fecha_factura,
                                    $fac->getComanda()->comanda,
                                    $fac->numero_factura,
                                    round(($fac->propina * $row['porcentaje'] / 100) / $cntUsuarios, 2)
                                ];

                                $hoja->fromArray($reg, null, "A{$fila}");
                                $hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                                $fila++;
                            }
                            $totalprop += $usu['propina'];
                            $hoja->setCellValue("E{$fila}", 'Total Empleado');
                            $hoja->setCellValue("F{$fila}", round($usu['propina'], 2));
                            $hoja->getStyle("E{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        }
                    } else {
                        $hoja->setCellValue("A{$fila}", 'N/A');
                        $fila++;
                        foreach ($row['facturas'] as $fac) {
                            $reg = [
                                '',
                                '',
                                $fac->fecha_factura,
                                $fac->getComanda()->comanda,
                                $fac->numero_factura,
                                round($fac->propina * $row['porcentaje'] / 100, 2)
                            ];

                            $hoja->fromArray($reg, null, "A{$fila}");
                            $hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $fila++;
                        }
                        $totalprop += $row['propina'];
                        $hoja->setCellValue("E{$fila}", 'Total Empleado');
                        $hoja->setCellValue("F{$fila}", round($row['propina'], 2));
                        $hoja->getStyle("E{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    }
                }
            } else {
                $nombres = [
                    'Empleado',
                    'Propina'
                ];

                $hoja->fromArray($nombres, null, 'A6');
                $hoja->getStyle('A6:B6')->getFont()->setBold(true);
                $hoja->getStyle('A6:F6')->getAlignment()->setHorizontal('center');
                $fila = 7;

                foreach ($datos['datos'] as $row) {
                    $totalTipo = 0;
                    $hoja->setCellValue("A{$fila}", $row['descripcion']);
                    $hoja->getStyle("A{$fila}")->getFont()->setBold(true);
                    $fila++;

                    if (isset($row['usuario'])) {
                        foreach ($row['usuario'] as $usu) {
                            $totalTipo += $usu['propina'];
                            $totalprop += $usu['propina'];
                            $hoja->setCellValue("A{$fila}", $usu['nombre']);
                            $hoja->setCellValue("B{$fila}", round($usu['propina'], 2));
                            $hoja->getStyle("B{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $fila++;
                        }
                    } else {
                        $totalTipo += $row['propina'];
                        $totalprop += $row['propina'];
                        $hoja->setCellValue("A{$fila}", 'N/A');
                        $hoja->setCellValue("B{$fila}", round($row['propina'], 2));
                        $hoja->getStyle("B{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        $fila++;
                    }
                    $hoja->setCellValue("A{$fila}", 'Total por tipo:');
                    $hoja->setCellValue("B{$fila}", round($totalTipo, 2));
                    $hoja->getStyle("A{$fila}:B{$fila}")->getFont()->setBold(true);
                    $hoja->getStyle("A{$fila}:B{$fila}")
                        ->getNumberFormat()->setFormatCode('0.00');
                    $fila++;
                }
            }

            $hoja->setCellValue("{$coltotal}{$fila}", 'Total general:');
            $hoja->setCellValue("{$coltotalVal}{$fila}", round($totalprop, 2));

            $hoja->getStyle("{$coltotal}{$fila}:{$coltotalVal}{$fila}")
                ->getNumberFormat()->setFormatCode('0.00');

            $hoja->getStyle("{$coltotal}{$fila}:{$coltotalVal}{$fila}")->getFont()->setBold(true);

            for ($i = 0; $i <= count($nombres); $i++) {
                $hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
            }

            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename=Kardex.xlsx');
            header('Cache-Control: max-age=1');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
            header('Cache-Control: cache, must-revalidate');
            header('Pragma: public');

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
            $writer->save('php://output');
        } else {
            $mpdf = new \Mpdf\Mpdf([
                'tempDir' => sys_get_temp_dir(),
                'format' => 'Legal'
            ]);

            $mpdf->WriteHTML($this->load->view('propina', $datos, true));
            $mpdf->Output('Distribucion de Propina.pdf', 'D');
            // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($datos));
        }
    }

    private function procesaParametrosDetalleComanda($req = [])
    {
        $parametros = '';

        $tipoFecha = 'comanda';
        if (isset($req['tipo_fecha']) && (int)$req['tipo_fecha'] > 0) {
            switch ((int)$req['tipo_fecha']) {
                case 2:
                    $tipoFecha = 'turno';
                    break;
                case 3:
                    $tipoFecha = 'inicio de turno';
                    break;
                case 4:
                    $tipoFecha = 'fin de turno';
                    break;
            }
        }
        $parametros .= "Fecha de {$tipoFecha}";

        if (isset($req['fdel'])) {
            if ($parametros != '') {
                $parametros .= ' ';
            }
            $parametros .= 'del ' . formatoFecha($req['fdel'], 2);
        }

        if (isset($req['fal'])) {
            if ($parametros != '') {
                $parametros .= ' ';
            }
            $parametros .= 'al ' . formatoFecha($req['fal'], 2);
        }

        if (isset($req['turno_tipo']) && (int)$req['turno_tipo'] > 0 && isset($req['descripcion_turno']) && trim($req['descripcion_turno']) !== '') {
            if ($parametros != '') {
                $parametros .= ' ';
            }
            $parametros .= 'Turno: ' . $req['descripcion_turno'];
        }

        if ($parametros != '') {
            $parametros .= ' ';
        }
        $parametros .= (isset($req['activos']) && (int)$req['activos'] === 1 ? 'Sin' : 'Con') . ' artículos eliminados de comanda.';

        if ($parametros != '') {
            $parametros .= ' ';
        }
        $parametros .= (isset($req['ver_detalle_comanda']) && (int)$req['ver_detalle_comanda'] === 1 ? 'Con' : 'Sin') . ' detalle de comanda.';

        if ($parametros != '') {
            $parametros .= ' ';
        }
        $parametros .= (isset($req['ver_forma_pago']) && (int)$req['ver_forma_pago'] === 1 ? 'Con' : 'Sin') . ' detalle de formas de pago de comanda.';

        if ($parametros != '') {
            $parametros .= ' ';
        }
        $parametros .= (isset($req['ver_facturas']) && (int)$req['ver_facturas'] === 1 ? 'Con' : 'Sin') . ' facturas de comanda.';

        if ($parametros != '') {
            $parametros .= ' ';
        }
        $parametros .= (isset($req['ver_detalle_facturas']) && (int)$req['ver_detalle_facturas'] === 1 ? 'Con' : 'Sin') . ' detalle de facturas de comanda.';

        if ($parametros != '') {
            $parametros .= ' ';
        }
        $parametros .= (isset($req['comandas']) && trim($req['comandas']) !== '' ? "Comandas: {$req['comandas']}" : '');

        return trim($parametros);
    }

    public function rpt_detalle_comanda()
    {
        $req = json_decode(file_get_contents('php://input'), true);

        $req['sede'] = isset($req['sede']) && (int)$req['sede'] > 0 ? $req['sede'] : $this->data->sede;

        $comandas = $this->Reporte_model->get_lista_comandas($req);
        foreach ($comandas as $comanda) {
            $req['comanda'] = $comanda->comanda;
            $req['suma'] = true;
            $comanda->total_detalle = $this->Reporte_model->get_detalle_comanda($req);
            unset($req['suma']);
            $comanda->detalle = isset($req['ver_detalle_comanda']) && (int)$req['ver_detalle_comanda'] === 1 ? $this->Reporte_model->get_detalle_comanda($req) : [];

            $req['suma'] = true;
            $sumas = $this->Reporte_model->get_formas_pago_comanda($req);
            $comanda->total_forma_pago = $sumas->monto;
            $comanda->total_propina = $sumas->propina;
            unset($req['suma']);
            $comanda->forma_pago = isset($req['ver_forma_pago']) && (int)$req['ver_forma_pago'] === 1 ? $this->Reporte_model->get_formas_pago_comanda($req) : [];
            $comanda->factura = isset($req['ver_facturas']) && (int)$req['ver_facturas'] === 1 ? $this->Reporte_model->get_facturas_comanda($req) : [];
            
            $comanda->numero_orden = null;
            $json = null;
            if(isset($comanda->comanda_origen_datos) && !is_null($comanda->comanda_origen_datos) && is_string($comanda->comanda_origen_datos)) {
                try {
                    $json = json_decode($comanda->comanda_origen_datos);
                } catch(Exception $e) {
                    $json = null;
                }
                $comanda->numero_orden = isset($json->numero_orden) ? $json->numero_orden : (isset($json->order_number) ? $json->order_number : null);                
            }
        }

        $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
        \PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder(new \PhpOffice\PhpSpreadsheet\Cell\AdvancedValueBinder());
        $excel->getProperties()
            ->setCreator('Restouch')
            ->setTitle('Office 2007 xlsx Comandas')
            ->setSubject('Office 2007 xlsx Comandas')
            ->setKeywords('office 2007 openxml php');

        $excel->setActiveSheetIndex(0);
        $hoja = $excel->getActiveSheet();

        $hoja->setCellValue('A1', 'DETALLE DE COMANDAS');
        $hoja->mergeCells('A1:N1');
        $hoja->getStyle('A1:N1')->getFont()->setBold(true);

        $parametros = $this->procesaParametrosDetalleComanda($req);
        $hoja->setCellValue('A2', $parametros);
        $hoja->mergeCells('A2:N2');
        $hoja->getStyle('A2:N2')->getFont()->setBold(true);

        $fila = 4;
        foreach ($comandas as $cmd) {
            $filaIniciaComanda = $fila;
            $hoja->setCellValue("A{$fila}", 'Sede');
            $hoja->setCellValue("B{$fila}", 'Orden GK');
            $hoja->setCellValue("C{$fila}", 'Comanda');
            $hoja->setCellValue("D{$fila}", 'Fecha de comanda');
            $hoja->setCellValue("E{$fila}", 'Turno');
            $hoja->setCellValue("F{$fila}", 'Tipo de turno');
            $hoja->setCellValue("G{$fila}", 'Fecha de turno');
            $hoja->setCellValue("H{$fila}", 'Inicio de turno');
            $hoja->setCellValue("I{$fila}", 'Fin de turno');
            $hoja->setCellValue("J{$fila}", 'Creada por');
            $hoja->setCellValue("K{$fila}", 'Mesero');
            $hoja->setCellValue("L{$fila}", 'Notas de comanda');
            $hoja->setCellValue("M{$fila}", 'Razón de anulación de comanda');
            $hoja->setCellValue("N{$fila}", 'Total de comanda');
            $hoja->setCellValue("O{$fila}", 'Comensales');
            $hoja->setCellValue("P{$fila}", 'No. Orden');
            $hoja->getStyle("A{$fila}:P{$fila}")->getFont()->setBold(true);
            $hoja->getStyle("A{$fila}:P{$fila}")->getAlignment()->setHorizontal('center');
            $fila++;
            $hoja->setCellValue("A{$fila}", $cmd->sede);
            $hoja->setCellValue("B{$fila}", $cmd->orden_gk);
            $hoja->setCellValue("C{$fila}", $cmd->comanda);
            $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('center');
            $hoja->setCellValue("D{$fila}", $cmd->fecha_comanda);
            $hoja->setCellValue("E{$fila}", $cmd->turno);
            $hoja->setCellValue("F{$fila}", $cmd->turno_tipo);
            $hoja->setCellValue("G{$fila}", $cmd->fecha_turno);
            $hoja->setCellValue("H{$fila}", $cmd->inicio_turno);
            $hoja->setCellValue("I{$fila}", $cmd->fin_turno);
            $hoja->setCellValue("J{$fila}", $cmd->usuario);
            $hoja->setCellValue("K{$fila}", $cmd->mesero);
            $hoja->setCellValue("L{$fila}", $cmd->notas_generales);
            $hoja->setCellValue("M{$fila}", $cmd->razon_anulacion);
            $hoja->setCellValue("N{$fila}", $cmd->total_detalle);
            $hoja->setCellValue("O{$fila}", $cmd->comensales);
            $hoja->setCellValue("P{$fila}", $cmd->numero_orden);
            $hoja->getStyle("N{$fila}")->getNumberFormat()->setFormatCode('0.00');
            $fila++;
            // Detalle de comanda
            if (count($cmd->detalle) > 0) {
                $hoja->setCellValue("B{$fila}", "Detalle de comanda {$cmd->comanda}");
                $hoja->mergeCells("B{$fila}:I{$fila}");
                $hoja->getStyle("B{$fila}:I{$fila}")->getFont()->setBold(true);
                $fila++;
                $hoja->setCellValue("B{$fila}", 'Artículo');
                $hoja->setCellValue("C{$fila}", 'Presentación');
                $hoja->setCellValue("D{$fila}", 'Cantidad');
                $hoja->setCellValue("E{$fila}", 'Precio');
                $hoja->setCellValue("F{$fila}", 'Total');
                $hoja->setCellValue("G{$fila}", 'Notas');
                $hoja->setCellValue("H{$fila}", 'Bodega');
                $hoja->setCellValue("I{$fila}", 'Cantidad de inventario');
                $hoja->getStyle("B{$fila}:I{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:I{$fila}")->getAlignment()->setHorizontal('center');
                $fila++;
                foreach ($cmd->detalle as $det) {
                    $descArticulo = '';
                    if (!empty($det->detalle_comanda_id)) {
                        $descArticulo .= '    ';
                        if ((int)$det->multiple === 0) {
                            $descArticulo .= '        ';
                        }
                    }
                    $descArticulo .= "{$det->articulo}";
                    $hoja->setCellValue("B{$fila}", $descArticulo);
                    $hoja->setCellValue("C{$fila}", $det->presentacion);
                    $hoja->setCellValue("D{$fila}", $det->cantidad);
                    $hoja->getStyle("D{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("E{$fila}", $det->precio);
                    $hoja->getStyle("E{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("F{$fila}", $det->total);
                    $hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("G{$fila}", $det->notas);
                    $hoja->setCellValue("H{$fila}", $det->bodega);
                    $hoja->setCellValue("I{$fila}", $det->cantidad_inventario);
                    $hoja->getStyle("I{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $fila++;
                }
            }
            //Formas de pago
            $filaIniciaFormasPago = null;
            $filaTerminaFormasPago = null;
            if (count($cmd->forma_pago) > 0) {
                $filaIniciaFormasPago = $fila;
                $hoja->setCellValue("B{$fila}", "Formas de pago de comanda {$cmd->comanda}");
                $hoja->mergeCells("B{$fila}:F{$fila}");
                $hoja->getStyle("B{$fila}:F{$fila}")->getFont()->setBold(true);
                $fila++;
                $hoja->setCellValue("B{$fila}", 'Cuenta');
                $hoja->setCellValue("C{$fila}", 'No. Cuenta');
                $hoja->setCellValue("D{$fila}", 'Forma de pago');
                $hoja->setCellValue("E{$fila}", 'Monto');
                $hoja->setCellValue("F{$fila}", 'Propina');
                $hoja->getStyle("B{$fila}:F{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:F{$fila}")->getAlignment()->setHorizontal('center');
                $fila++;
                foreach ($cmd->forma_pago as $fp) {
                    $hoja->setCellValue("B{$fila}", $fp->nombre_cuenta);
                    $hoja->setCellValue("C{$fila}", $fp->numero_cuenta);
                    $hoja->setCellValue("D{$fila}", $fp->forma_pago);
                    $hoja->setCellValue("E{$fila}", $fp->monto);
                    $hoja->getStyle("E{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("F{$fila}", $fp->propina);
                    $hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $fila++;
                }
                $filaTerminaFormasPago = $fila - 1;
            }
            //Factuaras de comanda
            $filaIniciaFacturas = null;
            $filaTerminaFacturas = null;
            if (count($cmd->factura) > 0) {
                $filaIniciaFacturas = $fila;
                $hoja->setCellValue("B{$fila}", "Facturas de comanda {$cmd->comanda}");
                $hoja->mergeCells("B{$fila}:H{$fila}");
                $hoja->getStyle("B{$fila}:H{$fila}")->getFont()->setBold(true);
                $fila++;
                $hoja->setCellValue("B{$fila}", 'Serie');
                $hoja->setCellValue("C{$fila}", 'Número');
                $hoja->setCellValue("D{$fila}", 'Fecha');
                $hoja->setCellValue("E{$fila}", 'Nombre');
                $hoja->setCellValue("F{$fila}", 'N.I.T.');
                $hoja->setCellValue("G{$fila}", 'Total');
                $hoja->setCellValue("H{$fila}", 'Razón de anulación de factura');
                $hoja->getStyle("B{$fila}:H{$fila}")->getFont()->setBold(true);
                $hoja->getStyle("B{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
                $fila++;
                foreach ($cmd->factura as $fact) {
                    $hoja->setCellValue("B{$fila}", $fact->serie_factura);
                    $hoja->setCellValue("C{$fila}", $fact->numero_factura);
                    $hoja->setCellValue("D{$fila}", $fact->fecha_factura);
                    $hoja->setCellValue("E{$fila}", $fact->cliente);
                    $docReceptor = $fact->documento_receptor ?? $fact->nit;
                    $hoja->setCellValue("F{$fila}", is_numeric($docReceptor) ? '=TEXT(' . $docReceptor . ', "0")' : $docReceptor);
                    $hoja->getStyle("F{$fila}")->getAlignment()->setHorizontal('left');
                    $hoja->setCellValue("G{$fila}", $fact->total_factura);
                    $hoja->getStyle("G{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("H{$fila}", $fact->razon_anulacion);
                    $fila++;
                    //Detalle de factura
                    if (count($fact->detalle_factura) > 0) {
                        $hoja->setCellValue("C{$fila}", "Detalle de factura {$fact->serie_factura}-{$fact->numero_factura} de comanda {$cmd->comanda}");
                        $hoja->mergeCells("C{$fila}:I{$fila}");
                        $hoja->getStyle("C{$fila}:I{$fila}")->getFont()->setBold(true);
                        $fila++;
                        $hoja->setCellValue("C{$fila}", 'Artículo');
                        $hoja->setCellValue("D{$fila}", 'Cantidad');
                        $hoja->setCellValue("E{$fila}", 'Precio');
                        $hoja->setCellValue("F{$fila}", 'Total');
                        $hoja->setCellValue("G{$fila}", 'Base');
                        $hoja->setCellValue("H{$fila}", 'I.V.A.');
                        $hoja->setCellValue("I{$fila}", 'Descuento');
                        $hoja->getStyle("C{$fila}:I{$fila}")->getFont()->setBold(true);
                        $hoja->getStyle("C{$fila}:I{$fila}")->getAlignment()->setHorizontal('center');
                        $fila++;
                        foreach ($fact->detalle_factura as $df) {
                            $hoja->setCellValue("C{$fila}", $df->articulo);
                            $hoja->setCellValue("D{$fila}", $df->cantidad);
                            $hoja->getStyle("D{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $hoja->setCellValue("E{$fila}", $df->precio_unitario);
                            $hoja->getStyle("E{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $hoja->setCellValue("F{$fila}", $df->total);
                            $hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $hoja->setCellValue("G{$fila}", $df->monto_base);
                            $hoja->getStyle("G{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $hoja->setCellValue("H{$fila}", $df->monto_iva);
                            $hoja->getStyle("H{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $hoja->setCellValue("I{$fila}", $df->descuento);
                            $hoja->getStyle("I{$fila}")->getNumberFormat()->setFormatCode('0.00');
                            $fila++;
                        }
                    }
                    $filaTerminaFacturas = $fila - 1;
                }
            }
            $filaFinComanda = $fila - 1;
            $hoja->getStyle("A{$filaIniciaComanda}:P{$filaFinComanda}")
                ->getBorders()
                ->getOutline()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

            $hoja->getStyle("A{$filaIniciaComanda}:P{$filaFinComanda}")->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()
                ->setARGB('EEECE1');

            if (isset($req['ver_forma_pago']) && (int)$req['ver_forma_pago'] === 1 && !empty($filaIniciaFormasPago) && !empty($filaTerminaFormasPago)) {
                $hoja->getStyle("B{$filaIniciaFormasPago}:F{$filaTerminaFormasPago}")
                    ->getBorders()
                    ->getOutline()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

                $hoja->getStyle("B{$filaIniciaFormasPago}:F{$filaTerminaFormasPago}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()
                    ->setARGB('C4BD97');
            }

            if (isset($req['ver_facturas']) && (int)$req['ver_facturas'] === 1 && !empty($filaIniciaFacturas) && !empty($filaTerminaFacturas)) {
                $hoja->getStyle("B{$filaIniciaFacturas}:I{$filaTerminaFacturas}")
                    ->getBorders()
                    ->getOutline()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                    ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

                $hoja->getStyle("B{$filaIniciaFacturas}:I{$filaTerminaFacturas}")->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()
                    ->setARGB('948A54');
            }
            $fila += 2;
        }

        foreach (range('A', 'P') as $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        $hoja->setTitle('Comandas');

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename=Comandas_' . date('YmdHis') . '.xlsx');
        header('Cache-Control: max-age=1');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
        header('Cache-Control: cache, must-revalidate');
        header('Pragma: public');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
        $writer->save('php://output');

        // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($comandas));
    }

    private function get_por_tipo_venta($data)
    {
        $tipo_venta = [];
        $data['domicilio'] = 0;
        $restaurante = $this->get_info_corte_caja($data);

        $tipo_venta[] = (object)[
            'tipo_venta' => 'Restaurante',
            'corte_caja' => (object)[
                'ingresos' => $restaurante['ingresos'],
                'facturas_sin_comanda' => $restaurante['facturas_sin_comanda'],
                'descuentos' => $restaurante['descuentos']
            ]
        ];

        $data['domicilio'] = 1;
        $data['comandas'] = true;
        $tipoDomicilio = ordenar_array_objetos($this->Tipo_domicilio_model->buscar(), 'descripcion');
        foreach ($tipoDomicilio as $row) {
            $data['tipo_domicilio'] = $row->tipo_domicilio;
            $domicilio = $this->get_info_corte_caja($data);
            $tipo_venta[] = (object)[
                'tipo_venta' => $row->descripcion,
                'corte_caja' => (object)[
                    'ingresos' => $domicilio['ingresos'],
                    'facturas_sin_comanda' => [],
                    'descuentos' => $domicilio['descuentos']
                ]
            ];
        }

        if (isset($data['domicilio'])) {
            unset($data['domicilio']);
        }

        if (isset($data['tipo_domicilio'])) {
            unset($data['tipo_domicilio']);
        }
        return $tipo_venta;
    }

    public function ventas_administrativo()
    {
        $params = json_decode(file_get_contents('php://input'), true);
        $datos = $this->Reporte_model->get_ventas_administrativo($params);
        $formas_pago = $datos['formas_pago'];
        $facturas = $datos['facturas'];

        $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
        \PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder(new \PhpOffice\PhpSpreadsheet\Cell\AdvancedValueBinder());
        $excel->getProperties()
            ->setCreator('Restouch')
            ->setTitle('Office 2007 xlsx Ventas_Administrativo')
            ->setSubject('Office 2007 xlsx Ventas_Administrativo')
            ->setKeywords('office 2007 openxml php');

        $excel->setActiveSheetIndex(0);
        $hoja = $excel->getActiveSheet();

        $hoja->setCellValue('A1', 'VENTAS ADMINISTRATIVO');
        $hoja->setCellValue('A2', 'Del ' . formatoFecha($params['fdel'], 2) . ' al ' . formatoFecha($params['fal'], 2));

        $hoja->mergeCells('A1:M1');
        $hoja->mergeCells('A2:M2');
        $hoja->getStyle('A1:A2')->getFont()->setBold(true);

        if (isset($params['sede']) && !empty($params['sede'])) {
            $this->load->model('Sede_model');
            $sede = $this->Sede_model->buscar(['sede' => $params['sede'], '_uno' => true]);
            $hoja->setCellValue('A3', "Sede: {$sede->nombre} ({$sede->alias})");
            $hoja->mergeCells('A3:M3');
            $hoja->getStyle('A3')->getFont()->setBold(true);
        }

        $fila = 5;

        $hoja->setCellValue("A{$fila}", 'Empresa');
        $hoja->setCellValue("B{$fila}", 'Sede');
        $hoja->setCellValue("C{$fila}", 'Serie');
        $hoja->setCellValue("D{$fila}", 'Numero');
        $hoja->setCellValue("E{$fila}", 'Fecha');
        $hoja->setCellValue("F{$fila}", 'NIT');
        $hoja->setCellValue("G{$fila}", 'Cliente');
        $hoja->setCellValue("H{$fila}", 'Anulada');
        $hoja->setCellValue("I{$fila}", 'Mesero/Agente');
        $hoja->setCellValue("J{$fila}", 'Mesa');
        $hoja->setCellValue("K{$fila}", 'Tipo');
        $hoja->setCellValue("L{$fila}", 'Razón de anulación');
        $hoja->setCellValue("M{$fila}", 'Comentario de anulación');
        $hoja->setCellValue("N{$fila}", 'Total');
        $hoja->setCellValue("O{$fila}", 'Base venta');
        $hoja->setCellValue("P{$fila}", 'Débito fiscal');

        $columna = 'Q';
        $fps = [];
        $propfps = [];
        foreach ($formas_pago as $fp) {
            $fps[(int)$fp->forma_pago] = $columna;
            $hoja->setCellValue($columna . $fila, $fp->descripcion);
            $hoja->getStyle($columna . $fila)->getAlignment()->setHorizontal('right');
            $columna++;
            $propfps[(int)$fp->forma_pago] = $columna;
            $hoja->setCellValue($columna . $fila, "Propina {$fp->descripcion}");
            $hoja->getStyle($columna . $fila)->getAlignment()->setHorizontal('right');
            $columna++;
        }

        $columna--;
        $hoja->getStyle("A{$fila}:{$columna}{$fila}")->getFont()->setBold(true);

        $fila++;
        foreach ($facturas as $factura) {
            foreach ($factura->formas_pago as $ffp) {
                $hoja->setCellValue("A{$fila}", $factura->empresa);
                $hoja->setCellValue("B{$fila}", "{$factura->sede} ({$factura->alias_sede})");
                $hoja->setCellValue("C{$fila}", $factura->serie);
                $hoja->setCellValue("D{$fila}", $factura->numero);
                $hoja->setCellValue("E{$fila}", $factura->fecha_factura);
                $docReceptor = $factura->documento_receptor ?? $factura->nit;
                $hoja->setCellValue("F{$fila}", is_numeric($docReceptor) ? '=TEXT(' . $docReceptor . ', "0")' : $docReceptor);
                $hoja->getStyle("F{$fila}")->getAlignment()->setHorizontal('left');
                $hoja->setCellValue("G{$fila}", $factura->cliente);
                $hoja->setCellValue("H{$fila}", $factura->anulada);
                $hoja->setCellValue("I{$fila}", $factura->mesero);
                $hoja->setCellValue("J{$fila}", $factura->mesa);
                $hoja->setCellValue("K{$fila}", $factura->tipo);
                $hoja->setCellValue("L{$fila}", is_null($factura->razon_anulacion) ? '' : $factura->razon_anulacion);
                $hoja->setCellValue("M{$fila}", is_null($factura->comentario_anulacion) ? '' : $factura->comentario_anulacion);
                foreach ($fps as $fp => $col) {
                    $hoja->setCellValue($col . $fila, (float)0.00);
                    $hoja->getStyle($col . $fila)->getNumberFormat()->setFormatCode('0.00');
                }
                foreach ($propfps as $fp => $col) {
                    $hoja->setCellValue($col . $fila, (float)0.00);
                    $hoja->getStyle($col . $fila)->getNumberFormat()->setFormatCode('0.00');
                }
                $hoja->setCellValue($fps[(int)$ffp->forma_pago] . $fila, (float)$ffp->monto);
                $hoja->setCellValue($propfps[(int)$ffp->forma_pago] . $fila, (float)$ffp->propina);

                $total = (float)$ffp->monto + (float)$ffp->propina;
                $hoja->setCellValue("N{$fila}", round($total, 2));
                $hoja->getStyle("N{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $hoja->setCellValue("O{$fila}", round($total / 1.12, 2));
                $hoja->getStyle("O{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $hoja->setCellValue("P{$fila}", round(($total / 1.12) * 0.12, 2));
                $hoja->getStyle("P{$fila}")->getNumberFormat()->setFormatCode('0.00');
                $fila++;
            }
        }

        foreach (range('A', 'K') as $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        foreach (range('N', 'P') as $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        foreach ($fps as $fp => $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        foreach ($propfps as $fp => $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        $hoja->setTitle('Ventas Administrativo');
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename=Ventas_Administrativo_' . date('YmdHis') . '.xlsx');
        header('Cache-Control: max-age=1');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
        header('Cache-Control: cache, must-revalidate');
        header('Pragma: public');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
        $writer->save('php://output');

        // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($datos));
    }

    public function articulos_eliminados()
    {
        $params = json_decode(file_get_contents('php://input'), true);
        $datos = $this->Reporte_model->get_articulos_eliminados($params);

        $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
        \PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder(new \PhpOffice\PhpSpreadsheet\Cell\AdvancedValueBinder());
        $excel->getProperties()
            ->setCreator('Resttouch')
            ->setTitle('Office 2007 xlsx Articulos_Eliminados')
            ->setSubject('Office 2007 xlsx Articulos_Eliminados')
            ->setKeywords('office 2007 openxml php');

        $excel->setActiveSheetIndex(0);
        $hoja = $excel->getActiveSheet();

        $hoja->setCellValue('A1', 'ARTÍCULOS ELIMINADOS');
        if (isset($params['fdel']) && !empty($params['fdel'])) {
            $hoja->setCellValue('A2', 'Del ' . formatoFecha($params['fdel'], 2));
        }

        if (isset($params['fal']) && !empty($params['fal'])) {
            $hoja->setCellValue('A3', 'Al ' . formatoFecha($params['fal'], 2));
        }

        $hoja->mergeCells('A1:E1');
        $hoja->mergeCells('A2:E2');
        $hoja->mergeCells('A3:E3');
        $hoja->getStyle('A1:E3')->getFont()->setBold(true);

        $fila = 5;

        $hoja->setCellValue("A{$fila}", 'Sede');
        $hoja->setCellValue("B{$fila}", 'Usuario');
        $hoja->setCellValue("C{$fila}", 'Artículo');
        $hoja->setCellValue("D{$fila}", 'Fecha/Hora');
        $hoja->setCellValue("E{$fila}", 'Comanda');
        $hoja->getStyle("A{$fila}:E{$fila}")->getFont()->setBold(true);
        $hoja->setAutoFilter("A{$fila}:E{$fila}");

        $fila++;
        foreach ($datos as $d) {
            $hoja->setCellValue("A{$fila}", $d->sede);
            $hoja->setCellValue("B{$fila}", $d->usuario);
            $hoja->setCellValue("C{$fila}", $d->articulo);
            $hoja->setCellValue("D{$fila}", $d->fechahora);
            $hoja->setCellValue("E{$fila}", $d->comanda);
            $fila++;
        }

        foreach (range('A', 'E') as $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        $hoja->setTitle('Articulos Eliminados');
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename=Articulos_Eliminados_' . date('YmdHis') . '.xlsx');
        header('Cache-Control: max-age=1');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
        header('Cache-Control: cache, must-revalidate');
        header('Pragma: public');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
        $writer->save('php://output');

        // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($datos));
    }
}

/* End of file Reporte.php */
/* Location: ./application/restaurante/controllers/Reporte.php */
