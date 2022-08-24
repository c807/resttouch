<?php
defined('BASEPATH') or exit('No direct script access allowed');

ini_set('memory_limit', -1);
set_time_limit(0);

class Reporte extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Sede_model',
			'Empresa_model',
			'reporte/Reporte_model',
			'Articulo_model',
			'Receta_model',
			'Ingreso_model',
			'Categoria_model',
			'Bodega_model',
			'BodegaArticuloCosto_model'
		]);

		$this->load->helper(['jwt', 'authorization']);

		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	public function existencia()
	{
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
		$arts = $this->Catalogo_model->getArticulo($data);
		$args = [
			'cliente' => '',
			'sub_cuenta' => '',
			'fecha' => formatoFecha($_POST['fecha'], 2),
			'sedes' => $_POST['sede'],
			'subtitulo' => (isset($_POST['solo_bajo_minimo']) && (int)$_POST['solo_bajo_minimo'] === 1) ? '(solo bajo mínimo de stock)' : '',
			'fecha_del' => formatoFecha($_POST['fecha_del'], 2)
		];

		foreach ($_POST['sede'] as $s) {
			$nbodega = [];
			foreach ($_POST['bodega'] as $bode) {
				$bodega = new Bodega_model($bode);
				if ((int)$s === (int)$bodega->sede) {
					$nbodega[] = $bodega->descripcion;
				}
			}
			$args['bodegas'][$s] = implode(', ', $nbodega);
		}

		foreach ($arts as $row) {
			$art = new Articulo_model($row->articulo);
			$art->actualizarExistencia($_POST);
			$rec = $art->getReceta();
			if (count($rec) == 0 || $art->produccion || (count($rec) > 0 && (int)$art->mostrar_inventario === 1)) {
				$args["reg"][$row->sede][] = $art->getExistencias($_POST);
			}
		}

		// Inicia calculo de saldo inicial
		$_POST['_saldo_inicial'] = 1;
		foreach ($args['reg'] as $key => $registro) {
			foreach ($registro as $llave => $value) {
				$art = new Articulo_model($value->articulo->articulo);
				$obj = $art->getExistencias($_POST);
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

		if (verDato($_POST, "_excel")) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->getProperties()
				->setCreator("Restouch")
				->setTitle("Office 2007 xlsx Existencias")
				->setSubject("Office 2007 xlsx Existencias")
				->setKeywords("office 2007 openxml php");

			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();
			$nombres = [
				"Código",
				"Descripción",
				"Unidad",
				"Mínimo",
				"Máximo",
				"S. Inicial",
				"Ingresos",
				"Egresos",
				"Comandas",
				"Factura Directa",
				"Total Egresos",
				"Existencia"
			];
			/*Encabezado*/
			$hoja->setCellValue('A1', "Reporte de Existencias {$args['subtitulo']}");
			$hoja->setCellValue('A2', "Del {$args['fecha_del']} al {$args['fecha']}");

			$hoja->fromArray($nombres, null, 'A4');
			$hoja->getStyle('A4:L4')->getFont()->setBold(true);
			$hoja->getStyle('A4:L4')->getAlignment()->setHorizontal('center');
			$hoja->getStyle('A1:L2')->getFont()->setBold(true);
			$fila = 5;
			foreach ($args['sedes'] as $sede) {
				$obj = new Sede_model($sede);
				$hoja->setCellValue("A{$fila}", $obj->nombre);
				$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
				$fila++;
				$hoja->setCellValue("A{$fila}", $args['bodegas'][$obj->getPK()]);
				$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
				$fila++;
				foreach ($args["reg"][$sede] as $row) {
					$art = new Articulo_model($row->articulo->articulo);
					$rec = $art->getReceta();

					$reg = [
						(!empty($row->articulo->codigo) ? $row->articulo->codigo : $row->articulo->articulo),
						"{$row->articulo->articulo} " . $row->articulo->descripcion,
						$row->presentacion->descripcion,
						round((float)$row->articulo->stock_minimo, 2),
						round((float)$row->articulo->stock_maximo, 2),
						((float) $row->saldo_inicial != 0) ? round($row->saldo_inicial / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->ingresos != 0) ? round($row->ingresos / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->egresos != 0) ? round($row->egresos / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->comandas != 0) ? round($row->comandas / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->facturas != 0) ? round($row->facturas / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->total_egresos != 0) ? round($row->total_egresos / $row->presentacion->cantidad, 2) : "0.00",
						(count($rec) > 0 && $art->produccion == 0) ? "0.00" : (((float) $row->existencia != 0) ? round($row->existencia / $row->presentacion->cantidad, 2) : "0.00")
					];

					$hoja->fromArray($reg, null, "A{$fila}");
					$hoja->getStyle("D{$fila}:L{$fila}")->getNumberFormat()->setFormatCode('0.00');
					$fila++;
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

			// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($args));
		}
	}

	private function get_info_kardex($parametros)
	{
		$_POST = $parametros;
		$rpt = new Reporte_model();

		$datos = [];
		$infoArticulo = new stdClass();

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
						'sede' => (object)['sede' => $sede->getPK(), 'nombre' => $sede->nombre],
						'presentacion' => $presentacionReporte->descripcion,
						'bodegas' => []
					];
					$lastIdxSedes = count($datos) - 1;
					foreach ($_POST['bodega'] as $bode) {
						$bodega = new Bodega_model($bode);
						if ((int)$bodega->sede === (int)$s) {
							$rpt->setTipo(2);
							$paramsExist = ['sede' => $s, 'bodega' => $bodega->getPK(), 'articulo' => $articulo->getPK(), 'fdel' => $_POST['fdel'], 'fal' => $_POST['fal']];
							$existencias = $rpt->getExistencias($paramsExist);
							$existencia = new stdClass();
							$existencia->existencia = 0;

							if (count($existencias) > 0) {
								$existencia = $existencias[0];
								if ($existencia->existencia != 0) {
									$existencia->existencia = (float)$presentacionReporte->cantidad !== 0 ? ((float)$existencia->existencia / (float)$presentacionReporte->cantidad) : 0;
								} else {
									$existencia->existencia = (float)$existencia->existencia;
								}
							}

							$datos[$lastIdxSedes]->bodegas[] = (object)[
								'bodega' => $bodega->getPK(), 'descripcion' => $bodega->descripcion, 'antiguedad' => $existencia->existencia,
								'ingresos' => 0, 'salidas' => 0, 'egresos' => 0, 'comandas' => 0, 'facturas' => 0, 'detalle' => []
							];
							$lastIdxBodegas = count($datos[$lastIdxSedes]->bodegas) - 1;
							$rpt->setTipo(3);
							$existencias = $rpt->getExistencias($paramsExist);
							foreach ($existencias as $row) {
								$row->cantidad = (float)$presentacionReporte->cantidad !== 0 ? ((float)$row->cantidad / (float)$presentacionReporte->cantidad) : 0;

								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->ingresos += ((int)$row->tipo === 1) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->salidas += ((int)$row->tipo === 2) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->egresos += ((int)$row->tipo_salida === 1) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->comandas += ((int)$row->tipo_salida === 2) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->facturas += ((int)$row->tipo_salida === 3) ? (float)$row->cantidad : 0;
								$datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->detalle[] = (object)[
									'id' => (int)$row->id,
									'tipo' => (int)$row->tipo,
									'cantidad' => (float)$row->cantidad,
									'fecha' => $row->fecha,
									'tipo_movimiento' => $row->tipo_movimiento,
								];
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

			$hoja->getStyle('A1:G4')->getFont()->setBold(true);
			$hoja->mergeCells('A1:G1');
			$hoja->mergeCells('A2:G2');
			$hoja->mergeCells('A3:G3');
			$hoja->mergeCells('A4:G4');

			$hoja->setCellValue('A1', 'Kardex');
			$hoja->setCellValue('A2', "Artículo: {$args->articulo->descripcion}");
			$hoja->setCellValue('A3', "Código: {$args->articulo->codigo}");
			$hoja->setCellValue('A4', 'Del ' . formatoFecha($args->fdel, 2) . ' al ' . formatoFecha($args->fal, 2));

			$fila = 6;
			foreach ($args->sedes as $sede) {
				$hoja->mergeCells("A{$fila}:G{$fila}");
				$hoja->getStyle("A{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
				$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
				$hoja->setCellValue("A{$fila}", "Sede: {$sede->sede->nombre}");
				$fila++;
				$hoja->mergeCells("A{$fila}:G{$fila}");
				$hoja->getStyle("A{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
				$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
				$hoja->setCellValue("A{$fila}", "Presentación: {$sede->presentacion}");
				$fila++;
				foreach ($sede->bodegas as $bodega) {
					$hoja->mergeCells("A{$fila}:G{$fila}");
					$hoja->getStyle("A{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
					$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
					$hoja->setCellValue("A{$fila}", "Bodega: {$bodega->descripcion}");
					$fila++;
					$hoja->getStyle("A{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
					$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
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
					$hoja->getStyle("A{$fila}:G{$fila}")->getNumberFormat()->setFormatCode('0.00');
					$fila++;
					if (count($bodega->detalle) > 0) {
						$hoja->getStyle("C{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
						$hoja->getStyle("C{$fila}:G{$fila}")->getFont()->setBold(true);
						$hoja->setCellValue("C{$fila}", 'Fecha');
						$hoja->setCellValue("D{$fila}", 'No.');
						$hoja->setCellValue("E{$fila}", 'Tipo Movimiento');
						$hoja->setCellValue("F{$fila}", 'Ingreso');
						$hoja->setCellValue("G{$fila}", 'Salida');
						$fila++;
						foreach ($bodega->detalle as $det) {
							$hoja->setCellValue("C{$fila}", formatoFecha($det->fecha, 2));
							$hoja->setCellValue("D{$fila}", $det->id);
							$hoja->setCellValue("E{$fila}", $det->tipo_movimiento);
							$hoja->getStyle("C{$fila}:E{$fila}")->getAlignment()->setHorizontal('center');
							$hoja->setCellValue("F{$fila}", ($det->tipo == 1) ? $det->cantidad : "0.00");
							$hoja->setCellValue("G{$fila}", ($det->tipo == 2) ? $det->cantidad : "0.00");
							$hoja->getStyle("F{$fila}:G{$fila}")->getNumberFormat()->setFormatCode('0.00');
							$fila++;
						}
					} else {
						$hoja->mergeCells("A{$fila}:G{$fila}");
						$hoja->getStyle("A{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
						$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
						$hoja->setCellValue("A{$fila}", "SIN MOVIMIENTOS EN LA BODEGA " . strtoupper($bodega->descripcion));
						$fila++;
					}
					$fila++;
				}
			}

			foreach (range('A', 'G') as $col) {
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

		$articulos = $this->Ingreso_model->get_articulos_con_ingresos($req);

		$data = [];
		foreach ($req['sede'] as $s) {
			$sede = new Sede_model($s);
			$empresa = $sede->getEmpresa();
			$data[] = (object)[
				'empresa' => (object)['empresa' => $empresa->getPK(), 'nombre' => $empresa->nombre, 'nombre_comercial' => $empresa->nombre_comercial],
				'sede' => $sede->getPK(),
				'nombre' => $sede->nombre,
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
								$art->actualizarExistencia(['fecha' => $req['fecha'], 'sede' => $s, 'bodega' => $bode]);
								$pres = $art->getPresentacionReporte();
								$art->existencias = (float)$art->existencias / (float)$pres->cantidad;

								$bcosto = $this->BodegaArticuloCosto_model->buscar([
									'bodega' => $bode,
									'articulo' => $row->articulo,
									'_uno' => true
								]);

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
									$nvoBac->BodegaArticuloCosto_model->guardar_costos($bode, $row->articulo);
								}

								$row->precio_unitario = $row->precio_unitario * $pres->cantidad;

								$obj = (object)[
									"articulo" => $art->getPK(),
									"presentacion" => $pres->descripcion,
									"cantidad" => $art->existencias,
									"total" => (float) round($art->existencias, 2) * (float) round($row->precio_unitario, 2),
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
			$hoja->getStyle('H')->getNumberFormat()->setFormatCode('0.00');
			$hoja->getStyle('J')->getNumberFormat()->setFormatCode('0.00');
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
						$hoja->setCellValue("F{$fila}", "{$articulo->articulo}-{$articulo->descripcion}");
						$hoja->setCellValue("G{$fila}", $articulo->presentacion);
						$hoja->setCellValue("H{$fila}", $articulo->cantidad);
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

	public function consumos()
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

	public function ingreso($id)
	{
		$rpt = new Reporte_model();
		$ingreso = $rpt->get_ingreso($id);

		$vista = $this->load->view('reporte/ingreso/imprimir', $ingreso, true);

		$mpdf = new \Mpdf\Mpdf([
			'tempDir' => sys_get_temp_dir(), //Produccion
			'format' => 'Letter'
		]);

		$mpdf->WriteHTML($vista);
		$mpdf->Output('Ingreso_' . date('YmdHis') . '.pdf', "D");

		// $this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($ingreso));
	}

	public function egreso($id)
	{
		$rpt = new Reporte_model();
		$egreso = $rpt->get_egreso($id);

		$vista = $this->load->view('reporte/egreso/imprimir', $egreso, true);

		$mpdf = new \Mpdf\Mpdf([
			'tempDir' => sys_get_temp_dir(), //Produccion
			'format' => 'Letter'
		]);

		$mpdf->WriteHTML($vista);
		$mpdf->Output('Egreso_' . date('YmdHis') . '.pdf', "D");

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
				$ultimo_producto = (int)$producto->articulo;
			}
		}

		$datos = [
			'empresa' => null,
			'sede' => $this->Sede_model->buscar(['sede' => $params['sede'], '_uno' => true]),
			'bodega' => $this->Bodega_model->buscar(['bodega' => $params['bodega'], '_uno' => true]),
			'fecha' => formatoFecha($params['fecha'], 2),
			'pedidos' => $pedidos,
		];

		$datos['empresa'] = $this->Empresa_model->buscar(['empresa' => $datos['sede']->empresa, '_uno' => true]);

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

	private function get_data_oc($idOC)
	{
		$rpt = new Reporte_model();
		return $rpt->get_compra($idOC);
	}

	public function orden_compra($id)
	{
		$oc = $this->get_data_oc($id);
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

		if (verDato($params, "fal") &&
			verDato($params, "fdel")
		) {
			$params["sede"]    = $params["sede"] ?? $this->data->sede;
			$params["_select"] = ["orden_compra"];

			$lista = $this->Reporte_model->get_lista_compra($params);

			if ($lista) {
				$data = [];
				$nombreArchivo = "resumen_pedidos_proveedor_".rand();
				
				foreach ($lista as $key => $row) {
					$tmp = new Reporte_model();
					$data[] = $tmp->get_compra($row->orden_compra);
				}
				
				if (verDato($params, "_excel")) {
					$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();

					$excel->setActiveSheetIndex(0);
					$hoja = $excel->getActiveSheet();
					$hoja->setTitle("Reporte");

					$hoja->setCellValue("A1", "Resumen de pedidos por proveedor")->mergeCells("A1:D1");
					$hoja->setCellValue("A3", "Del: ");
					$hoja->setCellValue("A4", "Al: ");
					$hoja->getStyle("A1:A4")->getFont()->setBold(true);

					$hoja->setCellValue("B3", formatoFecha($params["fdel"], 2));
					$hoja->setCellValue("B4", formatoFecha($params["fal"], 2));
					
					$pos   = 6;
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
						$hoja->setCellValue("B{$pos}", "Codigo");
						$hoja->setCellValue("C{$pos}", "Descripcion");
						$hoja->setCellValue("D{$pos}", "Presentacion");
						$hoja->setCellValue("E{$pos}", "Cantidad");
						$hoja->setCellValue("F{$pos}", "Costo U.");
						$hoja->setCellValue("G{$pos}", "Total");
						$hoja->getStyle("B{$pos}:G{$pos}")->getFont()->setBold(true);
						$hoja->getStyle("E{$pos}:G{$pos}")->getAlignment()->setHorizontal("right");
						
						$pos++;

						$tmpTotal = 0;
						foreach ($row->detalle as $llave => $fila) {
							$hoja->setCellValue("B{$pos}", $fila->codigo);
							$hoja->setCellValue("C{$pos}", $fila->articulo);
							$hoja->setCellValue("D{$pos}", $fila->presentacion);
							$hoja->setCellValue("E{$pos}", number_format((float)$fila->cantidad, 2, ".", ""));
							$hoja->setCellValue("F{$pos}", number_format((float)$fila->monto, 2, ".", ""));
							$hoja->setCellValue("G{$pos}", number_format((float)$fila->total, 2, ".", ""));
							$hoja->getStyle("E{$pos}:G{$pos}")
							->getNumberFormat()
							->setFormatCode("0.00");

							$tmpTotal += $fila->total;
							$pos++;
						}
						
						$hoja->setCellValue("A{$pos}", "Total")->mergeCells("A{$pos}:F{$pos}");
						$hoja->setCellValue("G{$pos}", number_format((float)$tmpTotal, 2, ".", ""));
						$hoja->getStyle("A{$pos}:G{$pos}")->getFont()->setBold(true);
						$hoja->getStyle("A{$pos}:G{$pos}")
						->getNumberFormat()
						->setFormatCode("0.00");
						
						$pos+=2;
						$total+= $tmpTotal;
					}

					$hoja->setCellValue("A{$pos}", "Total")->mergeCells("A{$pos}:F{$pos}");
					$hoja->setCellValue("G{$pos}", number_format((float)$total, 2, ".", ""));
					
					$hoja->getStyle("A{$pos}:G{$pos}")
					->getNumberFormat()
					->setFormatCode("0.00");

					$hoja->getStyle("A{$pos}:G{$pos}")->applyFromArray([
						"font"    => ["bold" => true],
						"borders" => [
							"top"    => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
							"bottom" => ["borderStyle" => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
						]
					]);

					for ($i=1; $i <= 6; $i++) {
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
				}
			}
		}
	}
	
	public function resumen_egreso()
	{
		$params = json_decode(file_get_contents("php://input"), true);

		if (verDato($params, "fal") &&
			verDato($params, "fdel") &&
			verDato($params, "bodega")
		) {
			$lista = $this->Reporte_model->getResumenEgreso($params);

			if ($lista) {
				$data = [];
				$nombreArchivo = "resumen_egreso_".rand();
				
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

				$params["sede"] = $this->Sede_model->buscar(["sede" => $this->data->sede, "_uno" => true]);
				
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
							"Articulo",
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
						
						$pos+=2;
						$total+= $tmpTotal;
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

					for ($i=1; $i <= 6; $i++) {
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
	}

	public function generar_catalogo_articulo()
	{
		$datos = json_decode(file_get_contents("php://input"), true);
		$lista = $this->Reporte_model->getCatalogoArticulo($datos);

		if ($lista) {
			$nombreArchivo = "Catalogo_articulo".rand()."xls";
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

			for ($i=0; $i <= 28; $i++) { 
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
			$nombreArchivo = "Uso_ingrediente_".rand().".xls";
			$lista         = $this->Reporte_model->getUsoIngrediente($datos);

			if (verDato($datos, "_excel")) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$hoja->setTitle("Ingrediente");

				$hoja->setCellValue("A1", "Uso de Ingrediente")->mergeCells("A1:D1");
				$hoja->setCellValue("A3", "Nombre:");
				$hoja->getStyle("A1:A3")->getFont()->setBold(true);
				$hoja->getStyle("A1")->getAlignment()->setHorizontal("center");
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

				for ($i=0; $i <= 4; $i++) { 
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
		
		$nombreArchivo = "Margen_receta_".rand().".xls";
		$lista         = $this->Articulo_model->buscarArticulo($datos);
		$data          = [];
		
		foreach ($lista as $key => $row) {
			$tmp = new Articulo_model($row->articulo);
			$pre = $tmp->getPresentacion();

			$costo = $tmp->_getCosto();
			$margen = ($row->precio > 0 && $costo > 0) ? ((($row->precio / $costo)-1)*100) : 0;
			
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

			for ($i=0; $i <= 6; $i++) { 
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
			$pdf->WriteHTML($this->load->view("reporte/articulo/margen_receta", ["data" => $data, "params" => $datos], true));
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

			foreach ($lista as $row) {
				$tmp   = new Articulo_model($row->articulo);
				$costo = $tmp->_getCosto();				
				
				if ((int)$tmp->produccion === 1 && (float)$tmp->rendimiento !== (float)0) {					
					$presR = $tmp->getPresentacionReporte();
					$costo = (float)$costo / (float)$tmp->rendimiento;
					$row->cantidad = (float)$presR->cantidad !== (float)0 ? ((float)$row->cantidad / (float)$presR->cantidad) : 0;					
				}

				$total = round(($row->cantidad * $costo), 2);
				
				$data[] = [
					'codigo'   => $row->codigo,
					'articulo' => $row->narticulo,
					'cantidad' => $row->cantidad,
					'unidad'   => $row->ndescripcion,
					'costo'    => $costo,
					'total'    => $total
				];
			}

			$nombreArchivo = 'Consumo_articulo_'.rand().'.xls';
			
			if (verDato($datos, '_excel')) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$hoja->setTitle('Reporte de consumos');

				$hoja->setCellValue('A1', 'Del: ')->mergeCells('A1:C1');
				$hoja->setCellValue('A2', 'Al: ')->mergeCells('A2:C2');
				$hoja->setCellValue('A3', 'Sede: ')->mergeCells('A3:C3');

				$hoja->setCellValue('D1', formatoFecha($datos['fdel'], 2))->mergeCells('D1:F1');
				$hoja->setCellValue('D2', formatoFecha($datos['fal'], 2))->mergeCells('D2:F2');
				$hoja->setCellValue('D3', "{$sede->nombre} - {$sede->alias}")->mergeCells('D3:F3');

				if (verDato($datos, 'grupo_nombre')) {
					$hoja->setCellValue('A4', 'Subcategoría: ')->mergeCells('A4:C4');
					$hoja->setCellValue('D4', $datos['grupo_nombre'])->mergeCells('D4:F4');
				}

				$hoja->getStyle('A1:A4')->getFont()->setBold(true);

				$nombres = [
					'Código',
					'Articulo',
					'Cantidad',
					'Unidad',
					'Costo',
					'Total'
				];

				$hoja->fromArray($nombres, null, 'A6');
				$hoja->getStyle('A6:F6')->getFont()->setBold(true);
				$hoja->getStyle('C6')->getAlignment()->setHorizontal('right');
				$hoja->getStyle('E6:F6')->getAlignment()->setHorizontal('right');
				
				$pos = 7;
				$tot = 0;
				foreach ($data as $row) {
					
					$hoja->fromArray($row, null, "A{$pos}");
					
					$hoja->getStyle("C{$pos}")
					->getNumberFormat()
					->setFormatCode('0.00');

					$hoja->getStyle("E{$pos}:F{$pos}")
					->getNumberFormat()
					->setFormatCode('0.00');
					
					$tot+= $row['total'];
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

				for ($i=0; $i <= 6; $i++) { 
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
		$lista = $this->Articulo_model->buscarArticulo([
			"esreceta" => 1,
			"_todos"   => true
		]);

		$data = [];

		$nombreArchivo = "Recetas_".rand().".xls";

		foreach ($lista as $llave => $fila) {
			$art = new Articulo_model($fila->articulo);
			$tmp = [];

			$tmp["articulo"]       = $art;
			$tmp["articulo_grupo"] = $art->getCategoriaGrupo();

			foreach ($art->getReceta() as $row) {
				$rec                  = new Articulo_model($row->articulo->articulo);
				$costo                = $rec->_getCosto();

				if ((int)$rec->produccion === 1 && (float)$rec->rendimiento !== (float)0) {
					$presR = $rec->getPresentacionReporte();
					$costo = (float)$costo / ((float)$rec->rendimiento * (float)$presR->cantidad);
				}

				$tmpCosto             = $costo * $row->cantidad;
				// $tmpCosto             = $costo;
				$row->costo           = round($tmpCosto, 2);
				$row->articulo->costo = $costo;
				$tmp["receta"][]      = $row;
			}

			$data[] = $tmp;
		}

		$pdf = new \Mpdf\Mpdf([
			"tempDir" => sys_get_temp_dir(),
			"format"  => "Letter"
		]);

		$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
		$pdf->WriteHTML($this->load->view("reporte/articulo/receta_costo", ["data" => $data], true));
		$pdf->Output("{$nombreArchivo}.pdf", "D");
	}
}

/* End of file Reporte.php */
/* Location: ./application/wms/controllers/Reporte.php */