import { pool } from "../DB/DB.js"

export const getRecord = (req, res) => res.send("Hola desde API de LudusDev");
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