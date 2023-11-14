<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Recurrente extends CI_Controller
{
    public $recurrent = null;
    private $headers = [];
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->load->model(['Recurrente_model', 'Cliente_rt_corporacion_model']);
        $headers = $this->input->request_headers();
        $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        $this->recurrent = $this->Recurrente_model->buscar(['recurrente' => 1, '_uno' => true]);
        if ($this->recurrent) {
            $this->headers = ["X-PUBLIC-KEY: {$this->recurrent->llave_publica}", "X-SECRET-KEY: {$this->recurrent->llave_privada}", 'Content-Type: application/json'];
        }
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    private function call_post($path_url, $params)
    {
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => "{$this->recurrent->url_base}{$path_url}",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($params),
            CURLOPT_HTTPHEADER => $this->headers,
        ));

        $response = curl_exec($curl);

        curl_close($curl);

        $respuesta = new stdClass();
        if (is_string($response)) {
            try {
                $respuesta = json_decode($response);
            } catch (Exception $e) {
                $respuesta = $response;
            }
        }
        return $respuesta;
    }

    public function crear_cliente()
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            if (isset($req['email']) && isset($req['full_name'])) {
                $datos['cliente_recurrente'] = $this->call_post($this->recurrent->crear_usuario, $req);
                if ($datos['cliente_recurrente']) {
                    if (isset($req['idcliente'])) {
                        $crt = new Cliente_rt_corporacion_model($req['idcliente']);
                        $crt->guardar(['correo' => $req['email'], 'id_recurrente' => $datos['cliente_recurrente']->id]);
                    }
                    $datos['exito'] = true;
                    $datos['mensaje'] = 'Cliente creado en recurrente.com.';
                } else {
                    $datos['mensaje'] = 'Error al crear el cliente en recurrente.com.';
                }
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }

    public function generar_cobro()
    {
        $datos = ['exito' => false];
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            if (isset($req['id_recurrente']) && isset($req['nombre_producto_recurrente']) && isset($req['monto'])) {
                $cobro = (object)[
                    'items' => [(object)[
                        'amount_in_cents' => (float)$req['monto'] * 100,
                        'currency' => 'GTQ',
                        'name' => $req['nombre_producto_recurrente'],
                        'quantity' => 1
                    ]],
                    'user_id' => $req['id_recurrente']
                ];
                $datos['checkout_recurrente'] = $this->call_post($this->recurrent->crear_checkout, $cobro);
                if ($datos['checkout_recurrente']) {
                    if (isset($req['idcliente'])) {
                        $crt = new Cliente_rt_corporacion_model($req['idcliente']);
                        $datos['checkout_recurrente']->fecha_ultimo_checkout = date('Y-m-d H:i:s');
                        $crt->guardar([
                            'ultimo_monto' => $req['monto'],
                            'ultimo_checkout' => $datos['checkout_recurrente']->checkout_url,
                            'fecha_ultimo_checkout' => $datos['checkout_recurrente']->fecha_ultimo_checkout
                        ]);
                    }
                    $datos['exito'] = true;
                    $datos['mensaje'] = 'Cobro creado en recurrente.com.';
                } else {
                    $datos['mensaje'] = 'Error al crear cobro en recurrente.com.';
                }
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }
        $this->output->set_output(json_encode($datos));
    }
}
