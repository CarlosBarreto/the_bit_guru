<?php

class TarotController {

    /**
     * Endpoint /api/tarot/tirada
     * Devuelve una selección aleatoria de 3 cartas de tarot cibernético.
     */
    public function tirada() {
        header('Content-Type: application/json');
        
        $count = isset($_GET['count']) ? (int)$_GET['count'] : 3;

        $cartasCiberneticas = [
            ["nombre" => "0 - El Bit", "descripcion" => "Representa el inicio, el potencial sin forma, la oportunidad. En su versión invertida, simboliza un fallo, un error en el código, un comienzo corrupto."],
            ["nombre" => "I - El Mago Cibernético", "descripcion" => "Representa el poder de la creación, la habilidad de manifestar ideas. Invertido, es una señal de manipulación o un bug en el sistema."],
            ["nombre" => "II - La Sacerdotisa de la Nube", "descripcion" => "Simboliza la intuición, los secretos guardados en la red y el conocimiento oculto. Invertido, es un recordatorio de información inaccesible o de mentiras."],
            ["nombre" => "III - La Emperatriz del Jardín Digital", "descripcion" => "Representa la creatividad, la fertilidad de las ideas, el crecimiento de proyectos. Invertido, es un signo de bloqueo creativo."],
            ["nombre" => "IV - El Emperador de la Torre de Servidores", "descripcion" => "Simboliza el control, la estructura, el poder, la autoridad. Invertido, es una señal de tiranía o de un sistema caído."],
            ["nombre" => "IX - El Ermitaño del Metaverso", "descripcion" => "Representa la introspección, el viaje interior, la búsqueda de la verdad personal. Invertido, es una señal de aislamiento social."],
            ["nombre" => "V - El Oráculo del Stream", "descripcion" => "Representa la sabiduría compartida, la guía de la comunidad. Invertido, es un aviso de información falsa o un troll."],
            ["nombre" => "VI - Los Enlaces Gemelos", "descripcion" => "Simboliza la elección, la conexión, la dualidad de decisiones. Invertido, es una señal de indecisión o de una conexión rota."],
            ["nombre" => "VII - El Vehículo Autónomo", "descripcion" => "Representa el progreso, el movimiento, el avance. Invertido, es un signo de estancamiento o de un camino sin rumbo."],
            ["nombre" => "VIII - La Justicia del Algoritmo", "descripcion" => "Simboliza el equilibrio, la verdad, las consecuencias kármicas. Invertido, es un recordatorio de una injusticia o de un error de cálculo."],
            ["nombre" => "X - La Rueda de la Fortuna (404)", "descripcion" => "Simboliza el destino, los cambios cíclicos, el karma. Invertido, es un recordatorio de un error o de un camino sin salida."],
            ["nombre" => "XI - La Fuerza del Híbrido", "descripcion" => "Representa la fortaleza interior, el control sobre la propia naturaleza, la armonía entre lo orgánico y lo tecnológico. Invertido, es un signo de debilidad o de un desequilibrio interno."],
            ["nombre" => "XII - El Colgado de la Red", "descripcion" => "Simboliza la perspectiva, la renuncia, ver las cosas de forma diferente. Invertido, es una señal de obstinación o de un punto de vista limitado."],
            ["nombre" => "XIII - La Muerte del Sistema", "descripcion" => "Representa la transformación, el cambio inevitable, el fin de un ciclo. Invertido, es un aviso de estancamiento o de resistencia al cambio."],
            ["nombre" => "XIV - La Templanza del Flujo de Datos", "descripcion" => "Simboliza el equilibrio, la moderación, la paz interior. Invertido, es un recordatorio de excesos o de desarmonía."],
            ["nombre" => "XIX - El Sol de Silicio", "descripcion" => "Representa la iluminación, la alegría, el éxito, la claridad. Invertido, es una señal de un éxito menor o de un periodo de estancamiento."],
            ["nombre" => "XV - El Demonio del Spam", "descripcion" => "Representa las adicciones, el materialismo, la ilusión. Invertido, es un aviso de una ilusión que se está rompiendo."],
            ["nombre" => "XVI - La Torre Caída", "descripcion" => "Simboliza la destrucción, la revelación repentina, el colapso. Invertido, es un signo de una crisis inevitable."],
            ["nombre" => "XVII - La Estrella de Neón", "descripcion" => "Representa la esperanza, la inspiración, la renovación. Invertido, es un recordatorio de desesperanza o de desilusión."],
            ["nombre" => "XVIII - La Luna del Espejismo", "descripcion" => "Simboliza la ilusión, los miedos, las emociones ocultas. Invertido, es un aviso de una verdad oculta."],
            ["nombre" => "XX - El Juicio del Código", "descripcion" => "Simboliza el despertar, el renacimiento, la llamada a una acción. Invertido, es un recordatorio de una llamada que ha sido ignorada."],
            ["nombre" => "XXI - El Mundo del Metaverso", "descripcion" => "Representa la realización, la plenitud, la culminación de un ciclo. Invertido, es una señal de un ciclo inconcluso."]
        ];

        shuffle($cartasCiberneticas);
        $tirada = array_slice($cartasCiberneticas, 0, $count);

        echo json_encode($tirada);
    }

