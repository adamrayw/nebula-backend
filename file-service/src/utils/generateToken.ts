import fs from "fs";
import jwt from "jsonwebtoken";

const generateToken = (email: string, id: string) => {
    const privateKey = fs.readFileSync('private.key')
    const token = jwt.sign({ id: id, email: email }, privateKey, {expiresIn: '1d'})

    return token;
}

export default generateToken;