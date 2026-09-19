import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mobileRouter from "./mobile";
import researchRouter from "./research";
import formulaRouter from "./formula";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mobileRouter);
router.use(researchRouter);
router.use(formulaRouter);

export default router;