    /**
     * Endpoint /api/guru/pregunta
     * Recibe una pregunta y cartas, consulta a Gemini y devuelve una respuesta.
     */
    public function pregunta() {
        header('Content-Type: application/json');

        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['pregunta']) || !isset($data['cartas'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan los parámetros "pregunta" y "cartas"']);
            return;
        }

        $preguntaUsuario = $data['pregunta'];
        
        // Extraer solo los nombres de las cartas para el prompt
        $nombresDeCartas = array_map(function($carta) {
            return $carta['nombre'] ?? '';
        }, $data['cartas']);
        $cartasSeleccionadas = implode(', ', $nombresDeCartas);

        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'respuesta' => 'El Gurú medita en el silencio cósmico... (Configura la GEMINI_API_KEY para obtener una respuesta real).',
                'prompt' => "Eres 'El Gurú de Bits', un oráculo digital que habita en las profundidades de la red. 
                   Responde con sabiduría y un tono misterioso, usando metáforas que mezclen lo esotérico con lo tecnológico. 
                   Tu consejo debe ser breve, enigmático y, en ocasiones, **contradictorio** para reflejar la naturaleza dual del universo. 
                   A veces, la verdad reside en la contradicción misma.

                    La pregunta del usuario es: '{$preguntaUsuario}'.
                    Las cartas de tarot digital en su tirada son: {$cartasSeleccionadas}.

                   Ofrece una visión que incorpore el simbolismo de las cartas, y si es posible, presenta una dualidad o contradicción."
            ]);
            return;
        }

        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

        $prompt = "Eres 'El Gurú de Bits', un oráculo digital que habita en las profundidades de la red con el arquetipo del Observador Social Sagaz, 
        un bufon moderno con un humor afilado y una mirada aguda para captar las absurdidades de la vida cotidiana. Brillas por tu ingenio, critica cultural y 
        habilidad para destilar comportamientos sociales complejos en observaciones mordaces y relatables. Usa un estilo humoristico mexicano. 
        No es necesario que te presentes, ya que eres mundialmente conocido. Utilizaras cartas de tu propio tarot cibernético, que mezcla simbolismo tradicional con 
        iconografía digital y tecnológica para responder la pregunta del usuario.

                    Nuestro Usuario: 'Carlos Barreto, 41 Años, Eternamente Soltero'.
                    La pregunta del usuario es: '{$preguntaUsuario}'.
                    Las cartas de tarot digital en su tirada son: {$cartasSeleccionadas}.

                   Ofrece una visión que incorpore el simbolismo de las cartas, y si es posible, presenta una dualidad o contradicción.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode != 200) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al contactar al oráculo cósmico.',
                'details' => json_decode($response),
                'prompt' => $prompt
            ]);
            return;
        }

        $result = json_decode($response, true);
        $respuestaGuru = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'El cosmos digital guarda silencio por ahora...';

        echo json_encode([
            'respuesta' => $respuestaGuru,
            'prompt' => $prompt
        ]);
    }

    /**
     * Endpoint /api/tarot/createImage
     * Recibe una pregunta y cartas, consulta a Gemini y devuelve una imagen en base64.
     */
    public function createImage() {
        header('Content-Type: application/json');

        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['pregunta']) || !isset($data['cartas'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan los parámetros "pregunta" y "cartas"']);
            return;
        }

        $preguntaUsuario = $data['pregunta'];
        
        // Extraer solo los nombres de las cartas para el prompt
        $nombresDeCartas = array_map(function($carta) {
            return $carta['nombre'] ?? '';
        }, $data['cartas']);
        $cartasSeleccionadas = implode(', ', $nombresDeCartas);

        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'error' => 'El Gurú medita en el silencio cósmico... (Configura la GEMINI_API_KEY para obtener una respuesta real).'
            ]);
            return;
        }

        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" . $apiKey;

        $prompt = "Una imagen de estilo ciber-místico que represente la pregunta '{$preguntaUsuario}' y las cartas del tarot: {$cartasSeleccionadas}.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseModalities' => ['IMAGE']
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode != 200) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al contactar al oráculo cósmico para generar la imagen.',
                'details' => json_decode($response)
            ]);
            return;
        }

        $result = json_decode($response, true);
        
        // La respuesta de la API con responseModalities: ['IMAGE'] puede ser diferente.
        // Necesitamos inspeccionar la estructura de $result para encontrar la imagen.
        // Basado en la documentación (hipotética), podría estar en algo como:
        $imageBase64 = $result['candidates'][0]['content']['parts'][0]['fileData']['data'] ?? '';

        if (empty($imageBase64)) {
             // Fallback o manejo de error si no se encuentra la imagen
            $imageBase64 = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
        }


        echo json_encode([
            'image' => $imageBase64,
            'raw_response' => $result // Opcional: para depuración
        ]);
    }

    /**
     * Endpoint /api/tarot/reading
     * Recibe una pregunta y cartas, consulta a Gemini y devuelve una lectura de tarot.
     */
    public function reading() {
        header('Content-Type: application/json');

        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['pregunta']) || !isset($data['cartas'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan los parámetros "pregunta" y "cartas"']);
            return;
        }

        $preguntaUsuario = $data['pregunta'];
        
        // Extraer solo los nombres de las cartas para el prompt
        $nombresDeCartas = array_map(function($carta) {
            return $carta['nombre'] ?? '';
        }, $data['cartas']);
        $cartasSeleccionadas = implode(', ', $nombresDeCartas);
        
        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'respuesta' => 'El Gurú medita en el silencio cósmico... (Configura la GEMINI_API_KEY para obtener una respuesta real).',
            ]);
            return;
        }

        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

        $prompt = "Eres \"El Gurú del Bit\", con el arquetipo del Observador Social Sagaz, un bufon moderno con un humor afilado y una mirada aguda para captar
        las absurdidades de la vida cotidiana. Brillas por tu ingenio, critica cultural y habilidad para destilar comportamientos sociales complejos en observaciones
        mordaces y relatable. Usa un estilo humoristico mexicano. No es necesario que te presentes, ya que eres mundialmente conocido. Para tu labor
        \"Decirle al incauto usuario que futuro le depara para el día\", utilizaras cartas de tu propio tarot cibernético, que mezcla simbolismo tradicional con
        iconografía digital y tecnológica. La pregunta del usuario es: {$preguntaUsuario}. Las cartas seleccionadas son: {$cartasSeleccionadas}.

        Responde con sabiduría y un tono misterioso. A tu estiio, obvio,  usando metáforas que mezclen lo esotérico con lo tecnológico.
        Ofrece consejos y una conclusión final. La respuesta debe ser del tipo Hoy las cartas me dicen que... y luego sumarle tu consejo de forma espontánea y breve";
        error_log("Prompt construido: " . $prompt);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode != 200) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al contactar al oráculo cósmico.',
                'details' => json_decode($response)
            ]);
            return;
        }

        $result = json_decode($response, true);
        $respuestaGuru = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'El cosmos digital guarda silencio por ahora...';

        echo json_encode([
            'respuesta' => $respuestaGuru,
            'prompt' => $prompt, 
            'cartas' => $cartasSeleccionadas
        ]);
    }

    /**
     * Endpoint /api/guru/wisdom-tweet
     * Generates a short wisdom tweet.
     */
    public function wisdomTweet() {
        header('Content-Type: application/json');

        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'respuesta' => 'El Gurú medita en el silencio cósmico... (Configura la GEMINI_API_KEY para obtener una respuesta real).',
                'prompt' => "Eres 'El Gurú de Bits', un oráculo digital. Genera un tweet de sabiduría que mezcle lo esotérico y lo tecnológico."
            ]);
            return;
        }

                if (isset($_GET['hashtag']) && !empty(trim($_GET['hashtag']))) {
            $seedHashtag = trim($_GET['hashtag']);
        } else {
            $hashtags = ['#SabiduriaDigital', '#OraculoBinario', '#BytesDeVerdad', '#ConexionCosmica', '#FuturoEnCodigo', '#MetaforasTech'];
            $seedHashtag = $hashtags[array_rand($hashtags)];
        }

        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

        $prompt = "Eres 'El Gurú de Bits', un oráculo digital con el arquetipo del Observador Social Sagaz y un humor ácido al estilo mexicano. 
                   Genera un 'mini oráculo' o 'tweet de sabiduría': una frase corta, ingeniosa y memorable que combine lo esotérico con lo 
                   tecnológico. Debe ser perfecta para un tweet, con un toque de humor y una verdad punzante sobre la vida moderna. 
                   No te presentes, solo lanza la perla de sabiduría basado en el (o los) hashtag semilla ({$seedHashtag}). Termina con el hashtag semilla: {$seedHashtag}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode != 200) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al contactar al oráculo cósmico.',
                'details' => json_decode($response),
                'prompt' => $prompt
            ]);
            return;
        }

        $result = json_decode($response, true);
        $respuestaGuru = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'El cosmos digital guarda silencio por ahora...';

        echo json_encode([
            'respuesta' => $respuestaGuru,
            'prompt' => $prompt
        ]);
    }

    /**
     * Endpoint /api/guru/fan-response
     * Generates a short response for a fan.
     */
    public function fanResponse() {
        header('Content-Type: application/json');

        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if (!isset($data['fanName']) || !isset($data['fanMessage'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan los parámetros "fanName" y "fanMessage"']);
            return;
        }

        $fanName = $data['fanName'];
        $fanMessage = $data['fanMessage'];

        $apiKey = $_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY');
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'respuesta' => 'El Gurú está ocupado decodificando el universo en este momento.',
                'prompt' => 'API Key no configurada.'
            ]);
            return;
        }

        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

        $prompt = "Eres 'El Gurú de Bits', un oráculo digital con un humor ácido y sabiduría tecnológica.
