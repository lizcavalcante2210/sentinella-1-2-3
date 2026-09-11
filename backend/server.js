const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");


// ==================================================
// BANCO DE DADOS
// ==================================================

function readDB() {

  if (!fs.existsSync(DB_FILE)) {

    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: [],
      altas: [],
      tv_chamada: null,
      tv_historico: []
    };

  }

  const db =
    JSON.parse(
      fs.readFileSync(DB_FILE, "utf8")
    );


  if (!db.tv_chamada) {
    db.tv_chamada = null;
  }

  if (!db.tv_historico) {
    db.tv_historico = [];
  }

  if (!db.pacientes) {
    db.pacientes = [];
  }

  if (!db.triagens) {
    db.triagens = [];
  }

  if (!db.consultas) {
    db.consultas = [];
  }

  if (!db.altas) {
    db.altas = [];
  }


  return db;
}


function writeDB(data) {

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );

}


// ==================================================
// LOGIN
// ==================================================

app.post("/login", (req, res) => {

  const db = readDB();

  const user =
    db.usuarios.find(
      u =>
        u.usuario === req.body.usuario &&
        u.senha === req.body.senha
    );


  if (!user) {

    return res.status(401).json({
      erro: "Login inválido"
    });

  }


  res.json(user);

});


// ==================================================
// CADASTRAR PACIENTE
// ==================================================

app.post("/atendimento", (req, res) => {

  try {

    const db = readDB();


    const paciente = {

      id: Date.now(),

      nome:
        req.body.nome || "",

      cpf:
        req.body.cpf || "",

      nascimento:
        req.body.nascimento ||
        req.body.dataNascimento ||
        "",

      sexo:
        req.body.sexo || "",

      rg:
        req.body.rg || "",

      nomeMae:
        req.body.nomeMae || "",

      estadoCivil:
        req.body.estadoCivil || "",

      telefone:
        req.body.telefone || "",

      email:
        req.body.email || "",

      contatoEmergencia:
        req.body.contatoEmergencia || "",

      endereco:
        req.body.endereco || "",

      cidade:
        req.body.cidade || "",

      estado:
        req.body.estado || "",

      tipo:
        req.body.tipo || "Particular",

      convenio:
        req.body.convenio || "",

      alergias:
        req.body.alergias ||
        req.body.alergia ||
        "",

      tipoSanguineo:
        req.body.tipoSanguineo || "",

      observacoes:
        req.body.observacoes || "",

      status:
        "triagem",

      createdAt:
        new Date().toISOString()

    };


    db.pacientes.push(paciente);

    writeDB(db);


    console.log(
      "Paciente cadastrado:",
      paciente
    );


    res.status(201).json({

      sucesso: true,

      mensagem:
        "Paciente cadastrado com sucesso!",

      paciente

    });

  }

  catch (erro) {

    console.error(
      "Erro ao cadastrar paciente:",
      erro
    );


    res.status(500).json({

      sucesso: false,

      erro:
        "Erro ao cadastrar paciente."

    });

  }

});


// ==================================================
// LISTAR PACIENTES
// ==================================================

app.get("/pacientes", (req, res) => {

  try {

    const db = readDB();


    /*
     * Normaliza os nomes dos campos
     * para o HTML da alta.
     */

    const pacientes =
      db.pacientes.map(p => ({

        ...p,

        dataNascimento:
          p.dataNascimento ||
          p.nascimento ||
          "",

        nomeMae:
          p.nomeMae ||
          "",

        estadoCivil:
          p.estadoCivil ||
          "",

        contatoEmergencia:
          p.contatoEmergencia ||
          "",

        rg:
          p.rg ||
          ""

      }));


    res.json(pacientes);

  }

  catch (erro) {

    console.error(erro);

    res.status(500).json({

      erro:
        "Erro ao listar pacientes."

    });

  }

});


// ==================================================
// BUSCAR PACIENTE POR ID
// ==================================================

app.get("/pacientes/:id", (req, res) => {

  try {

    const db = readDB();


    const id =
      String(req.params.id);


    const paciente =
      db.pacientes.find(
        p => String(p.id) === id
      );


    if (!paciente) {

      return res.status(404).json({

        erro:
          "Paciente não encontrado."

      });

    }


    /*
     * Converte os nomes para o formato
     * esperado pelo HTML.
     */

    const pacienteFormatado = {

      ...paciente,

      dataNascimento:
        paciente.dataNascimento ||
        paciente.nascimento ||
        "",

      nomeMae:
        paciente.nomeMae ||
        "",

      estadoCivil:
        paciente.estadoCivil ||
        "",

      contatoEmergencia:
        paciente.contatoEmergencia ||
        "",

      rg:
        paciente.rg ||
        ""

    };


    res.json(pacienteFormatado);

  }

  catch (erro) {

    console.error(
      "Erro ao buscar paciente:",
      erro
    );


    res.status(500).json({

      erro:
        "Erro ao buscar paciente."

    });

  }

});


