import { Router } from "express";
import { getRecords, getRecord } from "../controllers/record.controllers.js";

const router = Router()

router.get("/records", getRecords )
router.post("/records/:id", getRecord)

export default router;