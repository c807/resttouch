<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fisico extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model([
			"Catalogo_model",
			"Fisico_model",
			"Fisico_detalle_model",
			"Articulo_model",
			"Receta_model",
			"Proveedor_model",
			"Tipo_movimiento_model",
			'Egreso_model', 
        	'EDetalle_model',
        	'Ingreso_model',
        	'IDetalle_Model',
        	'Presentacion_model',
        	'BodegaArticuloCosto_model'
		]);

		$this->load->helper(['jwt', 'authorization']);

		$headers = $this->input->request_headers();
		if (isset($headers['Authorization'])) {
			$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		}

		$this->output->set_content_type('application/json');
	}

	public function generar()
	{
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		$arts = [];
		$fisico = new Fisico_model();
		$req['usuario'] = $this->data->idusuario;

		if (!isset($req['sede'])) {
			$req['sede'] = $this->data->sede;
		}

		if (isset($req['categoria_grupo_grupo'])) {
			$arts = $this->Articulo_model->buscar([
				"categoria_grupo" => $req['categoria_grupo_grupo'],
				"mostrar_inventario" => 1
			]);

			$req['categoria_grupo'] = $req['categoria_grupo_grupo'];

		} else {
			$arts = $this->Catalogo_model->getArticulo([
				"sede" => $req['sede'],
				"mostrar_inventario" => 1
			]);
		}


		$articulos = [];
		foreach ($arts as $row) {
			$art = new Articulo_model($row->articulo);
			$rec = $art->getReceta();
			if (count($rec) == 0 || $art->produccion) {
				$articulos[] = $row;
			}
		}

		$arts = $articulos;

		if (count($arts) > 0) {
			if ($fisico->guardar($req)) {
				foreach ($arts as $row) {
					$art = new Articulo_model($row->articulo);
					//if ($art->mostrar_inventario == 1) {
						$art->actualizarExistencia($req);
						$fisico->setDetalle([
							"articulo" => $row->articulo,
							"precio" => $row->precio,
							"existencia_sistema" => $art->existencias
						]);
					
				}
				$datos['exito'] = true;
				$datos['inventario'] = $fisico->getPK();
				$datos['mensaje'] = "Proceso realizado exitosamente";
			} else {
				$datos['mensaje'] = "Ocurrio un error al generar el proceso";	
			}
		} else {
			$datos['mensaje'] = "No hay articulos en la categoria seleccionada";
		}
		
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function imprimir($id = '')
	{
		if (!empty($id)) {
			$fisico = new Fisico_model($id);
			$args = $_GET;
			$args['inventario'] = $this->Fisico_model->buscar([
				"inventario_fisico" => $fisico->getPK(),
				"_uno" => true
			]);

			$args['esfisico'] = (int)$args['inventario']->escuadrediario === 0;

			foreach ($fisico->getDetalle() as $row) {
				if (!isset($args['detalle'][$row->categoria])) {
					$args['detalle'][$row->categoria] = [
						"descripcion" => $row->ncategoria,
						"datos" => []
					];
				} 

				if (!isset($args['detalle'][$row->categoria]['datos'][$row->categoria_grupo])) {
					$args['detalle'][$row->categoria]['datos'][$row->categoria_grupo] = [
						"descripcion" => $row->ncategoria_grupo,
						"datos" => []
					];
				}

				$args['detalle'][$row->categoria]['datos'][$row->categoria_grupo]['datos'][] = $row;
			}
			
			if (verDato($_GET, "_excel") && filter_var($_GET['_excel'], FILTER_VALIDATE_BOOLEAN)) {
				$excel = new PhpOffice\PhpSpreadsheet\Spreadsheet();
				$excel->getProperties()
					  ->setCreator("Restouch")
					  ->setTitle("Office 2007 xlsx Fisico")
					  ->setSubject("Office 2007 xlsx Fisico")
					  ->setKeywords("office 2007 openxml php");

				$excel->setActiveSheetIndex(0);
				$hoja = $excel->getActiveSheet();
				$nombres = [
					"Descripción",
					"Código",
					"Presentación",
					"Existencia Sistema",
					"Existencia Física"
				];

				if ($args['inventario']->confirmado) {
					array_push($nombres, "Diferencia");
				}
				/*Encabezado*/
				$hoja->setCellValue("A1", "Inventario Físico #{$args['inventario']->inventario_fisico}");
				$hoja->setCellValue("D1", "Fecha: ".formatoFecha($args['inventario']->fhcreacion, 2));

				$hoja->fromArray($nombres, null, "A3");
				$hoja->getStyle("A1:G3")->getFont()->setBold(true);
				$hoja->getStyle('A1:G3')->getAlignment()->setHorizontal('center');

				$fila = 4;
				foreach ($args["detalle"] as $key => $cat) {
					$hoja->setCellValue("A{$fila}", $cat['descripcion']);
					$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
					$fila++;

					foreach ($cat['datos'] as $gcat) {
						$hoja->setCellValue("A{$fila}", $gcat['descripcion']);
						$hoja->getStyle("A{$fila}")->getFont()->setBold(true);
						$fila++;

						foreach ($gcat['datos'] as $art) {
							$articulo = new Articulo_model($art->articulo);
							$pres = $articulo->getPresentacionReporte();
							$existencias = $art->existencia_sistema/$pres->cantidad;
							$diferencia = ($art->existencia_sistema / $pres->cantidad) - $art->existencia_fisica;

							if (round($diferencia, 2) == 0) {
								continue;
							}
							
							$reg = [
								$art->narticulo,
								empty($art->codigo) ? $art->articulo : $art->codigo,
								$pres->descripcion,
								($existencias == 0) ? "0.00" : round($existencias,2)
							];

							if (isset($args['existencia_fisica'])) {
								if ($art->existencia_fisica == 0) {
									array_push($reg, "0.00");
								} else {
									array_push($reg, round($art->existencia_fisica,2));
								}								
							}

							if ($args['inventario']->confirmado) {
								array_push(
									$reg, 
									round(($art->existencia_sistema/$pres->cantidad) - $art->existencia_fisica,2));
							}

							$hoja->fromArray($reg, null, "A{$fila}");
							$hoja->getStyle("D{$fila}:F{$fila}")->getNumberFormat()->setFormatCode('0.00');
							$hoja->getStyle("B{$fila}")->getAlignment()->setHorizontal('left');
							$fila++;
						}
					}
				}

				for ($i=0; $i <= count($nombres) ; $i++) { 
					$hoja->getColumnDimensionByColumn($i)->setAutoSize(true);
				}

				$hoja->setTitle("Inventario_Fisico");

				header("Content-Type: application/vnd.ms-excel");
				header("Content-Disposition: attachment;filename=Inventario_Fisico.xlsx");
				header("Cache-Control: max-age=1");
				header("Expires: Mon, 26 Jul 1997 05:00:00 GTM");
				header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GTM");
				header("Cache-Control: cache, must-revalidate");
				header("Pragma: public");

				$writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($excel);
				$writer->save("php://output");

			} else {
				$pdf   = new \Mpdf\Mpdf([
					'tempDir' => sys_get_temp_dir(), //produccion
					"format" => "letter", 
					"lands"
				]);
				$vista = $this->load->view('reporte/fisico/imprimir', $args, true);
				// $rand  = rand();
				$pdf->AddPage();
				$pdf->WriteHTML($vista);
				$pdf->setFooter("Página {PAGENO} de {nb}  {DATE j/m/Y H:i:s}");
				$nombre = ($args['esfisico'] ? 'Inventario_Fisico_' : 'Cuadre_Diario_').date('YmdHis').'.pdf';
				$pdf->Output($nombre, "D");
			}
		}
	}

	public function buscar_detalle($inv)
	{
		$queryParams = $_GET;
		$fltr = ['inventario_fisico' => $inv, 'sede' => $this->data->sede, '_uno' => true];

		$esCuadreDiario = false;
		if (isset($queryParams['escuadrediario'])) {
			$esCuadreDiario = (int)$queryParams['escuadrediario'] === 1;
			$fltr['escuadrediario'] = $queryParams['escuadrediario'];
		}

		$srchInvFisico = $this->Fisico_model->buscar($fltr);
		$datos = [];
		$data = ["exito" => 0];
		if ($srchInvFisico) {
			$fisico = new Fisico_model($inv);	
			if ($fisico->getPK()) {
				foreach ($fisico->getDetalle() as $row) {
					$art = new Articulo_model($row->articulo);
					$pres = $art->getPresentacionReporte();
					$row->existencia_sistema = round($row->existencia_sistema/$pres->cantidad, 2);
					$row->existencia_fisica = (float)$row->existencia_fisica;
					$row->diferencia = (float)$row->diferencia;
					if (!isset($datos[$row->categoria])) {
						$datos[$row->categoria] = [
							"descripcion" => $row->ncategoria,
							"datos" => []
						];
					} 
	
	
					if (!isset($datos[$row->categoria]['datos'][$row->categoria_grupo])) {
						$datos[$row->categoria]['datos'][$row->categoria_grupo] = [
							"descripcion" => $row->ncategoria_grupo,
							"datos" => []
						];
					}
	
					$datos[$row->categoria]['datos'][$row->categoria_grupo]['datos'][] = $row;
				}
	
				foreach ($datos as $row) {
					$row['datos'] = array_values($row['datos']);
					$data['detalle'][] = $row;
				}
	
				$data['inventario'] = $this->Fisico_model->buscar([
					"inventario_fisico" => $fisico->getPK(),
					"_uno" => true
				]);	
	
				$data['exito'] = 1;
			} else {
				$data['mensaje'] = "No existe un ".($esCuadreDiario ? 'cuadre diario' : 'inventario físico')." con este número {$inv}";
			}
		} else {
			$data['mensaje'] = "No existe un ".($esCuadreDiario ? 'cuadre diario' : 'inventario físico')." con este número {$inv}";
		}
		
		$this->output
		->set_content_type("application/json")
		->set_output(json_encode($data));
	}

	public function actualizar()
	{
		$datos = ["exito" => false, "mensaje" => ""];
		if ($this->input->method() == 'post') {
			$req = json_decode(file_get_contents('php://input'), true);
			$contunuar = true;
			foreach ($req as $cat) {
				foreach ($cat['datos'] as $gcat) {
					foreach ($gcat['datos'] as $art) {
						$det = new Fisico_detalle_model($art['id']);
						$fisico = new Fisico_model($det->inventario_fisico);
						if ($fisico->confirmado == 0) {
							$det->guardar([
								"existencia_fisica" => $art['existencia_fisica']
							]);
						} else {
							$contunuar = false;
							break;
						}
					}
				}
			}

			if ($contunuar) {
				$datos['exito'] = true;
				$datos['mensaje'] = "Datos actualizados con exito";				
			} else {
				$datos['mensaje'] = "El inventario ya está confirmado no es posible modificarlo";
			}

		} else {
            $datos['mensaje'] = "Parametros invalidos";
        }

        $this->output
        	 ->set_output(json_encode($datos));
	}

	private function getMovAjuste($deIngreso = 0, $deEgreso = 0)
	{		
		$tm = $this->Tipo_movimiento_model->buscar([ "descripcion" => "Ajuste", "ingreso" => 1, "egreso" => 1, "_uno" => true ]);

		if (!$tm)
		{
			$tm = $this->Tipo_movimiento_model->buscar([
				"descripcion" => "Ajuste",
				"ingreso" => $deIngreso,
				"egreso" => $deEgreso,
				"_uno" => true
			]);

			if(!$tm)
			{
				$obj = new Tipo_movimiento_model();
				$obj->guardar([
					"descripcion" => "Ajuste",
					"ingreso" => $deIngreso,
					"egreso" => $deEgreso
				]);
				return $obj->getPK();
			}
		}

		return $tm->tipo_movimiento;		
	}

	public function confirmar($id)
	{
		$datos = ["exito" => false, "mensaje" => ""];
		$ingreso=[];
		$egreso=[];

		if ($this->input->method() == 'post') {

			$inv = new Fisico_model($id);
			$esFisico = (int)$inv->escuadrediario === 0; 
			$sede = new Sede_model($this->data->sede);
			$emp = $sede->getEmpresa();

			$args = [
				"confirmado_fecha" => Hoy(3),
				"confirmado" => 1
			];

			if ($esFisico) {
				$prov = $this->Proveedor_model->buscar([
					"razon_social" => "Interno",
					"_uno" => true
				]);			
	
				if (!$prov) {
					$obj = new Proveedor_model();
					$obj->guardar([
						"razon_social" => "Interno",
						"nit" => "cf",
						"corporacion" => 1
					]);
					$idProv = $obj->getPK();
				} else {
					$idProv = $prov->proveedor;
				}
			}
			
			if ($inv->guardar($args)) {

				//Inicia código para actualizar campo diferencia
				foreach ($inv->getDetalle() as $row) {
					$art = new Articulo_model($row->articulo);
					$pres = $art->getPresentacionReporte();
					$row->diferencia = round(($row->existencia_sistema/$pres->cantidad), 2) - $row->existencia_fisica;

					if ($esFisico) {
						if (round($row->diferencia, 2) > 0){
							$egreso[] = $row;
						}
						elseif (round($row->diferencia, 2) < 0){
							$ingreso[] = $row;
						}
					}					
				}
				// Termina código para actualizar campo diferencia

				if ($esFisico) {
					// Inicia código para generar salidas de ajuste
					if (count($egreso) > 0){
						$gegreso = [
							"tipo_movimiento" => $this->getMovAjuste(0, 1),
							"bodega" => $inv->bodega,
							"fecha" => Hoy(),
							"usuario" => $inv->usuario,
							"estatus_movimiento" => 2,
							"ajuste" => 1,
							"comentario" => "Ajuste mediante Inventario Físico"
						];
						$egr = new Egreso_model();
						if ($egr->guardar($gegreso)) {
							foreach ($egreso as $row) {
								$bac = new BodegaArticuloCosto_model();
								$art = new Articulo_model($row->articulo);
								$pres = $art->getPresentacionReporte();
	
								$costo = $bac->get_costo($egr->bodega, $row->articulo, $pres->presentacion);
	
								$datos = [
									"cantidad" => abs($row->diferencia),
									"articulo" => $row->articulo,
									"precio_unitario" => $costo,
									"precio_total" => $costo * abs($row->diferencia),
									"presentacion" => $pres->presentacion
								];
	
								$egr->setDetalle($datos);
							}
						}
					}
					// Termina código para generar salidas de ajuste
	
					// Inicia código para generar ingresos de ajuste
					if (count($ingreso) > 0){
						$gingreso = [
							"tipo_movimiento" => $this->getMovAjuste(1, 0),
							"fecha" => Hoy(),
							"bodega" => $inv->bodega,
							"usuario" => $inv->usuario,
							"comentario" => "Ajuste mediante Inventario Físico",
							"proveedor" => $idProv,
							"estatus_movimiento" => 2,
							"ajuste" => 1
						];
	
						$ing = new Ingreso_model();
						if ($ing->guardar($gingreso)) {
							foreach ($ingreso as $row) {
								$bac = new BodegaArticuloCosto_model();
								$articulo = new Articulo_model($row->articulo);
								$pres = $articulo->getPresentacionReporte();
								$costo = $bac->get_costo($ing->bodega, $row->articulo, $pres->presentacion);
	
								$datos = [
									"articulo" => $row->articulo, 
									"cantidad" => abs($row->diferencia),
									"precio_unitario" => $costo,
									"precio_total" => $costo * abs($row->diferencia),
									"presentacion" => $pres->presentacion,
									"precio_costo_iva" => $costo * abs($row->diferencia) * $emp->porcentaje_iva
								];
	
								$ing->setDetalle($datos);
							}
						}
					}
					// Termina código para generar ingresos de ajuste
				}

				$datos['exito'] = true;
				$datos['inventario'] = $this->Fisico_model->buscar([
					"inventario_fisico" => $inv->getPK(),
					"_uno" => true
				]);
				$datos['mensaje'] = "Datos actualizados con exito";	
			} else {
				$datos['mensaje'] = "Ocurrio un error al guardar el registro";	
			}
		} else {
            $datos['mensaje'] = "Parametros invalidos";
        }

        $this->output->set_output(json_encode($datos));
	}

}

/* End of file Fisico.php */
/* Location: ./application/wms/controllers/Fisico.php */