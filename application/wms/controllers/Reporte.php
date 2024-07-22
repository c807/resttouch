<?php
defined('BASEPATH') or exit('No direct script access allowed');
ini_set('memory_limit', -1);
set_time_limit(0);

class Reporte extends CI_Controller
{
	private $php_self = '';
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->php_self = $_SERVER['PHP_SELF'];
		$this->load->model([
			'Sede_model',
			'Empresa_model',
			'reporte/Reporte_model',
			'Articulo_model',
			'Receta_model',
			'Ingreso_model',
			'Categoria_model',
			'Bodega_model',
			'BodegaArticuloCosto_model',
			'Bitacora_model',
			'Impresora_model',
			'Umedida_model',
			'Resumen_traslados_model'
		]);

		$this->load->helper(['jwt', 'authorization']);

		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	/** Inicia función para el cálculo de existencias */
	public function existencia()
	{
		// $this->Bitacora_model->log_to_file(Hoy(5) . ",{$this->data->dominio}," . $this->php_self . ',' . get_mem_usage() . ',inicio,');
		ini_set('pcre.backtrack_limit', '15000000');
		$data = [];
		$_POST = json_decode(file_get_contents('php://input'), true);

		if (!isset($_POST['sede'])) {
			$_POST['sede'] = [$this->data->sede];
			$data['sede'] = [$this->data->sede];
		} else {
			$data['sede'] = $_POST['sede'];
		}

		if (isset($_POST['categoria_grupo']) && (int)$_POST['categoria_grupo'] > 0) {
			$data['categoria_grupo'] = $_POST['categoria_grupo'];
		}

		$data['mostrar_inventario'] = 1;

		// 20/02/2024 19:07: Con JM se decidió mejor quitar este filtro para no afectar el funcionamiento original del reporte de existencias.
		// if (isset($_POST['bodega'])) {
		// 	$data['bodega'] = $_POST['bodega'];
		// }

		$arts = $this->Catalogo_model->getArticulo($data);
		$args = [
			'cliente' => '',
			'sub_cuenta' => '',
			'fecha' => formatoFecha($_POST['fecha'], 2),
			'sedes' => $_POST['sede'],
			'subtitulo' => (isset($_POST['solo_bajo_minimo']) && (int)$_POST['solo_bajo_minimo'] === 1) ? '(solo bajo mínimo de stock)' : '',
			'fecha_del' => formatoFecha($_POST['fecha_del'], 2)
		];

		$listaBodegas = $this->Bodega_model->get_lista_bodegas();
		foreach ($_POST['sede'] as $s) {
			$nbodega = [];
			foreach ($_POST['bodega'] as $bode) {
				$bodega = $listaBodegas[(int)$bode];
				if ((int)$s === (int)$bodega->sede) {
					$nbodega[] = $bodega->descripcion;
				}
			}
			$args['bodegas'][$s] = implode(', ', $nbodega);
		}

		$listaMedidas = $this->Umedida_model->get_lista_medidas();
		$listaArticulos = $this->Articulo_model->get_lista_articulos();
		foreach ($arts as $row) {
			$art = new Articulo_model($row->articulo);
			// $art->actualizarExistencia($_POST);
			$rec = $art->getReceta([], $listaMedidas, $listaArticulos);
			if (count($rec) == 0 || $art->produccion || (count($rec) > 0 && (int)$art->mostrar_inventario === 1)) {
				$args['reg'][$row->sede][] = $art->getExistencias($_POST, $listaMedidas, $listaArticulos);
			}
		}

		if (count($arts) > 0) {
			$_POST['_saldo_inicial'] = 1;
			foreach ($args['reg'] as $key => $registro) {
				foreach ($registro as $llave => $value) {
					$art = new Articulo_model($value->articulo->articulo);
					$obj = $art->getExistencias($_POST, $listaMedidas, $listaArticulos);
					// $args['reg'][$key][$llave]->saldo_inicial = $obj->saldo_inicial;
					$value->saldo_inicial = $obj->saldo_inicial;
					$value->existencia = (float)$obj->saldo_inicial + (float)$value->ingresos - ((float)$value->egresos + (float)$value->comandas + (float)$value->facturas);
				}
			}
			// Finaliza calculo de saldo inicial

			if (isset($_POST['solo_bajo_minimo']) && (int)$_POST['solo_bajo_minimo'] === 1) {
				foreach ($args['reg'] as $key => $registro) {
					foreach ($registro as $llave => $value) {
						if (round((float)$value->existencia / (float)$value->presentacion->cantidad, 2) > (float)$value->articulo->stock_minimo) {
							unset($args['reg'][$key][$llave]);
						}
					}
				}
			}
		}
		// Inicia calculo de saldo inicial

		// $this->Bitacora_model->log_to_file(Hoy(5) . ",{$this->data->dominio}," . $this->php_self . ',' . get_mem_usage() . ',medio,');

		if (verDato($_POST, '_excel')) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->getProperties()
				->setCreator('Restouch')
				->setTitle('Office 2007 xlsx Existencias')
				->setSubject('Office 2007 xlsx Existencias')
				->setKeywords('office 2007 openxml php');

			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();
			$nombres = [
				'Código',
				'Descripción',
				'Unidad',
				'Mínimo',
				'Máximo',
				'S. Inicial',
				'Ingresos',
				'Egresos',
				'Comandas',
				'Factura Directa',
				'Total Egresos',
				'Existencia'
			];
			/*Encabezado*/
			$hoja->setCellValue('A1', "Reporte de Existencias {$args['subtitulo']}");
			$hoja->setCellValue('A2', "Del {$args['fecha_del']} al {$args['fecha']}");

			$hoja->fromArray($nombres, null, 'A4');
			$hoja->getStyle('A4:L4')->getFont()->setBold(true);
			$hoja->getStyle('A4:L4')->getAlignment()->setHorizontal('center');
			$hoja->getStyle('A1:L2')->getFont()->setBold(true);
			$fila = 5;
			if (count($arts) > 0) {
				foreach ($args['sedes'] as $sede) {
					$obj = new Sede_model($sede);
					$hoja->setCellValue("A{$fila}", "{$obj->nombre} ({$obj->alias})");
					$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
					$fila++;
					$hoja->setCellValue("A{$fila}", $args['bodegas'][$obj->getPK()]);
					$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
					$fila++;
					foreach ($args["reg"][$sede] as $row) {
						$art = new Articulo_model($row->articulo->articulo);
						$rec = $art->getReceta();

						$existencia = round($row->existencia / $row->presentacion->cantidad, 5);

						$reg = [
							(!empty($row->articulo->codigo) ? $row->articulo->codigo : $row->articulo->articulo),
							// "{$row->articulo->articulo} " . $row->articulo->descripcion,
							$row->articulo->descripcion,
							$row->presentacion->descripcion,
							round((float)$row->articulo->stock_minimo, 2),
							round((float)$row->articulo->stock_maximo, 2),
							((float) $row->saldo_inicial != 0) ? round($row->saldo_inicial / $row->presentacion->cantidad, 5) : "0.00",
							((float) $row->ingresos != 0) ? round($row->ingresos / $row->presentacion->cantidad, 2) : "0.00",
							((float) $row->egresos != 0) ? round($row->egresos / $row->presentacion->cantidad, 2) : "0.00",
							((float) $row->comandas != 0) ? round($row->comandas / $row->presentacion->cantidad, 2) : "0.00",
							((float) $row->facturas != 0) ? round($row->facturas / $row->presentacion->cantidad, 2) : "0.00",
							((float) $row->total_egresos != 0) ? round($row->total_egresos / $row->presentacion->cantidad, 2) : "0.00",
							// (count($rec) > 0 && $art->produccion == 0) ? "0.00" : (((float) $row->existencia != 0) ? round($row->existencia / $row->presentacion->cantidad, 2) : "0.00")
							(float)$existencia === (float)0 ? "0.00" : $existencia
						];

						$hoja->fromArray($reg, null, "A{$fila}");
						$hoja->getStyle("D{$fila}:E{$fila}")->getNumberFormat()->setFormatCode('0.00');
						$hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00000');
						$hoja->getStyle("G{$fila}:K{$fila}")->getNumberFormat()->setFormatCode('0.00');
						$hoja->getStyle("L{$fila}")->getNumberFormat()->setFormatCode('0.00000');
						$fila++;
					}
				}
			}

			for ($i = 0; $i <= count($nombres); $i++) {
				$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
			}

			$hoja->getStyle("A4:A{$fila}")->getAlignment()->setHorizontal('left');

			$fila++;
			$hoja->setCellValue("A{$fila}", "Supervisor:");
			$hoja->setCellValue("D{$fila}", "Jefe de Almacenaje:");
			$hoja->setCellValue("F{$fila}", "Fecha:");
			$hoja->setCellValue("H{$fila}", "Hora:");
			$hoja->setTitle("Existencias");

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename=Existencias.xlsx");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save("php://output");
			// $this->Bitacora_model->log_to_file(Hoy(5) . ",{$this->data->dominio}," . $this->php_self . ',' . get_mem_usage() . ',fin (excel),' . json_encode($_POST));
		} else {

			$pdf = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(), //produccion
				"format" => "letter",
				"lands"
			]);


			$vista = $this->load->view('reporte/existencia/imprimir', $args, true);
			$rand  = rand();
			$pdf->AddPage("L");
			$pdf->WriteHTML($vista);
			$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			$pdf->Output("Existencias_{$rand}.pdf", "D");
			// $this->Bitacora_model->log_to_file(Hoy(5) . ",{$this->data->dominio}," . $this->php_self . ',' . get_mem_usage() . ',fin (pdf),' . json_encode($_POST));
			// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($args));
		}
	}
	/** Finaliza función para el cálculo de existencias */

	private function get_info_kardex($parametros)
	{
		$_POST = $parametros;
		$rpt = new Reporte_model();

		$datos = [];
		$infoArticulo = new stdClass();

		$listaMedidas = $this->Umedida_model->get_lista_medidas();
		$listaArticulos = $this->Articulo_model->get_lista_articulos();
		foreach ($_POST['sede'] as $s) {
			$art = $this->Articulo_model->buscarArticulo(['sede' => $s, 'codigo' => $_POST['articulo']]);
			if ($art) {
				$articulo = new Articulo_model($art->articulo);
				$infoArticulo->codigo = $articulo->codigo;
				$infoArticulo->descripcion = $articulo->descripcion;
				$cntReceta = count($articulo->getReceta());
				if ($cntReceta === 0 || $articulo->produccion || ($cntReceta > 0 && (int)$articulo->mostrar_inventario === 1)) {
					$presentacionReporte = $articulo->getPresentacionReporte();
					$sede = new Sede_model($s);
					$datos[] = (object)[
						'sede' => (object)['sede' => $sede->getPK(), 'nombre' => $sede->nombre, 'alias' => $sede->alias],
						'presentacion' => $presentacionReporte->descripcion,
						'bodegas' => []
					];
					$lastIdxSedes = count($datos) - 1;
					foreach ($_POST['bodega'] as $bode) {
						$bodega = new Bodega_model($bode);
						if ((int)$bodega->sede === (int)$s) {
							$rpt->setTipo(2);
							$paramsExist = ['sede' => $s, 'bodega' => $bodega->getPK(), 'articulo' => $articulo->getPK(), 'fdel' => $_POST['fdel'], 'fal' => $_POST['fal']];
							// $existencias = $rpt->getExistencias($paramsExist);
							$paramsExistNvo = [
								'sede' => [0 => $s], 'bodega' => [0 => $bodega->getPK()], 'fecha_del' => $_POST['fdel'], 'fecha_al' => $_POST['fal'],
								'solo_bajo_minimo' => 0, '_excel' => 0, 'categoria_grupo' => $articulo->categoria_grupo, 'fecha' => $_POST['fal'],
								'_saldo_inicial' => 1
							];
							$existencias = $articulo->getExistencias($paramsExistNvo, $listaMedidas, $listaArticulos);
							$existencia = new stdClass();
							$existencia->existencia = 0;
							$existencia->saldo_inicial = 0;

							if (is_array($existencias) && count($existencias) > 0) {
								$existencia = $existencias[0];
								if ($existencia->existencia != 0) {
									// $existencia->existencia = (float)$presentacionReporte->cantidad !== 0 ? ((float)$existencia->existencia / (float)$presentacionReporte->cantidad) : 0;
									$existencia->existencia = (float)$existencia->existencia;
								} else {
									$existencia->existencia = (float)$existencia->existencia;
								}
							} else {
								$existencia->existencia = (float)$presentacionReporte->cantidad !== 0 ? ((float)$existencias->existencia / (float)$presentacionReporte->cantidad) : 0;
								$existencia->saldo_inicial = (float)$presentacionReporte->cantidad !== 0 ? ((float)$existencias->saldo_inicial / (float)$presentacionReporte->cantidad) : 0;
							}

							$datos[$lastIdxSedes]->bodegas[] = (object)[
								'bodega' => $bodega->getPK(), 'descripcion' => $bodega->descripcion, 'antiguedad' => $existencia->saldo_inicial,
								'ingresos' => 0, 'salidas' => 0, 'egresos' => 0, 'comandas' => 0, 'facturas' => 0, 'detalle' => []
							];
							$lastIdxBodegas = count($datos[$lastIdxSedes]->bodegas) - 1;
							$rpt->setTipo(3);
							$existencias = $rpt->getExistencias($paramsExist);
							foreach ($existencias as $row) {
								$row->cantidad = (float)$presentacionReporte->cantidad !== 0 ? ((float)$row->cantidad / (float)$presentacionReporte->cantidad) : 0;
								// $row->cantidad = (float)$row->cantidad;

								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->ingresos += ((int)$row->tipo === 1) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->salidas += ((int)$row->tipo === 2) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->egresos += ((int)$row->tipo_salida === 1) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->comandas += ((int)$row->tipo_salida === 2) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->facturas += ((int)$row->tipo_salida === 3) ? (float)$row->cantidad : 0;
								if ((float)$row->cantidad !== (float)0) {
									$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->detalle[] = (object)[
										'id' => (int)$row->id,
										'tipo' => (int)$row->tipo,
										'cantidad' => (float)$row->cantidad,
										'fecha' => $row->fecha,
										'tipo_movimiento' => $row->tipo_movimiento,
									];
								}
							}
							usort($datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->detalle, function ($a, $b) {
								return strtotime($b->fecha) < strtotime($a->fecha);
							});
						}
					}
				}
			}
		}

		$args = [
			'fdel' => $_POST['fdel'],
			'fal' => $_POST['fal'],
			'articulo' => $infoArticulo,
			'sedes' => $datos
		];

		return $args;
	}

	public function kardex()
	{
		$parametros = json_decode(file_get_contents('php://input'), true);
		$args = $this->get_info_kardex($parametros);

		if (verDato($parametros, "_excel")) {
			$args = (object)$args;
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->getProperties()
				->setCreator("Restouch")
				->setTitle("Office 2007 xlsx Kardex")
				->setSubject("Office 2007 xlsx Kardex")
				->setKeywords("office 2007 openxml php");


			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();

			$hoja->getStyle('A1:H4')->getFont()->setBold(true);
			$hoja->mergeCells('A1:H1');
			$hoja->mergeCells('A2:H2');
			$hoja->mergeCells('A3:H3');
			$hoja->mergeCells('A4:H4');

			$hoja->setCellValue('A1', 'Kardex');
			$hoja->setCellValue('A2', "Artículo: {$args->articulo->descripcion}");
			$hoja->setCellValue('A3', "Código: {$args->articulo->codigo}");
			$hoja->setCellValue('A4', 'Del ' . formatoFecha($args->fdel, 2) . ' al ' . formatoFecha($args->fal, 2));

			$fila = 6;
			foreach ($args->sedes as $sede) {
				$hoja->mergeCells("A{$fila}:H{$fila}");
				$hoja->getStyle("A{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
				$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
				$hoja->setCellValue("A{$fila}", "Sede: {$sede->sede->nombre} ({$sede->sede->alias})");
				$fila++;
				$hoja->mergeCells("A{$fila}:H{$fila}");
				$hoja->getStyle("A{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
				$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
				$hoja->setCellValue("A{$fila}", "Presentación: {$sede->presentacion}");
				$fila++;
				foreach ($sede->bodegas as $bodega) {
					$hoja->mergeCells("A{$fila}:H{$fila}");
					$hoja->getStyle("A{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
					$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
					$hoja->setCellValue("A{$fila}", "Bodega: {$bodega->descripcion}");
					$fila++;
					$hoja->getStyle("A{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
					$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
					$hoja->setCellValue("A{$fila}", 'Saldo Anterior');
					$hoja->setCellValue("B{$fila}", 'Ingresos');
					$hoja->setCellValue("C{$fila}", 'Egresos');
					$hoja->setCellValue("D{$fila}", 'Comandas');
					$hoja->setCellValue("E{$fila}", 'Facturas Directas');
					$hoja->setCellValue("F{$fila}", 'Total Egresos');
					$hoja->setCellValue("G{$fila}", 'Saldo Actual');
					$fila++;
					$saldo = $bodega->antiguedad + $bodega->ingresos - $bodega->salidas;
					$hoja->setCellValue("A{$fila}", $bodega->antiguedad);
					$hoja->setCellValue("B{$fila}", $bodega->ingresos);
					$hoja->setCellValue("C{$fila}", $bodega->egresos);
					$hoja->setCellValue("D{$fila}", $bodega->comandas);
					$hoja->setCellValue("E{$fila}", $bodega->facturas);
					$hoja->setCellValue("F{$fila}", $bodega->salidas);
					$hoja->setCellValue("G{$fila}", $saldo);
					$hoja->getStyle("A{$fila}")->getNumberFormat()->setFormatCode('0.00000');
					$hoja->getStyle("B{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
					$hoja->getStyle("G{$fila}")->getNumberFormat()->setFormatCode('0.00000');
					$fila++;
					if (count($bodega->detalle) > 0) {
						$hoja->getStyle("C{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
						$hoja->getStyle("C{$fila}:H{$fila}")->getFont()->setBold(true);
						$hoja->setCellValue("C{$fila}", 'Fecha');
						$hoja->setCellValue("D{$fila}", 'No.');
						$hoja->setCellValue("E{$fila}", 'Tipo Movimiento');
						$hoja->setCellValue("F{$fila}", 'Ingreso');
						$hoja->setCellValue("G{$fila}", 'Salida');
						$hoja->setCellValue("H{$fila}", 'Saldo');
						$fila++;
						$saldo2 = $bodega->antiguedad;
            foreach ($bodega->detalle as $det) {
              if ($det->tipo == 1) {
                $saldo2 += $det->cantidad;
              } elseif ($det->tipo == 2) {
                $saldo2 -= $det->cantidad;
              }
							$hoja->setCellValue("C{$fila}", formatoFecha($det->fecha, 2));
							$hoja->setCellValue("D{$fila}", $det->id);
							$hoja->setCellValue("E{$fila}", $det->tipo_movimiento);
							$hoja->getStyle("C{$fila}:E{$fila}")->getAlignment()->setHorizontal('center');
							$hoja->setCellValue("F{$fila}", ($det->tipo == 1) ? $det->cantidad : "0.00");
							$hoja->setCellValue("G{$fila}", ($det->tipo == 2) ? $det->cantidad : "0.00");
							$hoja->setCellValue("H{$fila}", $saldo2);
							$hoja->getStyle("F{$fila}:H{$fila}")->getNumberFormat()->setFormatCode('0.00');
							$fila++;
						}
					} else {
						$hoja->mergeCells("A{$fila}:H{$fila}");
						$hoja->getStyle("A{$fila}:H{$fila}")->getAlignment()->setHorizontal('center');
						$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
						$hoja->setCellValue("A{$fila}", "SIN MOVIMIENTOS EN LA BODEGA " . strtoupper($bodega->descripcion));
						$fila++;
					}
					$fila++;
				}
			}

			foreach (range('A', 'H') as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}


			$hoja->setTitle("Kardex");

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename=Kardex.xls");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save("php://output");
		} else {
			$vista = $this->load->view('reporte/kardex/imprimir', $args, true);
			$pdf   = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(), //produccion
				"format" => "letter",
				"lands"
			]);

			$pdf->AddPage("L");
			$pdf->WriteHTML($vista);
			$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			$pdf->Output("Kardex.pdf", "D");

			// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($args));
		}
	}

	public function valorizado()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$hoy = date('Y-m-d');
		$listaMedidas = $this->Umedida_model->get_lista_medidas();
		$listaArticulos = $this->Articulo_model->get_lista_articulos();
		$soloConfirmados = !isset($req['_sinconfirmar']) || (isset($req['_sinconfirmar']) && (int)$req['_sinconfirmar'] === 0);

		$articulos = $this->Ingreso_model->get_articulos_con_ingresos($req);

		$data = [];
		foreach ($req['sede'] as $s) {
			$sede = new Sede_model($s);
			$empresa = $sede->getEmpresa();

			$porIva = 1.0;
			if (isset($req['_coniva']) && (int)$req['_coniva'] === 1) {
				$porIva +=  ($empresa ? (float)$empresa->porcentaje_iva : 0);
			}

			$data[] = (object)[
				'empresa' => (object)['empresa' => $empresa->getPK(), 'nombre' => $empresa->nombre, 'nombre_comercial' => $empresa->nombre_comercial],
				'sede' => $sede->getPK(),
				'nombre' => "{$sede->nombre} ({$sede->alias})",
				'bodegas' => []
			];
			$lastIdxSedes = count($data) - 1;
			foreach ($req['bodega'] as $bode) {
				$bodega = new Bodega_model($bode);
				if ((int)$bodega->sede === (int)$s) {
					$data[$lastIdxSedes]->bodegas[] = (object)[
						'bodega' => $bodega->getPK(),
						'descripcion' => $bodega->descripcion,
						'articulos' => []
					];
					$lastIdxBodegas = count($data[$lastIdxSedes]->bodegas) - 1;
					foreach ($articulos as $row) {
						$art = new Articulo_model($row->articulo);
						$categoria = $art->get_categoria();

						if ((int)$categoria->sede === (int)$s) {
							$pathSubcat = $art->get_path_subcategorias();
							$receta = $art->getReceta();
							if (count($receta) === 0 || (int)$art->produccion === 1 || (count($receta) > 0 && (int)$art->mostrar_inventario === 1)) {
								// 12/02/2024 JM solicitó cambio en el siguiente proceso, que en ves de llamar actualizarExistencia, de una vez
								// se llame el proceso obtenerExistencia, para que hale el valor de la existencia en base a la tabla boodega_articulo_costo
								// este cambio probablemente afecte los artículos que son recetas o tienen detalle.
								// $art->actualizarExistencia(['fecha' => $req['fecha'], 'sede' => $s, 'bodega' => $bode, '_sinconfirmar' => ($soloConfirmados ? 0 : 1)]);

								// Hasta el 22/06/2024 15:45 se usó lo siguiente:
								// $args = ['fecha' => $req['fecha'], 'sede' => $s, 'bodega' => $bode, '_sinconfirmar' => ($soloConfirmados ? 0 : 1)];
								// $art->existencias = $art->obtenerExistencia($args, $art->getPK(), (int)$art->esreceta === 1);

								$paramsExist = [
									'sede' => [0 => (int)$s], 'bodega' => [0 => (int)$bode], 'fecha_al' => $hoy,
									'solo_bajo_minimo' => 0, '_excel' => 0, 'categoria_grupo' => (int)$art->categoria_grupo, 'fecha' => $hoy,
								];
								$existencia = $art->getExistencias($paramsExist, $listaMedidas, $listaArticulos);
								$art->existencias = $existencia && $existencia->saldo_calculado ? round($existencia->saldo_calculado, 5) : round(0, 5);

								$pres = $art->getPresentacionReporte();
								$art->existencias = (float)$art->existencias / (float)$pres->cantidad;
								// $art->existencias = (float)$art->existencias;

								if (!isset($req['_sinconfirmar']) || (isset($req['_sinconfirmar']) && (int)$req['_sinconfirmar'] === 0)) {
									$datos_costo = $this->BodegaArticuloCosto_model->get_datos_costo($bode, $row->articulo);
									if ($datos_costo) {
										if ($empresa->metodo_costeo == 1) {
											$row->precio_unitario = $datos_costo->costo_ultima_compra;
										} else if ($empresa->metodo_costeo == 2) {
											$row->precio_unitario = $datos_costo->costo_promedio;
										} else {
											$row->precio_unitario = 0;
										}
									} else {
										$bcosto = $this->BodegaArticuloCosto_model->buscar(['bodega' => $bode, 'articulo' => $row->articulo, '_uno' => true]);

										if ($bcosto) {
											if ($empresa->metodo_costeo == 1) {
												$row->precio_unitario = $bcosto->costo_ultima_compra;
											} else if ($empresa->metodo_costeo == 2) {
												$row->precio_unitario = $bcosto->costo_promedio;
											} else {
												$row->precio_unitario = 0;
											}
										} else {
											$row->precio_unitario = $art->getCosto(['bodega' => $bode]);
											$nvoBac = new BodegaArticuloCosto_model();
											$nvoBac->BodegaArticuloCosto_model->guardar_costos($bode, $row->articulo, ($art->existencias * (float)$pres->cantidad));
										}
									}
								} else {
									$row->precio_unitario = $art->getCosto(['bodega' => $bode, '_sinconfirmar' => (int)$req['_sinconfirmar']]);
								}


								$row->precio_unitario = ($row->precio_unitario * $porIva) * $pres->cantidad;

								$obj = (object)[
									"articulo" => $art->getPK(),
									"presentacion" => $pres->descripcion,
									"cantidad" => (float)$art->existencias,
									"total" => (float)$art->existencias * $row->precio_unitario,
									"descripcion" => $art->descripcion,
									"precio_unitario" => $row->precio_unitario,
									"ultima_compra" => isset($row->fecha) ? formatoFecha($row->fecha, 2) : '',
									"categoria" => $categoria->descripcion,
									"categoria_grupo" => $pathSubcat,
									"full_name" => trim($categoria->descripcion) . '-' . $pathSubcat . '-' . trim($art->descripcion)
								];

								if (!in_array($obj, $data[$lastIdxSedes]->bodegas[$lastIdxBodegas]->articulos)) {
									$data[$lastIdxSedes]->bodegas[$lastIdxBodegas]->articulos[] = $obj;
								}
							}
						}
					}
					$data[$lastIdxSedes]->bodegas[$lastIdxBodegas]->articulos = ordenar_array_objetos($data[$lastIdxSedes]->bodegas[$lastIdxBodegas]->articulos, 'full_name');
				}
			}
		}

		$datos = ['fecha' => formatoFecha($req['fecha'], 2), 'sedes' => $data];

		if (verDato($req, "_excel")) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->getProperties()
				->setCreator("Restouch")
				->setTitle("Office 2007 xlsx Valorizado")
				->setSubject("Office 2007 xlsx Valorizado")
				->setKeywords("office 2007 openxml php");

			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();

			$hoja->getStyle('A1:K4')->getFont()->setBold(true);
			$hoja->mergeCells('A1:K1');
			$hoja->mergeCells('A2:K2');
			$hoja->setCellValue('A1', 'Inventario Valorizado');
			$hoja->setCellValue('A2', "Al {$datos['fecha']}");

			$hoja->getStyle('A4:K4')->getAlignment()->setHorizontal('center');
			$hoja->getStyle('I')->getAlignment()->setHorizontal('center');
			$hoja->getStyle('H')->getNumberFormat()->setFormatCode('0.00000');
			$hoja->getStyle('J')->getNumberFormat()->setFormatCode('0.00000');
			$hoja->getStyle('K')->getNumberFormat()->setFormatCode('0.00');
			$hoja->setCellValue('A4', 'Empresa');
			$hoja->setCellValue('B4', 'Sede');
			$hoja->setCellValue('C4', 'Bodega');
			$hoja->setCellValue('D4', 'Categoría');
			$hoja->setCellValue('E4', 'Subcategoría');
			$hoja->setCellValue('F4', 'Descripción');
			$hoja->setCellValue('G4', 'Presentación');
			$hoja->setCellValue('H4', 'Existencia');
			$hoja->setCellValue('I4', 'Última Compra');
			$hoja->setCellValue('J4', 'Costo');
			$hoja->setCellValue('K4', 'Valor');
			$hoja->setAutoFilter('A4:K4');

			$fila = 5;
			foreach ($datos['sedes'] as $sede) {
				foreach ($sede->bodegas as $bodega) {
					foreach ($bodega->articulos as $articulo) {
						$hoja->setCellValue("A{$fila}", $sede->empresa->nombre);
						$hoja->setCellValue("B{$fila}", $sede->nombre);
						$hoja->setCellValue("C{$fila}", $bodega->descripcion);
						$hoja->setCellValue("D{$fila}", $articulo->categoria);
						$hoja->setCellValue("E{$fila}", $articulo->categoria_grupo);
						// $hoja->setCellValue("F{$fila}", "{$articulo->articulo}-{$articulo->descripcion}");
						$hoja->setCellValue("F{$fila}", "{$articulo->descripcion}");
						$hoja->setCellValue("G{$fila}", $articulo->presentacion);
						$hoja->setCellValue("H{$fila}", round($articulo->cantidad, 5));
						$hoja->setCellValue("I{$fila}", $articulo->ultima_compra);
						$hoja->setCellValue("J{$fila}", $articulo->precio_unitario);
						$hoja->setCellValue("K{$fila}", $articulo->total);
						$fila++;
					}
				}
			}

			$fila--;
			$hoja->getStyle("A4:K{$fila}")->getBorders()->getAllBorders()
				->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
				->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

			foreach (range('A', 'K') as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}

			$hoja->setTitle("Inventario Valorizado");

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename=Valorizado.xls");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save("php://output");
		} else {
			$vista = $this->load->view('reporte/valorizado/imprimir', $datos, true);

			$mpdf = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(), //Produccion
				'format' => 'Legal'
			]);

			$mpdf->WriteHTML($vista);
			$mpdf->Output("valorizado.pdf", "D");
			// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($datos));
		}
	}

	public function consumos_original()
	{
		set_time_limit(0);
		$params = json_decode(file_get_contents('php://input'), true);
		$rpt = new Reporte_model();
		$datos = [];

		$fltr = [];

		if (isset($params['categoria']) && (int)$params['categoria'] > 0) {
			$fltr['categoria'] = $params['categoria'];
		}

		if (isset($params['categoria_grupo']) && (int)$params['categoria_grupo'] > 0) {
			$fltr['categoria_grupo'] = $params['categoria_grupo'];
		}

		$begin = new DateTime($params['fdel']);
		$end = new DateTime($params['fal']);

		$interval = DateInterval::createFromDateString('1 day');
		$period = new DatePeriod($begin, $interval, $end->modify('+1 day'));

		foreach ($params['sede'] as $s) {
			$fltr['sede'] = $s;
			$lstArticulos = $rpt->get_info_articulos_inventario($fltr);
			foreach ($lstArticulos as $articulo) {
				$datos[] = $articulo;
				$idx = count($datos) - 1;
				foreach ($params['bodega'] as $b) {
					$bodega = new Bodega_model($b);
					if ((int)$bodega->sede === (int)$s) {
						$datos[$idx]->bodega[] = (object)[
							'idbodega' => $bodega->bodega,
							'bodega' => $bodega->descripcion,
							'consumos' => []
						];
						$idxBodega = count($datos[$idx]->bodega) - 1;

						foreach ($period as $dt) {
							$fecha = $dt->format('Y-m-d');
							$datos[$idx]->bodega[$idxBodega]->consumos[$fecha] = 0;
						}

						$kardex = $this->get_info_kardex([
							'sede' => [$s],
							'bodega' => [$b],
							'articulo' => $articulo->codigo,
							'fdel' => $params['fdel'],
							'fal' => $params['fal']
						]);

						if (isset($kardex['sedes']) && isset($kardex['sedes'][0]->bodegas[0]->detalle)) {
							$detalles = $kardex['sedes'][0]->bodegas[0]->detalle;
							foreach ($detalles as $detalle) {
								if ((int)$detalle->tipo === 2) {
									$fecha = new DateTime($detalle->fecha);
									$fecha = $fecha->format('Y-m-d');
									$datos[$idx]->bodega[$idxBodega]->consumos[$fecha] += (float)$detalle->cantidad;
								}
							}
						}
					}
				}
			}
		}

		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
		$excel->getProperties()
			->setCreator("RestTouch")
			->setTitle("Office 2007 xlsx Consumos")
			->setSubject("Office 2007 xlsx Consumos")
			->setKeywords("office 2007 openxml php");


		$excel->setActiveSheetIndex(0);
		$hoja = $excel->getActiveSheet();

		$hoja->setCellValue('A1', 'Reporte de Consumos');
		$hoja->setCellValue('A2', 'Del ' . formatoFecha($params['fdel'], 2) . ' al ' . formatoFecha($params['fal'], 2));
		$hoja->mergeCells('A1:C1');
		$hoja->mergeCells('A2:C2');
		$hoja->getStyle("A1:A2")->getFont()->setBold(true);

		$hoja->setCellValue('A4', 'Sede');
		$hoja->setCellValue('B4', 'Categoría');
		$hoja->setCellValue('C4', 'Subcategoría');
		$hoja->setCellValue('D4', 'Artículo');
		$hoja->setCellValue('E4', 'Código');
		$hoja->setCellValue('F4', 'Presentación');
		$hoja->setCellValue('G4', 'Presentación reporte');
		$hoja->setCellValue('H4', 'Bodega');
		$columna = 'I';
		foreach ($period as $dt) {
			$hoja->setCellValue("{$columna}4", $dt->format('D d/m/Y'));
			$columna++;
		}
		$hoja->setCellValue("{$columna}4", 'Total');

		$fila = 5;
		$columnaFinal = '';
		foreach ($datos as $d) {
			foreach ($d->bodega as $b) {
				$hoja->setCellValue("A{$fila}", $d->sede);
				$hoja->setCellValue("B{$fila}", $d->categoria);
				$hoja->setCellValue("C{$fila}", $d->subcategoria);
				$hoja->setCellValue("D{$fila}", $d->descripcion);
				$hoja->setCellValue("E{$fila}", $d->codigo);
				$hoja->setCellValue("F{$fila}", $d->presentacion);
				$hoja->setCellValue("G{$fila}", $d->presentacion_reporte);
				$hoja->setCellValue("H{$fila}", $b->bodega);
				$columna = 'I';
				$totalConsumo = 0;
				foreach ($b->consumos as $consumo) {
					$hoja->setCellValue("{$columna}{$fila}", $consumo);
					$totalConsumo += $consumo;
					$columna++;
				}
				$columnaFinal = $columna;
				$hoja->setCellValue("{$columnaFinal}{$fila}", $totalConsumo);
				$fila++;
			}
		}

		$fila--;
		$hoja->getStyle("I4:{$columnaFinal}{$fila}")->getAlignment()->setHorizontal('right');
		$hoja->getStyle("A4:{$columnaFinal}4")->getFont()->setBold(true);
		$hoja->getStyle("I5:{$columnaFinal}{$fila}")->getNumberFormat()->setFormatCode('0.00');
		$hoja->setAutoFilter("A4:H4");

		foreach (range('A', $columnaFinal) as $col) {
			$hoja->getColumnDimension($col)->setAutoSize(true);
		}

		$hoja->setTitle("Consumos");

		header("Content-Type: application/vnd.ms-excel");
		header("Content-Disposition: attachment;filename=Consumos_" . date('YmdHis') . ".xls");
		header("Cache-Control: max-age=1");
		header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
		header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
		header("Cache-Control: cache, must-revalidate");
		header("Pragma: public");

		$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
		$writer->save("php://output");
		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($datos));
	}

	public function dump_ingresos()
	{
		$params = json_decode(file_get_contents('php://input'), true);
		$rpt = new Reporte_model();
		$ingresos = $rpt->get_dump_ingresos($params);

		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
		$excel->getProperties()
			->setCreator("RestTouch")
			->setTitle("Office 2007 xlsx Ingresos")
			->setSubject("Office 2007 xlsx Ingresos")
			->setKeywords("office 2007 openxml php");


		$excel->setActiveSheetIndex(0);
		$hoja = $excel->getActiveSheet();

		$hoja->setCellValue('A1', 'Ingresos');
		$hoja->setCellValue('A2', 'Del ' . formatoFecha($params['fdel'], 2) . ' al ' . formatoFecha($params['fal'], 2));
		$hoja->mergeCells('A1:C1');
		$hoja->mergeCells('A2:C2');
		$hoja->getStyle("A1:A2")->getFont()->setBold(true);

		$hoja->setCellValue('A4', 'Ingreso');
		$hoja->setCellValue('B4', 'Fecha');
		$hoja->setCellValue('C4', 'Tipo');
		$hoja->setCellValue('D4', 'Bodega');
		$hoja->setCellValue('E4', 'Usuario');
		$hoja->setCellValue('F4', 'Bodega origen');
		$hoja->setCellValue('G4', 'Proveedor');
		$hoja->setCellValue('H4', 'Artículo');
		$hoja->setCellValue('I4', 'Presentación');
		$hoja->setCellValue('J4', 'Cantidad');
		$hoja->setCellValue('K4', 'Costo Unitario (con IVA)');
		$hoja->setCellValue('L4', 'Costo Total (con IVA)');
		$hoja->setCellValue('M4', 'Comentario');

		$fila = 5;

		foreach ($ingresos as $ingreso) {
			foreach ($ingreso->detalle as $det) {
				$hoja->setCellValue("A{$fila}", $ingreso->ingreso);
				$hoja->setCellValue("B{$fila}", $ingreso->fecha);
				$hoja->setCellValue("C{$fila}", $ingreso->tipo_movimiento);
				$hoja->setCellValue("D{$fila}", $ingreso->bodega);
				$hoja->setCellValue("E{$fila}", $ingreso->usuario);
				$hoja->setCellValue("F{$fila}", $ingreso->bodega_origen);
				$hoja->setCellValue("G{$fila}", $ingreso->proveedor);
				$hoja->setCellValue("H{$fila}", $det->articulo);
				$hoja->setCellValue("I{$fila}", $det->presentacion);
				$hoja->setCellValue("J{$fila}", $det->cantidad);
				$hoja->setCellValue("K{$fila}", $det->costo_unitario_con_iva);
				$hoja->setCellValue("L{$fila}", $det->costo_total_con_iva);
				$hoja->setCellValue("M{$fila}", $ingreso->comentario);
				$fila++;
			}
		}

		$fila--;
		$hoja->getStyle("J4:L{$fila}")->getAlignment()->setHorizontal('right');
		$hoja->getStyle("A4:M4")->getFont()->setBold(true);
		$hoja->getStyle("J5:L{$fila}")->getNumberFormat()->setFormatCode('0.00');
		$hoja->setAutoFilter("A4:I4");

		foreach (range('A', 'M') as $col) {
			$hoja->getColumnDimension($col)->setAutoSize(true);
		}

		$hoja->setTitle("Ingresos");

		header("Content-Type: application/vnd.ms-excel");
		header("Content-Disposition: attachment;filename=Ingresos_" . date('YmdHis') . ".xls");
		header("Cache-Control: max-age=1");
		header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
		header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
		header("Cache-Control: cache, must-revalidate");
		header("Pragma: public");

		$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
		$writer->save("php://output");

		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($ingresos));
	}

	public function dump_egresos()
	{
		$params = json_decode(file_get_contents('php://input'), true);
		$rpt = new Reporte_model();
		$egresos = $rpt->get_dump_egresos($params);

		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
		$excel->getProperties()
			->setCreator("RestTouch")
			->setTitle("Office 2007 xlsx Egresos")
			->setSubject("Office 2007 xlsx Egresos")
			->setKeywords("office 2007 openxml php");


		$excel->setActiveSheetIndex(0);
		$hoja = $excel->getActiveSheet();

		$hoja->setCellValue('A1', 'Egresos');
		$hoja->setCellValue('A2', 'Del ' . formatoFecha($params['fdel'], 2) . ' al ' . formatoFecha($params['fal'], 2));
		$hoja->mergeCells('A1:C1');
		$hoja->mergeCells('A2:C2');
		$hoja->getStyle("A1:A2")->getFont()->setBold(true);

		$hoja->setCellValue('A4', 'Egreso');
		$hoja->setCellValue('B4', 'Fecha');
		$hoja->setCellValue('C4', 'Tipo');
		$hoja->setCellValue('D4', 'Bodega');
		$hoja->setCellValue('E4', 'Usuario');
		$hoja->setCellValue('F4', 'Artículo');
		$hoja->setCellValue('G4', 'Presentación');
		$hoja->setCellValue('H4', 'Cantidad');
		$hoja->setCellValue('I4', 'Costo Unitario');
		$hoja->setCellValue('J4', 'Costo Total');

		$fila = 5;

		foreach ($egresos as $egreso) {
			foreach ($egreso->detalle as $det) {
				$hoja->setCellValue("A{$fila}", $egreso->egreso);
				$hoja->setCellValue("B{$fila}", $egreso->fecha);
				$hoja->setCellValue("C{$fila}", $egreso->tipo_movimiento);
				$hoja->setCellValue("D{$fila}", $egreso->bodega);
				$hoja->setCellValue("E{$fila}", $egreso->usuario);
				$hoja->setCellValue("F{$fila}", $det->articulo);
				$hoja->setCellValue("G{$fila}", $det->presentacion);
				$hoja->setCellValue("H{$fila}", $det->cantidad);
				$hoja->setCellValue("I{$fila}", $det->costo_unitario);
				$hoja->setCellValue("J{$fila}", $det->costo_total);
				$fila++;
			}
		}

		$fila--;
		$hoja->getStyle("H4:J{$fila}")->getAlignment()->setHorizontal('right');
		$hoja->getStyle("A4:J4")->getFont()->setBold(true);
		$hoja->getStyle("H5:J{$fila}")->getNumberFormat()->setFormatCode('0.00');
		$hoja->setAutoFilter("A4:G4");

		foreach (range('A', 'J') as $col) {
			$hoja->getColumnDimension($col)->setAutoSize(true);
		}

		$hoja->setTitle("Ingresos");

		header("Content-Type: application/vnd.ms-excel");
		header("Content-Disposition: attachment;filename=Egresos_" . date('YmdHis') . ".xls");
		header("Cache-Control: max-age=1");
		header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
		header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
		header("Cache-Control: cache, must-revalidate");
		header("Pragma: public");

		$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
		$writer->save("php://output");

		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($egresos));
	}

	public function ingreso($id, $excel = 0)
	{
		$rpt = new Reporte_model();
		$ingreso = $rpt->get_ingreso($id);
		$ingreso->excel = (int)$excel === 1;

		$vista = $this->load->view('reporte/ingreso/imprimir', $ingreso, true);

		$nombre = 'Ingreso_' . date('YmdHis');

		if ((int)$excel === 1) {
			$reader = new \PhpOffice\PhpSpreadsheet\Reader\Html();
			$vista = str_replace('&', '&amp;', $vista);
			$xlsx = $reader->loadFromString($vista);
			$xlsx->setActiveSheetIndex(0);
			$hoja = $xlsx->getActiveSheet();

			$hoja->mergeCells('A1:F1');
			$hoja->mergeCells('A2:F2');
			$hoja->mergeCells('A3:F3');
			$hoja->mergeCells('A4:F4');
			$hoja->getStyle('A1:F4')->getFont()->setBold(true);

			$hoja->getStyle('A')->getAlignment()->setHorizontal('left');
			$hoja->getStyle('B')->getAlignment()->setHorizontal('left');
			$hoja->getStyle('C')->getAlignment()->setHorizontal('left');

			$hoja->getStyle('A7:A10')->getFont()->setBold(true);
			$hoja->getStyle('C7')->getFont()->setBold(true);
			$hoja->getStyle('C9')->getFont()->setBold(true);

			$hoja->getStyle('A13:F13')->getFont()->setBold(true);

			$hoja->getStyle('D')->getNumberFormat()->setFormatCode('0.00');
			$hoja->getStyle('D')->getAlignment()->setHorizontal('right');
			$hoja->getStyle('E')->getNumberFormat()->setFormatCode('0.0000');
			$hoja->getStyle('E')->getAlignment()->setHorizontal('right');
			$hoja->getStyle('F')->getNumberFormat()->setFormatCode('0.00');
			$hoja->getStyle('F')->getAlignment()->setHorizontal('right');

			foreach (range('A', 'Z') as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename={$nombre}.xlsx");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($xlsx, 'Xlsx');
			$writer->save('php://output');
		} else {
			$mpdf = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(), //Produccion
				'format' => 'Letter'
			]);

			$mpdf->WriteHTML($vista);
			$mpdf->Output($nombre . '.pdf', 'D');
		}

		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($ingreso));
	}

	public function egreso($id, $excel = 0)
	{
		$rpt = new Reporte_model();
		$egreso = $rpt->get_egreso($id);
		$egreso->excel = (int)$excel === 1;

		$vista = $this->load->view('reporte/egreso/imprimir', $egreso, true);

		$nombre = 'Egreso_' . date('YmdHis');

		if ((int)$excel === 1) {
			$reader = new \PhpOffice\PhpSpreadsheet\Reader\Html();
			$vista = str_replace('&', '&amp;', $vista);
			$xlsx = $reader->loadFromString($vista);
			$xlsx->setActiveSheetIndex(0);
			$hoja = $xlsx->getActiveSheet();

			$hoja->mergeCells('A1:F1');
			$hoja->mergeCells('A2:F2');
			$hoja->mergeCells('A3:F3');
			$hoja->mergeCells('A4:F4');
			$hoja->getStyle('A1:F4')->getFont()->setBold(true);

			$hoja->getStyle('A')->getAlignment()->setHorizontal('left');
			$hoja->getStyle('B')->getAlignment()->setHorizontal('left');
			$hoja->getStyle('C')->getAlignment()->setHorizontal('left');

			$hoja->getStyle('A7:A12')->getFont()->setBold(true);
			$hoja->getStyle('C7')->getFont()->setBold(true);
			$hoja->getStyle('C9')->getFont()->setBold(true);
			$hoja->getStyle('E9')->getFont()->setBold(true);

			$hoja->getStyle('A15:F15')->getFont()->setBold(true);

			$hoja->getStyle('D')->getNumberFormat()->setFormatCode('0.00');
			$hoja->getStyle('D')->getAlignment()->setHorizontal('right');
			$hoja->getStyle('E')->getNumberFormat()->setFormatCode('0.0000');
			$hoja->getStyle('E')->getAlignment()->setHorizontal('right');
			$hoja->getStyle('F')->getNumberFormat()->setFormatCode('0.00');
			$hoja->getStyle('F')->getAlignment()->setHorizontal('right');

			foreach (range('A', 'Z') as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename={$nombre}.xlsx");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($xlsx, 'Xlsx');
			$writer->save('php://output');
		} else {
			$mpdf = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(), //Produccion
				'format' => 'Letter'
			]);

			$mpdf->WriteHTML($vista);
			$mpdf->Output($nombre . '.pdf', 'D');
		}
		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($egreso));
	}

	public function lista_pedidos()
	{
		set_time_limit(0);
		$rpt = new Reporte_model();
		$params = json_decode(file_get_contents('php://input'), true);

		if (!isset($params['sede']) || empty($params['sede'])) {
			$params['sede'] = $this->data->sede;
		}

		$args = [
			'_saldo_inicial' => 1,
			'sede' => $params['sede'],
			'bodega' => $params['bodega'],
			'fecha_del' => $params['fecha_del']
		];

		$pedidos = $rpt->get_lista_pedido_productos($params);

		foreach ($pedidos as $pedido) {
			$ultimo_producto = 0;
			$cantNoMostrar = 0;
			foreach ($pedido->productos as $producto) {
				if ((int)$producto->articulo !== $ultimo_producto) {
					// Inicia calculo de existencia
					$art = new Articulo_model($producto->articulo);
					$obj = $art->getExistencias($args);
					// Finaliza calculo de existencia
				}

				if ((int)$producto->ultima_presentacion > 0) {
					if ((int)$producto->presentacion === (int)$producto->ultima_presentacion) {
						$producto->existencia = round($obj->saldo_inicial / $producto->cantidad_presentacion_reporte, 2);
					} else {
						$producto->existencia = round($obj->saldo_inicial / $producto->cantidad_presentacion_ultima_compra, 2);
					}
				} else {
					$producto->existencia = round($obj->saldo_inicial / $producto->cantidad_presentacion_reporte, 2);
				}

				$producto->a_pedir = (float)$producto->maximo - (float)$producto->existencia;
				$producto->mostrar = (float)$producto->existencia >= (float)$producto->maximo ? 0 : 1;
				if ($producto->mostrar === 0) {
					$cantNoMostrar++;
				}
				$ultimo_producto = (int)$producto->articulo;
			}
			$pedido->mostrar = $cantNoMostrar !== count($pedido->productos);
		}

		$datos = [
			'empresa' => null,
			'sede' => $this->Sede_model->buscar(['sede' => $params['sede'], '_uno' => true]),
			'bodega' => $this->Bodega_model->buscar(['bodega' => $params['bodega'], '_uno' => true]),
			'fecha' => formatoFecha($params['fecha'], 2),
			'pedidos' => $pedidos,
		];

		$datos['empresa'] = $this->Empresa_model->buscar(['empresa' => $datos['sede']->empresa, '_uno' => true]);

		if (verDato($params, '_excel')) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->getProperties()
				->setCreator('RestTouch')
				->setTitle('Office 2007 xlsx Lista_pedidos')
				->setSubject('Office 2007 xlsx Lista_pedidos')
				->setKeywords('office 2007 openxml php');


			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();

			$hoja->setCellValue('A1', $datos['empresa']->nombre);
			$hoja->setCellValue('A2', "{$datos['sede']->nombre} ({$datos['sede']->alias})");
			$hoja->setCellValue('A3', "Lista de pedido de productos al {$datos['fecha']}");
			$hoja->setCellValue('A4', "Bodega: {$datos['bodega']->descripcion}");
			$hoja->setCellValue('A5', 'Impreso: ' . date('d/m/Y H:i:s'));
			$hoja->mergeCells('A1:H1');
			$hoja->mergeCells('A2:H2');
			$hoja->mergeCells('A3:H3');
			$hoja->mergeCells('A4:H4');
			$hoja->mergeCells('A5:H5');
			$hoja->getStyle('A1:H5')->getFont()->setBold(true);
			$hoja->getStyle('A1:H5')->getAlignment()->setHorizontal('center');

			$fila = 7;
			$hoja->setCellValue("E{$fila}", 'Última Compra');
			$hoja->mergeCells("E{$fila}:F{$fila}");
			$hoja->getStyle("E{$fila}:F{$fila}")->getFont()->setBold(true);
			$hoja->getStyle("E{$fila}:F{$fila}")->getAlignment()->setHorizontal('center');
			$fila++;
			$hoja->setCellValue("A{$fila}", 'Descripción');
			$hoja->setCellValue("B{$fila}", 'Presentación');
			$hoja->setCellValue("C{$fila}", 'Mínimo');
			$hoja->setCellValue("D{$fila}", 'Máximo');
			$hoja->getStyle("C{$fila}:D{$fila}")->getAlignment()->setHorizontal('right');
			$hoja->setCellValue("E{$fila}", 'Presentación');
			$hoja->setCellValue("F{$fila}", 'Costo');
			$hoja->setCellValue("G{$fila}", 'Existencia');
			$hoja->setCellValue("H{$fila}", 'A pedir');
			$hoja->getStyle("F{$fila}:H{$fila}")->getAlignment()->setHorizontal('right');
			$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
			$hoja->setAutoFilter("A{$fila}:H{$fila}");
			$fila++;
			foreach ($datos['pedidos'] as $pedido) {
				if ($pedido->mostrar) {
					$hoja->setCellValue("A{$fila}", $pedido->proveedor);
					$hoja->mergeCells("A{$fila}:H{$fila}");
					$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
					$fila++;
					foreach ($pedido->productos as $producto) {
						if ($producto->mostrar === 1) {
							$hoja->setCellValue("A{$fila}", $producto->descripcion_articulo);
							$hoja->setCellValue("B{$fila}", $producto->descripcion_presentacion);
							$hoja->setCellValue("C{$fila}", (float)$producto->minimo);
							$hoja->setCellValue("D{$fila}", (float)$producto->maximo);
							$hoja->getStyle("C{$fila}:D{$fila}")->getAlignment()->setHorizontal('right');
							$hoja->getStyle("C{$fila}:D{$fila}")->getNumberFormat()->setFormatCode('0.00');
							$hoja->setCellValue("E{$fila}", $producto->descripcion_ultima_presentacion);
							$hoja->setCellValue("F{$fila}", (float)$producto->ultimo_costo);
							$hoja->setCellValue("G{$fila}", (float)$producto->existencia);
							$hoja->setCellValue("H{$fila}", (float)$producto->a_pedir);
							$hoja->getStyle("F{$fila}:H{$fila}")->getAlignment()->setHorizontal('right');
							$hoja->getStyle("F{$fila}:H{$fila}")->getNumberFormat()->setFormatCode('0.00');
							$fila++;
						}
					}
				}
			}

			$hoja->setTitle('Lista de pedidos');
			for ($i = 0; $i <= 7; $i++) {
				$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
			}

			header('Content-Type: application/vnd.ms-excel');
			header('Content-Disposition: attachment;filename=Lista_pedidos_' . date('YmdHis') . '.xls');
			header('Cache-Control: max-age=1');
			header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
			header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
			header('Cache-Control: cache, must-revalidate');
			header('Pragma: public');

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save('php://output');
		} else {
			$vista = $this->load->view('reporte/pedidos/imprimir', $datos, true);

			$mpdf = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(), //Produccion
				'format' => 'Letter',
				'lands'
			]);

			$mpdf->AddPage('L');
			$mpdf->WriteHTML($vista);
			$mpdf->Output('Pedido_' . date('YmdHis') . '.pdf', "D");

			// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($datos));
		}
	}

	private function get_data_oc($idOC, $idbodega = null)
	{
		$rpt = new Reporte_model();
		return $rpt->get_compra($idOC, $idbodega);
	}

	public function orden_compra($id, $idbodega = null)
	{
		$oc = $this->get_data_oc($id, $idbodega);
		$oc->bodega_existencias = $idbodega && (int)$idbodega > 0 ? $this->Bodega_model->buscar(['bodega' => $idbodega, '_uno' => true]) : null;
		$vista = $this->load->view('reporte/orden_compra/imprimir', $oc, true);

		$mpdf = new \Mpdf\Mpdf([
			'tempDir' => sys_get_temp_dir(), //Produccion
			'format' => 'Letter'
		]);

		$mpdf->WriteHTML($vista);
		$mpdf->Output('OC_' . date('YmdHis') . '.pdf', "D");

		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($egreso));
	}

	public function lista_ordenes_compra()
	{
		$params = json_decode(file_get_contents("php://input"), true);

		if (
			verDato($params, "fal") &&
			verDato($params, "fdel")
		) {
			$params["sede"]    = $params["sede"] ?? $this->data->sede;
			$params["_select"] = ["orden_compra"];

			$lista = $this->Reporte_model->get_lista_compra($params);

			// if ($lista) {
			$data = [];
			$nombreArchivo = "resumen_pedidos_proveedor_" . rand();

			foreach ($lista as $key => $row) {
				$tmp = new Reporte_model();
				$data[] = $tmp->get_compra($row->orden_compra, $params['bodega']);
			}

			if (verDato($params, '_alfa') && $params['_alfa']) {
				$data = ordenar_array_objetos($data, 'orden_alfa');
			}

			$params['datos_sede'] = $this->Sede_model->buscar(['sede' => $params['sede'], '_uno' => true]);
			$params['datos_bodega'] = $this->Bodega_model->buscar(['bodega' => $params['bodega'], '_uno' => true]);

			if (verDato($params, "_excel")) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();

				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$hoja->setTitle("Reporte");

				$hoja->setCellValue("A1", "Resumen de pedidos por proveedor")->mergeCells("A1:D1");
				$hoja->setCellValue("A2", "Sede: ");
				$hoja->setCellValue("A3", "Las existencias se calculan con base en la bodega: {$params['datos_bodega']->descripcion}")->mergeCells("A3:D3");
				$hoja->setCellValue("A4", "Del: ");
				$hoja->setCellValue("A5", "Al: ");

				$hoja->setCellValue("B2", "{$params['datos_sede']->nombre} ({$params['datos_sede']->alias})");
				$hoja->setCellValue("B4", formatoFecha($params["fdel"], 2));
				$hoja->setCellValue("B5", formatoFecha($params["fal"], 2));
				$hoja->getStyle("A1:B5")->getFont()->setBold(true);

				$pos   = 8;
				$total = 0;

				foreach ($data as $key => $row) {
					$hoja->setCellValue("A{$pos}", $row->orden_compra);
					$hoja->setCellValue("B{$pos}", $row->fhcreacion);
					$hoja->setCellValue("C{$pos}", $row->usuario);
					$hoja->setCellValue("D{$pos}", $row->proveedor);
					$hoja->setCellValue("E{$pos}", $row->estatus);
					$hoja->setCellValue("F{$pos}", $row->ingreso);

					$pos++;

					$hoja->setCellValue("A{$pos}", $row->notas)->mergeCells("A{$pos}:F{$pos}");

					$pos++;
					$hoja->setCellValue("B{$pos}", "Código");
					$hoja->setCellValue("C{$pos}", "Descripción");
					$hoja->setCellValue("D{$pos}", "Presentación");
					$hoja->setCellValue("E{$pos}", "Existencia");
					$hoja->setCellValue("F{$pos}", "Cantidad");
					$hoja->setCellValue("G{$pos}", "Costo U.");
					$hoja->setCellValue("H{$pos}", "Total");
					$hoja->getStyle("B{$pos}:H{$pos}")->getFont()->setBold(true);
					$hoja->getStyle("E{$pos}:H{$pos}")->getAlignment()->setHorizontal("right");

					$pos++;

					$tmpTotal = 0;
					foreach ($row->detalle as $llave => $fila) {
						$hoja->setCellValue("B{$pos}", $fila->codigo);
						$hoja->setCellValue("C{$pos}", $fila->articulo);
						$hoja->setCellValue("D{$pos}", $fila->presentacion);
						$hoja->setCellValue("E{$pos}", $fila->existencias);
						$hoja->setCellValue("F{$pos}", number_format((float)$fila->cantidad, 2, ".", ""));
						$hoja->setCellValue("G{$pos}", number_format((float)$fila->monto, 2, ".", ""));
						$hoja->setCellValue("H{$pos}", number_format((float)$fila->total, 2, ".", ""));
						$hoja->getStyle("E{$pos}:H{$pos}")->getNumberFormat()->setFormatCode("0.00");

						$tmpTotal += $fila->total;
						$pos++;
					}

					$hoja->setCellValue("A{$pos}", "Total")->mergeCells("A{$pos}:G{$pos}");
					$hoja->setCellValue("H{$pos}", number_format((float)$tmpTotal, 2, ".", ""));
					$hoja->getStyle("A{$pos}:H{$pos}")->getFont()->setBold(true);
					$hoja->getStyle("A{$pos}:H{$pos}")->getNumberFormat()->setFormatCode("0.00");

					$pos += 2;
					$total += $tmpTotal;
				}

				$hoja->setCellValue("A{$pos}", "Total")->mergeCells("A{$pos}:G{$pos}");
				$hoja->setCellValue("H{$pos}", number_format((float)$total, 2, ".", ""));

				$hoja->getStyle("A{$pos}:H{$pos}")->getNumberFormat()->setFormatCode("0.00");

				$hoja->getStyle("A{$pos}:H{$pos}")->applyFromArray([
					"font"    => ["bold" => true],
					"borders" => [
						"top"    => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
						"bottom" => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
					]
				]);

				for ($i = 1; $i <= 6; $i++) {
					$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
				}

				header("Content-Type: application/vnd.ms-excel");
				header("Content-Disposition: attachment;filename={$nombreArchivo}.xls");
				header("Cache-Control: max-age=1");
				header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
				header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
				header("Cache-Control: cache, must-revalidate");
				header("Pragma: public");

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
				$writer->save("php://output");
			} else {
				$pdf = new \Mpdf\Mpdf([
					"tempDir" => sys_get_temp_dir(),
					"format"  => "Letter"
				]);

				$pdf->WriteHTML($this->load->view("reporte/orden_compra/imprimir_pedidos_proveedor", ["data" => $data, "params" => $params], true));
				$pdf->Output("{$nombreArchivo}.pdf", "D");

				// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($data));
			}
			//} //If lista
		}
	}

	public function resumen_egreso()
	{
		$params = json_decode(file_get_contents("php://input"), true);

		if (
			verDato($params, "fal") &&
			verDato($params, "fdel") &&
			verDato($params, "bodega")
		) {
			$lista = $this->Reporte_model->getResumenEgreso($params);

			$data = [];
			$nombreArchivo = "resumen_egreso_" . rand();
			if ($lista) {

				foreach ($lista as $key => $row) {
					if (!isset($data[$row->egreso])) {
						$data[$row->egreso] = [
							"fecha"       => $row->fecha,
							"egreso"      => $row->egreso,
							"nmovimiento" => $row->nmovimiento,
							"nbodega"     => $row->nbodega,
							"comentario"  => $row->comentario,
							"estatus"     => $row->nestatus,
							"detalle"     => []
						];
					}

					$data[$row->egreso]["detalle"][] = $row;
				}
			}

			if (!isset($params["sede"]) || (int)$params["sede"] === 0) {
				$params["sede"] = $this->data->sede;
			}

			$params["sede"] = $this->Sede_model->buscar(["sede" => $params["sede"], "_uno" => true]);

			if (verDato($params, "_excel")) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();

				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$hoja->setTitle("Reporte");

				$hoja->setCellValue("A1", "Resumen de egresos")->mergeCells("A1:D1");
				$hoja->setCellValue("A3", "Del: ");
				$hoja->setCellValue("A4", "Al: ");
				$hoja->setCellValue("A5", "Sede: ");
				$hoja->setCellValue("A6", "Bodega: ");
				$hoja->getStyle("A1:A6")->getFont()->setBold(true);

				$hoja->setCellValue("B3", formatoFecha($params["fdel"], 2));
				$hoja->setCellValue("B4", formatoFecha($params["fal"], 2));
				$hoja->setCellValue("B5", "{$params['sede']->nombre} ({$params['sede']->alias})");
				$hoja->setCellValue("B6", $params["bodega_nombre"]);

				$pos   = 8;
				$total = 0;

				$titulo = [
					"Fecha",
					"Documento",
					"Estatus egreso",
					"Tipo",
					"Bodega",
					"",
					"Comentario"
				];

				$hoja->fromArray($titulo, null, "A{$pos}");
				$hoja->getStyle("A{$pos}:G{$pos}")->getFont()->setBold(true);
				$pos++;

				foreach ($data as $key => $row) {

					$tmpData = [
						formatoFecha($row["fecha"], 2),
						$row["egreso"],
						$row["estatus"],
						$row["nmovimiento"],
						$row["nbodega"],
						"",
						$row["comentario"]
					];

					$hoja->fromArray($tmpData, null, "A{$pos}");

					$hoja->getStyle("G{$pos}")
						->getAlignment()
						->setWrapText(true);

					$pos++;

					$tmpTotal = 0;
					$tmpTitulo = [
						"Código",
						"Artículo",
						"Presentación",
						"Cantidad",
						"Total"
					];

					$hoja->fromArray($tmpTitulo, null, "B{$pos}");
					$hoja->getStyle("E{$pos}:F{$pos}")->getAlignment()->setHorizontal("right");
					$hoja->getStyle("A{$pos}:F{$pos}")->getFont()->setBold(true);
					$pos++;

					foreach ($row["detalle"] as $llave => $fila) {

						$hoja->setCellValue("B{$pos}", $fila->carticulo);
						$hoja->setCellValue("C{$pos}", $fila->narticulo);
						$hoja->setCellValue("D{$pos}", $fila->npresentacion);
						$hoja->setCellValue("E{$pos}", number_format((float)$fila->cantidad, 2, ".", ""));
						$hoja->setCellValue("F{$pos}", number_format((float)$fila->precio_total, 2, ".", ""));
						$hoja->getStyle("E{$pos}:F{$pos}")
							->getNumberFormat()
							->setFormatCode("0.00");

						$tmpTotal += $fila->precio_total;
						$pos++;
					}

					$hoja->setCellValue("A{$pos}", "Total Documento:")->mergeCells("A{$pos}:E{$pos}");
					$hoja->setCellValue("F{$pos}", number_format((float)$tmpTotal, 2, ".", ""));
					$hoja->getStyle("A{$pos}:E{$pos}")->getAlignment()->setHorizontal("right");
					$hoja->getStyle("A{$pos}:F{$pos}")->getFont()->setBold(true);
					$hoja->getStyle("F{$pos}")
						->getNumberFormat()
						->setFormatCode("0.00");

					$pos += 2;
					$total += $tmpTotal;
				}

				$hoja->setCellValue("A{$pos}", "GRAN TOTAL")->mergeCells("A{$pos}:E{$pos}");
				$hoja->setCellValue("F{$pos}", number_format((float)$total, 2, ".", ""));
				$hoja->getStyle("A{$pos}:E{$pos}")->getAlignment()->setHorizontal("right");
				$hoja->getStyle("F{$pos}")
					->getNumberFormat()
					->setFormatCode("0.00");

				$hoja->getStyle("A{$pos}:F{$pos}")->applyFromArray([
					"font"    => ["bold" => true],
					"borders" => [
						"top"    => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
						"bottom" => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
					]
				]);

				for ($i = 1; $i <= 6; $i++) {
					$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
				}
				$hoja->getColumnDimension("G")->setWidth(30);

				header("Content-Type: application/vnd.ms-excel");
				header("Content-Disposition: attachment;filename={$nombreArchivo}.xls");
				header("Cache-Control: max-age=1");
				header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
				header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
				header("Cache-Control: cache, must-revalidate");
				header("Pragma: public");

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
				$writer->save("php://output");
			} else {
				$tmp = sys_get_temp_dir();
				$pdf = new \Mpdf\Mpdf([
					"tempDir" => $tmp,
					"format"  => "Letter"
				]);

				$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
				$pdf->WriteHTML($this->load->view("reporte/egreso/resumen_imprimir", ["data" => $data, "params" => $params], true));

				if (verDato($params, "_rturno")) {
					$ruta = "{$tmp}/{$nombreArchivo}.pdf";
					$pdf->Output($ruta, "F");

					$this->output
						->set_content_type("application/json")
						->set_output(json_encode(["ruta" => $ruta]));
				} else {
					$pdf->Output("{$nombreArchivo}.pdf", "D");
				}
			}
		}
	}

	public function resumen_traslados()
	{
		$params = json_decode(file_get_contents("php://input"), true);
		$data = $this->Resumen_traslados_model->get_resumen_traslados($params);

		$reportData = [];
		$bodegaOrigen = '';
		$bodegasDestino = [];
		foreach ($data as $row) {
			$articulo = $row['articulo'];
			$bodega_destino = $row['bodega_destino'];
			if (empty($bodegaOrigen)) {
				$bodegaOrigen = "{$row['bodega_origen']} ({$row['sede_origen']} - {$row['alias_origen']})";
			}

      if (!isset($bodegasDestino[$bodega_destino])) {
        $bodegasDestino[$bodega_destino] = "{$row['bodega_destino_desc']} ({$row['sede_destino']} - {$row['alias_destino']})";
      }
      if (!isset($reportData[$articulo])) {
        $reportData[$articulo] = [
          'articulo_descripcion' => $row['articulo_descripcion'],
          'precio_unitario' => $row['precio_unitario'],
          'cantidad_total' => 0,
          'bodegas' => []
        ];
      }
			if (!isset($reportData[$articulo]['bodegas'][$bodega_destino])) {
        $reportData[$articulo]['bodegas'][$bodega_destino] = 0;
    	}
      $reportData[$articulo]['bodegas'][$bodega_destino] += $row['cantidad'];
      $reportData[$articulo]['cantidad_total'] += $row['cantidad'];
    }
    $totalFinal = 0;
    foreach ($reportData as $item) {
      $totalFinal += $item['cantidad_total'] * $item['precio_unitario'];
    }
    if (isset($params['_excel']) && $params['_excel']) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();

			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();
			$hoja->setTitle("Resumen de Traslados");

			$hoja->setCellValue('A1', 'Resumen de Traslados');
			$hoja->mergeCells('A1:' . chr(70 + count($bodegasDestino)) . '1');
			$hoja->getStyle('A1')->getFont()->setBold(true)->setSize(16);
			$hoja->getStyle('A1')->getAlignment()->setHorizontal('center');

			$hoja->setCellValue('A2', 'Del: ' . date('d/m/Y', strtotime($params['fdel'])) . ' al: ' . date('d/m/Y', strtotime($params['fal'])));
			$hoja->mergeCells('A2:' . chr(70 + count($bodegasDestino)) . '2');
			$hoja->getStyle('A2')->getAlignment()->setHorizontal('center');

			$hoja->setCellValue('A4', $bodegaOrigen);
			$columnIndex = 'B';
			foreach ($bodegasDestino as $bodegaDestino) {
				$hoja->setCellValue($columnIndex . '4', $bodegaDestino);
				$columnIndex++;
			}
			$hoja->setCellValue($columnIndex . '4', 'Suma');
			$hoja->setCellValue(++$columnIndex . '4', 'Precio Costo');
			$hoja->setCellValue(++$columnIndex . '4', 'Total');
			$hoja->getStyle('A4:' . $columnIndex . '4')->getFont()->setBold(true);
			$hoja->getStyle('A4:' . $columnIndex . '4')->getAlignment()->setHorizontal('center');

			$fila = 5;
			foreach ($reportData as $articulo => $info) {
				$hoja->setCellValue('A' . $fila, $info['articulo_descripcion']);
				$columnIndex = 'B';
				foreach ($bodegasDestino as $key => $bodegaDestino) {
					$hoja->setCellValue($columnIndex . $fila, isset($info['bodegas'][$key]) ? $info['bodegas'][$key] : 0);
					$hoja->getStyle($columnIndex . $fila)->getAlignment()->setHorizontal('right');
					$columnIndex++;
				}
				$hoja->setCellValue($columnIndex . $fila, $info['cantidad_total']);
				$hoja->getStyle($columnIndex . $fila)->getAlignment()->setHorizontal('right');
				$hoja->setCellValue(++$columnIndex . $fila, 'Q.' . number_format($info['precio_unitario'], 2));
				$hoja->getStyle($columnIndex . $fila)->getAlignment()->setHorizontal('right');
				$hoja->setCellValue(++$columnIndex . $fila, 'Q.' . number_format($info['cantidad_total'] * $info['precio_unitario'], 2));
				$hoja->getStyle($columnIndex . $fila)->getAlignment()->setHorizontal('right');
				$fila++;
			}
			$hoja->setCellValue('A' . $fila, 'TOTAL:');
			$hoja->mergeCells('A' . $fila . ':' . chr(67 + count($bodegasDestino)) . $fila);
			$hoja->getStyle('A' . $fila)->getFont()->setBold(true);
			$hoja->getStyle('A' . $fila)->getAlignment()->setHorizontal('right');
			$hoja->setCellValue(chr(68 + count($bodegasDestino)) . $fila, 'Q' . number_format($totalFinal, 2));
			$hoja->getStyle(chr(68 + count($bodegasDestino)) . $fila)->getAlignment()->setHorizontal('right');

			foreach (range('A', $columnIndex) as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}

			$hoja->getStyle('A4:' . $columnIndex . ($fila))->getBorders()->getAllBorders()
				->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
				->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

			header('Content-Type: application/vnd.ms-excel');
			header('Content-Disposition: attachment;filename="resumen_traslados.xlsx"');
			header('Cache-Control: max-age=1');
			header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
			header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
			header('Cache-Control: cache, must-revalidate');
			header('Pragma: public');

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save('php://output');
		} else {
			$tmp = sys_get_temp_dir();
			$pdf = new \Mpdf\Mpdf([
				"tempDir" => $tmp,
				"format"  => "A4",
				"orientation" => "L"
			]);

			$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			$pdf->WriteHTML($this->load->view("reporte/egreso/resumen_traslados", ["data" => $reportData, "totalFinal" => $totalFinal, "params" => $params, "bodegaOrigen" => $bodegaOrigen, "bodegasDestino" => $bodegasDestino], true));
			$pdf->Output("Resumen_traslados.pdf", "D");
		}
	}

	public function generar_catalogo_articulo()
	{
		$datos = json_decode(file_get_contents("php://input"), true);
		$lista = $this->Reporte_model->getCatalogoArticulo($datos);

		if ($lista) {
			$nombreArchivo = "Catalogo_articulo" . rand() . "xls";
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();
			$hoja->setTitle("Articulo");

			$nombres = [
				"Sede",
				"Sede Alias",
				"Id Categoria",
				"Categoria",
				"Id Subcategoria",
				"Sub Categoria",
				"Id Articulo",
				"Articulo",
				"Id Presentacion",
				"Presentacion",
				"Id Presentacion Reporte",
				"Presentacion Reporte",
				"Es Produccion",
				"Codigo",
				"Es de Inventario",
				"Es de POS",
				"Rendimiento",
				"Es Receta",
				"Es Extra",
				"Stock Minimo",
				"Stock Maximo",
				"Descripcion Interna Impuesto Especial",
				"Descripcion Impuesto Especial SAT",
				"Codigo SAT Impuesto Especial",
				"Porcentaje Impuesto Especial"
			];

			if (verDato($datos, "_ucompra") == 1) {
				$nombres[] = "Ultimo Proveedor Compra";
				$nombres[] = "Ultima Presentacion Compra";
				$nombres[] = "Ultimo Costo";
			}

			$hoja->fromArray($nombres, null, "A1");
			$hoja->setAutoFilter("A1:AB1");

			$pos = 2;
			foreach ($lista as $key => $row) {
				$hoja->fromArray((array) $row, null, "A{$pos}");

				if (isset($row->ultimo_costo)) {
					$hoja->getStyle("AB{$pos}")
						->getNumberFormat()
						->setFormatCode("0.00");
				}

				$pos++;
			}

			for ($i = 0; $i <= 28; $i++) {
				$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
			}

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename={$nombreArchivo}.xls");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save("php://output");
		}
	}

	public function generar_uso_ingrediente()
	{
		$datos = json_decode(file_get_contents("php://input"), true);

		if (verDato($datos, "articulo")) {
			$nombreArchivo = "Uso_ingrediente_" . rand() . ".xls";
			$lista         = $this->Reporte_model->getUsoIngrediente($datos);

			$datos['sede'] = new Sede_model($this->data->sede);

			if (verDato($datos, "_excel")) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$hoja->setTitle("Ingrediente");

				$hoja->setCellValue("A1", "Uso de Ingrediente")->mergeCells("A1:D1");
				$hoja->setCellValue("A2", "{$datos['sede']->nombre} ({$datos['sede']->alias})")->mergeCells("A2:D2");
				$hoja->setCellValue("A3", "Nombre:");
				$hoja->getStyle("A1:A3")->getFont()->setBold(true);
				$hoja->getStyle("A1")->getAlignment()->setHorizontal("center");
				$hoja->getStyle("A2")->getAlignment()->setHorizontal("center");
				$hoja->setCellValue("B3", $datos["articulo_nombre"])->mergeCells("B3:D3");

				$hoja->getStyle("A3:D3")->applyFromArray([
					"borders" => [
						"bottom" => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
					]
				]);

				$nombres = [
					"Código",
					"Receta",
					"Cantidad uso",
					"Medida"
				];

				$hoja->fromArray($nombres, null, "A5");
				$hoja->getStyle("A5:D5")->getFont()->setBold(true);

				$pos = 6;
				foreach ($lista as $key => $row) {
					$hoja->fromArray((array) $row, null, "A{$pos}");
					$pos++;
				}

				for ($i = 0; $i <= 4; $i++) {
					$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
				}

				header("Content-Type: application/vnd.ms-excel");
				header("Content-Disposition: attachment;filename={$nombreArchivo}.xls");
				header("Cache-Control: max-age=1");
				header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
				header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
				header("Cache-Control: cache, must-revalidate");
				header("Pragma: public");

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
				$writer->save("php://output");
			} else {
				$pdf = new \Mpdf\Mpdf([
					"tempDir" => sys_get_temp_dir(),
					"format"  => "Letter"
				]);

				$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
				$pdf->WriteHTML($this->load->view("reporte/articulo/uso_ingrediente", ["data" => $lista, "params" => $datos], true));
				$pdf->Output("{$nombreArchivo}.pdf", "D");
			}
		}
	}

	public function margen_receta()
	{
		ini_set("pcre.backtrack_limit", "15000000");

		$datos   = json_decode(file_get_contents("php://input"), true);
		$enExcel = verDato($datos, "_excel");

		$datos["sede"]   = $datos["sede"] ?? $this->data->sede;
		$datos["_todos"] = true;
		unset($datos["_excel"]);

		$sede = new Sede_model($datos["sede"]);
		$emp = $sede->getEmpresa();

		$porIva = 1.0;
		if (isset($datos['_coniva']) && (int)$datos['_coniva'] === 1) {
			$porIva +=  ($emp ? (float)$emp->porcentaje_iva : 0);
		}

		$nombreArchivo = "Margen_receta_" . rand() . ".xls";
		$lista         = $this->Articulo_model->buscarArticulo($datos);
		$data          = [];

		foreach ($lista as $key => $row) {
			$tmp = new Articulo_model($row->articulo);
			$pre = $tmp->getPresentacion();

			$costo = $tmp->_getCosto_2();

			if ((int)$tmp->produccion === 1 && (float)$tmp->rendimiento !== (float)0) {
				$presR = $tmp->getPresentacionReporte();
				$costo = (float)$costo / ((float)$tmp->rendimiento * (float)$presR->cantidad);
			}

			$costo *= $porIva;
			$margen = ($row->precio > 0 && $costo > 0) ? ((($row->precio / $costo) - 1) * 100) : 0;

			$data[] = [
				"codigo"       => $row->codigo,
				"descripcion"  => $row->descripcion,
				"presentacion" => $pre->descripcion,
				"precio"       => round($row->precio, 2),
				"costo"        => round($costo, 2),
				"margen"       => round($margen, 2)
			];
		}

		if ($enExcel) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();
			$hoja->setTitle("Margen");

			$hoja->setCellValue("A1", "Margen de receta")->mergeCells("A1:F1");
			$hoja->setCellValue("A2", "{$sede->nombre} ($sede->alias)")->mergeCells("A2:F2");
			$hoja->getStyle("A1:F2")->getFont()->setBold(true);

			$nombres = [
				"Código",
				"Receta",
				"Presentación",
				"Precio venta",
				"Costo",
				"Margen"
			];

			$hoja->fromArray($nombres, null, "A4");
			$hoja->getStyle("A4:F4")->getFont()->setBold(true);
			$hoja->getStyle("D4:F4")->getAlignment()->setHorizontal("right");

			$pos = 5;
			foreach ($data as $key => $row) {

				$hoja->fromArray($row, null, "A{$pos}");
				$hoja->getStyle("D{$pos}:F{$pos}")
					->getNumberFormat()
					->setFormatCode("0.00");

				$pos++;
			}

			for ($i = 0; $i <= 6; $i++) {
				$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
			}

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename={$nombreArchivo}.xls");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save("php://output");
		} else {
			$pdf = new \Mpdf\Mpdf([
				"tempDir" => sys_get_temp_dir(),
				"format"  => "Letter"
			]);

			$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			$pdf->WriteHTML($this->load->view("reporte/articulo/margen_receta", ["data" => $data, "params" => $datos, 'sede' => $sede], true));
			$pdf->Output("{$nombreArchivo}.pdf", "D");
		}
	}

	public function consumo_articulo()
	{
		ini_set('pcre.backtrack_limit', '15000000');

		$datos = json_decode(file_get_contents('php://input'), true);

		$datos['sede'] = $datos['sede'] ?? $this->data->sede;

		if (verDato($datos, 'fdel') && verDato($datos, 'fal')) {
			$lista = $this->Reporte_model->getResumenConsumo($datos);
			$sede  = new Sede_model($datos['sede']);
			$data  = [];

			$emp = $sede->getEmpresa();

			$porIva = 1.0;
			if (isset($datos['_coniva']) && (int)$datos['_coniva'] === 1) {
				$porIva +=  ($emp ? (float)$emp->porcentaje_iva : 0);
			}

			foreach ($lista as $row) {
				$tmp   = new Articulo_model($row->articulo);
				$costo = $tmp->_getCosto_2();

				$presR = $tmp->getPresentacionReporte();
				$row->cantidad = (float)$presR->cantidad !== (float)0 ? ((float)$row->cantidad / (float)$presR->cantidad) : 0;

				if ((int)$tmp->produccion === 1 && (float)$tmp->rendimiento !== (float)0) {
					$costo = (float)$costo / (float)$tmp->rendimiento;
				}

				$costo *= $porIva;
				$total = round(($row->cantidad * $costo), 5);

				$data[] = [
					'codigo'   => $row->codigo,
					'articulo' => $row->narticulo,
					'cantidad' => $row->cantidad,
					'unidad'   => $row->ndescripcion,
					'costo'    => $costo,
					'total'    => $total
				];
			}

			$nombreArchivo = 'Consumo_articulo_' . rand() . '.xls';

			if (verDato($datos, '_excel')) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$hoja->setTitle('Reporte de consumos');

				$hoja->setCellValue('A1', 'Resumen de consumos por artículo')->mergeCells('A1:C1');
				$hoja->setCellValue('A2', 'Del: ')->mergeCells('A2:C2');
				$hoja->setCellValue('A3', 'Al: ')->mergeCells('A3:C3');
				$hoja->setCellValue('A4', 'Sede: ')->mergeCells('A4:C4');

				$hoja->setCellValue('D2', formatoFecha($datos['fdel'], 2))->mergeCells('D2:F2');
				$hoja->setCellValue('D3', formatoFecha($datos['fal'], 2))->mergeCells('D3:F3');
				$hoja->setCellValue('D4', "{$sede->nombre} - {$sede->alias}")->mergeCells('D4:F4');

				if (verDato($datos, 'grupo_nombre')) {
					$hoja->setCellValue('A5', 'Subcategoría: ')->mergeCells('A5:C5');
					$hoja->setCellValue('D5', $datos['grupo_nombre'])->mergeCells('D5:F5');
				}

				$hoja->getStyle('A1:A5')->getFont()->setBold(true);

				$nombres = [
					'Código',
					'Artículo',
					'Cantidad',
					'Unidad',
					'Costo',
					'Total'
				];

				$hoja->fromArray($nombres, null, 'A7');
				$hoja->getStyle('A7:F7')->getFont()->setBold(true);
				$hoja->getStyle('C7')->getAlignment()->setHorizontal('right');
				$hoja->getStyle('E7:F7')->getAlignment()->setHorizontal('right');

				$pos = 8;
				$tot = 0;
				foreach ($data as $row) {

					$hoja->fromArray($row, null, "A{$pos}");

					$hoja->getStyle("C{$pos}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$hoja->getStyle("E{$pos}")
						->getNumberFormat()
						->setFormatCode('0.00000');

					$hoja->getStyle("F{$pos}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$tot += $row['total'];
					$pos++;
				}

				$hoja->setCellValue("A{$pos}", 'Total:')->mergeCells("A{$pos}:E{$pos}");
				$hoja->setCellValue("F{$pos}", $tot);

				$hoja->getStyle("F{$pos}")
					->getNumberFormat()
					->setFormatCode('0.00');

				$hoja->getStyle("A{$pos}:F{$pos}")->applyFromArray([
					'font'    => ['bold' => true],
					'borders' => [
						'top'    => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
						'bottom' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
					]
				]);

				for ($i = 0; $i <= 6; $i++) {
					$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
				}

				header('Content-Type: application/vnd.ms-excel');
				header("Content-Disposition: attachment;filename={$nombreArchivo}.xls");
				header('Cache-Control: max-age=1');
				header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
				header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
				header('Cache-Control: cache, must-revalidate');
				header('Pragma: public');

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
				$writer->save('php://output');
			} else {
				$pdf = new \Mpdf\Mpdf([
					'tempDir' => sys_get_temp_dir(),
					'format'  => 'Letter'
				]);

				$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
				$pdf->WriteHTML($this->load->view('reporte/articulo/consumo_articulo', [
					'data'   => $data,
					'params' => $datos,
					'sede'   => $sede
				], true));
				$pdf->Output("{$nombreArchivo}.pdf", 'D');
			}
		}
	}

	public function generar_receta_costo()
	{
		ini_set('pcre.backtrack_limit', '15000000');
		$lista = $this->Articulo_model->buscarArticulo([
			'esreceta' => 1,
			'_todos'   => true,
			'sede'     => $this->data->sede
		]);

		$data = [];

		$nombreArchivo = 'Recetas_' . rand() . '.xls';

		$sede = new Sede_model($this->data->sede);
		$emp = $sede->getEmpresa();

		$req = json_decode(file_get_contents('php://input'), true);
		$porIva = 1.0;
		if (isset($req['_coniva']) && (int)$req['_coniva'] === 1) {
			$porIva +=  ($emp ? (float)$emp->porcentaje_iva : 0);
		}

		$enPDF = true;
		if (isset($req['_excel']) && (int)$req['_excel'] === 1) {
			$enPDF = false;
		}

		foreach ($lista as $fila) {
			$art = new Articulo_model($fila->articulo);
			$tmp = [];

			$tmp['articulo']       = $art;
			$tmp['articulo_grupo'] = $art->getCategoriaGrupo();
			$tmp['presentacion_reporte'] = $art->getPresentacionReporte();
			$tmp['advertir'] = '';

			foreach ($art->getReceta() as $row) {
				$rec                  = new Articulo_model($row->articulo->articulo);

				if ((int)$rec->produccion === 0 && (int)$rec->mostrar_inventario === 0 && in_array((int)$rec->esreceta, [0, 1])) {
					$tmp['advertir'] = 'REVISAR';
				}

				$costo                = $rec->_getCosto_2();

				if ((int)$rec->produccion === 1 && (float)$rec->rendimiento !== (float)0) {
					$presR = $rec->getPresentacionReporte();
					$costo = (float)$costo / ((float)$rec->rendimiento * (float)$presR->cantidad);
				}

				$costo *= $porIva;
				$tmpCosto             = $costo * $row->cantidad;
				$row->costo           = round($tmpCosto, 5);
				$row->articulo->costo = $costo;
				$tmp['receta'][]      = $row;
			}

			$data[] = $tmp;
		}

		$data['enPDF'] = $enPDF;

		$vista = $this->load->view('reporte/articulo/receta_costo', ['data' => $data], true);

		if ($enPDF) {
			$pdf = new \Mpdf\Mpdf([
				'tempDir' => sys_get_temp_dir(),
				'format'  => 'Letter'
			]);
			$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			$pdf->WriteHTML($vista);
			$pdf->Output("{$nombreArchivo}.pdf", 'D');
		} else {
			$reader = new \PhpOffice\PhpSpreadsheet\Reader\Html();
			$vista = str_replace('&', '&amp;', $vista);
			$xlsx = $reader->loadFromString($vista);
			$xlsx->setActiveSheetIndex(0);
			$hoja = $xlsx->getActiveSheet();

			foreach (range('A', 'Z') as $col) {
				$hoja->getColumnDimension($col)->setAutoSize(true);
			}

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename={$nombreArchivo}.xlsx");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($xlsx, 'Xlsx');
			$writer->save('php://output');
		}
	}

	public function consumos()
	{
		set_time_limit(0);
		$params = json_decode(file_get_contents('php://input'), true);
		$rpt = new Reporte_model();

		$datos = [];

		$fltr = ['sede' => $params['sede'][0]];

		if (isset($params['categoria_grupo']) && (int)$params['categoria_grupo'] > 0) {
			$fltr['categoria_grupo'] = $params['categoria_grupo'];
		}

		$lstArticulosInventario = $rpt->get_info_articulos_inventario($fltr);

		$fltr['fdel'] = $params['fdel'];
		$fltr['fal'] = $params['fal'];

		$begin = new DateTime($params['fdel']);
		$end = new DateTime($params['fal']);

		$interval = DateInterval::createFromDateString('1 day');
		$period = new DatePeriod($begin, $interval, $end->modify('+1 day'));
		$periodo = [];
		foreach ($period as $dt) {
			$fecha = $dt->format('Y-m-d');
			$periodo[$fecha] = 0.0;
		}

		$fltr['bodega'] = $params['bodega'][0];
		$bodega = $this->Bodega_model->buscar(['bodega' => $fltr['bodega'], '_uno' => true]);

		$sede = new Sede_model($params['sede'][0]);
		$empresa = $sede->getEmpresa();
		$metodo_costeo = (int)$empresa->metodo_costeo === 1 ? 'costo_ultima_compra' : 'costo_promedio';

		$lstConsumos = $rpt->get_consumos($fltr);

		foreach ($lstArticulosInventario as $artinv) {
			$art = new Articulo_model($artinv->articulo);
			$pr = $art->getPresentacionReporte();
			$costo = 0.0;
			$bcosto = $this->BodegaArticuloCosto_model->buscar([
				'bodega' => $bodega->bodega,
				'articulo' => $artinv->articulo,
				'_uno' => true
			]);

			if ($bcosto) {
				$costo = (float)$bcosto->{$metodo_costeo};
			} else {
				$costo = $art->getCosto(['bodega' => $bodega->bodega]);
				$nvoBac = new BodegaArticuloCosto_model();
				$nvoBac->BodegaArticuloCosto_model->guardar_costos($bodega->bodega, $artinv->articulo);
			}

			$datos[] = (object)[
				'sede' => $artinv->sede,
				'categoria' => $artinv->categoria,
				'subcategoria' => $artinv->subcategoria,
				'articulo' => $artinv->articulo,
				'descripcion_articulo' => $artinv->descripcion,
				'codigo' => $artinv->codigo,
				'presentacion_reporte' => $artinv->presentacion_reporte,
				'bodega' => $bodega->descripcion,
				'total_costo' => 0.0,
				'consumos' => $periodo,
				'total_consumos' => 0.0,
				'ordenar_por' => "{$artinv->sede}-{$artinv->categoria}-{$artinv->subcategoria}-{$artinv->descripcion}"
			];
			$idx = count($datos) - 1;
			foreach ($datos[$idx]->consumos as $key => $fecconsumo) {
				foreach ($lstConsumos as $consumo) {
					if (strcasecmp($key, $consumo->fecha) == 0 && (int)$datos[$idx]->articulo === (int)$consumo->articulo) {
						if ((float)$consumo->cantidad_presentacion_reporte !== (float)0) {
							$datos[$idx]->consumos[$key] += ((float)$consumo->cantidad * (float)$consumo->cantidad_presentacion_detalle_comanda) / (float)$consumo->cantidad_presentacion_reporte;
							$datos[$idx]->total_consumos += $datos[$idx]->consumos[$key];
						}
					}
				}
			}

			$datos[$idx]->total_costo = (float)$costo * (float)$pr->cantidad * (float)$datos[$idx]->total_consumos;
		}
		$datos = ordenar_array_objetos($datos, 'ordenar_por');

		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
		$excel->getProperties()
			->setCreator("RestTouch")
			->setTitle("Office 2007 xlsx Consumos")
			->setSubject("Office 2007 xlsx Consumos")
			->setKeywords("office 2007 openxml php");


		$excel->setActiveSheetIndex(0);
		$hoja = $excel->getActiveSheet();

		$hoja->setCellValue('A1', 'Reporte de Consumos');
		$hoja->setCellValue('A2', 'Del ' . formatoFecha($params['fdel'], 2) . ' al ' . formatoFecha($params['fal'], 2));
		$hoja->mergeCells('A1:C1');
		$hoja->mergeCells('A2:C2');
		$hoja->getStyle("A1:A2")->getFont()->setBold(true);

		$hoja->setCellValue('A4', 'Sede');
		$hoja->setCellValue('B4', 'Categoría');
		$hoja->setCellValue('C4', 'Subcategoría');
		$hoja->setCellValue('D4', 'Artículo');
		$hoja->setCellValue('E4', 'Código');
		$hoja->setCellValue('F4', 'Presentación reporte');
		$hoja->setCellValue('G4', 'Bodega');
		$columna = 'H';
		foreach ($period as $dt) {
			$hoja->setCellValue("{$columna}4", $dt->format('D d/m/Y'));
			$columna++;
		}
		$hoja->setCellValue("{$columna}4", 'Cantidad total');
		$columna++;
		$hoja->setCellValue("{$columna}4", 'Costo Total');

		$fila = 5;
		$columnaFinal = $columna;
		foreach ($datos as $d) {
			if ($d->total_consumos !== (float)0) {
				$hoja->setCellValue("A{$fila}", $d->sede);
				$hoja->setCellValue("B{$fila}", $d->categoria);
				$hoja->setCellValue("C{$fila}", $d->subcategoria);
				$hoja->setCellValue("D{$fila}", $d->descripcion_articulo);
				$hoja->setCellValue("E{$fila}", $d->codigo);
				$hoja->setCellValue("F{$fila}", $d->presentacion_reporte);
				$hoja->setCellValue("G{$fila}", $d->bodega);
				$columna = 'H';
				foreach ($d->consumos as $consumo) {
					$hoja->setCellValue("{$columna}{$fila}", $consumo);
					$columna++;
				}
				$hoja->setCellValue("{$columna}{$fila}", $d->total_consumos);
				$columna++;
				$hoja->setCellValue("{$columna}{$fila}", $d->total_costo);
				$columnaFinal = $columna;
				$fila++;
			}
		}
		$fila--;
		$hoja->getStyle("H4:{$columnaFinal}{$fila}")->getAlignment()->setHorizontal('right');
		$hoja->getStyle("A4:{$columnaFinal}4")->getFont()->setBold(true);
		$hoja->getStyle("H5:{$columnaFinal}{$fila}")->getNumberFormat()->setFormatCode('0.00000');
		$hoja->setAutoFilter("A4:G4");

		foreach (range('A', $columnaFinal) as $col) {
			$hoja->getColumnDimension($col)->setAutoSize(true);
		}

		$hoja->setTitle("Consumos");

		header("Content-Type: application/vnd.ms-excel");
		header("Content-Disposition: attachment;filename=Consumos_" . date('YmdHis') . ".xls");
		header("Cache-Control: max-age=1");
		header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
		header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
		header("Cache-Control: cache, must-revalidate");
		header("Pragma: public");

		$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
		$writer->save("php://output");
		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($datos));
	}
}

/* End of file Reporte.php */
/* Location: ./application/wms/controllers/Reporte.php */