<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reporte_gk extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Catalogo_model',
            'Orden_gk_model',
            'Sede_model'
        ]);
        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);        
    }

    public function get_sedes()
    {
        $sedes = $this->Sede_model->buscar();
        $sedes = ordenar_array_objetos($sedes, 'nombre');
        $columna = 'G';
        foreach ($sedes as $sede) {
            $sede->col_ini = $columna;
            $columna++;
            $columna++;
            $sede->col_fin = $columna;
            $columna++;
        }
        return $sedes;
        // s$this->output->set_output(json_encode($sedes));
    }

    public function propinas()
    {
        $datos = [];

        if ($this->input->method() == 'post') {
            ini_set("pcre.backtrack_limit", "15000000");
            $fltr = json_decode(file_get_contents('php://input'), true);

            $fdel = formatoFecha($fltr['_fdel'], 2);
            $fal = formatoFecha($fltr['_fal'], 2);

            if (isset($fltr['_fdel'])) {
                $fltr['_fdel'] = ['DATE(fhcreacion)' => $fltr['_fdel']];
            }

            if (isset($fltr['_fal'])) {
                $fltr['_fal'] = ['DATE(fhcreacion)' => $fltr['_fal']];
            }

            $ordenesgk = $this->Orden_gk_model->buscar($fltr);
            $fltr = (object)$fltr;

            if (!isset($fltr->_porexpo)) {
                $fltr->_porexpo = 10;
            }

            $sedes = $this->get_sedes();

            foreach ($ordenesgk as $ogk) {
                $dato = new stdClass();
                $ort = json_decode($ogk->orden_rt);
                if (isset($ort->total_propina) && (float)$ort->total_propina > 0) {
                    $dato->orden = $ogk->orden_gk;
                    $dato->pedido = $ort->numero_orden;
                    $dato->fecha = date('d/m/Y H:i:s', strtotime($ogk->fhcreacion));
                    $dato->total = number_format($ort->total_orden, 2);
                    $dato->propina = number_format($ort->total_propina, 2);
                    $dato->expo = number_format((float)$ort->total_propina * (float)$fltr->_porexpo / 100, 2);
                    $dato->sedes = [];
                    $sedes_ort = $this->Orden_gk_model->get_distinct_sedes($ort->articulos);

                    foreach ($sedes_ort as $so) {
                        $dato->sedes[] = (object)[
                            'sede' => $so->sede,
                            'total' => 0,
                        ];
                    }

                    foreach ($ort->articulos as $art) {
                        foreach ($dato->sedes as $s) {
                            if ((int)$s->sede === (int)$art->atiende->sede) {
                                $s->total += (float)$art->total;
                            }
                        }
                    }

                    $datos[] = $dato;
                }
                $dato = null;
            }      
            
            $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
            $excel->getProperties()
                ->setCreator("Restouch")
                ->setTitle("Office 2007 xlsx Articulo")
                ->setSubject("Office 2007 xlsx Articulo")
                ->setKeywords("office 2007 openxml php");

            $excel->setActiveSheetIndex(0);
            $hoja = $excel->getActiveSheet();

            $hoja->getStyle('A:C')->getAlignment()->setHorizontal('center');
            $hoja->getStyle('A1:F6')->getFont()->setBold(true);
            $hoja->mergeCells('A1:F1');
            $hoja->mergeCells('A2:F2');
            $hoja->mergeCells('A3:F3');
            $hoja->getStyle('A1:F3')->getAlignment()->setHorizontal('left');
            $hoja->setCellValue('A1', 'DISTRIBUCIÓN DE PROPINAS');
            $hoja->setCellValue('A2', 'GHOST KITCHEN');
            $hoja->setCellValue('A3', "Del {$fdel} al {$fal}");

            $hoja->getStyle('A6:F6')->getAlignment()->setHorizontal('center');
            $hoja->getStyle('D')->getNumberFormat()->setFormatCode('0.00');
            $hoja->getStyle('E')->getNumberFormat()->setFormatCode('0.00');
            $hoja->getStyle('F')->getNumberFormat()->setFormatCode('0.00');
            $hoja->setCellValue('A6', 'Orden');
            $hoja->setCellValue('B6', 'Pedido');
            $hoja->setCellValue('C6', 'Fecha');
            $hoja->setCellValue('D6', 'Total');
            $hoja->setCellValue('E6', 'Propina');
            $hoja->setCellValue('F6', 'Expo');

            foreach ($sedes as $sede) {
                $cini = $sede->col_ini;
                $cfin = $sede->col_fin;
                $rangoTitulo = "{$cini}5:{$cfin}5";
                $rango = "{$cini}6:{$cfin}6";
                $hoja->getStyle($rangoTitulo)->getFont()->setBold(true);
                $hoja->getStyle($rango)->getFont()->setBold(true);
                $hoja->getStyle($rango)->getAlignment()->setHorizontal('center');
                $hoja->mergeCells($rangoTitulo);
                $hoja->getStyle($rangoTitulo)->getAlignment()->setHorizontal('center');
                $hoja->setCellValue("{$cini}5", $sede->nombre);
                $hoja->setCellValue("{$cini}6", 'Total');
                $cini++;
                $hoja->setCellValue("{$cini}6", 'Equitativo');
                $cini++;
                $hoja->setCellValue("{$cini}6", 'Porcentual');
            }

            $filaIni = 7;
            foreach ($datos as $dato) {
                $hoja->setCellValue("A{$filaIni}", $dato->orden);
                $hoja->setCellValue("B{$filaIni}", $dato->pedido);
                $hoja->setCellValue("C{$filaIni}", $dato->fecha);
                $hoja->setCellValue("D{$filaIni}", $dato->total);
                $hoja->setCellValue("E{$filaIni}", $dato->propina);
                $hoja->setCellValue("F{$filaIni}", $dato->expo);

                $sedesParticipantes = count($dato->sedes);
                foreach ($sedes as $sede) {
                    $cini = $sede->col_ini;
                    $totalSede = 0.00;
                    $equitativo = 0.00;
                    $porcentual = 0.00;
                    foreach ($dato->sedes as $ds) {
                        if ((int)$ds->sede === (int)$sede->sede) {
                            $totalSede = $ds->total;
                            $equitativo = ((float)$dato->propina - (float)$dato->expo) / $sedesParticipantes;
                            $porcentual = ((float)$dato->propina - (float)$dato->expo) * (((float)$ds->total * 100 / (float)$dato->total) / 100);
                            break;
                        } 
                    }
                    $hoja->getStyle("{$cini}{$filaIni}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("{$cini}{$filaIni}", $totalSede);
                    $cini++;
                    $hoja->getStyle("{$cini}{$filaIni}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("{$cini}{$filaIni}", $equitativo);
                    $cini++;                        
                    $hoja->getStyle("{$cini}{$filaIni}")->getNumberFormat()->setFormatCode('0.00');
                    $hoja->setCellValue("{$cini}{$filaIni}", $porcentual);
                }
                $filaIni++;
            }

            $colFinal = $sedes[count($sedes) - 1]->col_fin;
            $filaFinal = 7 + count($datos);

            $rango = "C{$filaFinal}";
            $hoja->getStyle($rango)->getFont()->setBold(true);
            $hoja->getStyle($rango)->getAlignment()->setHorizontal('right');
            $hoja->setCellValue($rango, 'Totales:');

            foreach(range('D', $colFinal) as $col) {
                $rango = "{$col}7:{$col}".($filaFinal - 1);
                $hoja->getStyle("{$col}{$filaFinal}")->getFont()->setBold(true);
                $hoja->getStyle("{$col}{$filaFinal}")->getNumberFormat()->setFormatCode('0.00');
                $hoja->setCellValue("{$col}{$filaFinal}", "=SUM({$rango})");
            }

            $hoja->getStyle("G5:{$colFinal}5")->getBorders()->getAllBorders()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

            $hoja->getStyle("A6:{$colFinal}".($filaFinal - 1))->getBorders()->getAllBorders()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

            $hoja->getStyle("C{$filaFinal}:{$colFinal}{$filaFinal}")->getBorders()->getAllBorders()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN)
                ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('Black'));

            foreach(range('A', $colFinal) as $col)
            {
                $hoja->getColumnDimension($col)->setAutoSize(true);
            }

            $hoja->setTitle("Distribución de propinas - GK");

            header("Content-Type: application/vnd.ms-excel");
            header("Content-Disposition: attachment;filename=DistPropGK.xlsx");
            header("Cache-Control: max-age=1");
            header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
            header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
            header("Cache-Control: cache, must-revalidate");
            header("Pragma: public");

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
            $writer->save("php://output");            
        }
    }
}
