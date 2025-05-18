import e from "express";
import { pool } from "../DB/DB.js"

const cleanValue = ( value ) => {
    if(value === undefined) return null;
    if(Array.isArray(value)) return JSON.stringify(value);
    if(value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
    return value;
}

export const newRecord = async (req, res) => {
    try{
        const { estadoTiempo, estacion, tipoRegistro } = req.body; 
        if (tipoRegistro !== null){
            //Pool executions must return ONLY ONE RESPONSE
            pool.execute("insert into registro( estadoTiempo, estacion, tipoRegistro) values (?, ?, ?)", 
                [estadoTiempo, estacion, tipoRegistro], 
                (error, results) => {
                    if (error){
                        return res.status(500).json({
                            msg: error.message, 
                        });
                    } 

                    console.log(results) //no se si dejar eso
                    const id_registro = results.insertId; //id from freshly created parent registry
                    switch(tipoRegistro){
                        case "camaras_trampa":
                            newCamaraTrampa(req, res, id_registro);
                            break;
                        case "fauna": //Case fauna 
                            newFauna(req, res, id_registro);
                            break;
                        default:
                            return res.status(200).json({
                                msg: "Base registry completed"
                            });
                        }
                    }
            );
        }
    } catch(error){
        console.log(error.message);
        return res.status(500).json({
            msg: "Internal server error"
        });
    }
};

//pasar atributo id de registro padre
const newCamaraTrampa = (req, res, id_registro) => {
    const { codigo, zona, nombreCamara, placaCamara, placaGuaya, 
        anchoCaminoMt, fechaInstalacion, distanciaObjetivoMt, 
        alturaLenteMt, listaChequeo } = req.body;

    pool.execute(`insert into camaras_trampa(
        id_registro, codigo, zona, nombreCamara, placaCamara, placaGuaya, anchoCaminoMt, 
        fechaInstalacion, distanciaObjetivoMt, alturaLenteMt, 
        listaChequeo
        )  values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cleanValue(id_registro), cleanValue(codigo), cleanValue(zona), cleanValue(nombreCamara), cleanValue(placaCamara), 
        cleanValue(placaGuaya), cleanValue(anchoCaminoMt), cleanValue(fechaInstalacion), 
        cleanValue(distanciaObjetivoMt), cleanValue(alturaLenteMt), cleanValue(listaChequeo)],
        (error, results) => {
            if (error){
                return res.status(500).json({msg : error.message});
            }
            console.log("Inserted new data into ");
            newEviObser(req, res, id_registro);
        }
    );
}

//pasar atributp id de registro padre
const newEviObser = (req, res, id_registro) => {
    const {observaciones, evidencias} = req.body;
    pool.execute(
        "insert into evidencias(id_registro, evidencias, observaciones) values(?, ?, ?)", 
       [cleanValue(id_registro), cleanValue(evidencias), cleanValue(observaciones)], 
       (error, results) => {
        if (error){
            return res.status(500).json({
                msg: error.message,
                e: "Algo paso en newEviObser"
            });
        } 
        console.log("New observation registered");
        return res.status(200).json({
                msg: "New evidence",
                results: results
            });
       } 
    );
};


export const getRecords = async (req, res) => {
    try {
        const [results] = await pool.promise().query("SELECT * FROM Registro");
        return res.status(200).json({
            msg: "Registros obtenidos correctamente",
            registros: results
        });
    } catch (error) {
        return res.status(500).json({
            msg: error.message,
            registros: []
        });
    }
};

// GET /registers/:id
export const getRecord = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ msg: "Falta el parámetro ID" });
    }

    try {
        const [rows] = await pool.promise().query("SELECT * FROM Registro WHERE id_registro = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: `No se encontró un registro con id ${id}` });
        }

        return res.status(200).json({
            msg: "Registro encontrado",
            registro: rows[0]
        });
    } catch (error) {
        console.error("Error al obtener el registro:", error);
        return res.status(500).json({ msg: "Error al obtener el registro" });
    }
};

export const getTotalRegisters = async (req, res) => {
    try {
        const [result] = await pool.promise().query("SELECT COUNT(*) AS total FROM Registro");
        return res.status(200).json({ total: result[0].total });
    } catch (error) {
        console.error("Error al contar registros:", error);
        return res.status(500).json({ msg: "Error al contar registros" });
    }
};

export const getRegistersByType = async (req, res) => {
    try {
        const [result] = await pool.promise().query(`
            SELECT tipoRegistro, COUNT(*) AS cantidad
            FROM Registro
            GROUP BY tipoRegistro
        `);
        return res.status(200).json({ porTipo: result });
    } catch (error) {
        console.error("Error al contar por tipo de registro:", error);
        return res.status(500).json({ msg: "Error al contar por tipo" });
    }
};


// opciones de registros a agregar
// case "Fauna en Transecto":
//     break;
// case "Fauna en Punto de Conteo":
//     break;
// case "Fauna Búsqueda Libre":
const newFaunaBusquedaLibre = (req, res, id_registro) => {
    const { zona, tipo_animal, nombre_comun, nombre_cientifico, numero_individuos, tipo_observacion, altura_observacion, evidencias, observaciones } = req.body;

    pool.execute(
        `INSERT INTO fauna_busqueda_libre(
            id_registro, zona, tipo_animal, nombre_comun, 
            nombre_cientifico, numero_individuos, 
            tipo_observacion, altura_observacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            cleanValue(id_registro), cleanValue(zona), cleanValue(tipo_animal),
            cleanValue(nombre_comun), cleanValue(nombre_cientifico),
            cleanValue(numero_individuos), cleanValue(tipo_observacion),
            cleanValue(altura_observacion)
        ],
        (error, results) => {
            if (error) {
                return res.status(500).json({
                    msg: error.message,
                    e: "Error en newFaunaBusquedaLibre"
                });
            }

            console.log("Inserted new Fauna Búsqueda Libre data");
            newEviObserFauna(req, res, id_registro);
        }
    );
};

// Observaciones y evidencias
const newEviObserFauna = (req, res, id_registro) => {
    const { evidencias, observaciones } = req.body;

    pool.execute(
        "INSERT INTO evidencias(id_registro, evidencias, observaciones) VALUES (?, ?, ?)",
        [
            cleanValue(id_registro),
            cleanValue(evidencias),
            cleanValue(observaciones)
        ],
        (error, results) => {
            if (error) {
                return res.status(500).json({
                    msg: error.message,
                    e: "Error en newEviObserFauna"
                });
            }

            console.log("Evidencias registradas (Fauna)");
            return res.status(200).json({
                msg: "Registro de fauna completado",
                results: results
            });
        }
    );
};
//Registro de fauna por ID de registro
export const getFaunaByRegistro = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ msg: "Falta el parámetro ID" });
    }

    try {
        const [rows] = await pool.promise().query(
            "SELECT * FROM fauna WHERE id_registro = ?", [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ msg: `No se encontró fauna con id_registro ${id}` });
        }

        return res.status(200).json({
            msg: "Fauna encontrada",
            fauna: rows
        });
    } catch (error) {
        console.error("Error al buscar fauna:", error);
        return res.status(500).json({ msg: "Error al buscar fauna" });
    }
};

//     break;
// case "Validación de Cobertura":
//     break;
// case "Parcela de Vegetación":
//     break;
// case "Variables Climáticas":
//     break;