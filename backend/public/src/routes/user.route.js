"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../utils/auth.middleware");
const user_controler_1 = require("../Controllers/user.controler");
const router = (0, express_1.Router)();
router.patch('/user/settings', auth_middleware_1.isAuthenticated, auth_middleware_1.isAdmin, user_controler_1.updateUserSettings);
router.get('/user/settings', auth_middleware_1.isAuthenticated, auth_middleware_1.isAdmin, user_controler_1.getUserSettings);
router.get('/customers', auth_middleware_1.isAuthenticated, auth_middleware_1.isAdmin, user_controler_1.getUsers);
router.put('/update-profile', auth_middleware_1.isAuthenticated, user_controler_1.updateProfile);
router.put('/update-password', auth_middleware_1.isAuthenticated, user_controler_1.updatePassword);
exports.default = router;
