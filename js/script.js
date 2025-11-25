// ----------------------------------------------------------------- //
const MOCKAPI_BASE_URL = "https://690a89a81a446bb9cc22d695.mockapi.io";
const CART_ENDPOINT = `${MOCKAPI_BASE_URL}/cart`;
const PRODUTOS_ENDPOINT = `${MOCKAPI_BASE_URL}/produtos`;

//  Dados Estáticos de Produtos (Caso dee erro no get)
let PRODUTOS_JSON = [

    { id: "1", nome: "Smartphone X", preco: 1500.00, imagem: "https://via.placeholder.com/300x200?text=Smartphone+X" },
    { id: "2", nome: "Notebook Pro", preco: 4500.00, imagem: "https://via.placeholder.com/300x200?text=Notebook+Pro" },
    { id: "3", nome: "Fone Bluetooth", preco: 250.00, imagem: "https://via.placeholder.com/300x200?text=Fone+Bluetooth" },
    { id: "4", nome: "Smartwatch Z", preco: 800.00, imagem: "https://via.placeholder.com/300x200?text=Smartwatch+Z" }
];

// Verificar e atualizar menu do usuário
function atualizarMenuUsuario() {
    const usuario = obterUsuarioLogado();
    const menuUsuario = $('#menu-usuario');
    const menuAdmin = $('#menu-admin');
    const menuAdminFil = $('#menu-admin_fil');
    const btnSair = $('#btn-logout-loja');
    
    if (usuario) {
        if (usuario.tipo === 'admin') {
            menuAdmin.show();
            menuAdminFil.show();
        }
        menuUsuario.html(`
            <span class="navbar-text mr-3">Olá, ${usuario.nome}</span>
        `);
        btnSair.show();
        
        btnSair.on('click', function(e) {
            e.preventDefault();
            fazerLogout();
        });
    } else {
        menuAdmin.hide();
        menuAdminFil.hide();
        btnSair.hide();
        menuUsuario.html(`
            <a class="nav-link" href="login.html">Login</a>
        `);
    }
}

function renderizarProdutos(produtos) {
    const produtosContainer = $('#produtos');
    produtosContainer.empty(); // Limpa o container

    produtosContainer.append('<h2 class="col-12 text-center mb-4">Catálogo de Produtos</h2>');

    produtos.forEach(produto => {
        const produtoCard = `
            <div class="col-lg-3 col-md-6 col-sm-12">
                <article class="card card-produto">
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">R$ ${produto.preco.toFixed(2)}</p>
                        <button class="btn btn-primary btn-adicionar-carrinho" data-produto-id="${produto.id}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </article>
            </div>
        `;
        produtosContainer.append(produtoCard);
    });

    // Adiciona o evento de clique para os botões "Adicionar ao Carrinho"
    $('.btn-adicionar-carrinho').on('click', function() {

        const produtoId = $(this).data('produto-id'); 

        console.log('debig:', produtoId || "-" || PRODUTOS_JSON.id);
        const produto = PRODUTOS_JSON.find(p => p.id === String(produtoId));
        console.log('debig:', produto);
        console.log('debig:', PRODUTOS_JSON);
        if (produto) {
            adicionarAoCarrinho(produto);
        }
    });
}

// GET:  chamada /produtos
function carregarProdutos() {  

        $.ajax({
        url: PRODUTOS_ENDPOINT,
        method: 'GET',
        dataType: 'json',
        success: function(data) {

            const produtosComImagensRandom = data.map(produto => ({
                ...(produto.imagem === null ? {
                // ...retorne um novo objeto com a nova imagem e o restante do produto
                ...produto,
                imagem: gerarUrlImagemAleatoria(produto.id)
                } : {
                // ...caso contrário, retorne o produto original
                ...produto
                })
            }));

            console.log('Produtos carregados:', produtosComImagensRandom);
            renderizarProdutos(produtosComImagensRandom);
            PRODUTOS_JSON = produtosComImagensRandom;

        },
        error: function(xhr, status, error) {
            console.error('Erro ao carregar produtos:', status, error);
            alert('Erro ao carregar o catálogo de produtos. Verifique a configuração da API.');
            const produtos = PRODUTOS_JSON;
            renderizarProdutos(produtos);
        }
    });
}

function gerarUrlImagemAleatoria(id, largura = 300, altura = 200) {
    //return `https://picsum.photos/id/${id}/300/200`;
    
    // OU, se você quiser uma imagem 100% nova em CADA REFRESH:
     return `https://picsum.photos/${largura}/${altura}?random=${Math.random()}`;
}

