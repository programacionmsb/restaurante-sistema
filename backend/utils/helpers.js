const emitirActualizacion = (evento, datos) => {
  if (global.io) {
    global.io.emit(evento, datos);
  }
};

module.exports = { emitirActualizacion };
