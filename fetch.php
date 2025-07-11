<?php
/* https://benjamincrozat.com/openai-api-php */


$run = false;
include('config.php');
require 'vendor/autoload.php';
$apiKey = $CONFIG['apiKey'];

$output = array("response"=>"no query");


$d = array("model" => "gpt-4o", "messages" => []);


if(isset($_POST['prompt']) && $prompt = $_POST['prompt']) {
  $d['messages'][] = ['role' => 'user','content' => [["type"=>"text","text"=> $prompt ]]];
  $run = true;
}
if(isset($_POST['imgurl']) && $imgurl = $_POST['imgurl']) {
  $d['messages'][] = ['role' => 'user','content' => [["type"=>"image_url","image_url"=> array( "url"=> $imgurl ) ]]];
  $run = true;
}

if($run) {

  $client = OpenAI::client($apiKey);
  $data = $client->chat()->create($d);
  $output = array('response'=>$data['choices'][0]['message']['content']);  
  
}
else { $output = array('response'=>"no response or bad input");  ; }

header('Content-Type: application/json; charset=utf-8');
echo json_encode($output);


