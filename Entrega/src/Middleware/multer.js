import multer from "multer";
import { __dirname } from '../router/utils.js';


// Configuración de Multer
const storage = multer.diskStorage({

  // Configuración de la carpeta de destino
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },

  // Configuración del nombre del archivo
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });