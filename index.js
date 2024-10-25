require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fingerprintMiddleware = require('./middlewares/fingerprintMiddleware');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('./middlewares/authMiddleware');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const extension = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
	},
});

const upload = multer({ storage: storage });

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(fingerprintMiddleware);
app.use('/', userRoutes);
app.use('/file', authMiddleware, upload.single('file'), fileRoutes);
app.use(errorMiddleware);

const start = async () => {
	try {
		app.listen(PORT, () => console.log(`Started on port ${PORT}`));
	} catch (error) {
		console.log(error);
	}
}

start();