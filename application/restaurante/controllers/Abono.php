<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Abono extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();		
		$this->load->add_package_path('application/facturacion');

		$this->load->model([
			'Abono_model',
            'Abono_forma_pago_model'
		]);

		$this->load->helper(['jwt', 'authorization']);
		$headers = $this->input->request_headers();
		$this->data = AUTHORIZATION::validateToken($headers['Authorization']);
		$this->output->set_content_type('application/json', 'UTF-8');
	}

    public function guardar($id = '') {
        $datos = ['exito' => false];		
		if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
			if ((isset($req['reserva']) && (int)$req['reserva'] > 0) || (isset($req['factura']) && (int)$req['factura'] > 0)) {
                $abono = new Abono_model($id);
                $datos['exito'] = $abono->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Abono guardado con éxito.';
                    $datos['abono'] = $abono;
                } else {
                    $datos['mensaje'] = implode('; ', $abono->getMensaje());
                }
			} else {
				$datos['mensaje'] = 'Hacen falta datos obligatorios para poder continuar';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}

		$this->output->set_output(json_encode($datos));
    }

    public function buscar() {
        $datos = $this->Abono_model->buscar($_GET);

        if (isset($_GET['_fulldata']) && (int)$_GET['_fulldata'] === 1) {
            foreach($datos as $dato) {
                $dato->reserva = (int)$dato->reserva > 0 ? $this->Abono_model->get_reserva((int)$dato->reserva) : null;
                $dato->factura = (int)$dato->factura > 0 ? $this->Abono_model->get_factura((int)$dato->factura) : null;
                $dato->usuario = (int)$dato->usuario > 0 ? $this->Abono_model->get_usuario((int)$dato->usuario) : null;
                $dato->anuladopor = (int)$dato->anuladopor > 0 ? $this->Abono_model->get_anuladopor((int)$dato->anuladopor) : null;
            }
        }

        $this->output->set_output(json_encode($datos));
    }

    public function guardar_detalle($id = '') {
        $datos = ['exito' => false];		
		if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
			if (isset($req['abono']) && (int)$req['abono'] > 0) {
                $afp = new Abono_forma_pago_model($id);
                $datos['exito'] = $afp->guardar($req);
                if ($datos['exito']) {
                    $datos['mensaje'] = 'Detalle de abono guardado con éxito.';
                    $datos['abono_forma_pago'] = $afp;
                } else {
                    $datos['mensaje'] = implode('; ', $afp->getMensaje());
                }
			} else {
				$datos['mensaje'] = 'Hacen falta datos obligatorios para poder continuar';
			}
		} else {
			$datos['mensaje'] = 'Parámetros inválidos.';
		}
		$this->output->set_output(json_encode($datos));        
    }

}