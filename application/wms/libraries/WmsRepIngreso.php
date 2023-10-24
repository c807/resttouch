<?php
defined('BASEPATH') or exit('No direct script access allowed');

class WmsRepIngreso
{
	protected $ci;
	private $lista;
	private $args;
	private $reportes;
	
	public $lasSedes = '';

	public function __construct()
	{
		$this->ci = &get_instance();
		$this->setReportes();
	}

	public function setLista($lista = [])
	{
		$this->lista = $lista;
	}

	public function setArgs($args = [])
	{
		if (is_array($args)) {
			$args = (object)$args;
		}

		$this->args = $args;
	}

	private function setReportes()
	{
		$this->reportes = [
			1 => (object)[
				"titulo" => "Ingresos por proveedor",
				"ultcol" => "I"
			],
			2 => (object)[
				"titulo" => "Ingresos por producto",
				"ultcol" => "H"
			],
			3 => (object)[
				"titulo" => "Variación de precios",
				"ultcol" => "D"
			]
		];
	}

	public function getReporte($idx = 1)
	{
		return $this->reportes[$idx];
	}

	public function generarPdf()
	{
		$rep = $this->getReporte($this->args->reporte);
		$tmp = "rep/ingreso/imprimir";
		$data = [];

		if ($this->args->reporte == 1) {
			$tmp = "rep/ingreso/imprimir_proveedor";

			foreach ($this->lista as $key => $row) {
				if (!isset($data[$row->nproveedor])) {
					$data[$row->nproveedor] = [];
				}

				if (!isset($data[$row->nproveedor][$row->num_documento])) {
					$data[$row->nproveedor][$row->num_documento] = [];
				}

				$data[$row->nproveedor][$row->num_documento][] = $row;
			}
		} else {
			$data = $this->lista;
		}

		$this->args->sedes = $this->lasSedes;

		$vista = $this->ci->load->view($tmp, [
			"args"  => $this->args,
			"lista" => $data,
			"reporte" => $rep
		], true);

		$pdf = new \Mpdf\Mpdf([
			'tempDir' => sys_get_temp_dir(),
			"format" => "letter",
			"lands"
		]);

		$pdf->AddPage("P");

		$pdf->WriteHTML($vista);
		$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");

		return $pdf;
	}

