<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Rpt_pedidos_sede extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->add_package_path('application/restaurante');
        $this->load->model([
            'Comanda_model',
            'Dcomanda_model',
            'Factura_model',
            'Dfactura_model',
            'Articulo_model',
            'Categoria_model',
            'Catalogo_model',
            'TurnoTipo_model',
            'Sede_model',
            'Configuracion_model',
            'Rpt_model',
            'Sede_model',
            'Seguimiento_callcenter_model'
        ]);
        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
    }

    public function getpedidosrpt()
    {
        $comanda = new Comanda_model();
        $fdel = $this->input->get('fdel');
        $fal = $this->input->get('fal');
        $tipoD = $this->input->get('tipo_venta');
        $sedeN = $this->input->get('sede');
        $tipoDName = $this->input->get('tipoDName');
        $sedeNName = $this->input->get('sedeNName');
        $totalDeVenta = 0;


        $result = $comanda->get_as_pedidos($fdel, $fal, $tipoD, $sedeN);
        $result_count_no_cer = count(array_filter($result, function ($var) {
            return ($var->monto > 0);
        }));

        //$this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode($result));
        //return;
        //GET ALL SEDES IN RESPONSE
        $arraySEDES = [];
        foreach ($result as $value) {
            if (!in_array($value->sede, $arraySEDES)) {
                array_push($arraySEDES, $value->sede);
            }
        }
        $data = json_decode(file_get_contents('php://input'), true);

        //EXCEL
        if (verDato($_GET, '_excel')) {
            $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
            $excel->getProperties()
                ->setCreator('Restouch')
                ->setTitle('Office 2007 xlsx Valorizado')
                ->setSubject('Office 2007 xlsx Valorizado')
                ->setKeywords('office 2007 openxml php');

            $excel->setActiveSheetIndex(0);
            $hoja = $excel->getActiveSheet();

            $hoja->getStyle('A1:K5')->getFont()->setBold(true);
            $hoja->getStyle('A9:C9')->getFont()->setBold(true);

            $hoja->mergeCells('A1:K1');
            $hoja->mergeCells('A2:K2');
            $hoja->setCellValue('A1', 'Pedidos por sede');
            $hoja->setCellValue('A2', 'Del : ' . formatoFecha($fdel, 2));
            $hoja->setCellValue('A3', 'Al : ' . formatoFecha($fal, 2));
            if ($sedeNName !== null) {
                $hoja->setCellValue('A4', 'Sede ' . $sedeNName);
            }
            if ($tipoDName !== null) {
                $hoja->setCellValue('A5', "Tipo domicilio $tipoDName");
            }

            $hoja->setTitle('Pedidos por sede');

            $fila = 9;
            $hoja->setCellValue("A{$fila}", 'Sede');
            $hoja->setCellValue("B{$fila}", 'Pedido');
            $hoja->setCellValue("C{$fila}", 'Monto');
            $fila++;


            //ITERATE THROUG SEDES
            foreach ($arraySEDES as $sede) {
                $flag = $sede;
                $fila++;

                $arrayA = [];
                foreach ($result as $value) {
                    if ($value->sede === $flag) {
                        array_push($arrayA, $value);
                    }
                }

                $montoTotal = 0;
                foreach ($arrayA as $row) {
                    $montoTotal = $montoTotal + $row->monto;
                }
                if ($montoTotal > 0) {
                    $hoja->setCellValue("A{$fila}", $flag);
                    foreach ($arrayA as $row) {
                        $fila++;
                        //Pedidos data
                        $hoja->setCellValue("B{$fila}", $row->pedido);
                        $hoja->setCellValue("C{$fila}", number_format((float)$row->monto, 2, '.', ''));
                        $hoja->getStyle("C{$fila}")->getNumberFormat()->setFormatCode('0.00');
                        $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('right');
                    }
                    $fila++;
                    $hoja->getStyle("B{$fila}")->getFont()->setBold(true);
                    $hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->setCellValue("B{$fila}", 'Total');
                    $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('right');
                    $hoja->getStyle("C{$fila}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("C{$fila}", number_format((float)$montoTotal, 2, '.', ''));
                    $totalDeVenta = $totalDeVenta + $montoTotal;
                    $montoTotal = 0;
                    $fila++;
                }
            }

            $fila++;
            $fila++;

            $hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('right');
            $hoja->setCellValue("B{$fila}", 'Total de venta');
            $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('right');
            $hoja->getStyle("C{$fila}")->getNumberFormat()->setFormatCode('0.00');
            $hoja->setCellValue("C{$fila}", number_format($totalDeVenta, 2, '.', ''));
            $hoja->getStyle("B{$fila}")->getFont()->setBold(true);
            $fila++;
            $hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('right');
            $hoja->setCellValue("B{$fila}", 'Cantidad de pedidos');
            $hoja->getStyle("B{$fila}")->getFont()->setBold(true);
            $hoja->setCellValue("C{$fila}", $result_count_no_cer);
            $fila++;
            $hoja->setCellValue("B{$fila}", 'Consumo/Pedido');
            $hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('right');
            $hoja->getStyle("C{$fila}")->getAlignment()->setHorizontal('right');
            $hoja->getStyle("B{$fila}")->getFont()->setBold(true);
            $hoja->getStyle("C{$fila}")->getNumberFormat()->setFormatCode('0.00');
            $hoja->setCellValue("C{$fila}", number_format($totalDeVenta / ($result_count_no_cer !== 0 ? $result_count_no_cer : 1), 2, '.', ''));

            // ITERATE THROUG THAT IN RESPONSE


            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename=Valorizado.xls');
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


            $forViewArr = [];
            $totalDeVenta = 0;
            foreach ($arraySEDES as $sede) {
                $arrayA = [];
                $arrayRsult = [];
                $totalOfPedidos = 0;
                foreach ($result as $value) {
                    if ($value->sede === $sede) {
                        array_push($arrayA, $value);
                        $totalOfPedidos = $totalOfPedidos + $value->monto;
                    }
                }
                $totalDeVenta = $totalDeVenta + $totalOfPedidos;
                $arrayRsult['total'] = $totalOfPedidos;
                $arrayRsult['sede'] = $sede;
                $arrayRsult['pedidos'] = $arrayA;
                if ($totalOfPedidos > 0) {
                    array_push($forViewArr, $arrayRsult);
                }
            }


            $data['tipoDName'] = $tipoDName;
            $data['sedeNName'] = $sedeNName;
            $data['forViewArr'] = $forViewArr;
            $data['totalDeVenta'] = $totalDeVenta;
            $data['cantPedidos'] = $result_count_no_cer;
            $data['consumoP'] = number_format($totalDeVenta / ($result_count_no_cer !== 0 ? $result_count_no_cer : 1), 2, '.', '');

            set_time_limit(300); //

            $mpdf->WriteHTML($this->load->view(
                'detalle_pedido',
                $data,
                true
            ));
            $mpdf->Output('Detalle de Pedidos.pdf', 'D');
        }
    }

    public function report_art()
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

    public function reporte_motoristas()
    {
        $_GET['_order_asc'] = true;
        $datos = $this->Seguimiento_callcenter_model->get_pedidos($_GET);
        $info = [];

        foreach($datos as $pedido) {
            $dt = new DateTime($pedido->fhtomapedido);
            $ahorita = new DateTime();
            $diferencia = $dt->diff($ahorita);
            $info[] = (object)[
                'comanda' => $pedido->comanda,
                'cliente' => $pedido->cliente,
                'total' => (float)$pedido->total_pedido + (float)$pedido->total_propina,
                'forma_pago' => $pedido->formas_pago,
                'fecha' => $dt->format('d/m/Y'),
                'hora' => $dt->format('H:i:s'),
                'transcurrido' => $diferencia->format('%y años, %m meses, %d días, %h horas, %i minutos y %s segundos'),
                'telefono' => $pedido->comanda_origen_datos->telefono,
                'atendio' => "{$pedido->nombres} {$pedido->apellidos}",
                'direccion_entrega' => $pedido->comanda_origen_datos->direccion_entrega,
                'sede_atiende' => $pedido->sede_atiende,
                'tiempo_ofrecido' => $pedido->tiempo_ofrecido,
                'motorista' => $pedido->motorista,
                'observaciones' => $pedido->observaciones,
            ];
        }

        $vista = $this->load->view('reporte/motoristas/imprimir', ['params' => $_GET, 'info' => $info], true);
        $nombre = 'Motoristas_'.date('YmdHis');

        if (verDato($_GET, '_excel')) {
            $reader = new \PhpOffice\PhpSpreadsheet\Reader\Html();
			$vista = str_replace('&', '&amp;', $vista);
			$xlsx = $reader->loadFromString($vista);
			$xlsx->setActiveSheetIndex(0);
			$hoja = $xlsx->getActiveSheet();

            foreach (range('A', 'N') as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}

			header('Content-Type: application/vnd.ms-excel');
			header("Content-Disposition: attachment;filename={$nombre}.xlsx");
			header('Cache-Control: max-age=1');
			header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
			header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
			header('Cache-Control: cache, must-revalidate');
			header('Pragma: public');
			
			$writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($xlsx, 'Xlsx');
			$writer->save('php://output');
        } else {
            $mpdf = new \Mpdf\Mpdf([
                'tempDir' => sys_get_temp_dir(),
                'format' => 'Letter'
            ]);

            $mpdf->AddPage('L');
            $mpdf->WriteHTML($vista);
            $mpdf->Output($nombre.'.pdf', 'D');
        }

        // $this->output->set_content_type('application/json', 'UTF-8')->set_output(json_encode(['params' => $_GET, 'info' => $info]));
    }
}
