// import { DeviceRuntimeFrontInfo, DeviceRuntimeNames, HostId, OrganizationId } from '@dogu-private/types';
// import { Row } from '@influxdata/influxdb-client';
// import { Injectable } from '@nestjs/common';
// import _ from 'lodash';
// import { from, lastValueFrom, Observable, reduce } from 'rxjs';
// import { distinct, map } from 'rxjs/operators';
// import { env } from '../../env';
// import { GetRuntimeDeviceInfoDto, GetRuntimeDeviceLastInfoDto, GetRuntimeDeviceListDto } from '../device/dto/runtime-device.dto';
// import { InfluxDbQuerier } from './influxdb.querier';

// export type InfluxData = { [key: string]: any };

// @Injectable()
// export class InfluxDbDeviceService {
//   constructor(private readonly influxDbQuerier: InfluxDbQuerier) {}

//   async getRuntimeListByTeamId(dto: GetRuntimeDeviceListDto, teamId: OrganizationId): Promise<string[]> {
//     const query = `
//     from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
//     |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
//     |> filter(fn: (r) => r["team_id"] == "${teamId}")`;

//     const influxRowObs$: Observable<Row> = from(this.influxDbQuerier.client.rows(query));
//     const obs$: Observable<string[]> = influxRowObs$.pipe(
//       distinct((row) => row.tableMeta.toObject(row.values).device_id as string),
//       map((row) => row.tableMeta.toObject(row.values).device_id as string),
//       reduce((acc, x) => {
//         return [...acc, x];
//       }, [] as string[]),
//     );

//     const deviceList = (await lastValueFrom(obs$)).filter((val) => val !== null && val !== undefined);

//     return deviceList;
//   }

//   async getRuntimeDeviceListByHostId(dto: GetRuntimeDeviceListDto, hostId: HostId): Promise<string[]> {
//     const query = `
//     from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
//     |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
//     |> filter(fn: (r) => r["host_id"] == "${hostId}")`;

//     const influxRowObs$: Observable<Row> = from(this.influxDbQuerier.client.rows(query));
//     const obs$: Observable<string[]> = influxRowObs$.pipe(
//       // TODO(henry): IDB 객체도 ts-types나 hcp에 타입 정의하고 toObject 후 프로퍼티 검증해서 사용하기
//       distinct((row) => row.tableMeta.toObject(row.values).device_id as string),
//       map((row) => row.tableMeta.toObject(row.values).device_id as string),
//       reduce((acc, x) => {
//         return [...acc, x];
//       }, [] as string[]),
//     );

//     const deviceList = (await lastValueFrom(obs$)).filter((val) => val !== null && val !== undefined);

//     return deviceList;
//   }

//   private accumulateFieldDatas(acc: DeviceRuntimeFrontInfo, rowData: InfluxData): DeviceRuntimeFrontInfo {
//     const processedValue: DeviceRuntimeFrontInfo = this.processData(rowData);

//     // acc 최초
//     if (!acc.hostId) {
//       return processedValue;
//     }

//     // mesurement 최초

//     if (!acc.measurement[rowData._measurement as string]) {
//       acc.measurement[rowData._measurement as string] = processedValue.measurement[rowData._measurement as string];
//       return acc;
//     }
//     // field 최초
//     if (!acc.measurement[rowData._measurement as string][rowData._field as string]) {
//       acc.measurement[rowData._measurement as string][rowData._field as string] = processedValue.measurement[rowData._measurement as string][rowData._field as string];
//       return acc;
//     }

//     // fields value 병합
//     const accFieldValues = acc.measurement[rowData._measurement as string][rowData._field as string];
//     const processedFieldValues = processedValue.measurement[rowData._measurement as string][rowData._field as string];
//     const mergedFieldValues = _.concat(accFieldValues, processedFieldValues);

//     acc.measurement[rowData._measurement as string][rowData._field as string] = mergedFieldValues;

//     return acc;
//   }

//   private processData(rowData: InfluxData): DeviceRuntimeFrontInfo {
//     const deviceRuntimeFrontInfo: DeviceRuntimeFrontInfo = {
//       deviceId: rowData.device_id as string,
//       hostId: rowData.host_id as string,
//       teamId: rowData.team_id as string,
//       platform: rowData.platform as string,
//       measurement: {
//         [rowData._measurement]: {
//           [rowData._field]: [{ value: rowData._value as string, time: rowData._time as string }],
//         },
//       },
//     };

//     return deviceRuntimeFrontInfo;
//   }

//   public async getRuntimeLastInfo(dto: GetRuntimeDeviceLastInfoDto, teamId: OrganizationId, id: string): Promise<DeviceRuntimeFrontInfo> {
//     const baseQuery = `
//     from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
//     |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
//     |> filter(fn: (r) => r["device_id"] == "${id}")
//     |> filter(fn: (r) => r["team_id"] == "${teamId}")
//     |> filter(fn: (r) => %MEASUREMENTS%)
//     |> last()`;

