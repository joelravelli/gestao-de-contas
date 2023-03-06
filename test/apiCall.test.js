const request = require("supertest");
const app = require("../app");
const constants = require("../resources/appConstants")

beforeAll(async () => {
    it("test MongoDB connection", async () => {
        await mongoose.connect(constants.mongodbUrlTest, { useNewUrlParser: true });
    });
});

describe('Pessoa API', () => {

    var idPessoa = 0;
    var idConta = 0;

    describe("API Root", () => {
        it("Test the root path", async () => {
            const res = await request(app).get("/");
            expect(res.statusCode).toEqual(200);
        });
    });

    describe("Post Pessoa", () => {
        it("Should create a new pessoa", async () => {
            const res = await request(app).post("/v1/pessoa").send({
                nome: "Jordimbrando da Silva",
                cpf: "00011122233",
                dataNascimento: "1980-10-19T00:00:00.000Z"
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('nome', 'Jordimbrando da Silva');
            expect(res.body).toHaveProperty('cpf', '00011122233');

            idPessoa = res.body.id;
        });
    });

    describe("Post Conta", () => {
        it("Should create a new conta", async () => {
            const res = await request(app).post("/v1/conta/criar").send({
                idPessoa: idPessoa,
                limiteSaqueDiario: 500,
                flagAtivo: true,
                tipoConta: 0
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body.limiteSaqueDiario).toHaveProperty('$numberDecimal', "500");
            expect(res.body).toHaveProperty('flagAtivo', true);
            expect(res.body).toHaveProperty('tipoConta', 0);

            idConta = res.body.id;
        });
    });

    describe("Get Transacao Saldo (1)", () => {
        it("Should get the account saldo", async () => {
            const res = await request(app).get(`/v1/transacao/saldo/${idConta}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.saldo).toHaveProperty("$numberDecimal", "0");
        });
    });

    describe("Post a Deposit", () => {
        it("Should create a new deposit transaction", async () => {
            const res = await request(app).post("/v1/transacao/deposito").send({
                idConta: idConta,
                valor: 1000
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "ok");
        });
    });

    describe("Get Transacao Saldo (2)", () => {
        it("Should get the account saldo", async () => {
            const res = await request(app).get(`/v1/transacao/saldo/${idConta}`);
            expect(res.statusCode).toEqual(200);

            expect(res.body.saldo).toHaveProperty("$numberDecimal", "1000");
        });
    });

    describe("Post a Withdrawn (1)", () => {
        it("Should create a new withdrawn transaction", async () => {
            const res = await request(app).post("/v1/transacao/saque").send({
                idConta: idConta,
                valor: -400
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "ok");
        });
    });

    describe("Get Transacao Saldo (3)", () => {
        it("Should get the account saldo", async () => {
            const res = await request(app).get(`/v1/transacao/saldo/${idConta}`);
            expect(res.statusCode).toEqual(200);

            expect(res.body.saldo).toHaveProperty("$numberDecimal", "600");
        });
    });

    describe("Post a Withdrawn (2)", () => {
        it("Should create a new withdrawn transaction but it has to be rejected by max daily withdrawal", async () => {
            const res = await request(app).post("/v1/transacao/saque").send({
                idConta: idConta,
                valor: -200
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message", "Max withdrawal amount per day reached.");
        });
    });
    
    describe("Delete all Transacao", () => {
        it("Should delete all created transacao", async () => {
            const res = await request(app).delete(`/v1/transacao/all/${idConta}`).send();
            expect(res.statusCode).toEqual(200);
        });
    });

    describe("Delete Conta", () => {
        it("Should delete a created conta", async () => {
            const res = await request(app).delete(`/v1/conta/${idConta}`).send();
            expect(res.statusCode).toEqual(200);
        });
    });
  
    describe("Delete Pessoa", () => {
        it("Should delete a created pessoa", async () => {
            const res = await request(app).delete(`/v1/pessoa/${idPessoa}`).send();
            expect(res.statusCode).toEqual(200);
        });
    });
  
  });
