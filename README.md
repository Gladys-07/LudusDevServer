# Configuración Inicial de un Backend con Node.js

Este documento describe los pasos básicos para iniciar un proyecto backend con Node.js, utilizando `Express`, `dotenv`, `mysql2` y `nodemon`.

## Pasos para la configuración

1. **Inicializa el proyecto con npm:**

   ```bash
   npm init -y
   npm install express dotenv mysql2
   npm install --save-dev nodemon
   
2. **Modifica el package.json:**
   ```bash
    {
      "name": "ludusdevserver",
      "version": "1.0.0",
      "type": "module",
      "main": "index.js",
      "scripts": {
        "start": "nodemon index.js"
      }
    }
