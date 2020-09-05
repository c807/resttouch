<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tablero extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model("Tablero_model");
		$this->output
		->set_content_type("application/json", "UTF-8");
	}

	public function index()
	{
		die("Forbidden");
	}

	public function get_datos()
	{
		$res = ["exito" => false];

		if ($this->input->get('fdel') && $this->input->get('fal')) {
			
			$datos = $this->Tablero_model->getServiciosFacturados($_GET);
			$dias = [];
			$total = 0;

			foreach ($datos as $key => $value) {
				if (isset($dias[$value->fecha_factura])) {
					$dias[$value->fecha_factura] += round($value->total, 2);
				} else {
					$dias[$value->fecha_factura] = round($value->total, 2);
				}
				
				$total += $value->total;
			}

			$res["exito"] = true;
			$res["datos"] = $datos;
			$res["dias"] = $dias;
			$res["min"] = number_format(min($dias), 2);
			$res["max"] = number_format(max($dias), 2);
			$res["cantidad"] = count($dias);
			$res["media"] = number_format(($total/$res["cantidad"]), 2);
			$res["total"] = number_format($total, 2);
		}

		$this->output
		->set_output(json_encode($res));
	}

	public function get_datos_graficas_ventas()
	{
		$res = ["exito" => false];

		if ($this->input->get('fdel') && $this->input->get('fal'))
		{
			$res['pordia'] = $this->Tablero_model->getVentasPorDia($_GET);
			$res['porcategoria'] = $this->Tablero_model->getVentasPorCategoria($_GET);
			$res['porturno'] = $this->Tablero_model->getVentasPorTurno($_GET);
			$res['pormesero'] = $this->Tablero_model->getVentasPorMesero($_GET);

			$res["exito"] = true;
			$res['mensaje'] = 'Datos generados con éxito.';
		} else {
			$res['mensaje'] = 'Por favor ingrese los datos para generar el reporte.';
		}

		$this->output->set_output(json_encode($res));
	}
}