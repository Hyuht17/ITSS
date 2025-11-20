# Backend API

Node.js backend server với Express.js

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Cấu hình ứng dụng (database, etc.)
│   ├── controllers/     # Controllers xử lý logic
│   ├── middlewares/     # Middleware functions
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## Environment Variables

Tạo file `.env` và cấu hình các biến môi trường:

```
PORT=5000
NODE_ENV=development
```

## API Endpoints

- `GET /` - Health check
- `GET /api` - API info

## Công nghệ sử dụng

- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables
- **nodemon** - Auto-restart server (dev)