	public function generarXls()
	{
		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
		$excel->getProperties()
			->setCreator("Restouch")
			->setTitle("Office 2007 xlsx DetalleIngreso")
			->setSubject("Office 2007 xlsx DetalleIngreso")
			->setKeywords("office 2007 openxml php");

		$excel->setActiveSheetIndex(0);
		$hoja = $excel->getActiveSheet();

		$rep = $this->getReporte($this->args->reporte);
		$lcol = $rep->ultcol;

		$hoja->getStyle("A1:{$lcol}3")->getFont()->setBold(true);
		$hoja->getStyle("A1:{$lcol}3")->getAlignment()->setHorizontal("center");
		$hoja->mergeCells("A1:{$lcol}1");
		$hoja->mergeCells("A2:{$lcol}2");
		$hoja->mergeCells("A3:{$lcol}3");


		$hoja->setCellValue('A1', $rep->titulo);
		if ($this->args->reporte == 3) {
			$hoja->setCellValue('A2', $this->lasSedes);
		}
		$hoja->setCellValue('A3', 'Del ' . formatoFecha($this->args->fdel, 2) . ' al ' . formatoFecha($this->args->fal, 2));

		$fila = $this->args->reporte == 3 ? 5 : 4;
		if ($this->args->reporte == 3) {
			$hoja->setCellValue("A{$fila}", "Producto");
			$hoja->setCellValue("B{$fila}", "Último costo");
			$hoja->setCellValue("C{$fila}", "Costo promedio");
			$hoja->setCellValue("D{$fila}", "Desviación estándar");
			$hoja->getStyle("B{$fila}:D{$fila}")->getAlignment()->setHorizontal("right");
		} elseif ($this->args->reporte == 1) {
			$titulo = [
				"Fecha",
				"Documento",
				"Estatus ingreso",
				"Tipo movimiento",
				"Bodega",
				"Producto",
				"Cantidad",
				"Costo",
				"Total"
			];

			$hoja->fromArray($titulo, null, "A{$fila}");
			$hoja->getStyle("G{$fila}:I{$fila}")->getAlignment()->setHorizontal("right");
		} else {
			$hoja->setCellValue("A{$fila}", "Fecha");
			$hoja->setCellValue("B{$fila}", "Tipo");
			$hoja->setCellValue("C{$fila}", "Documento");
			$hoja->setCellValue("D{$fila}", "Estatus ingreso");
			$hoja->setCellValue("E{$fila}", "Bodega");

			$t = "Producto";

			if ($this->args->reporte == 2) {
				$t = "Proveedor";
			}

			$hoja->setCellValue("F{$fila}", $t);
			$hoja->setCellValue("G{$fila}", "Cantidad");
			$hoja->setCellValue("H{$fila}", "Costo");
			$hoja->setCellValue("I{$fila}", "Total");
			$hoja->getStyle("G{$fila}:I{$fila}")->getAlignment()->setHorizontal("right");
		}

		$hoja->getStyle("A{$fila}:I{$fila}")->getFont()->setBold(true);

		$fila++;
		if ($this->lista && $this->args->reporte == 3) {
			$categoria = "";
			$subcategoria = "";

			foreach ($this->lista as $row) {
				if ($categoria != $row->categoria) {
					$categoria = $row->categoria;
					$hoja->mergeCells("A{$fila}:D{$fila}");
					$hoja->getStyle("A{$fila}:D{$fila}")->getFont()->setBold(true);
					$hoja->getStyle("A{$fila}:D{$fila}")->getAlignment()->setHorizontal("left");
					$hoja->setCellValue("A{$fila}", $categoria);
					$fila++;
				}

				if ($subcategoria != $row->subcategoria) {
					$subcategoria = $row->subcategoria;
					$hoja->mergeCells("A{$fila}:D{$fila}");
					$hoja->getStyle("A{$fila}:D{$fila}")->getFont()->setBold(true);
					$hoja->getStyle("A{$fila}:D{$fila}")->getAlignment()->setHorizontal("left");
					$hoja->setCellValue("A{$fila}", "      " . $subcategoria);
					$fila++;
				}

				$hoja->setCellValue("A{$fila}", $row->producto);
				$hoja->setCellValue("B{$fila}", number_format((float)$row->ultimo_costo, 2, ".", ""));
				$hoja->setCellValue("C{$fila}", number_format((float)$row->costo_promedio, 2, ".", ""));
				$hoja->setCellValue("D{$fila}", number_format((float)$row->desviacion, 2, ".", ""));
				$hoja->getStyle("B{$fila}:D{$fila}")
					->getNumberFormat()
					->setFormatCode("0.00");
				$fila++;
			}
		} elseif ($this->lista && $this->args->reporte == 1) {
			$data = [];

			foreach ($this->lista as $key => $row) {
				if (!isset($data[$row->nproveedor])) {
					$data[$row->nproveedor] = [];
				}

				if (!isset($data[$row->nproveedor][$row->num_documento])) {
					$data[$row->nproveedor][$row->num_documento] = [];
				}

				$data[$row->nproveedor][$row->num_documento][] = $row;
			}

			$total = 0;
			foreach ($data as $proveedor => $documento) {
				$provTotal = 0;
				$provCant  = 0;

				$hoja->mergeCells("A{$fila}:I{$fila}");
				$hoja->setCellValue("A{$fila}", $proveedor);
				$hoja->getStyle("A{$fila}:I{$fila}")->getFont()->setBold(true);
				$fila++;

				foreach ($documento as $llave => $producto) {
					$docTotal = 0;
					$docCant  = 0;

					foreach ($producto as $key => $row) {



						$tmpCosto = $row->costo;
						$tmpCant  = $row->cantidad;
						$tmpTot   = $tmpCosto * $row->cantidad;

						$tmpData = [
							formatoFecha($row->fecha, 2),
							$row->num_documento,
							$row->nestatus,
							$row->ntipo_movimiento,
							$row->bodega,
							$row->producto,
							number_format((float)$row->cantidad, 2, ".", ""),
							number_format((float)$tmpCosto, 5, ".", ""),
							number_format((float)$tmpTot, 2, ".", "")
						];

						$hoja->fromArray($tmpData, null, "A{$fila}");

						$hoja->getStyle("G{$fila}:I{$fila}")
							->getNumberFormat()
							->setFormatCode("0.00");

						$provTotal += $tmpTot;
						$provCant  += $tmpCant;
						$docTotal  += $tmpTot;
						$docCant   += $tmpCant;
						$fila++;
					}

					$hoja->mergeCells("A{$fila}:F{$fila}");
					$hoja->getStyle("A{$fila}:F{$fila}")->getAlignment()->setHorizontal("right");
					$hoja->setCellValue("A{$fila}", "Total documento: ");
					$hoja->setCellValue("G{$fila}", number_format((float)$docCant, 2, ".", ""));
					$hoja->setCellValue("I{$fila}", number_format((float)$docTotal, 2, ".", ""));
					$hoja->getStyle("A{$fila}:I{$fila}")->getFont()->setBold(true);
					$hoja->getStyle("G{$fila}:I{$fila}")
						->getNumberFormat()
						->setFormatCode("0.00");
					$fila++;
				}

				$hoja->mergeCells("A{$fila}:F{$fila}");
				$hoja->getStyle("A{$fila}:F{$fila}")->getAlignment()->setHorizontal("right");
				$hoja->setCellValue("A{$fila}", "Total proveedor: ");
				$hoja->setCellValue("G{$fila}", number_format((float)$provCant, 2, ".", ""));
				$hoja->setCellValue("I{$fila}", number_format((float)$provTotal, 2, ".", ""));
				$hoja->getStyle("A{$fila}:I{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("G{$fila}:I{$fila}")
					->getNumberFormat()
					->setFormatCode("0.00");

				$total += $provTotal;
				$fila++;
			}

			$hoja->mergeCells("A{$fila}:F{$fila}");
			$hoja->setCellValue("A{$fila}", "Total");
			$hoja->setCellValue("I{$fila}", number_format((float)$total, 2, ".", ""));
			$hoja->getStyle("A{$fila}:I{$fila}")->getFont()->setBold(true);
			$hoja->getStyle("A{$fila}:F{$fila}")->getAlignment()->setHorizontal("center");
			$hoja->getStyle("I{$fila}")->getAlignment()->setHorizontal("right");
			$hoja->getStyle("I{$fila}")
				->getNumberFormat()
				->setFormatCode("0.00");
		} else if ($this->lista) {
			$total = 0;
			$tcantidad = 0;

			$proveedor = "";
			$producto = "";

			foreach ($this->lista as $row) {
				if ($this->args->reporte == 1) {
					if ($row->nproveedor != $proveedor) {
						$proveedor = $row->nproveedor;
						$hoja->mergeCells("A{$fila}:H{$fila}");
						$hoja->setCellValue("A{$fila}", $proveedor);
						$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
						$fila++;
					}
				}
				if ($this->args->reporte == 2) {
					if ($row->producto != $producto) {
						$producto = $row->producto;
						$hoja->mergeCells("A{$fila}:H{$fila}");
						$hoja->setCellValue("A{$fila}", $producto);
						$hoja->getStyle("A{$fila}:H{$fila}")->getFont()->setBold(true);
						$fila++;
					}
				}

				$hoja->setCellValue("A{$fila}", formatoFecha($row->fecha, 2));
				$hoja->setCellValue("B{$fila}", $row->ntipo_movimiento);
				$hoja->setCellValue("C{$fila}", $row->num_documento);
				$hoja->setCellValue("D{$fila}", $row->nestatus);
				$hoja->setCellValue("E{$fila}", $row->bodega);

				$t = $row->producto;

				if ($this->args->reporte == 2) {
					$t = $row->nproveedor;
				}

				$hoja->setCellValue("F{$fila}", $t);
				$hoja->setCellValue("G{$fila}", number_format((float)$row->cantidad, 2, ".", ""));
				$hoja->setCellValue("H{$fila}", number_format((float)$row->costo, 4, ".", ""));
				$hoja->setCellValue("I{$fila}", number_format((float)$row->costo_total, 2, ".", ""));
				$hoja->getStyle("G{$fila}:I{$fila}")->getNumberFormat()->setFormatCode("0.00");

				$total += $row->cantidad * $row->costo;
				$tcantidad += $row->cantidad;
				$fila++;
			}

			$hoja->mergeCells("A{$fila}:F{$fila}");
			$hoja->setCellValue("A{$fila}", "Total");
			if ($this->args->reporte == 2) {
				$hoja->setCellValue("G{$fila}", number_format((float)$tcantidad, 2, ".", ""));
			}
			$hoja->setCellValue("I{$fila}", number_format((float)$total, 2, ".", ""));

			$hoja->getStyle("A{$fila}:I{$fila}")->getFont()->setBold(true);
			$hoja->getStyle("A{$fila}:E{$fila}")->getAlignment()->setHorizontal("center");
			$hoja->getStyle("H{$fila}")->getAlignment()->setHorizontal("right");
			$hoja->getStyle("G{$fila}:I{$fila}")->getNumberFormat()->setFormatCode("0.00");
		}

		foreach (range('A', $rep->ultcol) as $col) {
			$hoja->getColumnDimension($col)->setAutoSize(true);
		}


		$hoja->setTitle($rep->titulo);

		return $excel;
	}
}

/* End of file WmsRepIngreso.php */
/* Location: ./application/wms/libraries/WmsRepIngreso.php */
