<?php
defined('BASEPATH') or exit('No direct script access allowed');
ini_set('memory_limit', -1);
ini_set('pcre.backtrack_limit', 100000000);
set_time_limit(0);

class Ingreso extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['reporte/Reporte_model', 'Sede_model']);
		$this->load->library('WmsRepIngreso');

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->dataToken = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	public function generar_detalle()
	{
		$data['exito'] = false;
		$args = json_decode(file_get_contents('php://input'));

		$headerTipo = $this->input->get_request_header('Accept');

		if (!empty($headerTipo)) {
			$tipo = str_replace('application/', '', strtolower($headerTipo));
			$lista = $this->Reporte_model->getIngresoDetalle($args);

			$lib = new WmsRepIngreso();
			$lib->setLista($lista);
			$lib->setArgs($args);

			if (isset($args->sede) && is_array($args->sede)) {
				foreach($args->sede as $s) {
					$tmp = $this->Sede_model->buscar(['sede' => $s, '_uno' => true]);
					if($lib->lasSedes !== '') {
						$lib->lasSedes .= ', ';
					}
					$lib->lasSedes .= "{$tmp->nombre} ({$tmp->alias})";
				}
			}

			if (isset($args->_excel)) {

				if ($args->_excel) {
					$xls = $lib->generarXls();
					header('Content-Type: application/vnd.ms-excel');
					header('Content-Disposition: attachment;filename=DetalleIngreso.xls');
					header('Cache-Control: max-age=1');
					header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
					header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
					header('Cache-Control: cache, must-revalidate');
					header('Pragma: public');

					$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($xls);
					$writer->save('php://output');
					die;
				} else {
					$pdf = $lib->generarPdf();

					if (verPropiedad($args, '_rturno')) {
						$tmp  = sys_get_temp_dir();
						$ruta = "{$tmp}/detalle_ingreso_" . rand() . '.pdf';

						$pdf->Output($ruta, 'F');

						$data['ruta'] = $ruta;
					} else {
						$pdf->Output('Detalle de ingreso.pdf', 'D');
					}
				}
			} else {
				$data['exito'] = true;
				$data['lista'] = $lista;
			}
		} else {
			$data['mensaje'] = 'No se indico el formato de respuesta.';
		}
		$this->output
			->set_content_type('application/json')
			->set_output(json_encode($data));
	}

	public function generar_resumen()
	{
		$datos = json_decode(file_get_contents('php://input'), true);
		$datos['_select'] = ['ingreso'];

		if (!isset($datos['sede'])) {
			$datos['sede'] = $this->dataToken->sede;
		}

		$lista = $this->Reporte_model->get_lista_ingreso($datos);

		$data = [];
		$tmpSedes = [];
		$nombreArchivo = 'Resumen_ingreso_' . rand();
		if ($lista) {

			foreach ($lista as $key => $row) {
				$tmp   = $this->Reporte_model->get_ingreso($row->ingreso);
				$total = 0;

				$keySede = "{$tmp->sede} ({$tmp->alias_sede})";

				if (!isset($tmpSedes[$keySede])) {
					$tmpSedes[$keySede] = [
						"sede" => $keySede,
						"bodega" => $tmp->bodega
					];
				}

				foreach ($tmp->detalle as $llave => $fila) {
					$total += $datos['iva'] == 1 ? $fila->costo_total_con_iva : $fila->costo_total_con_iva / 1.12;
					$fila->costo = $datos['iva'] == 1 ? $fila->costo_total_con_iva : $fila->costo_total_con_iva / 1.12;
				}

				$data[] = (object) [
					'fecha'     => $tmp->fecha,
					'numero'    => $tmp->ingreso,
					'estatus'   => $tmp->nestatus,
					'tipo'      => $tmp->tipo_movimiento,
					'sede'      => "{$tmp->sede} ({$tmp->alias_sede})",
					'bodega'    => $tmp->bodega,
					'proveedor' => $tmp->proveedor,
					'serie'     => $tmp->documento->serie ?? '',
					'documento' => $tmp->documento->numero ?? '',
					'fecha_doc' => $tmp->documento->fecha ?? '',
					'total'     => round($total, 2),
					'ordenar' =>  "{$tmp->ingreso}-{$tmp->fecha}",
					'egreso_origen' => $tmp->egreso_origen ?? '',
					'detalle' => $tmp->detalle ?? []
				];
			}

			$data = ordenar_array_objetos($data, 'ordenar');
		}

		if (verDato($datos, '_excel')) {
			$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
			$excel->setActiveSheetIndex(0);
			$hoja = $excel->getActiveSheet();
			$hoja->setTitle('Resumen de ingresos');

			if (verDato($datos, 'resumen')){

				$hoja->getStyle('A1:A6')->getFont()->setBold(true);
				$hoja->setCellValue('A1', 'Resumen de Ingresos')->mergeCells('A1:D1');
				$hoja->setCellValue('A3', 'Del: ');
				$hoja->setCellValue('A4', 'Al: ');
				$hoja->mergeCells('A1:K1');
				$hoja->mergeCells('A2:K2');

				$hoja->setCellValue('B3', formatoFecha($datos['fdel'], 2));
				$hoja->setCellValue('B4', formatoFecha($datos['fal'], 2));

				$pos = 5;

				foreach ($tmpSedes as $cd => $tcd)
				{	

					$tmp = $tcd;

					$hoja->setCellValue("A{$pos}", 'Sede: ');
					$hoja->setCellValue("B{$pos}", "{$tmp['sede']}");
					$hoja->getStyle("A{$pos}")->getFont()->setBold(true);
					$pos += 2;

					#$pos   = 8;
					$total = 0;

					$titulo = [
						"Fecha",
						"Documento",
						"Estatus ingreso",
						"Tipo",
						"",
						"Bodega",
						"Comentario"
					];

					$hoja->fromArray($titulo, null, "A{$pos}");
					$hoja->getStyle("A{$pos}:G{$pos}")->getFont()->setBold(true);
					$pos++;

					foreach ($data as $key => $row) {

						if ($tcd["sede"] == $row->sede) {
							$tmpData = [
								$row->fecha,
								$row->numero,
								$row->estatus,
								$row->tipo,
								"",
								$row->bodega
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


							foreach ($row->detalle as $fila)
							{
								$hoja->setCellValue("B{$pos}", $fila->codigo);
								$hoja->setCellValue("C{$pos}", $fila->articulo);
								$hoja->setCellValue("D{$pos}", $fila->presentacion);
								$hoja->setCellValue("E{$pos}", number_format((float)$fila->cantidad, 2, ".", ""));
								$hoja->setCellValue("F{$pos}", number_format((float)$fila->costo, 2, ".", ""));
								$hoja->getStyle("E{$pos}:F{$pos}")
									->getNumberFormat()
									->setFormatCode("0.00");

								$tmpTotal += $fila->costo;
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

					$pos += 3;
				}


				header('Content-Type: application/vnd.ms-excel');
				header("Content-Disposition: attachment;filename={$nombreArchivo}.xlsx");
				header('Cache-Control: max-age=1');
				header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
				header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
				header('Cache-Control: cache, must-revalidate');
				header('Pragma: public');

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xls($excel);
				$writer->save('php://output');

			} else {
			
				$hoja->getStyle('A1:K2')->getFont()->setBold(true);
				$hoja->getStyle('A1:K2')->getAlignment()->setHorizontal('center');
				$hoja->mergeCells('A1:K1');
				$hoja->mergeCells('A2:K2');

				$hoja->setCellValue('A1', 'Resumen de ingresos');
				$hoja->setCellValue('A2', 'Del ' . formatoFecha($datos['fdel'], 2) . ' al ' . formatoFecha($datos['fal'], 2));
				$titulo =  [
					'Fecha',
					'Número',
					'Estatus ingreso',
					'Tipo',
					'Egr./Req./ACP',
					'Sede',
					'Bodega',
					'Proveedor',
					'Serie',
					'Documento',
					'Fecha',
					'Total'
				];
				$hoja->fromArray($titulo, null, 'A4');
				$hoja->getStyle('L4')->getAlignment()->setHorizontal('right');
				$hoja->getStyle('A4:L4')->getFont()->setBold(true);

				$pos   = 5;
				$total = 0;

				foreach ($data as $key => $row) {
					$tmpData = [
						$row->fecha,
						$row->numero,
						$row->estatus,
						$row->tipo,
						$row->egreso_origen,
						$row->sede,
						$row->bodega,
						$row->proveedor,
						$row->serie,
						$row->documento,
						formatoFecha($row->fecha_doc, 2),
						number_format((float)$row->total, 2, '.', '')
					];

					$hoja->fromArray($tmpData, null, "A{$pos}");
					$hoja->getStyle("J{$pos}")->getAlignment()->setHorizontal('right');
					$hoja->getStyle("J{$pos}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$total += $row->total;
					$pos++;
				}

				for ($i = 1; $i <= 11; $i++) {
					$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
				}

				$hoja->getStyle("A{$pos}:L{$pos}")->getFont()->setBold(true);
				$hoja->getStyle("A{$pos}:L{$pos}")->getAlignment()->setHorizontal('right');
				$hoja->mergeCells("A{$pos}:J{$pos}");
				$hoja->setCellValue("A{$pos}", 'Total');
				$hoja->setCellValue("L{$pos}", number_format((float)$total, 2, '.', ''));

				$hoja->getStyle("K{$pos}")
					->getNumberFormat()
					->setFormatCode('0.00');

				$hoja->getStyle("A{$pos}:L{$pos}")->applyFromArray([
					'borders' => [
						'top'    => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
						'bottom' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
					]
				]);

				header('Content-Type: application/vnd.ms-excel');
				header("Content-Disposition: attachment;filename={$nombreArchivo}.xlsx");
				header('Cache-Control: max-age=1');
				header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
				header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
				header('Cache-Control: cache, must-revalidate');
				header('Pragma: public');

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xls($excel);
				$writer->save('php://output');
			}
			
		} else {
			$tmp  = sys_get_temp_dir();
			$pdf = new \Mpdf\Mpdf([
				'tempDir' => $tmp,
				'format' => 'letter',
				'lands'
			]);

			$pdf->AddPage('P');

			$tmpVista = verDato($datos, "resumen") ? "imprimir_resumen2" : "imprimir_resumen";
			$vista = $this->load->view("rep/ingreso/{$tmpVista}", [
				'params' => $datos,
				'lista'  => $data,
				'sedes'  => $tmpSedes
			], true);

			$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
			$pdf->WriteHTML($vista);

			if (verDato($datos, '_rturno')) {
				$ruta = "{$tmp}/{$nombreArchivo}.pdf";
				$pdf->Output($ruta, 'F');

				$this->output
					->set_content_type('application/json')
					->set_output(json_encode(['ruta' => $ruta]));
			} else {
				$pdf->Output("{$nombreArchivo}.pdf", 'D');
			}
		}
	}
}

/* End of file Ingreso.php */
/* Location: ./application/wms/controllers/rep/Ingreso.php */