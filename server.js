arquivo server.js

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public")); // pasta pública


app.engine('handlebars', exphbs.engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');
app.set('views', './views'); // pasta das views


let servicos = [];
let clientes = [];
let agendamentos = [];

let idServico = 1;
let idCliente = 1;
let idAgendamento = 1;


app.get("/", (req, res) => {
  res.render("inicio");
});


// ROTAS DE SERVIÇOS

app.get("/servicos", (req, res) => {
  res.render("servicos/listar", { servicos });
});

// Rota para criar novo serviço (formulário)
app.get("/servicos/novo", (req, res) => {
  res.render("servicos/novo");
});

// Criar serviço (POST)
app.post("/servicos/criar", (req, res) => {
  servicos.push({ id: idServico++, nome: req.body.nome, preco: req.body.preco });
  res.redirect("/servicos");
});

app.get("/servicos/editar/:id", (req, res) => {
  const servico = servicos.find(s => s.id === Number(req.params.id));
  if (!servico) return res.send("Serviço não encontrado.");
  res.render("servicos/editar", { servico });
});

app.post("/servicos/atualizar/:id", (req, res) => {
  const servico = servicos.find(s => s.id === Number(req.params.id));
  if (!servico) return res.send("Serviço não encontrado.");
  servico.nome = req.body.nome;
  servico.preco = req.body.preco;
  res.redirect("/servicos");
});

app.get("/servicos/remover/:id", (req, res) => {
  servicos = servicos.filter(s => s.id !== Number(req.params.id));
  res.redirect("/servicos");
});

// Ver detalhes de um serviço
app.get("/servicos/ver/:id", (req, res) => {
  const servico = servicos.find(s => s.id === Number(req.params.id));
  if (!servico) return res.send("Serviço não encontrado.");
  res.render("servicos/servico-ver", { servico });
});


// ROTAS DE CLIENTES

app.get("/clientes", (req, res) => {
  res.render("clientes/listar", { clientes });
});

app.post("/clientes/criar", (req, res) => {
  clientes.push({
    id: idCliente++,
    nome: req.body.nome,
    telefone: req.body.telefone
  });
  res.redirect("/clientes");
});

app.get("/clientes/editar/:id", (req, res) => {
  const cliente = clientes.find(c => c.id === Number(req.params.id));
  if (!cliente) return res.send("Cliente não encontrado.");
  res.render("clientes/editar", { cliente });
});

app.post("/clientes/atualizar/:id", (req, res) => {
  const cliente = clientes.find(c => c.id === Number(req.params.id));
  if (!cliente) return res.send("Cliente não encontrado.");
  cliente.nome = req.body.nome;
  cliente.telefone = req.body.telefone;
  res.redirect("/clientes");
});

app.get("/clientes/remover/:id", (req, res) => {
  clientes = clientes.filter(c => c.id !== Number(req.params.id));
  agendamentos = agendamentos.filter(a => a.clienteId !== Number(req.params.id));
  res.redirect("/clientes");
});

// Ver detalhes de um cliente
app.get("/clientes/ver/:id", (req, res) => {
  const cliente = clientes.find(c => c.id === Number(req.params.id));
  if (!cliente) return res.send("Cliente não encontrado.");
  const agendaDoCliente = agendamentos
    .filter(a => a.clienteId === cliente.id)
    .map(a => ({ ...a, servico: servicos.find(s => s.id === a.servicoId)?.nome }));
  res.render("clientes/cliente-ver", { cliente, agendaDoCliente });
});


// ROTAS DE AGENDAMENTOS

app.get("/agendamentos", (req, res) => {
  const lista = agendamentos.map(a => ({
    ...a,
    cliente: clientes.find(c => c.id === a.clienteId)?.nome,
    servico: servicos.find(s => s.id === a.servicoId)?.nome
  }));
  res.render("agendamentos/listar", { agendamentos: lista });
});

app.get("/agendamentos/criar", (req, res) => {
  res.render("agendamentos/criar", { clientes, servicos });
});

app.post("/agendamentos/criar", (req, res) => {
  agendamentos.push({
    id: idAgendamento++,
    horario: req.body.horario,
    clienteId: Number(req.body.clienteId),
    servicoId: Number(req.body.servicoId)
  });
  res.redirect("/agendamentos");
});

app.get("/agendamentos/editar/:id", (req, res) => {
  const agendamento = agendamentos.find(a => a.id === Number(req.params.id));
  if (!agendamento) return res.send("Agendamento não encontrado.");
  res.render("agendamentos/editar", { agendamento, clientes, servicos });
});

app.post("/agendamentos/atualizar/:id", (req, res) => {
  const a = agendamentos.find(ag => ag.id === Number(req.params.id));
  if (!a) return res.send("Agendamento não encontrado.");
  a.horario = req.body.horario;
  a.clienteId = Number(req.body.clienteId);
  a.servicoId = Number(req.body.servicoId);
  res.redirect("/agendamentos");
});

app.get("/agendamentos/remover/:id", (req, res) => {
  agendamentos = agendamentos.filter(a => a.id !== Number(req.params.id));
  res.redirect("/agendamentos");
});

// Ver detalhes de um agendamento
app.get("/agendamentos/ver/:id", (req, res) => {
  const agendamento = agendamentos.find(a => a.id === Number(req.params.id));
  if (!agendamento) return res.send("Agendamento não encontrado.");
  const ag = {
    ...agendamento,
    cliente: clientes.find(c => c.id === agendamento.clienteId)?.nome,
    servico: servicos.find(s => s.id === agendamento.servicoId)?.nome
  };
  res.render("agendamento-ver", { ag });
});


// HORÁRIOS DISPONÍVEIS

app.get("/agendamentos/disponiveis", (req, res) => {
  const horarios = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];
  const ocupados = agendamentos.map(a => a.horario);
  const livres = horarios.filter(h => !ocupados.includes(h));
  res.render("agendamentos/disponiveis", { livres });
});
app.listen(port, () => {
  console.log(`SERVIDOR RODANDO http://localhost:${port}`);
});
