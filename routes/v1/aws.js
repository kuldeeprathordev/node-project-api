import { Router } from "express";
import tokenAuth from '../../app/middlewares/adminAuthorization.js';
import {
    index,

} from "../../app/controllers/v1/AwsController.js";

const router = Router();

// AWS routes
router.get("/aws-details", tokenAuth, index);

export default router;
