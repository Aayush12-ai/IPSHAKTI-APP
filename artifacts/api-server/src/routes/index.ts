import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mobileRouter from "./mobile";
import researchRouter from "./research";
import formulaRouter from "./formula";
import classifyRouter from "./classify";
import absRouter from "./abs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mobileRouter);
router.use(researchRouter);
router.use(formulaRouter);
router.use(classifyRouter);
router.use(absRouter);

export default router;
