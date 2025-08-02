import { Router } from "express";
import tokenAuth from '../../../app/middlewares/authorization.js';
import {
  index,
  videoViewsCountAdd,
  pdfDownloadCountAdd,
  categoryList,
  landingBanner,
  show
} from "../../../app/controllers/v1/web/ContentController.js";
import {
  login,
} from "../../../app/controllers/v1/web/AuthController.js";
import {store,customerList} from "../../../app/controllers/v1/web/CustomerController.js";
const router = Router();

router.post("/login", login);
router.get("/contents/:id?", index);
router.post("/video-views-count-add",tokenAuth, videoViewsCountAdd);
router.post("/pdf-download-count-add", tokenAuth, pdfDownloadCountAdd);
router.get("/category-list", categoryList);
router.get("/landing-banner", landingBanner);
router.get("/video-pdf-show/:id", show);

// concact form
router.post("/store", store);
router.get("/customer-details", customerList);




export default router;
