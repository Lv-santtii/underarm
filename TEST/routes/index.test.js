//TESTING que comprueba que la ruta principal ("/") devuelve el resultado que se espera //

const request = require('supertest');
const { app, server } = require('../../app'); // Ajusta la ruta según tu estructura de carpetas

beforeAll((done) => {
  done();
});

test('Index.html devuelto', async () => {
  const response = await request(app).get('/');
  expect(response.status).toBe(200);
  expect(response.text).toContain('Categorias UNDER');
});

afterAll((done) => {
    server.close(() => {
      console.log('Servidor cerrado');
      done();
    });
  });