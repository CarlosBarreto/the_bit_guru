<?php
// Cargar variables de entorno desde el archivo .env
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Habilitar CORS para permitir peticiones desde el frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Incluir el controlador
require_once __DIR__ . '/../app/Controllers/TarotController.php';

// Router mejorado para funcionar en subdirectorios
$request_uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

$api_marker = 'guru-api/';
$api_pos = strpos($request_uri, $api_marker);

if ($api_pos === false) {
    $route = ''; // 'api/' no se encontró en la URL
} else {
    // Extrae la ruta desde el final de 'api/'
    $route = substr($request_uri, $api_pos + strlen($api_marker));
}

// Crear una instancia del controlador
$controller = new TarotController();

// Enrutamiento

switch ($route) {
    case 'tarot/tirada':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->tirada();
        }
        break;
    case 'guru/pregunta':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->pregunta();
        }
        break;
    case 'tarot/createImage':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createImage();
        }
        break;
    case 'tarot/reading':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->reading();
        }
        break;
    case 'guru/wisdom-tweet':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->wisdomTweet();
        }
        break;
    case 'guru/fan-response':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->fanResponse();
        }
        break;
    default:
        header("HTTP/1.0 404 Not Found");
        echo json_encode(['error' => 'Endpoint no encontrado']);
        break;
}
