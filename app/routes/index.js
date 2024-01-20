// Ruta 

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/usuario');
const viewController = require('../controllers/viewController');

router.get('/:page?', viewController.getView);

router.post('/register', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email
      });
      await user.save();
      res.redirect('/login'); // Puedes redirigir a donde sea apropiado
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Busca al usuario en la base de datos por nombre de usuario
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrecta' });
      }
  
      // Compara la contraseña proporcionada con la almacenada en la base de datos
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrecta' });
      }
  
      // Genera un token JWT para la autenticación
      const token = jwt.sign({ userId: user._id }, 'tu_secreto_secreto', { expiresIn: '1h' });
  
      // Puedes enviar el token en la respuesta para que el cliente lo almacene y lo utilice en las solicitudes posteriores
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      res.status(500).send('Error al cerrar sesión');
    } else {
      res.sendStatus(200);
    }
  });
});

  
  module.exports = router;