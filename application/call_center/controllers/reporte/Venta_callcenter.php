<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Venta_callcenter extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		set_database_server();
	}

	public function index()
	{
	}

	public function generar_archivo()
	{
		set_time_limit(0);
		if (
			verDato($_GET, 'fdel') &&
			verDato($_GET, 'fal') &&
			verDato($_GET, 'tipo_reporte')
		) {
			$this->load->model([
				'Reporte_callcenter_model'
			]);

			$data = [];
			$nombreArchivo = 'Ventas_callcenter_' . rand();

			foreach ($this->Reporte_callcenter_model->get_venta_callcenter($_GET) as $key => $row) {
				if (!isset($data[$row->sede])) {
					$data[$row->sede] = [
						'alias'   => $row->alias_sede,
						'nombre'  => "{$row->nsede} ({$row->alias_sede})",
						'detalle' => []
					];
				}

				$data[$row->sede]['detalle'][] = $row;
			}


			if (verDato($_GET, '_excel')) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();

				$excel->setActiveSheetIndex(0);
				$hojaResumen = $excel->getActiveSheet();
				$hojaResumen->setTitle('Resumen');

				$hojaResumen->setCellValue('A2', 'Sede');
				$hojaResumen->setCellValue('B2', 'Cantidad');
				$hojaResumen->setCellValue('C2', 'Total');
				$hojaResumen->getStyle('B2:C2')->getAlignment()->setHorizontal('right');
				$hojaResumen->getStyle('A2:C2')->getFont()->setBold(true);

				$hojaResumen->setCellValue('H2', 'Del: ');
				$hojaResumen->setCellValue('H3', 'Al: ');
				$hojaResumen->setCellValue('H4', 'Tipo reporte: ');
				$hojaResumen->getStyle('H2:H4')->getFont()->setBold(true);

				$hojaResumen->setCellValue('I2', formatoFecha($_GET['fdel'], 2));
				$hojaResumen->setCellValue('I3', formatoFecha($_GET['fal'], 2));
				$hojaResumen->setCellValue('I4', $_GET['tipo_reporte'] == 1 ? 'Detallado' : 'Resumido');

				$posResumen   = 3;
				$hoja         = 1;
				$granCantidad = 0;
				$granTotal    = 0;

				foreach ($data as $key => $row) {
					$tmpHoja = $excel->createSheet($hoja);
					$excel->setActiveSheetIndex($hoja);
					$tmpHoja->setTitle($row['alias']);

					$tmpHoja->setCellValue('A2', $row['nombre'])->mergeCells('A2:D2');
					$tmpHoja->getStyle('A2:D2')->getFont()->setBold(true);
					$tmpHoja->getStyle('A2:D2')->getAlignment()->setHorizontal('center');

					$tmpHoja->setCellValue('A4', 'Artículo');
					$tmpHoja->setCellValue('B4', 'Cantidad');
					$tmpHoja->setCellValue('C4', 'Precio');
					$tmpHoja->setCellValue('D4', 'Total');
					$tmpHoja->getStyle('B4:D4')->getAlignment()->setHorizontal('right');
					$tmpHoja->getStyle('A4:D4')->getFont()->setBold(true);

					$tmpHoja->setCellValue('H2', 'Del: ');
					$tmpHoja->setCellValue('H3', 'Al: ');
					$tmpHoja->setCellValue('H4', 'Tipo reporte: ');
					$tmpHoja->getStyle('H2:H4')->getFont()->setBold(true);

					$tmpHoja->setCellValue('I2', formatoFecha($_GET['fdel'], 2));
					$tmpHoja->setCellValue('I3', formatoFecha($_GET['fal'], 2));
					$tmpHoja->setCellValue('I4', $_GET['tipo_reporte'] == 1 ? 'Detallado' : 'Resumido');

					$pos         = 5;
					$tmpCantidad = 0;
					$tmpTotal    = 0;

					foreach ($row['detalle'] as $llave => $fila) {
						$tmpHoja->setCellValue("A{$pos}", $fila->narticulo);
						$tmpHoja->setCellValue("B{$pos}", $fila->cantidad);
						$tmpHoja->setCellValue("C{$pos}", $fila->precio);
						$tmpHoja->setCellValue("D{$pos}", $fila->total);

						$tmpHoja->getStyle("B{$pos}:D{$pos}")
							->getNumberFormat()
							->setFormatCode('0.00');

						$tmpCantidad += $fila->cantidad;
						$tmpTotal    += $fila->total;

						$pos++;
					}

					$tmpHoja->setCellValue("A{$pos}", 'Totales');
					$tmpHoja->setCellValue("B{$pos}", number_format((float)$tmpCantidad, 2, '.', ''));
					$tmpHoja->getStyle("B{$pos}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$tmpHoja->setCellValue("C{$pos}", '');

					$tmpHoja->setCellValue("D{$pos}", number_format((float)$tmpTotal, 2, '.', ''));
					$tmpHoja->getStyle("D{$pos}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$tmpHoja->getStyle("A{$pos}:D{$pos}")->applyFromArray([
						'font'    => ['bold' => true],
						'borders' => [
							'top'    => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
							'bottom' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
						]
					]);

					$tmpHoja->getColumnDimension('A')->setAutoSize(1);
					$tmpHoja->getColumnDimension('B')->setAutoSize(1);
					$tmpHoja->getColumnDimension('C')->setAutoSize(1);
					$tmpHoja->getColumnDimension('H')->setAutoSize(1);
					$tmpHoja->getColumnDimension('I')->setAutoSize(1);


					$hojaResumen->setCellValue("A{$posResumen}", $row['nombre']);
					$hojaResumen->getStyle("A{$posResumen}")->getFont()->setBold(true);

					$hojaResumen->setCellValue("B{$posResumen}", number_format((float)$tmpCantidad, 2, '.', ''));
					$hojaResumen->getStyle("B{$posResumen}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$hojaResumen->setCellValue("C{$posResumen}", number_format((float)$tmpTotal, 2, '.', ''));
					$hojaResumen->getStyle("C{$posResumen}")
						->getNumberFormat()
						->setFormatCode('0.00');

					$granCantidad += $tmpCantidad;
					$granTotal    += $tmpTotal;
					$posResumen++;
				}

				$hojaResumen->setCellValue("A{$posResumen}", 'Totales');
				$hojaResumen->setCellValue("B{$posResumen}", number_format((float)$granCantidad, 2, '.', ''));
				$hojaResumen->getStyle("B{$posResumen}")
					->getNumberFormat()
					->setFormatCode('0.00');

				$hojaResumen->setCellValue("C{$posResumen}", number_format((float)$granTotal, 2, '.', ''));
				$hojaResumen->getStyle("C{$posResumen}")
					->getNumberFormat()
					->setFormatCode('0.00');

				$hojaResumen->getStyle("A{$posResumen}:C{$posResumen}")->applyFromArray([
					'font'    => ['bold' => true],
					'borders' => [
						'top'    => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN],
						'bottom' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]
					]
				]);

				$hojaResumen->getColumnDimension('A')->setAutoSize(1);
				$hojaResumen->getColumnDimension('B')->setAutoSize(1);
				$hojaResumen->getColumnDimension('C')->setAutoSize(1);
				$hojaResumen->getColumnDimension('H')->setAutoSize(1);
				$hojaResumen->getColumnDimension('I')->setAutoSize(1);

				$nombreArchivo = 'Ventas_callcenter_' . rand();

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
				ini_set('pcre.backtrack_limit', '5000000');
				$pdf = new \Mpdf\Mpdf([
					'tempDir' => sys_get_temp_dir(),
					'format'  => 'Legal'
				]);
				$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
				$pdf->WriteHTML($this->load->view('reporte/venta_callcenter/imprimir', ['data' => $data, 'params' => $_GET], true));
				$pdf->Output("{$nombreArchivo}.pdf", 'D');
			}
		}
	}
}

/* End of file venta_callcenter.php */
/* Location: ./application/call_center/controllers/reporte/venta_callcenter.php */