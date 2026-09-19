import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mobileRouter from "./mobile";
import researchRouter from "./research";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mobileRouter);
router.use(researchRouter);

export default router;