function renderizarCarrinho(itensCarrinho) {
    const carrinhoLista = $('#carrinho-lista');
    carrinhoLista.empty(); // Limpa a lista

    let total = 0;
    let contador = 0;

    let itemDist = new Array();

    if (itensCarrinho.length === 0) {
        carrinhoLista.append('<li class="list-group-item text-center">O carrinho está vazio.</li>');
        $('#finalizar-compra').prop('disabled', true);
    } else {
        itensCarrinho.forEach(item => {
            // Validação de dados: Garante que preco e quantidade são números
            const preco = parseFloat(item.preco) || 0;
            const quantidade = parseInt(item.quantidade) || 0;

            if(!itemDist.includes(item.id)){
                contador++;
                itemDist.push(item.id);
            }
            //

            const subtotal = preco * quantidade;
            total += subtotal;

            const itemImage = PRODUTOS_JSON.find(x => x.id === item.produtoId).imagem;
                    console.log('image debug:', itemImage);


            const itemHtml = `
                <li class="list-group-item" data-item-id="${item.id}">
                    <img src="${itemImage}" alt="${item.nome}" class="item-carrinho-img">
                    <div class="item-carrinho-info">
                        <strong>${item.nome}</strong>
                        <p class="mb-0">Preço: R$ ${preco.toFixed(2)}</p>
                    </div>
                    <div class="item-carrinho-acoes">
                        <button class="btn btn-sm btn-outline-secondary btn-diminuir-qtd" data-item-id="${item.id}">-</button>
                        <input type="number" class="form-control form-control-sm text-center input-quantidade" value="${quantidade}" min="1" data-item-id="${item.id}" readonly>
                        <button class="btn btn-sm btn-outline-secondary btn-aumentar-qtd" data-item-id="${item.id}">+</button>
                        <div class="text-subtotal">
        <p class="mb-0">Subtotal: R$ ${subtotal.toFixed(2)}</p>
    </div>
                        <button class="btn btn-danger btn-sm ml-3 btn-remover-item" data-item-id="${item.id}">
                            Excluir
                        </button>
                    </div>
                </li>
            `;
            carrinhoLista.append(itemHtml);
        });
        $('#finalizar-compra').prop('disabled', false);
    }

    $('#total-carrinho').text(total.toFixed(2));
    $('#carrinho-contador').text(contador);
}

// GET: itens do carrinho
function buscarCarrinho() {
    $.ajax({
        url: CART_ENDPOINT,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log('Carrinho carregado:', data);
            renderizarCarrinho(data);
        },
        error: function(xhr, status, error) {
            console.error('Erro ao buscar carrinho:', status, error);

            alert('Erro ao carregar o carrinho. Verifique a URL do MockAPI.io e se o endpoint /cart está configurado corretamente.');
        }
    });
}

// POST: Adicionar item ao carrinho
function adicionarAoCarrinho(produto) {
    
    $.ajax({
        url: CART_ENDPOINT,
        method: 'GET',
        dataType: 'json',
        success: function(itensCarrinho) {

            const itemExistente = itensCarrinho.find(item => String(item.produtoId) === String(produto.id));

            if (itemExistente) {
                // Se existe, atualiza a quantidade 
                atualizarQuantidade(itemExistente.id, parseInt(itemExistente.quantidade) + 1);
            } else {
                // Se não existe, cria um novo item
                const novoItem = {
                    produtoId: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: 1
                };

                $.ajax({
                    url: CART_ENDPOINT,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(novoItem),
                    success: function(data) {
                        console.log('Item adicionado:', data);
                        buscarCarrinho(); // Recarrega o carrinho
                    },
                    error: function(xhr, status, error) {
                        console.error('Erro ao adicionar item:', status, error);
                        alert('Erro ao adicionar item ao carrinho.');
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Erro ao verificar carrinho:', status, error);
            alert('Erro ao verificar o carrinho.');
        }
    });
}

// PUT: Atualizar a quantidade item
function atualizarQuantidade(itemId, novaQuantidade) {
    if (novaQuantidade <= 0) {
        alert('A quantidade deve ser no mínimo 1.');
        return;
    }

    const itemUrl = `${CART_ENDPOINT}/${itemId}`;
    const dadosAtualizados = {
        quantidade: novaQuantidade
    };

    $.ajax({
        url: itemUrl,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(dadosAtualizados),
        success: function(data) {
            console.log('Quantidade atualizada:', data);
            buscarCarrinho(); // Recarrega o carrinho
        },
        error: function(xhr, status, error) {
            console.error('Erro ao atualizar quantidade:', status, error);
            alert('Erro ao atualizar a quantidade do item.');
        }
    });
}

// DELETE: Remover item carrinho
function removerDoCarrinho(itemId) {
    const itemUrl = `${CART_ENDPOINT}/${itemId}`;

    $.ajax({
        url: itemUrl,
        method: 'DELETE',
        success: function() {
            console.log('Item removido:', itemId);
            buscarCarrinho(); // Recarrega o carrinho
        },
        error: function(xhr, status, error) {
            console.error('Erro ao remover item:', status, error);
            alert('Erro ao remover item do carrinho.');
        }
    });
}

// Init da Aplicação
$(document).ready(function() {
    atualizarMenuUsuario();
    carregarProdutos();
    buscarCarrinho(); 
 

    // funcoes aumentar e diminuir qtde no carrinho
    $('#carrinho-lista').on('click', '.btn-aumentar-qtd', function() {
        const itemId = $(this).data('item-id');
        $.ajax({
            url: `${CART_ENDPOINT}/${itemId}`,
            method: 'GET',
            success: function(item) {
                atualizarQuantidade(itemId, parseInt(item.quantidade) + 1);
            }
        });
    });

    $('#carrinho-lista').on('click', '.btn-diminuir-qtd', function() {
        const itemId = $(this).data('item-id');
        $.ajax({
            url: `${CART_ENDPOINT}/${itemId}`,
            method: 'GET',
            success: function(item) {
                if (parseInt(item.quantidade) > 1) {
                    atualizarQuantidade(itemId, parseInt(item.quantidade) - 1);
                } else {
                    removerDoCarrinho(itemId);
                }
            }
        });
    });

    $('#carrinho-lista').on('click', '.btn-remover-item', function() {
        const itemId = $(this).data('item-id');
        removerDoCarrinho(itemId);
    });
});

// mensagem finaliza compra
$('#finalizar-compra').on('click', function() {
    alert('Compra finalizada com sucesso! O carrinho será limpo na próxima atualização.');
});
