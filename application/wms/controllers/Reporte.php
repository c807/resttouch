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
		ini_set("pcre.backtrack_limit", "15000000");
		// $rpt = new Reporte_model();
		$data = [];
		$_POST = json_decode(file_get_contents('php://input'), true);

		if (!isset($_POST['sede'])) {
			$_POST['sede'] = [$this->data->sede];
			$data['sede'] = [$this->data->sede];
		} else {
			$data['sede'] = $_POST['sede'];
		}

		$data['mostrar_inventario'] = 1;
		$arts = $this->Catalogo_model->getArticulo($data);
		$args = [
			"cliente" => "",
			"sub_cuenta" => "",
			"fecha" => formatoFecha($_POST['fecha'], 2),
			"sedes" => $_POST['sede']
		];

		foreach($_POST['sede'] as $s)
		{
			$nbodega = [];
			foreach($_POST['bodega'] as $bode)
			{
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
				"Ingresos",
				"Egresos",
				"Comandas",
				"Factura Directa",
				"Total Egresos",
				"Existencia"
			];
			/*Encabezado*/
			$hoja->setCellValue("A1", "Reporte de Existencias");
			$hoja->setCellValue("G1", "Fecha: {$args['fecha']}");

			$hoja->fromArray($nombres, null, "A3");
			$hoja->getStyle("A3:I3")->getFont()->setBold(true);
			$hoja->getStyle('A3:I3')->getAlignment()->setHorizontal('center');
			$hoja->getStyle("A1")->getFont()->setBold(true);
			$fila = 4;
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
						((float) $row->ingresos != 0) ? round($row->ingresos / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->egresos != 0) ? round($row->egresos / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->comandas != 0) ? round($row->comandas / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->facturas != 0) ? round($row->facturas / $row->presentacion->cantidad, 2) : "0.00",
						((float) $row->total_egresos != 0) ? round($row->total_egresos / $row->presentacion->cantidad, 2) : "0.00",
						(count($rec) > 0 && $art->produccion == 0) ? "0.00" : (((float) $row->existencia != 0) ? round($row->existencia / $row->presentacion->cantidad, 2) : "0.00")
					];

					$hoja->fromArray($reg, null, "A{$fila}");
					$hoja->getStyle("D{$fila}:I{$fila}")->getNumberFormat()->setFormatCode('0.00');
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

	/*public function kardex_previous()
	{
		$_POST = json_decode(file_get_contents('php://input'), true);
		$datos = [];
		$rpt = new Reporte_model();
		$rpt->setTipo(2);

		$dato = [];
		$bodegas = $_POST['bodega'];
		foreach ($bodegas as $bod) {
			$_POST['bodega'] = [$bod];
			$exist = $rpt->getExistencias($_POST);
			foreach ($exist as $row) {
				$art = new Articulo_model($row->articulo);
				$rec = $art->getReceta();
				if (count($rec) == 0 || $art->produccion) {
					$pres = $art->getPresentacionReporte();
					//$row->cantidad = $row->cantidad / $pres->cantidad;

					if ($row->existencia != 0) {
						$row->existencia = $row->existencia / $pres->cantidad;

						$dato[$bod][$row->articulo] = [
							"codigo" => $row->codigo,
							"articulo" => $row->articulo,
							"descripcion" => $row->descripcion,
							"antiguedad"  => $row->existencia,
							"ingresos"    => 0,
							"salidas"     => 0,
							"egresos" => 0,
							"comandas" => 0,
							"facturas" => 0,
							"presentacion" => $pres->descripcion,
							"detalle" 	  => []
						];
					}
				}
			}
		}

		$rpt->setTipo(3);

		foreach ($bodegas as $bod) {
			$_POST['bodega'] = [$bod];
			$reg = $rpt->getExistencias($_POST);
			foreach ($reg as $row) {
				$art = new Articulo_model($row->articulo);
				$rec = $art->getReceta();
				if (count($rec) == 0 || $art->produccion) {
					$pres = $art->getPresentacionReporte();
					$row->cantidad = $row->cantidad / $pres->cantidad;

					$ingresos = ($row->tipo == 1) ? $row->cantidad : 0;
					$salidas  = ($row->tipo == 2) ? $row->cantidad : 0;

					if (isset($dato[$bod][$row->articulo])) {
						$dato[$bod][$row->articulo]['ingresos'] += ($ingresos);
						$dato[$bod][$row->articulo]['salidas'] += ($salidas);
						$dato[$bod][$row->articulo]['egresos'] += ($row->tipo_salida == 1) ? $row->cantidad : 0;
						$dato[$bod][$row->articulo]['comandas'] += ($row->tipo_salida == 2) ? $row->cantidad : 0;
						$dato[$bod][$row->articulo]['facturas'] += ($row->tipo_salida == 3) ? $row->cantidad : 0;
						$dato[$bod][$row->articulo]['detalle'][] = $row;
					} else {
						$dato[$bod][$row->articulo] = [
							"articulo" => $row->articulo,
							"codigo" => $row->codigo,
							"descripcion" => $row->descripcion,
							"antiguedad"  => 0,
							"ingresos"    => $ingresos,
							"salidas"     => $salidas,
							"egresos" => ($row->tipo_salida == 1) ? $row->cantidad : 0,
							"comandas" => ($row->tipo_salida == 2) ? $row->cantidad : 0,
							"facturas" => ($row->tipo_salida == 3) ? $row->cantidad : 0,
							"presentacion" => $pres->descripcion,
							"detalle"	  => [$row]
						];
					}
					usort($dato[$bod][$row->articulo]["detalle"], function ($a, $b) {
						return strtotime($b->fecha) < strtotime($a->fecha);
					});
				}
			}
		}

		$args = [
			"articulos" => $dato,
			"bodegas" => $bodegas,
			"fdel" => $this->input->post("fdel"),
			"fal" => $this->input->post("fal")
		];

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
				"Presentación",
				"Saldo Anterior",
				"Ingresos",
				"Egresos",
				"Comandas",
				"Facturas",
				"Total Egresos",
				"Saldo Actual"
			];			
			$hoja->setCellValue("B1", "Kardex");
			$hoja->setCellValue("E1", "Del: " . formatoFecha($args['fdel'], 2));
			$hoja->setCellValue("F1", "Al: " . formatoFecha($args['fal'], 2));


			$hoja->getStyle("B1:F1")->getFont()->setBold(true);

			$fila = 4;

			foreach ($args['bodegas'] as $bodega) {
				$bod = new Bodega_model($bodega);
				$hoja->setCellValue("A{$fila}", $bod->descripcion);
				$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
				$fila++;
				if (isset($args['articulos'][$bodega])) {
					foreach ($args["articulos"][$bodega] as $row) {
						$hoja->fromArray($nombres, null, "A{$fila}");
						$hoja->getStyle("A{$fila}:J{$fila}")->getFont()->setBold(true);
						$hoja->getStyle("A{$fila}:J{$fila}")->getAlignment()->setHorizontal('center');
						$fila++;

						$saldo = $row['antiguedad'] + $row['ingresos'] - $row['salidas'];

						$reg = [
							(!empty($row['codigo']) ? $row['codigo'] : $row['articulo']),
							$row['descripcion'],
							$row['presentacion'],
							($row['antiguedad'] == 0) ? "0.00" : round($row['antiguedad'], 2),
							($row['ingresos'] == 0) ? "0.00" : round($row['ingresos'], 2),
							($row['egresos'] == 0) ? "0.00" : round($row['egresos'], 2),
							($row['comandas'] == 0) ? "0.00" : round($row['comandas'], 2),
							($row['facturas'] == 0) ? "0.00" : round($row['facturas'], 2),
							($row['salidas'] == 0) ? "0.00" : round($row['salidas'], 2),
							($saldo == 0) ? "0.00" : round($saldo, 2)
						];

						$hoja->fromArray($reg, null, "A{$fila}");
						$hoja->getStyle("D{$fila}:J{$fila}")->getNumberFormat()->setFormatCode('0.00');
						$hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('left');
						$fila++;

						if (count($row['detalle']) > 0) {
							$sub = [
								"",
								"",
								"",
								"",
								"",
								"Fecha",
								"No",
								"Tipo Movimiento",
								"Ingreso",
								"Salida"
							];
							$hoja->fromArray($sub, null, "A{$fila}");
							$hoja->getStyle("B{$fila}:J{$fila}")->getFont()->setBold(true);
							$hoja->getStyle("B{$fila}:J{$fila}")->getAlignment()->setHorizontal('center');
							$fila++;

							foreach ($row['detalle'] as $det) {
								$detalle = [
									"",
									"",
									"",
									"",
									"",
									formatoFecha($det->fecha, 2),
									$det->id,
									$det->tipo_movimiento,
									($det->tipo == 1) ? round($det->cantidad, 2) : "0.00",
									($det->tipo == 2) ? round($det->cantidad, 2) : "0.00"
								];

								$hoja->fromArray($detalle, null, "A{$fila}");
								$hoja->getStyle("I{$fila}:J{$fila}")->getNumberFormat()->setFormatCode('0.00');
								$fila++;
							}
							$fila++;
						}
					}
				} else {
					$hoja->setCellValue("A{$fila}", "Sin Movimientos");
					$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
					$fila++;
				}
			}

			for ($i = 0; $i <= count($nombres); $i++) {
				$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
			}

			header("Content-Type: application/vnd.ms-excel");
			header("Content-Disposition: attachment;filename=Kardex.xlsx");
			header("Cache-Control: max-age=1");
			header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");

			$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
			$writer->save("php://output");
		} else {
			// $vista = $this->load->view('reporte/kardex/imprimir', $args, true);
			// $pdf   = new \Mpdf\Mpdf([
			// 	'tempDir' => sys_get_temp_dir(), //produccion
			// 	"format" => "letter",
			// 	"lands"
			// ]);

			// $pdf->AddPage("L");
			// $pdf->WriteHTML($vista);
			// $pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			// $pdf->Output("Kardex.pdf", "D");

			$this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode($args));
		}
	}*/	

	public function kardex()
	{
		$_POST = json_decode(file_get_contents('php://input'), true);		
		$rpt = new Reporte_model();
		
		$datos = [];
		$infoArticulo = new stdClass();

		foreach($_POST['sede'] as $s) 
		{
			$art = $this->Articulo_model->buscarArticulo(['sede' => $s, 'codigo' => $_POST['articulo']]);
			if($art) {
				$articulo = new Articulo_model($art->articulo);				
				$infoArticulo->codigo = $articulo->codigo;
				$infoArticulo->descripcion = $articulo->descripcion;
				$cntReceta = count($articulo->getReceta());
				if($cntReceta === 0 || $articulo->produccion || ($cntReceta > 0 && (int)$articulo->mostrar_inventario === 1))
				{					
					$presentacionReporte = $articulo->getPresentacionReporte();
					$sede = new Sede_model($s);				
					$datos[] = (object)[
						'sede' => (object)['sede' => $sede->getPK(), 'nombre' => $sede->nombre],
						'presentacion' => $presentacionReporte->descripcion,
						'bodegas' => []					
					];
					$lastIdxSedes = count($datos) - 1;
					foreach ($_POST['bodega'] as $bode)
					{
						$bodega = new Bodega_model($bode);
						if ((int)$bodega->sede === (int)$s)
						{
							$rpt->setTipo(2);
							$paramsExist = ['sede' => $s, 'bodega' => $bodega->getPK(), 'articulo' => $articulo->getPK(), 'fdel' => $_POST['fdel'], 'fal' => $_POST['fal']];
							$existencias = $rpt->getExistencias($paramsExist);
							$existencia = new stdClass();
							$existencia->existencia = 0;

							if (count($existencias) > 0) 
							{
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
							foreach ($existencias as $row)
							{
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
							usort($datos[$lastIdxSedes]->bodegas[$lastIdxBodegas]->detalle, function($a, $b){ return strtotime($b->fecha) < strtotime($a->fecha); });
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

		if (verDato($_POST, "_excel"))
		{
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
			$hoja->setCellValue('A4', 'Del '.formatoFecha($args->fdel, 2).' al '.formatoFecha($args->fal, 2));

			$fila = 6;
			foreach($args->sedes as $sede) 
			{
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
				foreach ($sede->bodegas as $bodega)
				{
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
					if(count($bodega->detalle) > 0)
					{
						$hoja->getStyle("C{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
						$hoja->getStyle("C{$fila}:G{$fila}")->getFont()->setBold(true);
						$hoja->setCellValue("C{$fila}", 'Fecha');
						$hoja->setCellValue("D{$fila}", 'No.');
						$hoja->setCellValue("E{$fila}", 'Tipo Movimiento');
						$hoja->setCellValue("F{$fila}", 'Ingreso');
						$hoja->setCellValue("G{$fila}", 'Salida');
						$fila++;
						foreach($bodega->detalle as $det)
						{
							$hoja->setCellValue("C{$fila}", formatoFecha($det->fecha, 2));
							$hoja->setCellValue("D{$fila}", $det->id);
							$hoja->setCellValue("E{$fila}", $det->tipo_movimiento);
							$hoja->getStyle("C{$fila}:E{$fila}")->getAlignment()->setHorizontal('center');
							$hoja->setCellValue("F{$fila}", ($det->tipo == 1) ? $det->cantidad : "0.00");
							$hoja->setCellValue("G{$fila}", ($det->tipo == 2) ? $det->cantidad : "0.00");
							$hoja->getStyle("F{$fila}:G{$fila}")->getNumberFormat()->setFormatCode('0.00');
							$fila++;
						}
					} else
					{
						$hoja->mergeCells("A{$fila}:G{$fila}");
						$hoja->getStyle("A{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
						$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
						$hoja->setCellValue("A{$fila}", "SIN MOVIMIENTOS EN LA BODEGA ".strtoupper($bodega->descripcion));
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
				// 'tempDir' => sys_get_temp_dir(), //produccion
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

						if((int)$categoria->sede === (int)$s)
						{
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
									$row->precio_unitario = 0;
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

	// public function valorizado_previous()
	// {
	// 	$req = json_decode(file_get_contents('php://input'), true);
	// 	$_POST = json_decode(file_get_contents('php://input'), true);
	// 	$sede = new Sede_model($this->data->sede);
	// 	$emp = $sede->getEmpresa();
	// 	if ($emp->metodo_costeo == 1) {
	// 		$ingresos = $this->Ingreso_model->get_ultima_compra($req);
	// 	} else if ($emp->metodo_costeo == 2) {
	// 		$ingresos = $this->Ingreso_model->get_costo_promedio($req);
	// 	} else {
	// 		$ingresos = [];
	// 	}

	// 	$arts = $this->Ingreso_model->get_articulos_sin_costo($req);
	// 	$ingresos = array_merge($ingresos, $arts);

	// 	$datos = [];
	// 	$detalle = [];
	// 	foreach ($req['bodega'] as $bodega) {
	// 		foreach ($ingresos as $row) {
	// 			$art = new Articulo_model($row->articulo);
	// 			$receta = $art->getReceta();
	// 			if (count($receta) == 0 || $art->produccion) {
	// 				$art->actualizarExistencia($_POST);
	// 				$pres = $art->getPresentacionReporte();
	// 				$art->existencias = $art->existencias / $pres->cantidad;


	// 				$bcosto = $this->BodegaArticuloCosto_model->buscar([
	// 					'bodega' => $bodega,
	// 					'articulo' => $row->articulo,
	// 					'_uno' => true
	// 				]);

	// 				if ($bcosto) {
	// 					if ($emp->metodo_costeo == 1) {
	// 						$row->precio_unitario = $bcosto->costo_ultima_compra;
	// 					} else if ($emp->metodo_costeo == 2) {
	// 						$row->precio_unitario = $bcosto->costo_promedio;
	// 					} else {
	// 						$row->precio_unitario = 0;
	// 					}
	// 				} else {
	// 					$row->precio_unitario = 0;
	// 				}

	// 				$row->precio_unitario = $row->precio_unitario * $pres->cantidad;

	// 				$detalle[$bodega][$art->getPK()] = [

	// 					"presentacion" => $pres->descripcion,
	// 					"cantidad" => $art->existencias,
	// 					"total" => (float) round($art->existencias, 2) * (float) round($row->precio_unitario, 2),
	// 					"descripcion" => $art->descripcion,
	// 					"precio_unitario" => $row->precio_unitario,
	// 					"ultima_compra" => isset($row->fecha) ? formatoFecha($row->fecha, 2) : ''
	// 				];
	// 			}
	// 		}
	// 	}


	// 	$buscar = [];
	// 	if (isset($_POST['sede'])) {
	// 		$buscar['sede'] = $this->input->post('sede');
	// 	} else {
	// 		$buscar['sede'] = [$this->data->sede];
	// 	}
	// 	$cat = $this->Categoria_model->buscar(["_in" => $buscar]);


	// 	$categorias = [];
	// 	foreach ($cat as $row) {
	// 		$grupo = $this->Catalogo_model->getCategoriaGrupo([
	// 			"categoria" => $row->categoria,
	// 			"categoria_grupo_grupo" => null,
	// 			"_todo" => true
	// 		]);

	// 		$row->categoria_grupo = $grupo;

	// 		$categorias[] = $row;
	// 	}
	// 	$datos = [];
	// 	foreach ($req['bodega'] as $bodega) {
	// 		$bod = new Bodega_model($bodega);
	// 		foreach ($categorias as $row) {
	// 			$row->tmp = $row->categoria_grupo;
	// 			if ($row->sede == $bod->sede) {
	// 				$row->subcategoria = buscar_articulo($row->categoria_grupo, (array)$detalle[$bodega]);
	// 				unset($row->categoria_grupo);

	// 				for ($i = 0; $i < count($row->subcategoria); $i++) {
	// 					if (count($row->subcategoria[$i]['articulos']) === 0) {
	// 						unset($row->subcategoria[$i]);
	// 					}
	// 				}

	// 				$datos[$bodega][] = $row;

	// 				$row->categoria_grupo = $row->tmp;
	// 			}
	// 		}
	// 	}

	// 	foreach ($datos as $row) {
	// 		foreach ($row as $r) {
	// 			unset($r->categoria_grupo);
	// 			unset($r->tmp);
	// 		}
	// 	}

	// 	$data = [
	// 		"detalle" => $datos,
	// 		"fecha" => formatoFecha($_POST['fecha'], 2),
	// 		"bodega" => $_POST['bodega']
	// 	];

	// 	$sede = $this->Catalogo_model->getSede([
	// 		'sede' => $this->data->sede,
	// 		"_uno" => true
	// 	]);

	// 	$tmp = [];
	// 	foreach ($_POST['sede'] as $row) {
	// 		$sede = $this->Catalogo_model->getSede([
	// 			'sede' => $row,
	// 			"_uno" => true
	// 		]);

	// 		$tmp[] = $sede->nombre;
	// 	}

	// 	if ($sede) {
	// 		$emp = $this->Catalogo_model->getEmpresa([
	// 			"empresa" => $sede->empresa,
	// 			"_uno" => true
	// 		]);
	// 		if ($emp) {
	// 			$data['empresa'] = $emp;
	// 			$data['nsede'] = implode(", ", $tmp);
	// 		}
	// 	}

	// 	if ($this->input->post('bodega')) {
	// 		$tmp = [];
	// 		foreach ($_POST['bodega'] as $row) {
	// 			$bod = new Bodega_model($row);
	// 			$tmp[] = $bod->descripcion;
	// 		}

	// 		$data['nbodega'] = implode(", ", $tmp);
	// 	} else {
	// 		$data['nbodega'] = 'Todas';
	// 	}

	// 	if (verDato($_POST, "_excel")) {
	// 		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
	// 		$excel->getProperties()
	// 			->setCreator("Restouch")
	// 			->setTitle("Office 2007 xlsx Valorizado")
	// 			->setSubject("Office 2007 xlsx Valorizado")
	// 			->setKeywords("office 2007 openxml php");

	// 		$excel->setActiveSheetIndex(0);
	// 		$hoja = $excel->getActiveSheet();
	// 		$nombres = [
	// 			"Descripción",
	// 			"Presentación",
	// 			"Existencia",
	// 			"Fecha Última Compra",
	// 			"Costo",
	// 			"Valor"
	// 		];

	// 		/*Encabezado*/
	// 		$hoja->setCellValue("A1", $data["empresa"]->nombre);
	// 		$hoja->setCellValue("A2", $data["nsede"]);
	// 		$hoja->setCellValue("A4", "Reporte de Inventario Valorizado");
	// 		$hoja->setCellValue("E4", "Fecha: {$data['fecha']}");
	// 		$hoja->setCellValue("A5", "Bodega: {$data['nbodega']}");

	// 		$hoja->fromArray($nombres, null, "A7");
	// 		$hoja->getStyle("A1:A5")->getFont()->setBold(true);
	// 		$hoja->getStyle("A7:F7")->getFont()->setBold(true);
	// 		$hoja->getStyle('A7:F7')->getAlignment()->setHorizontal('center');
	// 		$hoja->getStyle("E4")->getFont()->setBold(true);
	// 		$fila = 8;
	// 		$granTotal = 0;
	// 		foreach ($data['bodega'] as $bod) {
	// 			$bodega = new Bodega_model($bod);
	// 			$hoja->setCellValue("A{$fila}", $bodega->descripcion);
	// 			$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
	// 			$fila++;
	// 			foreach ($data["detalle"][$bod] as $det) {
	// 				$totalCat = 0;
	// 				if (count($det->subcategoria) > 0) {
	// 					$hoja->fromArray([$det->descripcion], null, "A{$fila}");
	// 					$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
	// 					$fila++;
	// 					foreach ($det->subcategoria as $sub) {
	// 						if (count($sub['articulos']) > 0) {
	// 							$hoja->fromArray([$sub['descripcion']], null, "A{$fila}");
	// 							$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
	// 							$fila++;

	// 							$total = 0;
	// 							foreach ($sub['articulos'] as $row) {
	// 								$reg = [
	// 									$row->descripcion,
	// 									$row->presentacion,
	// 									((float) $row->cantidad != 0) ? round($row->cantidad, 2) : "0.00",
	// 									$row->ultima_compra,
	// 									((float) $row->precio_unitario != 0) ? round($row->precio_unitario, 2) : "0.00",
	// 									((float) $row->total != 0) ? round($row->total, 2) : "0.00"
	// 								];

	// 								$hoja->fromArray($reg, null, "A{$fila}");
	// 								$hoja->getStyle("C{$fila}")->getNumberFormat()->setFormatCode('0.00');
	// 								$hoja->getStyle("E{$fila}")->getNumberFormat()->setFormatCode('0.00');
	// 								$hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
	// 								$fila++;

	// 								$total += $row->total;
	// 								$granTotal += $row->total;
	// 								$totalCat += $row->total;
	// 							}

	// 							$hoja->setCellValue("E{$fila}", "Total subcategoría {$sub['descripcion']}");
	// 							$hoja->setCellValue("F{$fila}", $total);
	// 							$hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
	// 							$hoja->getStyle("E{$fila}:F{$fila}")->getFont()->setBold(true);
	// 							$fila++;
	// 						}
	// 					}
	// 					$hoja->setCellValue("E{$fila}", "Total Categoría {$det->descripcion}");
	// 					$hoja->setCellValue("F{$fila}", $totalCat);
	// 					$hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
	// 					$hoja->getStyle("E{$fila}:F{$fila}")->getFont()->setBold(true);
	// 					$fila++;
	// 				}
	// 			}
	// 		}

	// 		$fila++;
	// 		$hoja->setCellValue("E{$fila}", "TOTAL");
	// 		$hoja->setCellValue("F{$fila}", round($granTotal, 2));
	// 		$hoja->getStyle("F{$fila}")->getNumberFormat()->setFormatCode('0.00');
	// 		$hoja->getStyle("E{$fila}:F{$fila}")->getFont()->setBold(true);

	// 		for ($i = 0; $i <= count($nombres); $i++) {
	// 			$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
	// 		}

	// 		$hoja->setTitle("Inventario Valorizado");

	// 		header("Content-Type: application/vnd.ms-excel");
	// 		header("Content-Disposition: attachment;filename=Valorizado.xls");
	// 		header("Cache-Control: max-age=1");
	// 		header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
	// 		header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
	// 		header("Cache-Control: cache, must-revalidate");
	// 		header("Pragma: public");

	// 		$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
	// 		$writer->save("php://output");
	// 	} else {
	// 		// $vista = $this->load->view('reporte/valorizado/imprimir', $data, true);

	// 		// $mpdf = new \Mpdf\Mpdf([
	// 		// 	'tempDir' => sys_get_temp_dir(), //Produccion
	// 		// 	'format' => 'Legal'
	// 		// ]);

	// 		// $mpdf->WriteHTML($vista);
	// 		// $mpdf->Output("valorizado.pdf", "D");

	// 		$this->output->set_content_type("application/json", "UTF-8")->set_output(json_encode([
	// 			'data' => $data,
	// 			'categorias' => $categorias,
	// 			'detalle' => $detalle
	// 		]));
	// 	}
	// }	
}

/* End of file Reporte.php */
/* Location: ./application/wms/controllers/Reporte.php */