import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config/config";

export interface SigninData {
    [key: string]: any;
}

export interface JwtResponse<T = any> {
    status: boolean;
    code?: number;
    message: string;
    data: T;
    Keyword?: string;
}

// ----------- Create JWT -----------
export const createJWT = async (
    signinData: SigninData
): Promise<JwtResponse<string>> => {
    try {
        const secret: jwt.Secret = (config.jwt.secret) as jwt.Secret;
        const expiresIn: jwt.SignOptions["expiresIn"] = (config.jwt.expiresIn) as jwt.SignOptions["expiresIn"];
        const token = jwt.sign(signinData as string | object | Buffer, secret, {
            expiresIn,
        });
        return {
            status: true,
            message: "token generated successfully",
            data: token,
        };
    } catch (error: any) {
        return {
            status: false,
            message: `JWTError: ${error.message}`,
            data: "",
        };
    }
};

export const jwtVerify = async (token: string): Promise<JwtResponse<any>> => {
    try {
        const secret: jwt.Secret = (config.jwt.secret) as jwt.Secret;
        const verified = jwt.verify(token, secret) as JwtPayload | string;
        if (verified) {
            return {
                status: true,
                code: 200,
                message: "authentication success",
                data: verified,
                Keyword: "ok",
            };
        }
        return {
            status: false,
            code: 500,
            message: "something went wrong while verify",
            data: null,
            Keyword: "internal-error",
        };
    } catch (error: any) {
        return {
            status: false,
            code: 401,
            message: `JwtVerifyError: ${error.message}`,
            data: null,
            Keyword: error.name,
        };
    }
};

export const jwtDecode = async (token: string): Promise<JwtResponse<any>> => {
    try {
        const decoded = jwt.decode(token);

        if (decoded) {
            return {
                status: true,
                code: 200,
                message: "decode success",
                data: decoded,
                Keyword: "ok",
            };
        }

        return {
            status: false,
            code: 500,
            message: "something went wrong while decode",
            data: null,
            Keyword: "internal-error",
        };
    } catch (error: any) {
        return {
            status: false,
            code: 401,
            message: `JwtDecodeError: ${error.message}`,
            data: null,
            Keyword: error.name,
        };
    }
};
