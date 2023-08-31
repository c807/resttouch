<?php
defined('BASEPATH') or exit('No direct script access allowed');

class BodegaArticuloCosto extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'BodegaArticuloCosto_model',
        ]);

        $this->load->helper(['jwt', 'authorization']);
        $headers = $this->input->request_headers();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }

        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function guardar($id = '')
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $bac = new BodegaArticuloCosto_model($id);
            $req = json_decode(file_get_contents('php://input'), true);
            $datos['exito'] = $bac->guardar($req);
            if ($datos['exito']) {
                $datos['mensaje'] = 'Datos actualizados con éxito.';
                $datos['compra'] = $bac;
            } else {
                $datos['mensaje'] = implode('<br>', $bac->getMensaje());
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }

    public function buscar()
    {
        $datos = $this->BodegaArticuloCosto_model->filtrar($_GET);
        $this->output->set_output(json_encode($datos));
    }

    public function descargar_articulos_excel()
    {
        $datos = $this->BodegaArticuloCosto_model->get_articulos_excel($_GET);

        $excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
        $excel->getProperties()
            ->setCreator("RestTouch")
            ->setTitle("Office 2007 xlsx Egresos")
            ->setSubject("Office 2007 xlsx Egresos")
            ->setKeywords("office 2007 openxml php");


        $excel->setActiveSheetIndex(0);
        $hoja = $excel->getActiveSheet();
        $hoja->getProtection()->setSheet(true);
        $hoja->getProtection()->setPassword('OgaXE8Gin65tB07XJ6k85Bso8b3P6L');
        $excel->getDefaultStyle()->getProtection()->setLocked(false);
        $hoja->getProtection()->setInsertRows(true);

        $hoja->setCellValue('A1', 'Sede');
        $hoja->setCellValue('B1', 'Categoría');
        $hoja->setCellValue('C1', 'Subcategoría');
        $hoja->setCellValue('D1', 'Bodega');
        $hoja->setCellValue('E1', 'Nombre de Bodega');
        $hoja->setCellValue('F1', 'Artículo');
        $hoja->setCellValue('G1', 'Nombre del Artículo');
        $hoja->setCellValue('H1', 'Presentación');
        $hoja->setCellValue('I1', 'Costo Unitario');
        $hoja->setCellValue('J1', 'Existencia');
        $hoja->getStyle('A1:J1')->getFont()->setBold(true);
        $hoja->getStyle('A1:J1')->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);

        $fila = 2;
        foreach ($datos as $d) {
            $hoja->setCellValue("A{$fila}", $d->descripcion_sede);
            $hoja->setCellValue("B{$fila}", $d->descripcion_categoria);
            $hoja->setCellValue("C{$fila}", $d->descripcion_subcategoria);
            $hoja->setCellValue("D{$fila}", (int)$d->bodega);
            $hoja->setCellValue("E{$fila}", $d->descripcion_bodega);
            $hoja->setCellValue("F{$fila}", (int)$d->articulo);
            $hoja->setCellValue("G{$fila}", $d->descripcion_articulo);
            $hoja->setCellValue("H{$fila}", $d->descripcion_presentacion);
            $hoja->getStyle("A{$fila}:H{$fila}")->getProtection()->setLocked(\PhpOffice\PhpSpreadsheet\Style\Protection::PROTECTION_PROTECTED);
            $hoja->setCellValue("I{$fila}", (float)$d->costo_unitario);
            $hoja->getStyle("I{$fila}")->getNumberFormat()->setFormatCode('0.00000');
            $hoja->setCellValue("J{$fila}", (float)$d->existencia);
            $hoja->getStyle("J{$fila}")->getNumberFormat()->setFormatCode('0.00');
            $fila++;
        }

        $hoja->getStyle('D')->getAlignment()->setHorizontal('right');
        $hoja->getStyle('F')->getAlignment()->setHorizontal('right');
        $hoja->getStyle('I')->getAlignment()->setHorizontal('right');
        $hoja->getStyle('J')->getAlignment()->setHorizontal('right');
        $hoja->setAutoFilter('A1:J1');

        foreach (range('A', 'J') as $col) {
            $hoja->getColumnDimension($col)->setAutoSize(true);
        }

        $hoja->setTitle("Artículos");

        header("Content-Type: application/vnd.ms-excel");
        header("Content-Disposition: attachment;filename=Articulos_costo_" . date('YmdHis') . ".xlsx");
        header("Cache-Control: max-age=1");
        header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
        header("Cache-Control: cache, must-revalidate");
        header("Pragma: public");

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
        $writer->save("php://output");
    }

    private function upload_config($path)
    {
        if (!is_dir($path))
            mkdir($path, 0777, TRUE);
        $config['upload_path']         = $path;
        $config['allowed_types']     = 'csv|CSV|xlsx|XLSX|xls|XLS';
        $config['max_filename']         = '255';
        $config['encrypt_name']     = TRUE;
        $config['max_size']         = 4096;
        $this->load->library('upload', $config);
    }

    public function cargar_articulos_excel()
    {

        set_time_limit(0);
        ini_set('memory_limit', -1);
        $path = APPPATH . 'documentos/';
        $json = ['exito' => true, 'errores' => []];
        $this->upload_config($path);
        if (!$this->upload->do_upload('file')) {
            $json['exito'] = false;
            $json['mensaje'] = $this->upload->display_errors();
        } else {
            $file_data = $this->upload->data();
            $file_name = $path . $file_data['file_name'];
            $arr_file = explode('.', $file_name);
            $extension = end($arr_file);
            if ('csv' == $extension) {
                $reader = new \PhpOffice\PhpSpreadsheet\Reader\Csv();
            } else {
                $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
            }
            try {
                $excel = $reader->load($file_name);
                $excel->setActiveSheetIndex(0);
                $sheet = $excel->getActiveSheet();
                $sheet_data = $sheet->toArray();
                
                foreach ($sheet_data as $row => $col) {
                    if ($row != 0) {
                        if ((int)$col[3] > 0 && (int)$col[5] > 0) {
                            $params = [
                                'bodega' => (int)$col[3],
                                'articulo' => (int)$col[5],
                                'cuc_ingresado' => (float)$col[8],
                                'cp_ingresado' => (float)$col[8],
                                'existencia_ingresada' => (float)$col[9],
                                'esajuste' => 1
                            ];
                            $exito = $this->BodegaArticuloCosto_model->ajustar_costo_promedio_existencia($params);
                            if (!$exito) {
                                $json['errores'][] = "Error al procesar la fila {$row}, artículo: {$col[6]} ({$col[5]}).";
                            }
                        }
                    } else {
                        $titulos = [
                            'Sede', 'Categoría', 'Subcategoría', 'Bodega', 'Nombre de Bodega', 'Artículo',
                            'Nombre del Artículo', 'Presentación', 'Costo Unitario', 'Existencia'
                        ];
                        foreach ($col as $titulo) {
                            if (!in_array($titulo, $titulos)) {
                                $json['exito'] = false;
                                break;
                            }
                        }
                        if (!$json['exito']) {
                            $json['mensaje'] = 'Este no es el formato de archivo correcto. Por favor descargue el formato correcto e intente de nuevo.';
                            break;
                        }
                    }
                }

                if (file_exists($file_name)) {
                    unlink($file_name);
                }
                if ($json['exito']) {
                    $json['mensaje'] = 'El archivo fue procesado. Por favor revise los cambios.';
                }
            } catch (Exception $e) {
                $json['exito'] = false;
                $json['mensaje'] = $e->getMessage();
            }
        }
        $this->output->set_output(json_encode($json));
    }

    public function get_cargas_realizadas()
    {
        $datos = $this->BodegaArticuloCosto_model->get_cargas_realizadas();
        $this->output->set_output(json_encode($datos));
    }

    public function get_detalle_carga_realizada()
    {
        $datos = $this->BodegaArticuloCosto_model->get_detalle_carga_realizada($_GET);
        $this->output->set_output(json_encode($datos));
    }
}

/* End of file Compra.php */
/* Location: ./application/wms/controllers/Compra.php */