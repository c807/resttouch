<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fpago extends CI_Controller {

	public function __construct()
	{
        parent::__construct();
        $this->load->model([
			'Fpago_model',
			'Forma_pago_comanda_origen_model',
			'Forma_pago_sede_cuenta_contable_model'
		]);
        $this->output->set_content_type('application/json', 'UTF-8');		
	}

	public function guardar($id = '') 
	{
		$pago = new Fpago_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			// $config = $this->Configuracion_model->buscar();
			$config = $this->Configuracion_model->buscar_configuraciones();
			$sinFactura = get_configuracion($config, 'RT_COMANDA_SIN_FACTURA', 3);
			$continuar = true;

			if (!$sinFactura && isset($req['sinfactura'])) {
				if ($req['sinfactura'] == 1) {
					$continuar = false;
				}
			}

			if ($continuar) {
				$datos['exito'] = $pago->guardar($req);
				if($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['forma_pago'] = $pago;
				} else {
					$datos['mensaje'] = $pago->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'No puede agregar formas de pago con la propiedad sin factura.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		
		$this->output
		->set_output(json_encode($datos));
	}

	public function buscar()
	{
		if (count($_GET) == 0) {
			$_GET['activo'] = 1;
		}
		
		// $datos = $this->Fpago_model->buscar($_GET);
		$datos = $this->Fpago_model->buscar_formaspago($_GET);
		$this->output->set_content_type('application/json')->set_output(json_encode($datos));
	}

	public function get_formas_pago_comanda_origen()
	{
		$datos = $this->Forma_pago_comanda_origen_model->full_search($_GET);
		$this->output->set_output(json_encode($datos));
	}

	public function guardar_fpco($id = '')
	{
		$fpco = new Forma_pago_comanda_origen_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$existe = false;

			if (empty($id))
			{
				$tmp = $this->Forma_pago_comanda_origen_model->buscar([
					'forma_pago' => $req['forma_pago'],
					'comanda_origen' => $req['comanda_origen'],
					'TRIM(codigo)' => trim($req['codigo']),
					'_uno' => true
				]);
				if($tmp) {
					$existe = true;
				}
			}

			if (!$existe) 
			{
				$req['codigo'] = trim($req['codigo']);
				$datos['exito'] = $fpco->guardar($req);
				if($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['forma_pago'] = $fpco;
				} else {
					$datos['mensaje'] = $fpco->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Esta relación entre la forma de pago y el origen ya existe. Por favor revise sus datos.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}		
		$this->output->set_output(json_encode($datos));
	}

	public function get_formas_pago_sede_cuenta_contable()
	{
		$datos = $this->Forma_pago_sede_cuenta_contable_model->buscar($_GET);
		$this->output->set_output(json_encode($datos));
	}

	public function guardar_fpscc($id = '')
	{
		$fpscc = new Forma_pago_sede_cuenta_contable_model($id);
		$req = json_decode(file_get_contents('php://input'), true);
		$datos = ['exito' => false];
		if ($this->input->method() == 'post') {
			$existe = false;

			if (empty($id))
			{
				$tmp = $this->Forma_pago_sede_cuenta_contable_model->buscar([
					'forma_pago' => $req['forma_pago'],
					'sede' => $req['sede'],
					'TRIM(cuenta_contable)' => trim($req['cuenta_contable']),
					'_uno' => true
				]);
				if($tmp) {
					$existe = true;
				}
			}

			if (!$existe) 
			{
				$req['cuenta_contable'] = trim($req['cuenta_contable']);
				$datos['exito'] = $fpscc->guardar($req);
				if($datos['exito']) {
					$datos['mensaje'] = 'Datos actualizados con éxito.';
					$datos['forma_pago_sede_cuenta_contable'] = $fpscc;
				} else {
					$datos['mensaje'] = $fpscc->getMensaje();
				}
			} else {
				$datos['mensaje'] = 'Esta relación entre la forma de pago y la sede ya existe. Por favor revise sus datos.';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}		
		$this->output->set_output(json_encode($datos));		
	}	
}

/* End of file Fpago.php */
/* Location: ./application/admin/controllers/mante/Fpago.php */