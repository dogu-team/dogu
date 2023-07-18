// @Injectable()
// export class IsRemoteDestExist implements PipeTransform<DestId, Promise<DestId>> {
//   // constructor(@InjectRepository(Dest) private readonly destRepository: Repository<Dest>) {}
//   // async transform(value: DestId, metadata: ArgumentMetadata): Promise<DestId> {
//   //   const exist = await this.destRepository.exist({ where: { destId: value } });
//   //   if (!exist) {
//   //     throw new NotFoundException({
//   //       message: 'Dest not found',
//   //       destId: value,
//   //     });
//   //   }
//   //   return value;
//   // }
// }
