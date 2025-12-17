document.addEventListener('DOMContentLoaded', () => {
    // Referências do HTML
    const formItem = document.getElementById('formularioAdicionarItem');
    const inputCooler = document.getElementById('nomeCooler');
    const inputProduto = document.getElementById('nomeProduto');
    const listaPreview = document.getElementById('listaItensPreview');
    const botaoGerar = document.getElementById('botaoGerarRelatorio');
    const relatorioSaida = document.getElementById('relatorioSaida');
    const botaoCopiar = document.getElementById('botaoCopiarRelatorio');

    // Configurações Padrão (Títulos e Observações fixos/vazios, pois os campos foram removidos do HTML)
    const TITULO_PADRAO = 'Relatório de Coolers e Produtos';
    const OBS_PADRAO = '';

    // Estado central: Armazena todos os itens do relatório
    let itensDoRelatorio = [];
    
    // Inicializa: esconde o botão de cópia
    botaoCopiar.style.display = 'none';

    // ----------------------------------------------------
    // 1. LÓGICA DE ADIÇÃO DE ITEM (Cooler + Produto)
    // ----------------------------------------------------
    formItem.addEventListener('submit', function(event) {
        event.preventDefault();

        const novoCooler = inputCooler.value.trim();
        const novoProduto = inputProduto.value.trim();

        if (novoCooler && novoProduto) {
            itensDoRelatorio.push({
                cooler: novoCooler,
                produto: novoProduto
            });
            
            // Renderiza a lista na pré-visualização e limpa o formulário
            renderizarPreview();
            formItem.reset();
            inputCooler.focus();
        }
    });

    // ----------------------------------------------------
    // 2. LÓGICA DE REMOÇÃO DE ITEM (Da pré-visualização)
    // ----------------------------------------------------
    listaPreview.addEventListener('click', function(event) {
        if (event.target.classList.contains('botao-remover')) {
            const indexParaRemover = parseInt(event.target.dataset.index);
            itensDoRelatorio.splice(indexParaRemover, 1); 
            renderizarPreview();
        }
    });

    // Função que redesenha a lista na seção de entrada
    function renderizarPreview() {
        if (itensDoRelatorio.length === 0) {
            listaPreview.innerHTML = '<p class="aviso-vazio">Nenhum item adicionado ainda.</p>';
            return;
        }

        let htmlTabela = `
            <table class="tabela-preview">
                <thead>
                    <tr>
                        <th>Cooler (ID/Nome)</th>
                        <th>Produto Específico</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        itensDoRelatorio.forEach((item, index) => {
            htmlTabela += `
                <tr>
                    <td>${item.cooler}</td>
                    <td>${item.produto}</td>
                    <td><button class="botao-remover" data-index="${index}">Remover</button></td>
                </tr>
            `;
        });

        htmlTabela += '</tbody></table>';
        listaPreview.innerHTML = htmlTabela;
    }


    // ----------------------------------------------------
    // 3. LÓGICA DE GERAÇÃO E VISUALIZAÇÃO DO RELATÓRIO FINAL
    // ----------------------------------------------------
    botaoGerar.addEventListener('click', function() {
        if (itensDoRelatorio.length === 0) {
            alert('Por favor, adicione pelo menos um Item (Cooler/Produto).');
            return;
        }

        // Gera e exibe o relatório no HTML
        const conteudoHTMLRelatorio = gerarConteudoHTML(TITULO_PADRAO, OBS_PADRAO, itensDoRelatorio);
        relatorioSaida.innerHTML = conteudoHTMLRelatorio;
        
        // Gera e armazena o texto plano (AGORA COM PARÊNTESES) para cópia
        const textoPlanoRelatorio = gerarTextoPlano(itensDoRelatorio);
        relatorioSaida.setAttribute('data-texto-copia', textoPlanoRelatorio);

        // Exibe o botão de cópia
        botaoCopiar.style.display = 'block'; 
    });


    // ----------------------------------------------------
    // 4. LÓGICA DE CÓPIA PARA WHATSAPP
    // ----------------------------------------------------
    botaoCopiar.addEventListener('click', function() {
        const textoParaCopiar = relatorioSaida.getAttribute('data-texto-copia');
        
        if (!textoParaCopiar) {
            alert('Por favor, gere o relatório primeiro!');
            return;
        }

        navigator.clipboard.writeText(textoParaCopiar)
            .then(() => {
                botaoCopiar.textContent = '✅ Copiado!';
                setTimeout(() => {
                    botaoCopiar.textContent = 'Copiar Relatório para WhatsApp';
                }, 2000); 
            })
            .catch(err => {
                console.error('Erro ao copiar o texto: ', err);
                alert('Falha ao copiar. O seu navegador pode não suportar a cópia automática.');
            });
    });

    // ----------------------------------------------------
    // 5. FUNÇÕES AUXILIARES PARA FORMATAÇÃO
    // ----------------------------------------------------
    
    // *** FUNÇÃO PARA COPIA (SOMENTE COOLER E PRODUTO COM PARÊNTESES) ***
    function gerarTextoPlano(itens) {
        
        let textoItens = itens.map((item) => {
            // Formato para cópia com parênteses, conforme solicitado:
            return `( *Cooler:* ${item.cooler} | *Produto:* ${item.produto} )`; 
        }).join('\n'); 

        return textoItens.trim();
    }
    
    // *** FUNÇÃO PARA VISUALIZAÇÃO (HTML) ***
    function gerarConteudoHTML(titulo, obsGerais, itens) {
        let tabelaCorpo = '';
        itens.forEach(item => {
            tabelaCorpo += `
                <tr>
                    <td>${item.cooler}</td>
                    <td>${item.produto}</td>
                </tr>
            `;
        });
        
        // O código de visualização usa o título e a data
        return `
            <div class="relatorio-pronto">
                <h3 class="relatorio-titulo">${titulo}</h3>
                <p class="relatorio-data"><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                
                <hr class="separador">
                
                <h4 class="subtitulo-relatorio">Itens do Relatório (${itens.length} Coolers):</h4>
                <table class="tabela-relatorio">
                    <thead>
                        <tr>
                            <th>Cooler (ID/Nome)</th>
                            <th>Produto Específico</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tabelaCorpo}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Roda a renderização inicial
    renderizarPreview(); 
});