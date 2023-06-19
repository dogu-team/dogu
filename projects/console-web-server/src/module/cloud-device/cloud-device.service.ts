import {
  CloudDevicePropCamel,
  FindAllCloudDeviceResponseDto,
  FindCloudDeviceByIdResponseDto,
  RentalCloudDeviceRequestDto,
  RentalCloudDeviceResponseDto,
} from '@dogu-private/console';
import { CloudDeviceId, UserId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudDeviceRental } from '../../db/entity/cloud-device-rental.entity';
import { CloudDevice } from '../../db/entity/cloud-device.entity';
import { Device } from '../../db/entity/device.entity';

@Injectable()
export class CloudDeviceService {
  constructor(
    @InjectRepository(CloudDevice)
    private readonly cloudDeviceRepository: Repository<CloudDevice>,
    @InjectRepository(CloudDeviceRental)
    private readonly cloudDeviceRentalRepository: Repository<CloudDeviceRental>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async findAllCloudDevice(): Promise<FindAllCloudDeviceResponseDto> {
    const cloudDevices = await this.cloudDeviceRepository.find();
    return { cloudDevices };
  }

  async findCloudDeviceById(cloudDeviceId: CloudDeviceId): Promise<FindCloudDeviceByIdResponseDto> {
    const cloudDevice = await this.cloudDeviceRepository
      .createQueryBuilder('cloudDevice') //
      .innerJoinAndSelect(`cloudDevice.${CloudDevicePropCamel.device}`, `device`)
      .where(`cloudDevice.${CloudDevicePropCamel.cloudDeviceId} = :cloudDeviceId`, { cloudDeviceId })
      .getOne();

    if (!cloudDevice) {
      throw new HttpException(`Cloud device not found. Please check your cloud device id. ${cloudDeviceId}`, HttpStatus.NOT_FOUND);
    }

    if (cloudDevice.device) {
      cloudDevice.device.organizationId = '';
    }

    return { cloudDevice };
  }

  async rentalCloudDevice(cloudDeviceId: CloudDeviceId, userId: UserId, dto: RentalCloudDeviceRequestDto): Promise<RentalCloudDeviceResponseDto> {
    const { organizationId } = dto;
    const cloudDevice = await this.cloudDeviceRepository.findOne({ where: { cloudDeviceId } });
    if (!cloudDevice) {
      throw new HttpException(`Cloud device not found. Please check your cloud device id. ${cloudDeviceId}`, HttpStatus.NOT_FOUND);
    }

    const rental = await this.cloudDeviceRentalRepository.findOne({ where: { cloudDeviceId } });
    if (rental) {
      throw new HttpException(`Cloud device already rented. Please check your cloud device id. ${cloudDeviceId}`, HttpStatus.BAD_REQUEST);
    }

    const device = await this.deviceRepository.findOne({ where: { deviceId: cloudDevice.deviceId, organizationId } });
    if (device) {
      throw new HttpException(`This Device is already belongs to organization. Please check your organization and device id.`, HttpStatus.BAD_REQUEST);
    }

    // state check ?

    // const data: DeepPartial<CloudDeviceRental> = ;
    const newData = this.cloudDeviceRentalRepository.create({
      cloudDeviceId,
      organizationId,
      customerId: userId,
    });
    await this.cloudDeviceRentalRepository.save(newData);
    return { cloudDevice };
  }
}
