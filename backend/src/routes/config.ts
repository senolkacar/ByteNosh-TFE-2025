import express, {Request, Response} from "express";
import SiteConfig from "../models/siteconfig";
import {body, validationResult} from "express-validator";
import {validateRole, validateToken} from "../auth";

const router = express.Router();


router.get("/",async (req, res): Promise<void> => {
    try {
        const config = await SiteConfig.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: "Error fetching site config" });
    }
});

router.post("/",
    validateToken,
    validateRole("ADMIN"),
    body('name').trim().escape().isString().isLength({ min: 1 }).withMessage('Name is required'),
    body('slogan').trim().escape().isString().isLength({ min: 1 }).withMessage('Slogan is required'),
    body('about').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about'),
    body('popularDishes.title').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for popular dishes title'),
    body('popularDishes.description').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for popular dishes description'),
    body('mobile.title').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile title'),
    body('mobile.description').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile description'),
    body('mobile.googlePlay').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile google play'),
    body('mobile.appStore').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for mobile app store'),
    body('social.facebook').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for social facebook'),
    body('social.twitter').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for social twitter'),
    body('social.instagram').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for social instagram'),
    body('contact.title').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact title'),
    body('contact.description').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact description'),
    body('contact.telephone').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact telephone'),
    body('contact.email').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for contact email'),
    body('contact.address').optional().trim().isString().isLength({ min: 1 }).withMessage('Invalid value for contact address'),
    body('aboutUs.title1').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us title1'),
    body('aboutUs.description1').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us description1'),
    body('aboutUs.title2').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us title2'),
    body('aboutUs.description2').optional().trim().escape().isString().isLength({ min: 1 }).withMessage('Invalid value for about us description2'),
    async (req :Request, res:Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const newConfig = req.body;
        if (newConfig.contact?.address) {
            try {
                const address = newConfig.contact.address;
                const response = await fetch(`https://photon.komoot.io/api/?q=${address}`);
                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const coordinates = data.features[0].geometry.coordinates;
                    newConfig.contact.latitude = coordinates[1];  // Latitude
                    newConfig.contact.longitude = coordinates[0];  // Longitude
                } else {
                    res.status(400).json({ message: "Invalid address: could not retrieve coordinates" });
                    return;
                }
            } catch (error) {
                res.status(500).json({ message: "Failed to validate address" });
                return;
            }
        }

        try {
            const existingConfig = await SiteConfig.findOne();

            if (existingConfig) {
                await SiteConfig.updateOne({ _id: existingConfig._id }, { $set: newConfig });
                res.status(200).json({ message: "Config updated successfully" });
            } else {
                await SiteConfig.create(newConfig);
                res.status(201).json({ message: "Config created successfully" });
            }
        } catch (error) {
            res.status(500).json({ message: "Failed to set site config" });
        }
    });

export default router;