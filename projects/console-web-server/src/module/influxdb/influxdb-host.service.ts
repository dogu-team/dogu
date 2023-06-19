import { Injectable } from '@nestjs/common';

export type InfluxData = { [key: string]: any };

@Injectable()
export class InfluxDbHostService {
  // async getRuntimeListByTeamId(dto: GetRuntimeHostListDto, teamId: TeamId): Promise<string[]> {
  //   const query = `
  //   from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
  //   |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
  //   |> filter(fn: (r) => r["team_id"] == "${teamId}")`;
  //   const influxRowObs$: Observable<Row> = from(this.influxDBAPIService.api.rows(query));
  //   const obs$: Observable<string[]> = influxRowObs$.pipe(
  //     distinct((row) => row.tableMeta.toObject(row.values).host_id as HostId),
  //     map((row) => row.tableMeta.toObject(row.values).host_id as HostId),
  //     reduce((acc, x) => {
  //       return [...acc, x];
  //     }, [] as string[]),
  //   );
  //   const hostList: string[] = await lastValueFrom(obs$);
  //   return hostList;
  // }
  // private processData(rowData: InfluxData): HostRuntimeFrontInfo {
  //   const hostRuntimeFrontInfo: HostRuntimeFrontInfo = {
  //     hostId: rowData.host_id as HostId,
  //     teamId: rowData.team_id as string,
  //     hostName: {
  //       [rowData.hostname]: {
  //         platform: rowData.platform as string,
  //         measurement: {
  //           [rowData._measurement]: {
  //             [rowData._field]: [{ value: rowData._value as string, time: rowData._time as string }],
  //           },
  //         },
  //       },
  //     },
  //   };
  //   return hostRuntimeFrontInfo;
  // }
  // private accumulateFieldDatas(acc: HostRuntimeFrontInfo, rowData: InfluxData): HostRuntimeFrontInfo {
  //   const processedValue: HostRuntimeFrontInfo = this.processData(rowData);
  //   // acc 최초
  //   if (!acc.hostId) {
  //     return processedValue;
  //   }
  //   // hostName 최초
  //   if (!acc.hostName[rowData.hostname as string]) {
  //     acc.hostName[rowData.hostname as string] = processedValue.hostName[rowData.hostname as string];
  //     return acc;
  //   }
  //   // mesurement 최초
  //   if (!acc.hostName[rowData.hostname as string].measurement[rowData._measurement as string]) {
  //     acc.hostName[rowData.hostname as string].measurement[rowData._measurement as string] =
  //       processedValue.hostName[rowData.hostname as string].measurement[rowData._measurement as string];
  //     return acc;
  //   }
  //   // field 최초
  //   if (!acc.hostName[rowData.hostname as string].measurement[rowData._measurement as string][rowData._field as string]) {
  //     acc.hostName[rowData.hostname as string].measurement[rowData._measurement as string][rowData._field as string] =
  //       processedValue.hostName[rowData.hostname as string].measurement[rowData._measurement as string][rowData._field as string];
  //     return acc;
  //   }
  //   // fields value 병합
  //   const accFieldValues = acc.hostName[rowData.hostname as string].measurement[rowData._measurement as string][rowData._field as string];
  //   const processedFieldValues = processedValue.hostName[rowData.hostname as string].measurement[rowData._measurement as string][rowData._field as string];
  //   const mergedFieldValues = _.concat(accFieldValues, processedFieldValues);
  //   acc.hostName[rowData.hostname as string].measurement[rowData._measurement as string][rowData._field as string] = mergedFieldValues;
  //   return acc;
  // }
  // async getRuntimeLastInfo(dto: GetRuntimeHostLastInfoDto, teamId: TeamId, hostId: HostId): Promise<HostRuntimeFrontInfo> {
  //   const baseQuery = `
  //   from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
  //   |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
  //   |> filter(fn: (r) => r["host_id"] == "${hostId}")
  //   |> filter(fn: (r) => r["team_id"] == "${teamId}")
  //   |> filter(fn: (r) => %MEASUREMENTS%)
  //   |> last()`;
  //   // make query
  //   const measureNames: string[] = HostRuntimeNames.HostMeasureCollection.getInstance().getMeasureNames();
  //   let mesuresFilter = measureNames.reduce((acc, val) => {
  //     // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc" or
  //     const baseFieldsFilter = 'r["_measurement"] == "%MEASURE%" or ';
  //     const makedString = baseFieldsFilter.replace('%MEASURE%', val);
  //     return acc + makedString;
  //   }, '');
  //   // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc"
  //   mesuresFilter = mesuresFilter.substring(0, mesuresFilter.lastIndexOf(' or '));
  //   const query = baseQuery.replace('%MEASUREMENTS%', mesuresFilter);
  //   // make observable
  //   const influxRowObs$: Observable<Row> = from(this.influxDBAPIService.api.rows(query));
  //   // process data
  //   const runTimeInfoObs$: Observable<HostRuntimeFrontInfo> = influxRowObs$.pipe(
  //     map((row) => row.tableMeta.toObject(row.values)),
  //     reduce((acc, val) => {
  //       return _.merge(acc, this.processData(val));
  //     }, {} as HostRuntimeFrontInfo),
  //   );
  //   // get observable result
  //   const hostInfo: HostRuntimeFrontInfo = await lastValueFrom<HostRuntimeFrontInfo>(runTimeInfoObs$);
  //   return hostInfo;
  // }
  // async getRuntimeInfo(dto: GetRuntimeHostInfoDto, teamId: TeamId, hostId: HostId): Promise<HostRuntimeFrontInfo> {
  //   const baseQuery = `
  //   from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
  //   |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
  //   |> filter(fn: (r) => r["host_id"] == "${hostId}")
  //   |> filter(fn: (r) => r["team_id"] == "${teamId}")
  //   |> filter(fn: (r) => r["_measurement"] == "%MEASUREMENT%")
  //   |> filter(fn: (r) => %FIELDS%)`;
  //   // make queries
  //   // result => r["_field"] == "aaa" or r["_field"] == "bbb" or r["_field"] == "ccc" or
  //   let fieldsFilter = dto.fields.reduce((acc, val) => {
  //     const baseFieldsFilter = 'r["_field"] == "%FEILD%" or ';
  //     const makedString = baseFieldsFilter.replace('%FEILD%', val);
  //     return acc + makedString;
  //   }, '');
  //   // result => r["_field"] == "aaa" or r["_field"] == "bbb" or r["_field"] == "ccc"
  //   fieldsFilter = fieldsFilter.substring(0, fieldsFilter.lastIndexOf(' or '));
  //   const query = baseQuery.replace('%MEASUREMENT%', dto.measure).replace('%FIELDS%', fieldsFilter);
  //   // make observable
  //   const influxRowObs$: Observable<InfluxData> = from(this.influxDBAPIService.api.rows(query)).pipe(map((row) => row.tableMeta.toObject(row.values)));
  //   // process data
  //   const runTimeInfoObs$: Observable<HostRuntimeFrontInfo> = influxRowObs$.pipe(
  //     reduce((acc, val) => {
  //       return this.accumulateFieldDatas(acc, val);
  //     }, {} as HostRuntimeFrontInfo),
  //   );
  //   // get observable result
  //   const hostInfo: HostRuntimeFrontInfo = await lastValueFrom(runTimeInfoObs$);
  //   return hostInfo;
  // }
  // async getRuntimeTotalInfo(dto: GetRuntimeHostTotalInfoDto, teamId: TeamId, hostId: HostId): Promise<HostRuntimeFrontInfo> {
  //   const baseQuery = `
  //   from(bucket: "${env.DOGU_INFLUX_DB_BUCKET}")
  //   |> range(start: ${dto.timeStart}, stop:${dto.timeEnd})
  //   |> filter(fn: (r) => r["host_id"] == "${hostId}")
  //   |> filter(fn: (r) => r["team_id"] == "${teamId}")
  //   |> filter(fn: (r) => %MEASUREMENTS%)`;
  //   // make query
  //   const measureNames: string[] = HostRuntimeNames.HostMeasureCollection.getInstance().getMeasureNames();
  //   let mesuresFilter = measureNames.reduce((acc, val) => {
  //     // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc" or
  //     const baseFieldsFilter = 'r["_measurement"] == "%MEASURE%" or ';
  //     const makedString = baseFieldsFilter.replace('%MEASURE%', val);
  //     return acc + makedString;
  //   }, '');
  //   // result => r["_measurement"] == "aaa" or r["_measurement"] == "bbb" or r["_measurement"] == "ccc"
  //   mesuresFilter = mesuresFilter.substring(0, mesuresFilter.lastIndexOf(' or '));
  //   const query = baseQuery.replace('%MEASUREMENTS%', mesuresFilter);
  //   // make observable
  //   const influxRowObs$: Observable<InfluxData> = from(this.influxDBAPIService.api.rows(query)).pipe(map((row) => row.tableMeta.toObject(row.values)));
  //   // process data
  //   const runTimeInfoObs$: Observable<HostRuntimeFrontInfo> = influxRowObs$.pipe(
  //     reduce((acc, val) => {
  //       return this.accumulateFieldDatas(acc, val);
  //     }, {} as HostRuntimeFrontInfo),
  //   );
  //   // get observable result
  //   const hostInfo: HostRuntimeFrontInfo = await lastValueFrom<HostRuntimeFrontInfo>(runTimeInfoObs$);
  //   return hostInfo;
  // }
}
