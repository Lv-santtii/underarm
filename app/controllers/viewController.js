// Controlador

module.exports = {
  getView: (req, res) => {
    const page = req.params.page || 'index';
    res.sendFile(`${page}.html`, { root: './app/views' });
  },
};