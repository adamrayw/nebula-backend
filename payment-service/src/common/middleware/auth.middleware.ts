import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request | any, res: Response, next: NextFunction) {
    const bearerHeader = req.headers.authorization;
    const accessToken = bearerHeader?.split(' ')[1];
    const privateKey = await readFile('private.key');

    if (!bearerHeader || !accessToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    verify(accessToken, privateKey, (err: any, decoded: any) => {
      if (err) {
        throw new ForbiddenException('Token Invalid.');
      }

      req.user = decoded;
      req.token = accessToken;
      next();
    });
  }
}
