import { Router } from "express";
import { newRecord, getRecords, getTotalRegisters, getRegistersByType } from "../controllers/record.controllers.js";

const router = Router()

router.post("/newRecord", newRecord);
router.get("/Records", getRecords);
router.get("/", (req, res) => {
    res.send("Hola desde API demo");
});
router.get("/registers/count", getTotalRegisters);
router.get("/registers/count-by-type", getRegistersByType);

export default router;