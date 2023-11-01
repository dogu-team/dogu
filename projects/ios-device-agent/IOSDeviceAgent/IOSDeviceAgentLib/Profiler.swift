//
//  Profiler.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/08/09.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation

func queryProfile(param: Inner_Types_DcIdaQueryProfileParam) async throws -> Inner_Types_DcIdaQueryProfileResult {
  var info = Outer_Profile_RuntimeInfo()
  info.cpues = try await getCpuUsages()
  info.mems = try await getMemUsages()
  return Inner_Types_DcIdaQueryProfileResult.with {
    $0.info = info
  }
}

var previousCpuLoadInfo = host_cpu_load_info()
var previousRuntimeInfo = Outer_Profile_RuntimeInfoCpu()

func getCpuUsages() async throws -> [Outer_Profile_RuntimeInfoCpu] {
  guard let cpuLoadInfo = hostCPULoadInfo() else {
    Log.shared.error("Error  - \(#file): \(#function) - hostCPULoadInfo() is nil")
    return []
  }
  let userDiff = cpuLoadInfo.cpu_ticks.0 - previousCpuLoadInfo.cpu_ticks.0
  let systemDiff = cpuLoadInfo.cpu_ticks.1 - previousCpuLoadInfo.cpu_ticks.1
  let idleDiff = cpuLoadInfo.cpu_ticks.2 - previousCpuLoadInfo.cpu_ticks.2
  let niceDiff = cpuLoadInfo.cpu_ticks.3 - previousCpuLoadInfo.cpu_ticks.3
  let totalTicks = userDiff + systemDiff + idleDiff + niceDiff
  if 0 == totalTicks {
    return [previousRuntimeInfo]
  }
  let cpuUsage = Float(userDiff + systemDiff + niceDiff) / Float(totalTicks) * 100.0
  previousCpuLoadInfo = cpuLoadInfo
  previousRuntimeInfo = Outer_Profile_RuntimeInfoCpu.with {
    $0.name = "default"
    $0.currentLoad = UInt64(Float(userDiff + systemDiff + niceDiff) * 100.0 / Float(totalTicks))
    $0.currentLoadUser = UInt64(Float(userDiff) * 100.0 / Float(totalTicks))
    $0.currentLoadSystem = UInt64(Float(systemDiff) * 100.0 / Float(totalTicks))
    $0.currentLoadNice = UInt64(Float(niceDiff) * 100.0 / Float(totalTicks))
    $0.currentLoadIdle = UInt64(Float(idleDiff) * 100.0 / Float(totalTicks))
    $0.currentLoadIrq = 0
    $0.currentLoadCpu = 100
  }
  return [previousRuntimeInfo]

}

var pageSize: UInt64? = nil

func getMemUsages() async throws -> [Outer_Profile_RuntimeInfoMem] {
  if pageSize == nil {
    pageSize = UInt64(getVMPageSize())
  }
  guard let pageSize = pageSize else {
    Log.shared.error("Error  - \(#file): \(#function) - pageSize is nil")
    return []
  }
  guard let vmstat = getVMStatistics() as vm_statistics? else {
    Log.shared.error("Error  - \(#file): \(#function) - vmstat is nil")
    return []
  }
  return [
    Outer_Profile_RuntimeInfoMem.with {
      $0.name = "default"
      $0.total = UInt64(vmstat.wire_count + vmstat.active_count + vmstat.inactive_count + vmstat.free_count) * pageSize
      $0.free = UInt64(vmstat.free_count) * pageSize
      $0.used = UInt64(vmstat.wire_count + vmstat.active_count + vmstat.inactive_count) * pageSize
      $0.active = UInt64(vmstat.active_count) * pageSize
      $0.available = UInt64(vmstat.free_count + vmstat.inactive_count) * pageSize
      $0.swaptotal = 0
      $0.swapused = 0
      $0.swapfree = 0
      $0.isLow = false

    }

  ]
}

func hostCPULoadInfo() -> host_cpu_load_info? {
  let HOST_CPU_LOAD_INFO_COUNT = MemoryLayout<host_cpu_load_info>.stride / MemoryLayout<integer_t>.stride
  var size = mach_msg_type_number_t(HOST_CPU_LOAD_INFO_COUNT)
  var cpuLoadInfo = host_cpu_load_info()

  let result = withUnsafeMutablePointer(to: &cpuLoadInfo) {
    $0.withMemoryRebound(to: integer_t.self, capacity: HOST_CPU_LOAD_INFO_COUNT) {
      host_statistics(mach_host_self(), HOST_CPU_LOAD_INFO, $0, &size)
    }
  }
  if result != KERN_SUCCESS {
    Log.shared.debug("Error  - \(#file): \(#function) - kern_result_t = \(result)")
    return nil
  }
  return cpuLoadInfo
}

func getVMPageSize() -> UInt {
  var pageSize: vm_size_t = 0
  let result = withUnsafeMutablePointer(to: &pageSize) { (size) -> kern_return_t in
    host_page_size(mach_host_self(), size)
  }

  guard result == KERN_SUCCESS else {
    return 0
  }

  return UInt(pageSize)
}

func getVMStatistics() -> vm_statistics {
  var vmstat = vm_statistics()
  var count = UInt32(MemoryLayout<vm_statistics>.size / MemoryLayout<integer_t>.size)

  let result = withUnsafeMutablePointer(to: &vmstat) {
    $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
      return host_statistics(mach_host_self(), HOST_VM_INFO, host_info_t($0), &count)
    }
  }

  guard result == KERN_SUCCESS else {
    return vm_statistics()
  }

  return vmstat
}
