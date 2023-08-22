import { createHmac } from "crypto";
import { exec } from "child_process";
import { config } from "dotenv";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;


function AutoGitPull(req) {
    const signature = createHmac("sha256", WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");
    
        if (`sha256=${signature}` === req.headers.get("x-hub-signature-256")) {
            exec("cd /var/node_applications/theoslab.APIs/ && git pull");
            return true;
        } else return false;
}


export default AutoGitPull;