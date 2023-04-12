<?php
defined('BASEPATH') or exit('No direct script access allowed');

use Orhanerday\OpenAi\OpenAi;

class Test extends CI_Controller
{
    public function __construct()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method == "OPTIONS") {
            die();
        }

        parent::__construct();
        $this->output->set_content_type("application/json", "UTF-8");
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
                    "role" => "system",
                    "content" => "You are a helpful assistant."
                ],
                [
                    "role" => "user",
                    "content" => "Who won the world series in 2020?"
                ],
                [
                    "role" => "assistant",
                    "content" => "The Los Angeles Dodgers won the World Series in 2020."
                ],
                [
                    "role" => "user",
                    "content" => "Where was it played?"
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
}
