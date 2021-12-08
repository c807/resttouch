<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class WmsRepIngreso
{
	protected $ci;
	private $lista;
	private $args;
	private $reportes;

	public function __construct()
	{
        $this->ci =& get_instance();
        $this->setReportes();
	}

	public function setLista($lista=[])
	{
		$this->lista = $lista;
	}

	public function setArgs($args=[])
	{
		$this->args = $args;
	}

	private function setReportes()
	{
		$this->reportes = [
			1 => (object)[
				"titulo" => "Ingresos por proveedor",
				"ultcol" => "G"
			],
			2 => (object)[
				"titulo" => "Ingresos por producto",
				"ultcol" => "G"
			],
			3 => (object)[
				"titulo" => "Variacion de precios",
				"ultcol" => "D"
			]
		];
	}

	public function getReporte($idx=1)
	{
		return $this->reportes[$idx];
	}

	public function generarPdf()
	{
		$rep = $this->getReporte($this->args->reporte);

		$vista = $this->ci->load->view('rep/ingreso/imprimir', [
			"args"  => $this->args,
			"lista" => $this->lista,
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

		$hoja->getStyle("A1:{$lcol}2")->getFont()->setBold(true);
		$hoja->getStyle("A1:{$lcol}2")->getAlignment()->setHorizontal("center");
		$hoja->mergeCells("A1:{$lcol}1");
		$hoja->mergeCells("A2:{$lcol}2");


		$hoja->setCellValue('A1', $rep->titulo);
		$hoja->setCellValue('A2', 'Del '.formatoFecha($this->args->fdel, 2).' al '.formatoFecha($this->args->fal, 2));

		$fila = 4;
		if ($this->args->reporte == 3) {
			$hoja->setCellValue("A{$fila}", "Producto");
			$hoja->setCellValue("B{$fila}", "Ultimo costo");
			$hoja->setCellValue("C{$fila}", "Costo promedio");
			$hoja->setCellValue("D{$fila}", "Desviación estandar");
		} else {
			$hoja->setCellValue("A{$fila}", "Fecha");
			$hoja->setCellValue("B{$fila}", "# Documento");
			$hoja->setCellValue("C{$fila}", "Bodega");

			$t = "Producto";
			
			if ($this->args->reporte == 2) {
				$t = "Proveedor";
			}

			$hoja->setCellValue("D{$fila}", $t);
			$hoja->setCellValue("E{$fila}", "Cantidad");
			$hoja->setCellValue("F{$fila}", "Costo");
			$hoja->setCellValue("G{$fila}", "Total");
		}

		$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);

		$fila++;
		if ($this->lista && $this->args->reporte == 3) {
			$categoria = "";
			$subcategoria = "";

			foreach($this->lista as $row) 
			{
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
					$hoja->setCellValue("A{$fila}", "      ".$subcategoria);
					$fila++;
				}

				$hoja->setCellValue("A{$fila}", $row->producto);
				$hoja->setCellValue("B{$fila}", number_format($row->ultimo_costo, 2));
				$hoja->setCellValue("C{$fila}", number_format($row->costo_promedio, 2));
				$hoja->setCellValue("D{$fila}", number_format($row->desviacion, 5));
				$fila++;
			}

		} else if ($this->lista) {
			$total = 0;
			$tcantidad = 0;

			$proveedor = "";
			$producto = "";

			foreach($this->lista as $row) 
			{
				if ($this->args->reporte == 1) {
					if ($row->nproveedor != $proveedor) {
						$proveedor = $row->nproveedor;
						$hoja->mergeCells("A{$fila}:G{$fila}");
						$hoja->setCellValue("A{$fila}", $proveedor);
						$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
						$fila++;
					}
				}
				if ($this->args->reporte == 2) {
					if ($row->producto != $producto) {
						$producto = $row->producto;
						$hoja->mergeCells("A{$fila}:G{$fila}");
						$hoja->setCellValue("A{$fila}", $producto);
						$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
						$fila++;
					}
				}

				$hoja->setCellValue("A{$fila}", formatoFecha($row->fecha, 2));
				$hoja->setCellValue("B{$fila}", $row->num_documento);
				$hoja->setCellValue("C{$fila}", $row->bodega);

				$t = $row->producto;
		
				if ($this->args->reporte == 2) {
					$t = $row->nproveedor;
				}

				$hoja->setCellValue("D{$fila}", $t);
				$hoja->setCellValue("E{$fila}", number_format($row->cantidad, 2));
				$hoja->setCellValue("F{$fila}", number_format($row->costo, 2));
				$hoja->setCellValue("G{$fila}", number_format($row->cantidad * $row->costo, 2));

				$total += $row->cantidad * $row->costo;
				$tcantidad += $row->cantidad;
				$fila++;
			}

			$hoja->mergeCells("A{$fila}:D{$fila}");
			$hoja->setCellValue("A{$fila}", "Total");
			if ($this->args->reporte == 2) {
				$hoja->setCellValue("E{$fila}", number_format($tcantidad, 2));
			}
			$hoja->setCellValue("G{$fila}", number_format($total, 2));

			$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
			$hoja->getStyle("A{$fila}:F{$fila}")->getAlignment()->setHorizontal("center");
			$hoja->getStyle("G{$fila}")->getAlignment()->setHorizontal("right");
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
