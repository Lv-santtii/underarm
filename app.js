// Declaro las const necesarias para el codigo //
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const Usuario = require('./app/models/usuario');
const authMiddleware = require('./app/middlewares/authMiddleware');
const multer = require('multer');
const { z } = require('zod');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3020;

// Llamada al middleware que se encarga de avisar por consola cuando hay una entrada a uno de los HTML //
app.use(authMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// Configuracion de las sesiones //
app.use(session({
  secret: 'clave123',
  resave: false,
  saveUninitialized: true
}));

// Url para conectarse a la Base de datos de Mongo //
mongoose.connect('mongodb+srv://santi2006:Santi2006@cluster0.0grnbd5.mongodb.net/?retryWrites=true&w=majority');
// Conexion a los archivos estaticos para que se vea correctamente //
app.use(express.static(path.join(__dirname, 'app', 'views')));
app.use(express.static('./app/views/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'views', 'index.html'));
});

// Codigo pra el registro de nuevos usuarios //
app.post('/register', async (req, res) => {
  try {
    const { newUsername, newPassword, email } = req.body;
// Funcionalidad para detectar usuarios ya creados y devolver error en caso de que ya exista //
    const existingUser = await Usuario.findOne({ $or: [{ username: newUsername }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario o correo electrónico ya existe' });
    }

    const newUser = new Usuario({
      username: newUsername,
      password: newPassword,
      email,
    });

    await newUser.save();
// Mensaje del servidor al registrarse correctamente y (rara vez, debido a que no suelen darse) al encontrar un error //
    res.status(200).json({ message: 'Registro exitoso' });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Usuario.findOne({ username });
// Mensaje de error al ingresar datos incorrectos //
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Guardar el usuario en la sesión //
      req.session.user = user;
      res.status(200).json({ message: 'Inicio de sesión exitoso', username: user.username });
    } else {
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Configuracion de Multer para la subida de imágenes de productos que (en este caso) la comunidad solicitaria agregar //
const storageProductos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'subidas/productos/'); // Carpeta en la cual se guardaran las imagenes subidas //
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Nombre del archivo //
  },
});

const subidasProductos = multer({
  storage: storageProductos,
  fileFilter: (req, file, cb) => {
    // Filtrar archivos para asegurarse de que solo sean imágenes y no permitir otra cosa //
    const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

// Ruta para manejar la subida de imágenes de productos //
app.post('/subidas-producto', subidasProductos.single('imagenProducto'), (req, res) => {
  try {
    // Validacion de que se haya eleigdo una imagen //
    if (!req.file) {
      return res.status(400).json({ error: 'Ninguna imagen seleccionada' });
    }

    // Validar los datos antes de seguir con el proceso //
    const datosValidos = productoSchema.parse({
      imagenProducto: req.file,
    });
// Mensaje al recibir, validar y almacenar de manera corretca la imagen, o de lo contrario, el error se ejecuta //
    res.status(200).json({ message: 'Imagen de producto subida exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.errors || error.message });
  }
});
// Utilizacion de ZOD //
const productoSchema = z.object({
  imagenProducto: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    destination: z.string(),
    filename: z.string(),
    size: z.number(),
  }),
});
// Ejecucuion del servidor //
app.listen(port, () => {
  console.log(`Servidor ON en el puerto ${port}`);
});

module.exports = { app, server };