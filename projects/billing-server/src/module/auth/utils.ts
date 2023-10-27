import { errorify } from '@dogu-tech/common';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { IncomingMessage } from 'http';

export interface AuthInfoActivated {
  type: 'activated';
}

export interface AuthInfoBasic extends Express.AuthInfo {
  type: 'basic';
  username: string;
  password: string;
}

export interface AuthInfoBearer extends Express.AuthInfo {
  type: 'bearer';
  token: string;
}

export type Authorization = AuthInfoActivated | AuthInfoBasic | AuthInfoBearer;

export function parseAuthorization(request: Request): Authorization {
  // already activated
  if (request.user) {
    request.authInfo = undefined;
    return { type: 'activated' };
  }

  // already parsed
  if (request.authInfo) {
    return request.authInfo as Authorization;
  }

  let parsed: ParsedAuthorizationHeader;
  try {
    parsed = parseAuthorizationHeader(request);
  } catch (error) {
    throw new BadRequestException(errorify(error));
  }

  const { type, token } = parsed;
  if (type.toLowerCase() === 'basic') {
    const [username, password] = Buffer.from(token, 'base64').toString().split(':');
    if (!username || !password) {
      throw new BadRequestException(`invalid token`);
    }

    request.authInfo = { type: 'basic', username, password };
  } else if (type.toLowerCase() === 'bearer') {
    request.authInfo = { type: 'bearer', token };
  } else {
    throw new BadRequestException(`invalid authorization type`);
  }

  return request.authInfo as Authorization;
}

export interface ParsedAuthorizationHeader {
  type: string;
  token: string;
}

export function parseAuthorizationHeader(request: IncomingMessage): ParsedAuthorizationHeader {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    throw new Error(`authorization header is required`);
  }

  const type = authHeader.split(' ')[0];
  if (!type) {
    throw new Error(`authorization type is required`);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error(`token is required`);
  }

  return { type, token };
}
