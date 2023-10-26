<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Bitacora extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Bitacora_model', 'Sede_model']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function get_tablas_bitacora()
	{
		$this->output->set_output(json_encode($this->Bitacora_model->get_tablas_bitacora()));
	}

	public function test_reporte()
	{
		$this->output->set_output(json_encode($this->Bitacora_model->reporte($_GET)));
	}

	public function reporte()
	{
		$_POST = json_decode(file_get_contents('php://input'), true);
		if (!isset($_POST['sede'])) {
			$_POST['sede'] = $this->data->sede;
		}

		$datos = $this->Bitacora_model->reporte($_POST);

		$lstSedes = explode(',', $_POST['sede']);
		$nombreSedes = '';
		foreach ($lstSedes as $s) {
			$sede = new Sede_model($s);
			if ($nombreSedes !== '') {
				$nombreSedes .= ', ';
			}
			$nombreSedes .= "{$sede->nombre} ({$sede->alias})";
		}

		$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
		$excel->getProperties()
			->setCreator('Restouch')
			->setTitle('Office 2007 xlsx Bitacora')
			->setSubject('Office 2007 xlsx Bitacora')
			->setKeywords('office 2007 openxml php');

		$excel->setActiveSheetIndex(0);
		$hoja = $excel->getActiveSheet();

		/*Encabezado*/
		$hoja->setCellValue('A1', 'BITÁCORA');
		$hoja->setCellValue('A2', 'FECHA: ' . Hoy(5));
		$hoja->setCellValue('A3', 'Sede' . (count($lstSedes) === 1 ? '' : 's') . ': ' . $nombreSedes);

		$parametros = '';
		if (isset($_POST['fdel']) && !empty($_POST['fdel'])) {
			$parametros .= 'Del: ' . formatoFecha($_POST['fdel'], 2);
		}

		if (isset($_POST['fal']) && !empty($_POST['fal'])) {
			if ($parametros !== '') {
				$parametros .= ' ';
			}
			$parametros .= 'Al: ' . formatoFecha($_POST['fal'], 2);
		}

		if (isset($_POST['tabla']) && !empty($_POST['tabla'])) {
			if ($parametros !== '') {
				$parametros .= ' ';
			}
			$parametros .= "Tabla: {$_POST['tabla']}";
		}

		if (isset($_POST['usrname']) && !empty($_POST['usrname'])) {
			if ($parametros !== '') {
				$parametros .= ' ';
			}
			$parametros .= "Usuario: {$_POST['usrname']}";
		}

		if (isset($_POST['ultimos']) && !empty($_POST['ultimos'])) {
			if ($parametros !== '') {
				$parametros .= ' ';
			}
			$parametros .= "Últimos {$_POST['ultimos']} registros.";
		}

		if (!empty($parametros)) {
			$hoja->setCellValue('A4', $parametros);
		}

		$hoja->getStyle('A1:C4')->getFont()->setBold(true);

		$hoja->mergeCells('A1:H1');
		$hoja->mergeCells('A2:H2');
		$hoja->mergeCells('A3:H3');
		$hoja->mergeCells('A4:H4');

		$hoja->setCellValue('A6', 'Bitácora');
		$hoja->setCellValue('B6', 'Sede');
		$hoja->setCellValue('C6', 'Usuario');
		$hoja->setCellValue('D6', 'Acción');
		$hoja->setCellValue('E6', 'Fecha');
		$hoja->setCellValue('F6', 'Tabla');
		$hoja->setCellValue('G6', 'Registro');
		$hoja->setCellValue('H6', 'Comentario');

		$hoja->getStyle('A6:H6')->getFont()->setBold(true);

		$fila = 7;
		foreach ($datos as $data) {
			$hoja->setCellValue("A{$fila}", $data->bitacora);
			$hoja->setCellValue("B{$fila}", $data->sede);
			$hoja->setCellValue("C{$fila}", $data->usuario);
			$hoja->setCellValue("D{$fila}", $data->accion);
			$hoja->setCellValue("E{$fila}", $data->fecha);
			$hoja->setCellValue("F{$fila}", $data->tabla);
			$hoja->setCellValue("G{$fila}", $data->registro);
			$hoja->setCellValue("H{$fila}", $data->comentario);
			$fila++;
		}
		$fila--;

		foreach (range('A', 'G') as $col) {
			$hoja->getColumnDimension($col)->setAutoSize(true);
		}

		$hoja->setAutoFilter('B6:F6');
		$hoja->getStyle("A6:H{$fila}")->getAlignment()->setVertical('top');
		$hoja->getColumnDimension('H')->setAutoSize(false);
		$hoja->getColumnDimension('H')->setWidth(85);
		$hoja->getStyle("H6:H{$fila}")->getAlignment()->setWrapText(true);

		header('Content-Type: application/vnd.ms-excel');
		header('Content-Disposition: attachment;filename=Bitacora.xlsx');
		header('Cache-Control: max-age=1');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GTM');
		header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GTM');
		header('Cache-Control: cache, must-revalidate');
		header('Pragma: public');

		$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
		$writer->save('php://output');
	}
}
