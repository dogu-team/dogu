// swift-tools-version: 5.7

import PackageDescription

let package = Package(
  name: "DoguTypes",
  platforms: [
    .macOS(.v10_15),
    .iOS(.v14),
  ],
  products: [
    .library(
      name: "DoguTypes",
      targets: ["DoguTypes"])
  ],
  dependencies: [
    .package(url: "https://github.com/grpc/grpc-swift.git", from: "1.11.0"),
    .package(url: "https://github.com/sindresorhus/ExceptionCatcher", from: "2.0.1"),
  ],
  targets: [
    .target(
      name: "DoguTypes",
      dependencies: [
        .product(name: "GRPC", package: "grpc-swift"),
        .product(name: "ExceptionCatcher", package: "ExceptionCatcher"),
      ]),
    .testTarget(
      name: "DoguTypesTests",
      dependencies: ["DoguTypes"]),
  ]
)
