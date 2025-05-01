import { Router } from "express";
import { newRecord } from "../controllers/record.controllers.js";

const router = Router()

router.post("/newRecord", newRecord);
router.get("/", (req, res) => {
    res.send("Hola desde API demo");
});

export default router;