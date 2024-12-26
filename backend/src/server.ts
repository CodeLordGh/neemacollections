import express, { Application } from "express";
import mongoose from "mongoose";
import passport from "./utils/auth.strategy.js";
import cors from "cors";
import * as dotenv from "dotenv";
import orderRouter from "./routes/order.route.js";
import http from "http";
import { Server } from "socket.io";
import router from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import { cleanupImages, imageUpload, upload } from "./utils/imageUpload.js";
import { getInsights } from "./utils/insights.js";
import morgan from "morgan"
import dashboardRoutes from "./routes/stats.route.js"
import { initMpesaRoutes } from "./routes/mpesa.route.js";
import notificationRoutes from './routes/notification.route.js';
import userRoutes from './routes/user.route.js';
import { emitNotification, NotificationTypes, setupNotificationHandlers } from "./utils/notification.js";
import session from "express-session";




dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3002;

const server = http.createServer(app);
app.use(morgan('dev'));

const db_connect = `mongodb+srv://PerisNeemaCollection:${process.env.DB_PASSWORD}@neema.acaijrr.mongodb.net/?retryWrites=true&w=majority&appName=Neema`
const io = new Server(server);

// Setup notification handlers
setupNotificationHandlers(io);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET as string || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Routes
app.use("/api", router);
app.use("/api", productRoute);
app.use("/api", orderRouter);
app.use("/api", cartRoute);
app.post("/api/image/upload", upload.array("my_files"), imageUpload);
app.post("/api/image/cleanup", cleanupImages);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', userRoutes)

app.post('/api/contact/whatsapp', async (req, res) => {
  try {
    emitNotification({
      type: NotificationTypes.WHATSAPP_CONTACT,
      title: 'New WhatsApp Contact Request',
      content: `${req.body.name} wants to contact you via WhatsApp`,
      soundType: 'message', 
      contactData: {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        message: req.body.message
      }
    });
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification' });
  }
});

app.post('/api/contact/email', async (req, res) => {
  try {
    emitNotification({
      type: NotificationTypes.EMAIL_CONTACT,
      title: 'New Email Contact Request',
      content: `${req.body.name} wants to contact you via email`,
      soundType: 'message', 
      contactData: {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
      }
    });
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification' });
  }
});

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('https://neemacollections.vercel.app/');
  }
);

initMpesaRoutes(app);

mongoose.connect(db_connect)
  .then(() => console.log("Connected to MongoDB"))
  .then(() => server.listen(port, () => {
    console.log(`Server running on port ${port} http://localhost:${port}`);
  }))
  .catch(error => console.error("Error connecting to MongoDB:", error));

export default app;



io.on("connection", socket => {
  console.log(`connected: ${socket.id}`);
  socket.on("get_insight_data", async () => {
    const insightData = await getInsights()
    socket.emit("insight_data")
  });

  socket.on("disconnect", () => console.log("User disconnected", socket.id));
});