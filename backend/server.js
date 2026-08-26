app.post("/atendimento", (req, res) => {

    try {

        const db = readDB();

        const paciente = {

            id: Date.now(),

            nome: req.body.nome || "",
            cpf: req.body.cpf || "",
            nascimento: req.body.nascimento || "",
            sexo: req.body.sexo || "",

            telefone: req.body.telefone || "",
            email: req.body.email || "",

            endereco: req.body.endereco || "",
            cidade: req.body.cidade || "",
            estado: req.body.estado || "",

            tipo: req.body.tipo || "Particular",
            convenio: req.body.convenio || "",

            alergias: req.body.alergias || "",
            tipoSanguineo: req.body.tipoSanguineo || "",

            observacoes: req.body.observacoes || "",

            status: "triagem",

            createdAt: new Date().toISOString()

        };


        db.pacientes.push(paciente);

        writeDB(db);


        console.log("================================");
        console.log("PACIENTE CADASTRADO");
        console.log(paciente);
        console.log("================================");


        res.status(201).json({

            sucesso: true,

            mensagem: "Paciente cadastrado com sucesso",

            paciente: paciente

        });


    } catch (erro) {

        console.error(
            "ERRO AO SALVAR PACIENTE:",
            erro
        );


        res.status(500).json({

            sucesso: false,

            mensagem: "Erro interno ao salvar paciente"

        });

    }

});
