// Verificação de acesso admin
$(document).ready(function() {
    if (!isAdmin()) {
        alert('Acesso negado! Apenas administradores podem acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    const usuario = obterUsuarioLogado();
    $('#nome-usuario').text(usuario.nome);

    carregarProdutosAdmin();

    // Logout
    $('#btn-logout').on('click', function() {
        fazerLogout();
    });

    // Abrir modal para novo produto
    $('#btn-novo-produto').on('click', function() {
        abrirModalProduto();
    });

    // Salvar produto
    $('#btn-salvar-produto').on('click', function() {
        salvarProduto();
    });
});

const MOCKAPI_BASE_URL = "https://690a89a81a446bb9cc22d695.mockapi.io";
const PRODUTOS_ENDPOINT = `${MOCKAPI_BASE_URL}/produtos`;

// Carregar produtos na tabela
function carregarProdutosAdmin() {
    $.ajax({
        url: PRODUTOS_ENDPOINT,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            renderizarTabelaProdutos(data);
        },
        error: function(xhr, status, error) {
            console.error('Erro ao carregar produtos:', status, error);
            alert('Erro ao carregar produtos.');
        }
    });
}

// Renderizar tabela de produtos
function renderizarTabelaProdutos(produtos) {
    const tabela = $('#tabela-produtos');
    tabela.empty();

    if (produtos.length === 0) {
        tabela.append('<tr><td colspan="5" class="text-center">Nenhum produto cadastrado</td></tr>');
        return;
    }

    produtos.forEach(produto => {
        const imagemUrl = produto.imagem || `https://picsum.photos/80/60?random=${produto.id}`;
        //const imagemUrl = `https://picsum.photos/80/60?random=${produto.id}`;
        const linha = `
            <tr>
                <td>${produto.id}</td>
                <td><img src="${imagemUrl}" alt="${produto.nome}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                <td>${produto.nome}</td>
                <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${produto.id}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-excluir" data-id="${produto.id}">Excluir</button>
                </td>
            </tr>
        `;
        tabela.append(linha);
    });

    // Eventos de editar e excluir
    $('.btn-editar').on('click', function() {
        const id = $(this).data('id');
        editarProduto(id);
    });

    $('.btn-excluir').on('click', function() {
        const id = $(this).data('id');
        excluirProduto(id);
    });
}

// Abrir modal para criar/editar produto
function abrirModalProduto(produto = null) {
    if (produto) {
        $('#modal-titulo').text('Editar Produto');
        $('#produto-id').val(produto.id);
        $('#produto-nome').val(produto.nome);
        $('#produto-preco').val(produto.preco);
        $('#produto-imagem').val(produto.imagem || '');
    } else {
        $('#modal-titulo').text('Novo Produto');
        $('#form-produto')[0].reset();
        $('#produto-id').val('');
    }
    
    $('#modal-produto').modal('show');
}

// Salvar produto (criar ou atualizar)
function salvarProduto() {
    const id = $('#produto-id').val();
    const nome = $('#produto-nome').val();
    const preco = parseFloat($('#produto-preco').val());
    const imagem = $('#produto-imagem').val() || `https://picsum.photos/300/200?random=${Date.now()}`;

    if (!nome || !preco || preco < 0) {
        alert('Por favor, preencha todos os campos obrigatórios corretamente.');
        return;
    }

    const dadosProduto = {
        nome: nome,
        preco: preco,
        imagem: imagem
    };

    if (id) {
        // Atualizar produto existente (PUT)
        $.ajax({
            url: `${PRODUTOS_ENDPOINT}/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(dadosProduto),
            success: function(data) {
                console.log('Produto atualizado:', data);
                $('#modal-produto').modal('hide');
                alert('Produto atualizado com sucesso!');
                carregarProdutosAdmin();
            },
            error: function(xhr, status, error) {
                console.error('Erro ao atualizar produto:', status, error);
                alert('Erro ao atualizar produto.');
            }
        });
    } else {
        // Criar novo produto (POST)
        $.ajax({
            url: PRODUTOS_ENDPOINT,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dadosProduto),
            success: function(data) {
                console.log('Produto criado:', data);
                $('#modal-produto').modal('hide');
                alert('Produto criado com sucesso!');
                carregarProdutosAdmin();
            },
            error: function(xhr, status, error) {
                console.error('Erro ao criar produto:', status, error);
                alert('Erro ao criar produto.');
            }
        });
    }
}

// Editar produto
function editarProduto(id) {
    $.ajax({
        url: `${PRODUTOS_ENDPOINT}/${id}`,
        method: 'GET',
        dataType: 'json',
        success: function(produto) {
            abrirModalProduto(produto);
        },
        error: function(xhr, status, error) {
            console.error('Erro ao buscar produto:', status, error);
            alert('Erro ao buscar produto.');
        }
    });
}

// Excluir produto
function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    $.ajax({
        url: `${PRODUTOS_ENDPOINT}/${id}`,
        method: 'DELETE',
        success: function() {
            console.log('Produto excluído:', id);
            alert('Produto excluído com sucesso!');
            carregarProdutosAdmin();
        },
        error: function(xhr, status, error) {
            console.error('Erro ao excluir produto:', status, error);
            alert('Erro ao excluir produto.');
        }
    });
}

function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    
    $.ajax({
        url: `${CART_ENDPOINT}`,
        method: 'GET',
        success: function(carrinho) {

            const existeNoCarrinho = carrinho.some(item => item.produtoId == id);

            if (existeNoCarrinho) {
                alert('Este produto não pode ser excluído porque está presente no carrinho de um usuário.');
                return;
            }

            // Se não estiver no carrinho → prossegue com exclusão
            $.ajax({
                url: `${PRODUTOS_ENDPOINT}/${id}`,
                method: 'DELETE',
                success: function() {
                    console.log('Produto excluído:', id);
                    alert('Produto excluído com sucesso!');
                    carregarProdutosAdmin();
                },
                error: function(xhr, status, error) {
                    console.error('Erro ao excluir produto:', status, error);
                    alert('Erro ao excluir produto.');
                }
            });

        },
        error: function(xhr, status, error) {
            console.error('Erro ao verificar carrinho:', status, error);
            alert('Erro ao verificar se o produto está no carrinho.');
        }
    });
}