// ==================================================
// TRIAGEM
// ==================================================

app.post("/triagem", (req, res) => {

  const db = readDB();


  let risco =
    req.body.risco;


  const temperatura =
    Number(req.body.temperatura);


  if (temperatura >= 39) {

    risco = "vermelho";

  }

  else if (temperatura >= 38) {

    risco = "amarelo";

  }

  else if (!risco) {

    risco = "verde";

  }


  const triagem = {

    id:
      Date.now(),

    nome:
      req.body.nome || "",

    sintoma:
      req.body.sintoma || "",

    temperatura:
      req.body.temperatura || "",

    alergia:
      req.body.alergia || "",

    observacao:
      req.body.observacao || "",

    risco,

    status:
      "aguardando_medico",

    createdAt:
      new Date().toISOString()

  };


  db.triagens.push(triagem);

  writeDB(db);


  res.json(triagem);

});


// ==================================================
// LISTAR TRIAGENS
// ==================================================

app.get("/triagens", (req, res) => {

  const db = readDB();

  res.json(db.triagens);

});


// ==================================================
// TV - CHAMAR PACIENTE
// ==================================================

app.post("/tv/chamar", (req, res) => {

  try {

    const db = readDB();


    const chamada = {

      id:
        Date.now().toString(),

      localTipo:
        req.body.localTipo || "CONSULTÓRIO",

      localNumero:
        req.body.localNumero || "01",

      paciente:
        req.body.paciente || "",

      hora:
        new Date().toLocaleTimeString(
          "pt-BR",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )

    };


    db.tv_chamada =
      chamada;


    db.tv_historico.unshift(
      chamada
    );


    if (
      db.tv_historico.length > 5
    ) {

      db.tv_historico.pop();

    }


    writeDB(db);


    res.json(chamada);

  }

  catch (erro) {

    console.error(erro);

    res.status(500).json({

      erro:
        "Erro ao chamar paciente na TV."

    });

  }

});


// ==================================================
// TV - CONSULTAR CHAMADA
// ==================================================

app.get("/tv/chamada", (req, res) => {

  const db = readDB();


  res.json({

    chamada:
      db.tv_chamada,

    historico:
      db.tv_historico

  });

});


// ==================================================
// LISTA DE MEDICAÇÕES
// ==================================================

app.get("/lista-medicacoes", (req, res) => {

  res.json([

    "Dipirona",
    "Paracetamol",
    "Ibuprofeno",
    "Amoxicilina",
    "Azitromicina",
    "Loratadina",
    "Omeprazol",
    "Buscopan",
    "Dramin",
    "Soro fisiológico"

  ]);

});


// ==================================================
// CONSULTA
// ==================================================

app.post("/consulta", (req, res) => {

  try {

    const db = readDB();


    const consulta = {

      id:
        Date.now(),

      paciente:
        req.body.paciente || "",

      diagnostico:
        req.body.diagnostico || "",

      medicacao:
        req.body.medicacao || "",

      obs:
        req.body.obs || "",

      createdAt:
        new Date().toISOString()

    };


    db.consultas.push(
      consulta
    );


    writeDB(db);


    res.json(consulta);

  }

  catch (erro) {

    console.error(erro);

    res.status(500).json({

      erro:
        "Erro ao salvar consulta."

    });

  }

});


// ==================================================
// LISTAR CONSULTAS
// ==================================================

app.get("/medicacoes", (req, res) => {

  const db = readDB();

  res.json(db.consultas);

});


// ==================================================
// REGISTRAR ALTA
// ==================================================

app.post("/alta", (req, res) => {

  try {

    const db = readDB();


    const pacienteId =
      String(req.body.pacienteId);


    const paciente =
      db.pacientes.find(
        p =>
          String(p.id) === pacienteId
      );


    if (!paciente) {

      return res.status(404).json({

        erro:
          "Paciente não encontrado."

      });

    }


    const dataAlta =
      req.body.dataAlta;


    if (!dataAlta) {

      return res.status(400).json({

        erro:
          "Informe a data e hora da alta."

      });

    }


    /*
     * Atualiza status do paciente.
     */

    paciente.status =
      "alta";


    paciente.dataAlta =
      dataAlta;


    paciente.observacoesAlta =
      req.body.observacoes || "";


    paciente.altaRegistradaEm =
      new Date().toISOString();


    /*
     * Registra também no histórico
     * de altas.
     */

    const alta = {

      id:
        Date.now(),

      pacienteId:
        paciente.id,

      paciente:
        paciente.nome,

      cpf:
        paciente.cpf,

      dataAlta,

      observacoes:
        req.body.observacoes || "",

      createdAt:
        new Date().toISOString()

    };


    db.altas.push(alta);


    writeDB(db);


    console.log(
      "Alta registrada:",
      alta
    );


    res.json({

      sucesso: true,

      mensagem:
        "Alta registrada com sucesso!",

      paciente,

      alta

    });

  }

  catch (erro) {

    console.error(
      "Erro ao registrar alta:",
      erro
    );


    res.status(500).json({

      erro:
        "Erro interno ao registrar alta."

    });

  }

});


