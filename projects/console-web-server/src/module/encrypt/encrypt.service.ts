import { OrganizationId } from '@dogu-private/types';
import { NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { EntityManager } from 'typeorm';

import { OrganizationKey } from '../../db/entity/organization-key.entity';

export class EncryptService {
  static async encryptToken(transactionManager: EntityManager, organizationId: OrganizationId, rawToken: string) {
    const organizationKey = await transactionManager.getRepository(OrganizationKey).findOne({
      where: { organizationId },
    });

    if (!organizationKey) {
      throw new NotFoundException('Organization key not found');
    }

    const key = organizationKey.key;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(rawToken), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  static async decryptToken(transactionManager: EntityManager, organizationId: OrganizationId, encryptedToken: string) {
    const organizationKey = await transactionManager.getRepository(OrganizationKey).findOne({
      where: { organizationId },
    });

    if (!organizationKey) {
      throw new NotFoundException('Organization key not found');
    }

    const key = organizationKey.key;

    const [iv, encrypted] = encryptedToken.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
    return decrypted.toString();
  }
}
