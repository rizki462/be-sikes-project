import { version } from "mongoose";
import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Sistem Informasi Kesehatan Digital",
        description: "Sistem Informasi Kesehatan Digital Project",
    },

    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local Server"
        },
        {
            url: "https://be-sikes-project.vercel.app/api",
            description: "Deploy Server"
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            LoginRequest: {
                identifier: "rizkidiego614@gmail.com",
                password: "12345678"
            }
        },
    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routers/api.ts"];


swaggerAutogen({openapi: "3.0.0"})(outputFile, endpointsFiles, doc);