//     // make query
//     const measureNames: string[] = DeviceRuntimeNames.DeviceMeasureCollection.getInstance().getMeasureNames();
//     let mesuresFilter = measureNames.reduce((acc, val) => {
//       // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc" or
//       const baseFieldsFilter = 'r["_measurement"] == "%MEASURE%" or ';
//       const makedString = baseFieldsFilter.replace('%MEASURE%', val);
//       return acc + makedString;
//     }, '');
//     // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc"
//     mesuresFilter = mesuresFilter.substring(0, mesuresFilter.lastIndexOf(' or '));
//     const query = baseQuery.replace('%MEASUREMENTS%', mesuresFilter);

//     // make observable
//     const influxRowObs$: Observable<Row> = from(this.influxDbQuerier.client.rows(query));

//     // process data
//     const runTimeInfoObs$: Observable<DeviceRuntimeFrontInfo> = influxRowObs$.pipe(
//       map((row) => row.tableMeta.toObject(row.values)),
//       reduce((acc, val) => {
//         return _.merge(acc, this.processData(val));
//       }, {} as DeviceRuntimeFrontInfo),
//     );

//     // get observable result
//     const deviceInfo: DeviceRuntimeFrontInfo = await lastValueFrom<DeviceRuntimeFrontInfo>(runTimeInfoObs$);
//     return deviceInfo;
//   }

//   public async getRuntimeInfo(dto: GetRuntimeDeviceInfoDto, teamId: OrganizationId, id: string): Promise<DeviceRuntimeFrontInfo> {
//     const baseQuery = `
//     from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
//     |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
//     |> filter(fn: (r) => r["device_id"] == "${id}")
//     |> filter(fn: (r) => r["team_id"] == "${teamId}")
//     |> filter(fn: (r) => r["_measurement"] == "%MEASURE%")
//     |> filter(fn: (r) => %FIELDS%)`;

//     // make queries
//     // result => r["_field"] == "aaa" or r["_field"] == "bbb" or r["_field"] == "ccc" or
//     let fieldsFilter = dto.fields.reduce((acc, val) => {
//       const baseFieldsFilter = 'r["_field"] == "%FEILD%" or ';
//       const makedString = baseFieldsFilter.replace('%FEILD%', val);
//       return acc + makedString;
//     }, '');
//     // result => r["_field"] == "aaa" or r["_field"] == "bbb" or r["_field"] == "ccc"
//     fieldsFilter = fieldsFilter.substring(0, fieldsFilter.lastIndexOf(' or '));
//     const query = baseQuery.replace('%MEASURE%', dto.measure).replace('%FIELDS%', fieldsFilter);

//     // make observable
//     const influxRowObs$: Observable<InfluxData> = from(this.influxDbQuerier.client.rows(query)).pipe(map((row) => row.tableMeta.toObject(row.values)));

//     // process data
//     const runTimeInfoObs$: Observable<DeviceRuntimeFrontInfo> = influxRowObs$.pipe(
//       reduce((acc, val) => {
//         return this.accumulateFieldDatas(acc, val);
//       }, {} as DeviceRuntimeFrontInfo),
//     );

//     // get observable result
//     const deviceInfo: DeviceRuntimeFrontInfo = await lastValueFrom(runTimeInfoObs$);
//     return deviceInfo;
//   }

//   public async getRuntimeTotalInfo(dto: GetRuntimeDeviceLastInfoDto, teamId: OrganizationId, id: string): Promise<DeviceRuntimeFrontInfo> {
//     const baseQuery = `
//     from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
//     |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
//     |> filter(fn: (r) => r["device_id"] == "${id}")
//     |> filter(fn: (r) => r["team_id"] == "${teamId}")
//     |> filter(fn: (r) => %MEASUREMENTS%)`;

//     // make query
//     const measureNames: string[] = DeviceRuntimeNames.DeviceMeasureCollection.getInstance().getMeasureNames();

//     let mesuresFilter = measureNames.reduce((acc, val) => {
//       // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc" or
//       const baseFieldsFilter = 'r["_measurement"] == "%MEASURE%" or ';
//       const makedString = baseFieldsFilter.replace('%MEASURE%', val);
//       return acc + makedString;
//     }, '');
//     // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc"
//     mesuresFilter = mesuresFilter.substring(0, mesuresFilter.lastIndexOf(' or '));
//     const query = baseQuery.replace('%MEASUREMENTS%', mesuresFilter);

//     // make observable
//     const influxRowObs$: Observable<InfluxData> = from(this.influxDbQuerier.client.rows(query)).pipe(map((row) => row.tableMeta.toObject(row.values)));

//     // process data
//     const runTimeInfoObs$: Observable<DeviceRuntimeFrontInfo> = influxRowObs$.pipe(
//       reduce((acc, val) => {
//         return this.accumulateFieldDatas(acc, val);
//       }, {} as DeviceRuntimeFrontInfo),
//     );

//     // get observable result
//     const deviceInfo: DeviceRuntimeFrontInfo = await lastValueFrom<DeviceRuntimeFrontInfo>(runTimeInfoObs$);
//     return deviceInfo;
//   }
// }
