<?php
defined('BASEPATH') or exit('No direct script access allowed');

use Orhanerday\OpenAi\OpenAi;

class Test extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        set_database_server();
        $this->output->set_content_type('application/json', 'UTF-8');
    }

    public function test()
    {
        $this->output->set_output(json_encode($_SERVER));
    }

    public function osinfo()
    {
        $this->output->set_output(json_encode(['OS' => PHP_OS]));
    }

    public function openai()
    {
        $open_ai_key = getenv('OPENAI_API_KEY');
        $open_ai = new OpenAi($open_ai_key);
        $open_ai->setORG('org-vLm4cxV8YfAVn8YRpxDeEk8C');

        $chat = $open_ai->chat([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful assistant.'
                ],
                [
                    'role' => 'user',
                    'content' => 'Who won the world series in 2020?'
                ],
                [
                    'role' => 'assistant',
                    'content' => 'The Los Angeles Dodgers won the World Series in 2020.'
                ],
                [
                    'role' => 'user',
                    'content' => 'Where was it played?'
                ],
            ],
            'temperature' => 1.0,
            'max_tokens' => 4000,
            'frequency_penalty' => 0,
            'presence_penalty' => 0,
        ]);

        $d = json_decode($chat);

        $this->output->set_output(json_encode($d));
    }

    public function test_menu()
    {
        $menu = $this->config->item('menu');

        $arbol = [];
        foreach ($menu as $mKey => $modulo) {
            if ($mKey !== 3) {
                $arbol[] = (object)[
                    'modulo' => $mKey,
                    'descripcion' => $modulo['nombre'],
                    'submodulos' => []
                ];

                $mIdx = count($arbol) - 1;
                foreach ($modulo['submodulo'] as $smKey => $submodulo) {
                    $arbol[$mIdx]->submodulos[] = (object)[
                        'submodulo' => $smKey,
                        'descripcion' => $submodulo['nombre'],
                        'opciones' => []
                    ];

                    $smIdx = count($arbol[$mIdx]->submodulos) - 1;
                    foreach ($submodulo['opciones'] as $oKey => $opcion) {
                        $arbol[$mIdx]->submodulos[$smIdx]->opciones[] = (object)[
                            'opcion' => $oKey,
                            'descripcion' => $opcion['nombre'],
                            'incluido' => 0
                        ];
                    }
                }
            }
        }

        $this->output->set_output(json_encode($arbol));
    }

    public function menu_as_tabla()
    {
        $menu = $this->config->item('menu');
        $arbol = [];
        foreach ($menu as $mKey => $modulo) {
            foreach ($modulo['submodulo'] as $smKey => $submodulo) {
                foreach ($submodulo['opciones'] as $oKey => $opcion) {
                    $arbol[] = (object)[
                        'idmodulo' => $mKey,
                        'modulo' => $modulo['nombre'],
                        'idsubmodulo' => $smKey,
                        'submodulo' => $submodulo['nombre'],
                        'idopcion' => $oKey,
                        'opcion' => $opcion['nombre']
                    ];
                }
            }
        }
        $this->output->set_output(json_encode($arbol));
    }
}
