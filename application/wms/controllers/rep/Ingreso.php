<?php
defined('BASEPATH') OR exit('No direct script access allowed');
ini_set('memory_limit', -1);
ini_set('pcre.backtrack_limit', 100000000);
set_time_limit(0);

class Ingreso extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model('reporte/Reporte_model');
		$this->load->library('WmsRepIngreso');
	}

	public function generar_detalle()
	{
		$data["exito"] = false;
		$args = json_decode(file_get_contents("php://input"));

		$headerTipo = $this->input->get_request_header("Accept");

		if (!empty($headerTipo)) {
			$tipo = str_replace("application/", "", strtolower($headerTipo));
			$lista = $this->Reporte_model->getIngresoDetalle($args);

			$lib = new WmsRepIngreso();
			$lib->setLista($lista);
			$lib->setArgs($args);

			if (isset($args->_excel)) {

				if ($args->_excel) {
					$xls = $lib->generarXls();
					header("Content-Type: application/vnd.ms-excel");
					header("Content-Disposition: attachment;filename=DetalleIngreso.xls");
					header("Cache-Control: max-age=1");
					header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
					header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
					header("Cache-Control: cache, must-revalidate");
					header("Pragma: public");

					$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($xls);
					$writer->save("php://output");
					die;
				} else {
					$pdf = $lib->generarPdf();
					$pdf->Output("Detalle de ingreso.pdf", "D");
					die;
				}
			}else{
				$data["exito"] = true;
				$data["lista"] = $lista;
			}

		} else {
			$data["mensaje"] = "No se indico el formato de respuesta.";
		}
		$this->output
			 ->set_content_type('application/json')
			 ->set_output(json_encode($data));
	}
}

/* End of file Ingreso.php */
/* Location: ./application/wms/controllers/rep/Ingreso.php */