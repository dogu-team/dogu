//
//  Network.swift
//  IOSDeviceAgentLib
//
//  Created by jenkins on 2023/08/04.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation

func isTCPPortOpen(host: String, port: Int) -> Bool {
    var sock: Int32 = -1
    var result = false

    // Create a socket
    sock = socket(AF_INET, SOCK_STREAM, 0)
    if sock == -1 {
        print("Error creating socket: \(String(describing: strerror(errno)))")
        return false
    }

    // Set up the server address structure
    var serverAddress = sockaddr_in()
    serverAddress.sin_len = __uint8_t(MemoryLayout<sockaddr_in>.size)
    serverAddress.sin_family = sa_family_t(AF_INET)
    serverAddress.sin_port = in_port_t(port)
    inet_pton(AF_INET, host, &serverAddress.sin_addr)

    // Connect to the server
    let connectResult = withUnsafePointer(to: &serverAddress) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
            connect(sock, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
        }
    }
    if connectResult != -1 {
        // Connection succeeded, port is open
        result = true
    }

    // Close the socket
    close(sock)

    return result
}