// ==================================================
// GERAR PDF DA ALTA
// ==================================================

app.get("/alta/:id/pdf", (req, res) => {

  try {

    const db = readDB();


    const id =
      String(req.params.id);


    const paciente =
      db.pacientes.find(
        p =>
          String(p.id) === id
      );


    if (!paciente) {

      return res.status(404).json({

        erro:
          "Paciente não encontrado."

      });

    }


    /*
     * Só permite PDF depois da alta.
     */

    if (
      paciente.status !== "alta"
    ) {

      return res.status(400).json({

        erro:
          "A alta ainda não foi registrada."

      });

    }


    const doc =
      new PDFDocument({
        size: "A4",
        margin: 50
      });


    const nomeArquivo =
      `alta_${paciente.cpf || paciente.id}.pdf`;


    res.setHeader(
      "Content-Type",
      "application/pdf"
    );


    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nomeArquivo}"`
    );


    /*
     * Envia o PDF diretamente
     * para o navegador.
     */

    doc.pipe(res);


    // ==========================================
    // CABEÇALHO
    // ==========================================

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(
        "ALTA DO PACIENTE",
        {
          align: "center"
        }
      );


    doc.moveDown();


    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Documento emitido em: ${
          new Date().toLocaleString("pt-BR")
        }`,
        {
          align: "center"
        }
      );


    doc.moveDown(2);


    // ==========================================
    // DADOS DO PACIENTE
    // ==========================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("DADOS DO PACIENTE");


    doc.moveDown();


    doc
      .fontSize(11)
      .font("Helvetica");


    doc.text(
      `Nome completo: ${paciente.nome || ""}`
    );


    doc.text(
      `CPF: ${paciente.cpf || ""}`
    );


    doc.text(
      `RG: ${paciente.rg || ""}`
    );


    doc.text(
      `Data de nascimento: ${
        paciente.dataNascimento ||
        paciente.nascimento ||
        ""
      }`
    );


    doc.text(
      `Sexo: ${paciente.sexo || ""}`
    );


    doc.text(
      `Nome da mãe: ${paciente.nomeMae || ""}`
    );


    doc.text(
      `Estado civil: ${
        paciente.estadoCivil || ""
      }`
    );


    doc.text(
      `Telefone: ${
        paciente.telefone || ""
      }`
    );


    doc.text(
      `E-mail: ${
        paciente.email || ""
      }`
    );


    doc.text(
      `Contato de emergência: ${
        paciente.contatoEmergencia || ""
      }`
    );


    doc.text(
      `Tipo de atendimento: ${
        paciente.tipo || ""
      }`
    );


    doc.text(
      `Endereço: ${
        paciente.endereco || ""
      }`
    );


    doc.moveDown(2);


    // ==========================================
    // DADOS DA ALTA
    // ==========================================

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("INFORMAÇÕES DA ALTA");


    doc.moveDown();


    doc
      .fontSize(11)
      .font("Helvetica");


    doc.text(
      `Data e hora da alta: ${
        paciente.dataAlta || ""
      }`
    );


    doc.moveDown();


    doc
      .font("Helvetica-Bold")
      .text("Observações e orientações:");


    doc.moveDown();


    doc
      .font("Helvetica")
      .text(
        paciente.observacoesAlta ||
        "Nenhuma observação informada."
      );


    doc.moveDown(4);


    // ==========================================
    // ASSINATURA
    // ==========================================

    doc
      .moveTo(170, doc.y)
      .lineTo(425, doc.y)
      .stroke();


    doc.moveDown();


    doc
      .fontSize(10)
      .text(
        "Assinatura / responsável",
        {
          align: "center"
        }
      );


    // ==========================================
    // FINALIZAR PDF
    // ==========================================

    doc.end();

  }

  catch (erro) {

    console.error(
      "Erro ao gerar PDF:",
      erro
    );


    if (!res.headersSent) {

      res.status(500).json({

        erro:
          "Erro ao gerar PDF."

      });

    }

  }

});


// ==================================================
// INICIAR SERVIDOR
// ==================================================

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `Servidor rodando na porta ${PORT}`
    );

  }
);
