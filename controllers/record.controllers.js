import e from "express";
import { pool } from "../DB/DB.js"

export const newRecord = (req, res) => {
    try{
        const { estadoTiempo, estacion, tipoRegistro } = req.body; 
            if (tipoRegistro !== null){
                pool.execute("insert into registro( estadoTiempo, estacion, tipoRegistro) values (?, ?, ?)", 
                    [estadoTiempo, estacion, tipoRegistro], 
                    (error, results) => {
                        if (error){
                            res.status(500).json({
                                msg: error.message, 
                            });
                            return;
                        } 
                        // console.log(results)
                        // res.status(200).json({
                        //     msg: "Base registry done, but particular not completed",
                        // })
                        switch(tipoRegistro){
                            case "Fauna en Transecto":
                                {numeroTransecto, tipoAnimal, nombreComun, nombreCientifico }
                                pool.execute("insert into ")
                                break;
                            case "Fauna en Punto de Conteo":
                                break;
                            case "Fauna Búsqueda Libre":
                                break;
                            case "Validación de Cobertura":
                                break;
                            case "Parcela de Vegetación":
                                break;
                            case "Camaras Trampa":
                                newCamaraTrampa(req);
                                break;
                            case "Variables Climáticas":
                                break;
                            default:
                                console.log("Done");
                        }
                    }
                )
            }
    } catch(error){
        console.log(error.message);
    }
};

const newFauna = () => {
    return;
}

const newCamaraTrampa = (req) => {
    const { codigo, zona, nombreCamara, placa, placaGuaya, 
        anchoCaminoMt, fechaInstalacion, distanciaObjetivoMt, 
        alturaLenteMt, listaChequeo } = req.body;

    pool.execute(`insert into camaras_trampa(codigo, zona, 
        nombreCamara, placaCamara, placaGuaya, anchoCaminoMt, 
        fechaInstalacion, distanciaObjetivoMt, alturaLenteMt, 
        listaChequeo)  values(?,?,?,?,?,?,?,?,?,?)`),
        [codigo, zona, nombreCamara, placa, placaGuaya, anchoCaminoMt, 
        fechaInstalacion, distanciaObjetivoMt, alturaLenteMt, listaChequeo],
        (error, results) => {
            if (error){
                res.status(500).json({msg : error.message});
                return;
            }
            console.log("Inserted new data into ")
            res.status(200).json({
                msg: "New camara trampa",
                results: results
            })
        }
    newEviObser(req);
    return;
}

const newEviObser = (req) => {
    const {observaciones, evidencias} = req.body;
    pool.execute("insert into evidencias(evidencias, observaciones) values(?, ?)", 
       [evidencias, observaciones], 
       (error, results) => {
        if (error){
            res.status(500).json({
                msg: error.message
            });
            return;
        } 
        console.log("New observation registered");
        res.status(200).json({
            msg: "New evidence",
            results: results
        })
       } 
    )
    return;
}

export const getRecords = (req, res) => {
    pool.execute("select * from customer", (error, results) => {
        if (error){
            res.status(500).json({
                msg: error.message, 
                users: []
            });
            return;
        };
        res.status(200).json({
            msg: "Good connection to DB",
            customers: results
        }
        )
    })
};