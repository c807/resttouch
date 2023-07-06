<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Ajuste_costo_promedio extends CI_Controller
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model([
            'Catalogo_model',
            'Ajuste_costo_promedio_model',
            'Detalle_ajuste_costo_promedio_model',
            'Articulo_model',
            'Receta_model',
            'Proveedor_model',
            'Tipo_movimiento_model',
            'Egreso_model',
            'EDetalle_model',
            'Ingreso_model',
            'IDetalle_Model',
            'Presentacion_model',
            'BodegaArticuloCosto_model',
            'Sede_model',
			'Empresa_model'
        ]);

        $this->load->helper(['jwt', 'authorization']);

        $headers = $this->input->request_headers();
        if (isset($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        }

        $this->output->set_content_type('application/json');
    }

    public function buscar()
    {
        if (!isset($_GET['sede'])) {
            $_GET['sede'] = $this->data->sede;
        }

        $data = $this->Ajuste_costo_promedio_model->buscar($_GET);
        $this->output->set_output(json_encode($data));
    }

    public function guardar($id = '')
    {
        $acp = new Ajuste_costo_promedio_model($id);
        $req = json_decode(file_get_contents('php://input'), true);
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            if (empty($id) || (int)$acp->confirmado === 0) {
                $datos['exito'] = $acp->guardar($req);

                if ($datos['exito']) {
                    $sede = new Sede_model($req['sede']);
			        $empresa = $sede->getEmpresa();

                    $args = [
                        'ajuste_costo_promedio' => $acp->getPK(),
                        'sede' => $req['sede'],
                        'bodega' => $req['bodega'],
                        'mostrar_inventario' => 1,
                        'debaja' => 0,
                        'por_iva' => (float)1 + (float)$empresa->porcentaje_iva
                    ];

                    if (isset($req['categoria_grupo']) && (int)$req['categoria_grupo'] > 0) {
                        $args['categoria_grupo'] = $req['categoria_grupo'];
                    }

                    $acp->genera_detalle($args);
                    $datos['mensaje'] = 'Datos actualizados con éxito.';
                    $datos['ajuste_costo_promedio'] = $acp;
                } else {
                    $datos['mensaje'] = implode('<br>', $acp->getMensaje());
                }
            } else {
                $datos['mensaje'] = 'Solo puede editar ajustes de costo promedio sin confirmar.';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }
    
    public function buscar_detalle()
    {
        $data = $this->Detalle_ajuste_costo_promedio_model->buscar_detalle($_GET);
        $this->output->set_output(json_encode($data));
    }
}
