import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, "../templates/email.otp.html");
export const compileTemplate = (variables) => {
  const template = fs.readFileSync(templatePath, "utf8");

  const compiled = Handlebars.compile(template);

  return compiled(variables);
};
