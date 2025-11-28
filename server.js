
const express = require('express');
const exphbs = require ('express-handlebars');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded ({ extended: true}));

app.engine('handlebars', exphbs.engine({defaultLayout: false}));
app.set('view engine', 'handlebars');



let servicos = [];
let clientes = [];
let agendamentos = [];

let idServico = 1;
let idCliente = 1;
let idAgendamento = 1;


app.get("/", (req, res) => {
  res.render("inicio");
});


// SERVIÇos
app.get("/servicos", (req, res) => {
  res.render("servicos/listar", { servicos });
});

app.post("/servicos/criar", (req, res) => {
  servicos.push({
    id: idServico++,
    nome: req.body.nome
  });
  res.redirect("/servicos");
});

app.get("/servicos/editar/:id", (req, res) => {
  const servico = servicos.find(s => s.id == req.params.id);
  res.render("servicos/editar", { servico });
});

app.post("/servicos/atualizar/:id", (req, res) => {
  const servico = servicos.find(s => s.id == req.params.id);
  servico.nome = req.body.nome;
  res.redirect("/servicos");
});

app.get("/servicos/remover/:id", (req, res) => {
  servicos = servicos.filter(s => s.id != req.params.id);
  res.redirect("/servicos");
});

// CLIENTES
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

app.get("/clientes/detalhes/:id", (req, res) => {
  const cliente = clientes.find(c => c.id == req.params.id);

  const agendaDoCliente = agendamentos
    .filter(a => a.clienteId == cliente.id)
    .map(a => ({
      ...a,
      servico: servicos.find(s => s.id == a.servicoId)?.nome
    }));

  res.render("clientes/detalhes", { cliente, agendaDoCliente });
});

app.get("/clientes/editar/:id", (req, res) => {
  const cliente = clientes.find(c => c.id == req.params.id);
  res.render("clientes/editar", { cliente });
});

app.post("/clientes/atualizar/:id", (req, res) => {
  const cliente = clientes.find(c => c.id == req.params.id);
  cliente.nome = req.body.nome;
  cliente.telefone = req.body.telefone;
  res.redirect("/clientes");
});

app.get("/clientes/remover/:id", (req, res) => {
  clientes = clientes.filter(c => c.id != req.params.id);
  agendamentos = agendamentos.filter(a => a.clienteId != req.params.id);
  res.redirect("/clientes");
});

// AGENDAMENTOS
app.get("/agendamentos", (req, res) => {
  const lista = agendamentos.map(a => ({
    ...a,
    cliente: clientes.find(c => c.id == a.clienteId)?.nome,
    servico: servicos.find(s => s.id == a.servicoId)?.nome
  }));
  res.render("agendamentos/listar", { agendamentos: lista });
});

app.get("/agendamentos/criar", (req, res) => {
  res.render("agendamentos/criar", {
    clientes,
    servicos
  });
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

app.get("/agendamentos/detalhes/:id", (req, res) => {
  const a = agendamentos.find(ag => ag.id == req.params.id);
  const info = {
    ...a,
    cliente: clientes.find(c => c.id == a.clienteId)?.nome,
    servico: servicos.find(s => s.id == a.servicoId)?.nome
  };
  res.render("agendamentos/detalhes", { agendamento: info });
});

app.get("/agendamentos/editar/:id", (req, res) => {
  const agendamento = agendamentos.find(a => a.id == req.params.id);

  res.render("agendamentos/editar", {
    agendamento,
    clientes,
    servicos
  });
});

app.post("/agendamentos/atualizar/:id", (req, res) => {
  const a = agendamentos.find(ag => ag.id == req.params.id);

  a.horario = req.body.horario;
  a.clienteId = Number(req.body.clienteId);
  a.servicoId = Number(req.body.servicoId);

  res.redirect("/agendamentos");
});

app.get("/agendamentos/remover/:id", (req, res) => {
  agendamentos = agendamentos.filter(a => a.id != req.params.id);
  res.redirect("/agendamentos");
});

// HORÁRIOS DISPONÍVEIS
app.get("/agendamentos/disponiveis", (req, res) => {
  const horarios = [
    "08:00", "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const ocupados = agendamentos.map(a => a.horario);
  const livres = horarios.filter(h => !ocupados.includes(h));

  res.render("agendamentos/disponiveis", { livres });
});







app.listen(3000, () => {
  console.log("SERVIDOR RODANDO http://localhost:3000");
});
