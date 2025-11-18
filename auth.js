// Sistema de Autenticação
const USUARIOS = {
    admin: {
        email: 'admin@minishop.com',
        senha: '123456',
        tipo: 'admin',
        nome: 'Administrador'
    },
    cliente: {
        email: 'cliente@minishop.com',
        senha: '123456',
        tipo: 'cliente',
        nome: 'Cliente'
    }
};

// Função para fazer login
function fazerLogin(email, senha) {
    const usuario = Object.values(USUARIOS).find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
        const dadosUsuario = {
            email: usuario.email,
            tipo: usuario.tipo,
            nome: usuario.nome
        };
        localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));
        return true;
    }
    return false;
}

// Função para fazer logout
function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

// Função para obter usuário logado
function obterUsuarioLogado() {
    const dados = localStorage.getItem('usuarioLogado');
    return dados ? JSON.parse(dados) : null;
}

// Função para verificar se é admin
function isAdmin() {
    const usuario = obterUsuarioLogado();
    return usuario && usuario.tipo === 'admin';
}

// Função para verificar se está logado
function estaLogado() {
    return obterUsuarioLogado() !== null;
}

// Handler do formulário de login
$(document).ready(function() {
    $('#form-login').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const senha = $('#senha').val();
        
        if (fazerLogin(email, senha)) {
            alert('Login realizado com sucesso!');
            window.location.href = 'index.html';
        } else {
            alert('Email ou senha incorretos!');
        }
    });
});