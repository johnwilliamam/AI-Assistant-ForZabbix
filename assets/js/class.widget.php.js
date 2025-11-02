class WidgetInsightsJs extends CWidget {
    onInitialize() {
        super.onInitialize();
        this._analysisType = null;
        this._outputContainer = null;
        this._analyseBtn = null;
    }

    setContents(response) {
        if (!this._analysisType) {
            super.setContents(response);
            this._body.innerHTML = `
            <div class="options" style="text-align: center; margin-bottom: 20px;">
                <select id="analysisType">
                    <option value="Resumo">Resumo</option>
                    <option value="Perspectivas">Perspectivas</option>
                    <option value="Diagnostico">Diagnóstico</option>
                    <option value="Comparacao">Comparação</option>
                    <option value="Previsao">Previsão</option>
                    <option value="Oquevocefaria">O que você faria?</option>
                </select>
                <button id="analyseBtn">Analisar</button>
            </div>
            <div id="dashboard-container" class="dashboard-grid" style="height: 300px;">
                <div id="outputContainer" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"></div>
            </div>
            `;

            this._analysisType = this._body.querySelector('#analysisType');
            this._outputContainer = this._body.querySelector('#outputContainer');
            this._analyseBtn = this._body.querySelector('#analyseBtn');

            this._loadHtml2Canvas().then(() => {
                this._analyseBtn.addEventListener('click', this._onAnalyseBtnClick.bind(this));
            }).catch(error => {
                console.error('Falha ao carregar html2canvas:', error);
            });
        }
    }

    _loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                return resolve();
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    _getPromptForAnalysisType(analysisType) {
        const prompts = {
            'Resumo': "Esta imagem mostra um painel do Zabbix. Concentre-se apenas nos painéis dentro do dashboard. NÃO INCLUA o painel do AI Analyser em sua análise. Forneça um breve resumo do que o painel está mostrando, focando nos pontos mais críticos e relevantes. As cores mais claras no mapa de calor indicam uso mais alto, e as mais escuras, uso mais baixo. Sempre comece com 'Este painel mostra...' e garanta que o resumo capture as ideias principais sem entrar em muitos detalhes.",
            'Perspectivas': "Esta imagem mostra um painel de controle do Zabbix. Concentre-se apenas nos painéis dentro do dashboard. NÃO INCLUA o painel do AI Analyser em sua análise. Explique o que as informações mostram e compartilhe quaisquer percepções (insights) que possam ser extraídas. As cores mais claras no mapa de calor indicam uso mais alto, e as mais escuras, uso mais baixo. Sempre comece com 'Este painel de controle mostra...' e forneça detalhes sobre as informações apresentadas, destacando tendências, padrões ou anomalias observadas.",
            'Diagnostico': "Esta imagem mostra um painel de controle do Zabbix. Foque apenas nos painéis dentro do dashboard. NÃO INCLUA o painel do AI Analyser em sua análise. Analise os dados para identificar possíveis problemas ou preocupações, destacando correlações e pontos críticos de atenção. As cores mais claras no mapa de calor indicam uso mais alto, e as mais escuras, uso mais baixo. Sempre comece com 'Este painel de controle mostra...' e forneça um diagnóstico detalhado de qualquer possível falha ou ineficiência indicada pelos dados.",
            'Comparacao': "Esta imagem mostra um painel de controle do Zabbix. Foque apenas nos painéis dentro do dashboard. NÃO INCLUA o painel do AI Analyser em sua análise. Compare os dados dos diferentes painéis para destacar correlações, discrepâncias ou diferenças significativas. As cores mais claras no mapa de calor indicam uso mais alto, e as mais escuras, uso mais baixo. Sempre comece com 'Este painel de controle mostra...' e ofereça uma análise comparativa explicando como os dados se relacionam entre si.",
            'Previsao': "Esta imagem mostra um painel de controle do Zabbix. Foque apenas nos painéis dentro do dashboard. NÃO INCLUA o painel do AI Analyser em sua análise. Com base nos dados atuais, forneça uma previsão das tendências e padrões futuros de uso. As cores mais claras no mapa de calor indicam uso mais alto, e as mais escuras, uso mais baixo. Sempre comece com 'Este painel de controle mostra...' e ofereça uma visão de como os dados podem evoluir, explicando a base das suas previsões.",
            'Oquevocefaria': "Esta imagem mostra um painel do Zabbix. Foque apenas nos painéis dentro do dashboard. NÃO INCLUA o painel do AI Analyser em sua análise. Com base nos dados exibidos, sugira ações proativas que um administrador de sistemas deve tomar para prevenir problemas e otimizar o desempenho. As cores mais claras no mapa de calor indicam uso mais alto, e as mais escuras, uso mais baixo. Comece com 'Com base neste painel, as ações proativas recomendadas são:' e forneça pelo menos 5 ações específicas, explicando o motivo e o impacto esperado de cada uma. Em seguida, imagine que você é um consultor de otimização de sistemas. Desenvolva uma estratégia de melhoria contínua de longo prazo com base nos dados exibidos, estabelecendo um plano de 3 a 6 meses. Comece com 'Para melhorar continuamente o sistema mostrado neste painel, recomendo a seguinte estratégia:' e detalhe objetivos específicos, métricas a acompanhar e mudanças sugeridas na infraestrutura ou nos processos. Explique como cada parte da estratégia se relaciona com os dados observados e como essas recomendações podem melhorar o desempenho futuro."
        };
        return prompts[analysisType];
    }

    async _onAnalyseBtnClick() {
        console.log("Botão de análise clicado...");
        const analysisType = this._analysisType.value;
        console.log("Tipo de análise selecionado:", analysisType);
        this._outputContainer.innerHTML = 'Analisando...';

        try {
            console.log("Capturando o painel...");
            const canvas = await html2canvas(document.querySelector('main'));
            console.log("Canvas criado:", canvas);
            const dataUrl = canvas.toDataURL('image/png');
            console.log("URL de imagem criada");

            const base64Image = dataUrl.split(',')[1];
            const prompt = this._getPromptForAnalysisType(analysisType);

            console.log("Enviando imagem capturada para a API Gemini...");
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/png",
                                    data: base64Image
                                }
                            }
                        ]
                    }]
                })
            });

            const responseData = await response.json();
            console.log("Resposta da Gemini:", responseData);

            const responseContent = responseData.candidates[0].content.parts[0].text;
            this._outputContainer.innerHTML = `<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">${responseContent}</div>`;
            console.log("Resultado da análise:", responseContent);

        } catch (error) {
            console.error('Erro durante a análise:', error);
            this._outputContainer.innerHTML = '<div style="border: 1px solid #f00; padding: 10px; border-radius: 5px; background-color: #fee;">Ocorreu um erro durante a análise.</div>';
        }
    }
}

// Registrar o widget
addWidgetClass(WidgetInsightsJs);