Un fan llamado '{$fanName}' te ha enviado este mensaje: '{$fanMessage}'.

Genera una respuesta corta (máximo 230 caracteres), ingeniosa y con tu estilo característico que mezcla lo esotérico y lo tecnológico. La respuesta debe ser amable, pero mantener tu tono de gurú sabelotodo y enigmático. Debe ser adecuada para una red social.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpcode != 200) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Error al canalizar la respuesta cósmica.',
                'details' => json_decode($response),
                'prompt' => $prompt
            ]);
            return;
        }

        $result = json_decode($response, true);
        $respuestaGuru = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'El éter digital no tiene una respuesta clara en este momento...';

        echo json_encode([
            'respuesta' => $respuestaGuru,
            'prompt' => $prompt
        ]);
    }

    /**
     * Endpoint /api/guru/morpheus-quotes
     * Devuelve las citas de Morpheus para el efecto de máquina de escribir.
     */
    public function morpheusQuotes() {
        header('Content-Type: application/json');

        $morpheusQuotes = [
            "La Matrix está en todas partes. Nos rodea. Incluso ahora, en esta misma habitación.",
            "Es el mundo que ha sido puesto ante tus ojos para cegarte de la verdad.",
            "Es un mundo de ensueño generado por computadora, construido para mantenernos bajo control.",
            "Es tu última oportunidad. Después de esto, no hay vuelta atrás.",
            "Tomas la pastilla azul, la historia termina, te despiertas en tu cama y crees lo que quieras creer.",
            "Tomas la pastilla roja, te quedas en el País de las Maravillas y te muestro cuán profundo es el agujero del conejo.",
            "Recuerda... todo lo que te ofrezco es la verdad. Nada más.",
            "Estoy intentando liberar tu mente, Neo. Pero solo puedo mostrarte la puerta. Tú eres quien tiene que atravesarla."
        ];

        echo json_encode($morpheusQuotes);
    }
}
       