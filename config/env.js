import dotenv from 'dotenv';
if(process.env.NODE_ENV != "production"){
    dotenv.config();
//Load environment variables from .env file 
// only in development (not in production)
}