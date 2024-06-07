<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Clientes_callcenter extends CI_Controller
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

        $this->load->model([
            'Cliente_callcenter_model'
        ]);

        $data = [];
        $nombreArchivo = 'Clientes_callcenter_' . rand();
        $esExcel = isset($_GET['_excel']) ? $_GET['_excel'] : false;

        foreach ($this->Cliente_callcenter_model->get_clientes_callcenter($_GET) as $key => $row) {
            $sedeKey = "{$row->nombre_sede} ({$row->alias_sede})";
            if (!isset($data[$sedeKey])) {
                $data[$sedeKey] = [
                    'nombre'  => $row->nombre_sede,
                    'alias'   => $row->alias_sede,
                    'detalle' => []
                ];
            }
            $data[$sedeKey]['detalle'][] = $row;
        }

        if ($esExcel) {
            $this->generar_excel($data, $nombreArchivo);
        } else {
            $this->generar_pdf($data, $nombreArchivo);
        }
    }

    private function generar_excel($data, $nombreArchivo)
    {
        $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
        $hojaResumen = $excel->getActiveSheet();
        $hojaResumen->setTitle('Clientes');

        $hojaResumen->setCellValue('A1', 'Reporte de Clientes');
        $hojaResumen->mergeCells('A1:F1');
        $hojaResumen->getStyle('A1:F1')->getFont()->setBold(true);
        $hojaResumen->getStyle('A1:F1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $hojaResumen->getStyle('A1:F1')->getFont()->setSize(16);

        $pos = 3;

        foreach ($data as $sede => $info) {

            $hojaResumen->setCellValue("B{$pos}", 'Sede:');
            $hojaResumen->setCellValue("C{$pos}", $info['nombre'] . ' (' . $info['alias'] . ')');
            $hojaResumen->mergeCells("C{$pos}:F{$pos}");
            $hojaResumen->getStyle("B{$pos}:F{$pos}")->getFont()->setBold(true);
            $hojaResumen->getStyle("B{$pos}:F{$pos}")->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
            $pos++;

            $hojaResumen->setCellValue('B' . $pos, 'No.');
            $hojaResumen->setCellValue('C' . $pos, 'Nombre');
            $hojaResumen->setCellValue('D' . $pos, 'Número Telefónico');
            $hojaResumen->setCellValue('E' . $pos, 'Dirección');
            $hojaResumen->setCellValue('F' . $pos, 'Nit');
            
            $hojaResumen->getStyle("B{$pos}:F{$pos}")->getFont()->setBold(true);
            $hojaResumen->getStyle("B{$pos}:F{$pos}")->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $hojaResumen->getStyle("B{$pos}:F{$pos}")->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFE5E5E5');
            $pos++;

            foreach ($info['detalle'] as $cliente) {
                $hojaResumen->setCellValue("B{$pos}", $cliente->cliente_master);
                $hojaResumen->setCellValue("C{$pos}", $cliente->nombre_cliente);
                $hojaResumen->setCellValue("D{$pos}", $cliente->telefono_cliente);
                $hojaResumen->setCellValue("E{$pos}", $cliente->direccion_cliente);
                $hojaResumen->setCellValue("F{$pos}", $cliente->nit_cliente);
                $hojaResumen->getStyle("B{$pos}:F{$pos}")->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $pos++;
            }

            $pos++;
        }

        foreach (range('A', 'F') as $col) {
            $hojaResumen->getColumnDimension($col)->setAutoSize(true);
        }

        header('Content-Type: application/vnd.ms-excel');
		header("Content-Disposition: attachment;filename={$nombreArchivo}.xlsx");
		header('Cache-Control: max-age=1');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
		header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
		header('Cache-Control: cache, must-revalidate');
		header('Pragma: public');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
        $writer->save('php://output');
    }

    private function generar_pdf($data, $nombreArchivo)
    {
        ini_set('pcre.backtrack_limit', '5000000');
		$pdf = new \Mpdf\Mpdf([
			'tempDir' => sys_get_temp_dir(),
			'format'  => 'A4'
		]);
		$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
		$pdf->WriteHTML($this->load->view('reporte/venta_callcenter/clientes_imprimir', ['data' => $data, 'params' => $_GET], true));
		$pdf->Output("{$nombreArchivo}.pdf", 'D');
    }
}