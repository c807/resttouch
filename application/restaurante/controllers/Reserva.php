<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Reserva extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			'Reserva_model', 'Dreserva_model', 'Mesa_model', 'Tarifa_reserva_model',
			'Comanda_model', 'Cuenta_model', 'Dcomanda_model', 'Articulo_model',
			'Receta_model', 'Dcuenta_model', 'Sede_model'
		]);
		$this->output->set_content_type('application/json', 'UTF-8');
		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}
	}

	public function guardar($id = null)
	{
		$rsrv = new Reserva_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$hayCruceDeFechas = $this->Reserva_model->hayCruceDeFechas($req['mesa'], $req['fecha_del'], $req['fecha_al'], (int)$req['reserva']);
			if ($hayCruceDeFechas) {
				$datos['mensaje'] = 'Ya existe una reservación en estas fechas. Por favor cambie las fechas e intente de nuevo.';
			} else {
				$continuar = true;
				$cmdAbierta = 0;
				if ((int)$req['estatus_reserva'] === 2) {
					$cmdAbierta = $rsrv->get_numero_comanda_reserva(null, true);
					$mesa = new Mesa_model($req['mesa']);
					$cmdAbiertaDeMesa = $mesa->get_comanda(['estatus' => 1]);
					$continuar = (int)$cmdAbierta === 0 && !$cmdAbiertaDeMesa;
				}

				if ($continuar) {
					$datos['exito'] = $rsrv->guardar($req);
					if ($datos['exito']) {
						$rsrv->generaDetalle();
						$habitacion = new Mesa_model($rsrv->mesa);
						$rsrv->area = $habitacion->area;
						$rsrv->numero_mesa = $habitacion->numero;
						$datos['reserva'] = $rsrv;
						$datos['mensaje'] = 'Datos actualizados con éxito.';
					} else {
						$datos['mensaje'] = $rsrv->getMensaje();
					}
				} else {
					$datos['mensaje'] = 'Esta habitación tiene una comanda abierta. Debe cerrarla primero para poder hacer check in.';
				}
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}

	public function buscar()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$vigentes = !isset($req['_vigentes']) || (int)$req['_vigentes'] === 0;
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$dias = [1 => 'monDate', 2 => 'marDate', 3 => 'mierDate', 4 => 'jueDate', 5 => 'vierDate', 6 => 'sabdDate', 7 => 'domDate'];
			$fecha = DateTime::createFromFormat('Y-m-d', $req['fecha']);
			if (isset($req['fecha']) && $fecha && $fecha->format('Y-m-d') === $req['fecha'] && (int)$fecha->format('w') === 1) {
				$datos['reservas'] = [];
				for ($i = 0; $i <= 6; $i++) {
					$datos['reservas'][$dias[(int)$fecha->format('N')]] = $this->Reserva_model->get_reservas($fecha->format('Y-m-d'), $vigentes);
					$fecha->modify('+1 day');
				}
				$datos['exito'] = true;
				$datos['mensaje'] = 'Reservas recuperadas con éxito.';
			} else {
				$datos['mensaje'] = 'Por favor envíe una fecha válida que sea lunes.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function simple_search()
	{
		$datos = $this->Reserva_model->buscar($_GET);
		foreach ($datos as $rsrv) {
			$habitacion = new Mesa_model($rsrv->mesa);
			$rsrv->area = $habitacion->area;
			$rsrv->numero_mesa = $habitacion->numero;
			$rsrv->etiqueta_mesa = $habitacion->etiqueta;
			$rsrv->comanda = $this->Reserva_model->get_numero_comanda_reserva($rsrv->reserva, true);
		}
		$this->output->set_output(json_encode($datos));
	}

	public function agregar_cobro_habitacion()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post' && isset($req['reserva'])) {
			$rsvr = new Reserva_model($req['reserva']);
			$numero_comanda = $rsvr->get_numero_comanda_reserva();
			if ((int)$numero_comanda > 0) {
				$cta = $this->Cuenta_model->buscar(['comanda' => $numero_comanda, 'numero' => 1, 'cerrada' => 0, '_uno' => true]);
				if ($cta && (int)$cta->cuenta > 0) {
					$tarifa = new Tarifa_reserva_model($rsvr->tarifa_reserva);
					if ($tarifa && (int)$tarifa->articulo > 0) {
						$comanda = new Comanda_model($numero_comanda);
						$cuenta = new Cuenta_model($cta->cuenta);
						$monto = (float)$tarifa->monto;
						$adultos_extras = (int)$rsvr->cantidad_adultos - (int)$tarifa->cantidad_adultos;
						$monto_adulto_adicional = $adultos_extras > 0 ? ($adultos_extras * (float)$tarifa->monto_adicional_adulto) : 0.0;
						$menores_extras = (int)$rsvr->cantidad_menores - (int)$tarifa->cantidad_menores;
						$monto_menor_adicional = $menores_extras > 0 ? ($menores_extras * (float)$tarifa->monto_adicional_menor) : 0.0;
						$monto += $monto_adulto_adicional + $monto_menor_adicional;

						$inicia = DateTime::createFromFormat('Y-m-d', $rsvr->fecha_del);
						$fin  = DateTime::createFromFormat('Y-m-d', $rsvr->fecha_al);
						$noches = abs((int)$fin->diff($inicia)->format('%a')) + 1;
						$noches = $noches === 0 ? 1 : $noches;

						$monto = $noches * $monto;

						$detalle_comanda = [
							'articulo' => $tarifa->articulo, 'cantidad' => 1, 'precio' => $monto, 'impreso' => 1, 'total' => $monto
						];

						$det = $comanda->guardarDetalle($detalle_comanda);
						if ($det) {
							$cuenta->guardarDetalle(['detalle_comanda' => $det->detalle_comanda]);
							$rsvr->guardar(['cobradoencomanda' => 1]);
							$datos['exito'] = true;
							$datos['mensaje'] = 'Cobro agregado a la comanda de la reserva con éxito.';
						} else {
							$datos['mensaje'] = implode(',', $comanda->getMensaje());
						}
					} else {
						$datos['mensaje'] = 'No se ha asociado un artículo para la tarifa asignada a la reserva.';
					}
				} else {
					$datos['mensaje'] = 'Todavía no se ha generado una cuenta para la comanda de esta reserva.';
				}
			} else {
				$datos['mensaje'] = 'Todavía no se ha generado una comanda para esta reserva.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function cambiar_habitacion()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post' && isset($req['reserva'])) {
			$rsvr = new Reserva_model($req['reserva']);
			if (in_array((int)$rsvr->estatus_reserva, array(1, 2))) {
				$hayCruceDeFechas = $this->Reserva_model->hayCruceDeFechas($req['mesa_destino'], $rsvr->fecha_del, $rsvr->fecha_al, (int)$req['reserva']);
				if (!$hayCruceDeFechas) {
					if ((int)$rsvr->estatus_reserva === 1) {
						$datos['exito'] = $rsvr->guardar(['mesa' => $req['mesa_destino']]);
						if ($datos['exito']) {
							$datos['mensaje'] = 'Cambio de habitación realizado con éxito.';
						} else {
							$datos['mensaje'] = implode(',', $rsvr->getMensaje());
						}
					} else if ((int)$rsvr->estatus_reserva === 2) {
						$cmdAbierta = $rsvr->get_numero_comanda_reserva(null, true);
						if ((int)$cmdAbierta > 0) {
							$cmd = new Comanda_model($cmdAbierta);
							$mesaDestino = new Mesa_model($req['mesa_destino']);
							$mesaOrigen = new Mesa_model($rsvr->mesa);

							$mesaDestino->guardar(['estatus' => 2]);
							$cmd->trasladar_mesa($req['mesa_destino'], $cmdAbierta);
							$mesaOrigen->guardar(['estatus' => 1]);
							$datos['exito'] = $rsvr->guardar(['mesa' => $req['mesa_destino']]);

							if ($datos['exito']) {
								$datos['mensaje'] = 'Cambio de habitación realizado con éxito.';
							} else {
								$datos['mensaje'] = implode(',', $rsvr->getMensaje());
							}
						} else {
							$datos['mensaje'] = 'No hay comanda abierta para esta habitación. Por favor revise la información.';
						}
					}
				} else {
					$datos['mensaje'] = 'Ya hay una reservación para esas fechas. Por favor cancélela o asigne otra habitación.';
				}
			} else {
				$datos['mensaje'] = 'La reservación debe estar en estatus de RESERVADA o CHECK-IN para poder cambiar de habitación.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));
	}

	public function info_reserva($id)
	{
		$datos = ['exito' => false];
		if (!empty($id)) {
			$datos['exito'] = true;
			$datos['reserva'] = $this->Reserva_model->get_info_reserva($id);
		}
		$this->output->set_output(json_encode($datos));
	}

	private function getResumenReservablesHistorial($reservas, $topN = 0)
	{
		$cantidadReservas = count($reservas);
		$reservables = [];
		foreach ($reservas as $reserva) {
			$existe = false;
			$i = null;
			foreach ($reservables as $key => $reservable) {
				if ((int)$reservable['idreservable'] === (int)$reserva->idmesa) {
					$i = (int)$key;
					$existe = true;
					break;
				}
			}

			if ($existe) {
				$reservables[$i]['cantidad']++;
				$reservables[$i]['porcentaje'] = round($reservables[$i]['cantidad'] * 100 / $cantidadReservas, 2);
				$reservables[$i]['orderby'] = "{$reservables[$i]['cantidad']}-{$reservables[$i]['reservable']}";
			} else {
				$reservables[] = [
					'idreservable' => (int)$reserva->idmesa,
					'reservable' => "{$reserva->area} - {$reserva->reservable}",
					'cantidad' => 1,
					'porcentaje' => round(100 / $cantidadReservas, 2),
					'orderby' => "1-{$reserva->area}-{$reserva->reservable}"
				];
			}
		}

		$reservables = ordenar_array_objetos($reservables, 'orderby', 2, 'desc');

		return $topN === 0 ? $reservables : array_slice($reservables, 0, $topN);
	}

	private function getResumenClienteHistorial($reservas, $topN = 0)
	{
		$cantidadReservas = count($reservas);
		$clientes = [];
		foreach ($reservas as $reserva) {
			$existe = false;
			$i = null;
			foreach ($clientes as $key => $reservable) {
				if ((int)$reservable['idcliente'] === (int)$reserva->idcliente) {
					$i = (int)$key;
					$existe = true;
					break;
				}
			}

			if ($existe) {
				$clientes[$i]['cantidad']++;
				$clientes[$i]['porcentaje'] = round($clientes[$i]['cantidad'] * 100 / $cantidadReservas, 2);
				$clientes[$i]['orderby'] = "{$clientes[$i]['cantidad']}-{$clientes[$i]['cliente']}";
			} else {
				$clientes[] = [
					'idcliente' => (int)$reserva->idcliente,
					'cliente' => $reserva->cliente,
					'cantidad' => 1,
					'porcentaje' => round(100 / $cantidadReservas, 2),
					'orderby' => "1-{$reserva->cliente}"
				];
			}
		}

		$clientes = ordenar_array_objetos($clientes, 'orderby', 2, 'desc');

		return $topN === 0 ? $clientes : array_slice($clientes, 0, $topN);
	}

	public function historial_reservas()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post' && isset($req['fdel'])  && isset($req['fal'])) {
			$topN = 0;
			if (isset($req['topn']) && (int)$req['topn'] > 0) {
				$topN = (int)$req['topn'];
			}

			if (!isset($req['sede']) || (int)$req['sede'] === 0) {
				$req['sede'] = (int)$this->data->sede;
			}

			$sede = new Sede_model($req['sede']);
			$datos['sede'] = "{$sede->nombre} ($sede->alias)";
			$empresa = $sede->getEmpresa();
			$datos['empresa'] = $empresa->nombre;
			$datos['fdel'] = formatoFecha($req['fdel'], 2);
			$datos['fal'] = formatoFecha($req['fal'], 2);
			$datos['topn'] = $topN;

			$historial = $this->Reserva_model->get_historial_reservas($req);
			$datos['resumen_reservables'] = $this->getResumenReservablesHistorial($historial, $topN);
			$datos['resumen_clientes'] = $this->getResumenClienteHistorial($historial, $topN);
			$datos['detalle'] = $historial;
			$datos['exito'] = true;
			
			if (verDato($req, '_excel')) {
				$this->output->set_content_type('application/vnd.ms-excel');
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
				\PhpOffice\PhpSpreadsheet\Cell\Cell::setValueBinder(new \PhpOffice\PhpSpreadsheet\Cell\AdvancedValueBinder());
				$excel->getProperties()
					->setCreator("Restouch")
					->setTitle("Office 2007 xlsx Historia_Reservas")
					->setSubject("Office 2007 xlsx Historia_Reservas")
					->setKeywords("office 2007 openxml php");

				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();

				$hoja->setCellValue('A1', $datos['empresa']);
				$hoja->mergeCells('A1:G1');
				$hoja->setCellValue('A2', $datos['sede']);
				$hoja->mergeCells('A2:G2');
				$hoja->setCellValue('A3', "Del: {$datos['fdel']} al {$datos['fal']}");
				$hoja->mergeCells('A3:G3');
				$hoja->setCellValue('A4', 'Total de reservas en el rango: '.count($datos['detalle']));
				$hoja->mergeCells('A4:G4');
				if ($datos['topn'] > 0) {
					$hoja->setCellValue('A5', "Se muestra el top {$datos['topn']}");
					$hoja->mergeCells('A5:G5');
				}
				$hoja->getStyle('A1:A5')->getFont()->setBold(true);				

				$fila = $datos['topn'] > 0 ? 7 : 6;
				$hoja->setCellValue("A{$fila}", 'RESERVABLES');
				$hoja->mergeCells("A{$fila}:C{$fila}");
				$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');
				$fila++;
				$hoja->setCellValue("A{$fila}", 'Reservable');
            	$hoja->setCellValue("B{$fila}", 'Cantidad');
            	$hoja->setCellValue("C{$fila}", 'Porcentaje');
				$hoja->getStyle("A{$fila}:C{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("B{$fila}:C{$fila}")->getAlignment()->setHorizontal('right');
				$fila++;
				foreach($datos['resumen_reservables'] as $rr) {
					$hoja->setCellValue("A{$fila}", $rr['reservable']);
            		$hoja->setCellValue("B{$fila}", $rr['cantidad']);
            		$hoja->setCellValue("C{$fila}", $rr['porcentaje']);
					$hoja->getStyle("B{$fila}:C{$fila}")->getNumberFormat()->setFormatCode('0.00');
					$hoja->getStyle("B{$fila}:C{$fila}")->getAlignment()->setHorizontal('right');
					$fila++;					
				}
				$fila++;
				$hoja->setCellValue("A{$fila}", 'CLIENTES');
				$hoja->mergeCells("A{$fila}:C{$fila}");
				$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');
				$fila++;
				$hoja->setCellValue("A{$fila}", 'Cliente');
            	$hoja->setCellValue("B{$fila}", 'Cantidad');
            	$hoja->setCellValue("C{$fila}", 'Porcentaje');
				$hoja->getStyle("A{$fila}:C{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("B{$fila}:C{$fila}")->getAlignment()->setHorizontal('right');
				$fila++;
				foreach($datos['resumen_clientes'] as $rc) {
					$hoja->setCellValue("A{$fila}", $rc['cliente']);
            		$hoja->setCellValue("B{$fila}", $rc['cantidad']);
            		$hoja->setCellValue("C{$fila}", $rc['porcentaje']);
					$hoja->getStyle("B{$fila}:C{$fila}")->getNumberFormat()->setFormatCode('0.00');
					$hoja->getStyle("B{$fila}:C{$fila}")->getAlignment()->setHorizontal('right');
					$fila++;					
				}
				$fila++;
				$hoja->setCellValue("A{$fila}", 'DETALLE');
				$hoja->mergeCells("A{$fila}:G{$fila}");
				$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("A{$fila}")->getAlignment()->setHorizontal('center');
				$fila++;
				$hoja->setCellValue("A{$fila}", 'Del');
            	$hoja->setCellValue("B{$fila}", 'Al');
            	$hoja->setCellValue("C{$fila}", 'Reserva');
				$hoja->setCellValue("D{$fila}", 'Ubicación');
				$hoja->setCellValue("E{$fila}", 'Cliente');
				$hoja->setCellValue("F{$fila}", 'Adultos');
				$hoja->setCellValue("G{$fila}", 'Menores');
				$hoja->getStyle("A{$fila}:G{$fila}")->getFont()->setBold(true);
				$hoja->getStyle("A{$fila}:C{$fila}")->getAlignment()->setHorizontal('center');
				$hoja->getStyle("F{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
				$hoja->setAutoFilter("A{$fila}:G{$fila}");
				$fila++;
				foreach($datos['detalle'] as $det) {
					$hoja->setCellValue("A{$fila}", formatoFecha($det->fecha_del, 2));
					$hoja->getStyle("A{$fila}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_DATE_DDMMYYYY);
					$hoja->setCellValue("B{$fila}", formatoFecha($det->fecha_al, 2));
					$hoja->getStyle("B{$fila}")->getNumberFormat()->setFormatCode(\PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_DATE_DDMMYYYY);
					$hoja->setCellValue("C{$fila}", $det->reserva);
					$hoja->getStyle("A{$fila}:C{$fila}")->getAlignment()->setHorizontal('center');
					$hoja->setCellValue("D{$fila}", "{$det->area} - {$det->reservable}");
					$hoja->setCellValue("E{$fila}", $det->cliente);
					$hoja->setCellValue("F{$fila}", $det->cantidad_adultos);
					$hoja->setCellValue("G{$fila}", $det->cantidad_menores);
					$hoja->getStyle("F{$fila}:G{$fila}")->getAlignment()->setHorizontal('center');
					$fila++;
				}

				foreach (range('A', 'G') as $col) {
					$hoja->getColumnDimension($col)->setAutoSize(true);
				}

				$hoja->setTitle("Historia_Reservas");
				header("Content-Type: application/vnd.ms-excel");
				header("Content-Disposition: attachment;filename=Historia_Reservas_" . date('YmdHis') . ".xlsx");
				header("Cache-Control: max-age=1");
				header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
				header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GTM");
				header("Cache-Control: cache, must-revalidate");
				header("Pragma: public");

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
				$writer->save("php://output");
				return;
			} else {
				$this->output->set_content_type('application/pdf', 'UTF-8');
				$mpdf = new \Mpdf\Mpdf([
					'tempDir' => sys_get_temp_dir(),
					'format' => 'letter'
				]);
				$mpdf->WriteHTML($this->load->view('historial_reservas', $datos, true));
				$mpdf->Output('Historial_reservas_' . date('YmdHis') . '.pdf', 'D');				
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
	}
}

/* End of file Propina.php */
/* Location: ./application/admin/controllers/mante/Propina.php */