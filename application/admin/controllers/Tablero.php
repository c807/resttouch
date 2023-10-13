<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tablero extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		set_database_server();
		$this->load->model(['Tablero_model', 'Configuracion_model']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

	public function index()
	{
		die('Forbidden');
	}

	private function getEsRangoPorFechaDeTurno()
	{
		$config = $this->Configuracion_model->buscar_configuraciones();
		return get_configuracion($config, 'RT_REPORTES_FECHAS_TURNOS', 3);
	}

	public function get_datos()
	{
		$res = ['exito' => false];

		if ($this->input->get('fdel') && $this->input->get('fal')) {

			if (isset($_GET['sede']) && $_GET['sede'] == 0) {
				unset($_GET['sede']);
			}

			$sinFactura = $this->Tablero_model->getServiciosSinFactura($_GET);
			$conFactura = $this->Tablero_model->getServiciosFacturados($_GET);

			$datos = array_merge($sinFactura, $conFactura);
			$dias = [];
			$total = 0;
			$semana = [];
			$horario = [];
			$producto = [];
			$domicilio = [];
			$mesero = [];
			$sede = [];
			$wlista = [];

			$fdel = new DateTime($_GET['fdel']);
			$fal = new DateTime($_GET['fal']);

			$period = new DatePeriod($fdel, new DateInterval('P1D'), $fal);

			foreach ($period as $row) {
				$idx = $row->format('Y') . '-' . (int)$row->format('W');

				if (!isset($wlista[$idx])) {
					$wlista[$idx] = 0;
				}

				$dias[$row->format('Y-m-d')] = 0;
			}

			$dias[$_GET['fal']] = 0;

			foreach ($datos as $key => $value) {
				if (!isset($semana[$value->dia])) {
					$semana[$value->dia] = 0;
				}

				if (!isset($horario[$value->hora])) {
					$horario[$value->hora] = 0;
				}

				if (!isset($producto[$value->descripcion])) {
					$producto[$value->descripcion] = 0;
				}

				if (!isset($domicilio[$value->domicilio])) {
					$domicilio[$value->domicilio] = 0;
				}

				if (!isset($sede[$value->sede])) {
					$sede[$value->sede] = 0;
				}

				if (!isset($mesero[$value->nombre_mesero])) {
					$mesero[$value->nombre_mesero] = 0;
				}

				if (!isset($wlista[$value->semana])) {
					$wlista[$value->semana] = 0;
				}

				$dias[$value->fecha_factura] += $value->total;
				$semana[$value->dia] += $value->total;
				$horario[$value->hora] += $value->total;
				$producto[$value->descripcion] += $value->total;
				$domicilio[$value->domicilio] += $value->total;
				$sede[$value->sede] += $value->total;
				$mesero[$value->nombre_mesero] += $value->total;
				$wlista[$value->semana] += $value->total;

				$total += $value->total;
			}

			ksort($semana);
			ksort($horario);
			ksort($wlista);

			arsort($producto);
			arsort($sede);
			arsort($mesero);

			if (count($producto) > 7) {
				$producto = array_slice($producto, 0, 7, true);
			}

			$interval = $fdel->diff($fal);
			$diferencia = (int)$interval->format('%a') + 1;

			if ($diferencia > 30) {
				$udias = array_slice($dias, -30, 30, true);
				$res['ultimos_dias'] = 30;
			} else {
				$udias = $dias;
				$res['ultimos_dias'] = $diferencia;
			}

			$dwl = graficaDatasets($wlista, false);
			$dwl->borderColor = randomColor();
			$dwl->fill = false;

			$res['line_wlista'] = $dwl;

			$das = graficaDatasets($udias, false);
			$das->borderColor = randomColor();
			$das->fill = false;

			$res['line_dias'] = $das;

			$res['pie_semana'] = graficaDatasets($semana);
			$res['pie_domicilio'] = graficaDatasets($domicilio);
			$res['bar_horario'] = graficaDatasets($horario);
			$res['bar_popular'] = graficaDatasets($producto);
			$res['bar_sede'] = graficaDatasets($sede);
			$res['bar_mesero'] = graficaDatasets($mesero);

			$res['datos'] = $datos;

			$res['estadistica'] = [
				['Días', count($dias)],
				['Mínimo', number_format(min($dias), 2)],
				['Máximo', number_format(max($dias), 2)],
				['Media', number_format(($total / count($dias)), 2)],
				['TOTAL', number_format($total, 2)]
			];

			$res['exito'] = true;
		}

		$this->output->set_output(json_encode($res));
	}

	public function get_datos_graficas_ventas()
	{
		$res = ['exito' => false];
		$datos = [];
		if ($this->input->get('fdel') && $this->input->get('fal')) {
			$args = $_GET;
			$args['_rango_turno'] = $this->getEsRangoPorFechaDeTurno();

			$datos['pordia'] = $this->Tablero_model->getVentasPorDia($args);
			$datos['porcategoria'] = $this->Tablero_model->getVentasPorCategoria($args);
			$datos['porturno'] = $this->Tablero_model->getVentasPorTurno($args);
			$datos['pormesero'] = $this->Tablero_model->getVentasPorMesero($args);

			$res['pordia'] = $this->Tablero_model->agruparDatos(
				$datos['pordia'],
				verDato($args, '_grupo', 1)
			);
			$res['porcategoria'] = $this->Tablero_model->agruparDatos(
				$datos['porcategoria'],
				verDato($args, '_grupo', 1)
			);
			$res['porturno'] = $this->Tablero_model->agruparDatos(
				$datos['porturno'],
				verDato($args, '_grupo', 1)
			);
			$res['pormesero'] = $this->Tablero_model->agruparDatos(
				$datos['pormesero'],
				verDato($args, '_grupo', 1)
			);



			$res['exito'] = true;
			$res['mensaje'] = 'Datos generados con éxito.';
		} else {
			$res['mensaje'] = 'Por favor ingrese los datos para generar el reporte.';
		}

		$this->output->set_output(json_encode($res));
	}

	public function get_metabase_url()
	{
		$params = [];
		// $config = $this->Configuracion_model->buscar();
		$config = $this->Configuracion_model->buscar_configuraciones();
		$params['RT_METABASE_SITE_URL'] = get_configuracion($config, 'RT_METABASE_SITE_URL');
		$params['RT_METABASE_SECRET_KEY'] = get_configuracion($config, 'RT_METABASE_SECRET_KEY');
		$cuerpo = json_decode(file_get_contents('php://input'));
		$params['tipo'] = $cuerpo->tipo;
		$params['payload'] = $cuerpo->payload;
		$res = $this->Tablero_model->sign_url_for_metabase($params);
		$this->output->set_output(json_encode(['url' => $res]));
	}

	public function get_datos_wms()
	{
		$res = ['exito' => false];

		if ($this->input->get('fdel') && $this->input->get('fal')) {
			if (isset($_GET['sede']) && $_GET['sede'] == 0) {
				unset($_GET['sede']);
			}

			$res['datos'] = $this->Tablero_model->get_movimientos_wms($_GET);
			$res['exito'] = true;
		}

		$this->output->set_output(json_encode($res));
	}
}
