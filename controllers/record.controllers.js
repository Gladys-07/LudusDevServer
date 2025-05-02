import e from "express";
import { pool } from "../DB/DB.js"

const cleanValue = ( value ) => {
    if(value === undefined) return null;
    if(Array.isArray(value)) return JSON.stringify(value);
    if(value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
    return value;
}

export const newRecord = (req, res) => {
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

export const getRecords = (req, res) => {
    pool.execute("select * from customer", (error, results) => {
        if (error){
            return res.status(500).json({
                msg: error.message, 
                users: []
            });
        };
        return res.status(200).json({
                msg: "Good connection to DB",
                customers: results
            }
        )
    })
};




// opciones de registros a agregar
// case "Fauna en Transecto":
//     break;
// case "Fauna en Punto de Conteo":
//     break;
// case "Fauna Búsqueda Libre":
//     break;
// case "Validación de Cobertura":
//     break;
// case "Parcela de Vegetación":
//     break;
// case "Variables Climáticas":
//     break;