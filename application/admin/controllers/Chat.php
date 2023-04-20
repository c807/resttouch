<?php
defined('BASEPATH') or exit('No direct script access allowed');

use Orhanerday\OpenAi\OpenAi;

class Chat extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $headers = $this->input->request_headers();
        if(isset($headers['Authorization']) && !empty($headers['Authorization'])) {
            $this->data = AUTHORIZATION::validateToken($headers['Authorization']);
        } else {
            die();
        }
        $this->output->set_content_type("application/json", "UTF-8");
    }

    public function query_chefbot()
    {
        $datos['exito'] = false;
        if ($this->input->method() == 'post') {
            $req = json_decode(file_get_contents('php://input'), true);
            if (isset($req['prompt']) && !empty(trim($req['prompt']))) {
                $prompt = trim($req['prompt']);
                $open_ai_key = getenv('OPENAI_API_KEY');
                $open_ai = new OpenAi($open_ai_key);
                $open_ai->setORG('org-vLm4cxV8YfAVn8YRpxDeEk8C');
        
                $chat = $open_ai->completion([
                    'model' => 'text-davinci-003',
                    'prompt' => $prompt,
                    'temperature' => 0.9,
                    'max_tokens' => 500,
                    'frequency_penalty' => 0,
                    'presence_penalty' => 0.6,
                ]);
        
                $d = json_decode($chat);

                if ($d && isset($d->choices) && is_array($d->choices) && count($d->choices) > 0) {
                    $datos['exito'] = true;
                    $datos['mensaje'] = str_replace("\n", "", $d->choices[0]->text);                    
                } else {
                    $datos['mensaje'] = 'Disculpe, no he comprendido su mensaje. ¿Podría intentar de nuevo, por favor?';
                }
            } else {
                $datos['mensaje'] = 'Disculpe, no he comprendido su mensaje. ¿Podría intentar de nuevo, por favor?';
            }
        } else {
            $datos['mensaje'] = 'Parámetros inválidos.';
        }

        $this->output->set_output(json_encode($datos));
    }
}
