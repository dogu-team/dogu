//
//  StreamingOption.swift
//  DoguScreen
//
//  Created by jenkins on 2023/06/07.
//  Copyright © 2023 Dogu. All rights reserved.
//

import Foundation

struct StreamingOption: Decodable {
  var type : String = ""
  var maxFps = 30
  var maxResolution = 720
}
