import express from "express";
import router from "./routers/api";
import { PORT } from "./utils/env";
import cors from "cors";

import db from "./utils/database";
import docs from "./docs/route";

async function init() {
    try {
        const result = await db();
        console.log(`Database Status : ${result}`);

        const app = express();

        app.use(cors());

        app.get('/', (req, res) => {
            res.send(200).json({
                message: "Server is Running",
                data: null
            })
        });

        app.use(express.json());
        app.use('/api', router);
        docs(app);

        app.listen(PORT, () => {
            console.log("Server is running on http://localhost:3000");
        });
    } catch (error) {
        console.log(error);
    }
};

init();