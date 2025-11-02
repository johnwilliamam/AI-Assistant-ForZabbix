var Gemini = {
    params: {},
    setParams: function(params) {
        if (typeof params !== 'object') {
            return;
        }
        Gemini.params = params;
        if (typeof Gemini.params.api_key !== 'string' || Gemini.params.api_key === '') {
            // Tradução: "API key for Gemini is required."
            throw 'A chave de API para o Gemini é obrigatória.';
        }
        Gemini.params.url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    },
    request: function(data) {
        if (!Gemini.params.api_key) {
            // Tradução: "API key is missing."
            throw 'A chave de API está faltando.';
        }
        var request = new HttpRequest();
        request.addHeader('Content-Type: application/json');
        
        // Tradução: "Construir URL con API key"
        // Construir URL com a chave de API
        var urlWithKey = Gemini.params.url + '?key=' + Gemini.params.api_key;
        
        // Tradução: "Sending request:"
        Zabbix.log(4, '[ Gemini Webhook ] Enviando requisição: ' + urlWithKey + '\n' + JSON.stringify(data));
        var response = request.post(urlWithKey, JSON.stringify(data));
        // Tradução: "Received response with status code"
        Zabbix.log(4, '[ Gemini Webhook ] Resposta recebida com código de status ' + request.getStatus() + '\n' + response);
        
        if (request.getStatus() < 200 || request.getStatus() >= 300) {
            // Tradução: "Gemini API request failed with status code"
            throw 'A requisição da API Gemini falhou com o código de status ' + request.getStatus() + '.';
        }
        
        try {
            response = JSON.parse(response);
        } catch (error) {
            // Tradução: "Failed to parse response from Gemini."
            Zabbix.log(4, '[ Gemini Webhook ] Falha ao analisar a resposta do Gemini.');
            response = null;
        }
        return response;
    }
};

try {
    var params = JSON.parse(value),
        data = {},
        result = "",
        required_params = ['alert_subject'];
    
    Object.keys(params).forEach(function(key) {
        if (required_params.indexOf(key) !== -1 && params[key] === '') {
            // Tradução: 'Parameter "' + key + '" cannot be empty.'
            throw 'O parâmetro "' + key + '" não pode estar vazio.';
        }
    });

    // Tradução: "Formatear la consulta para Gemini"
    // Formatar a consulta para o Gemini
    data = {
        contents: [{
            parts: [{
                // Tradução do prompt em Espanhol:
                text: "O alerta: " + params.alert_subject + " ocorreu no Zabbix. " +
                      "Sugira possíveis causas e soluções para resolver este problema, não faça um texto grande, " +
                      "apenas umas 10 linhas com causas, ideias, comandos de debug e medidas para mitigar futuros incidentes."
            }]
        }]
    };

    // Tradução: "Configurar la API de Gemini"
    // Configurar a API do Gemini
    Gemini.setParams({ api_key: params.api_key });
    
    // Tradução: "Hacer la solicitud a Gemini"
    // Fazer a solicitação ao Gemini
    var response = Gemini.request(data);
    
    if (response && response.candidates && response.candidates.length > 0) {
        result = response.candidates[0].content.parts[0].text.trim();
    } else {
        // Tradução: "No response from Gemini."
        throw 'Nenhuma resposta do Gemini.';
    }
    
    return result;
    
} catch (error) {
    Zabbix.log(3, '[ Gemini Webhook ] ERROR: ' + error);
    // Tradução: "Sending failed:"
    throw 'O envio falhou: ' + error;
}