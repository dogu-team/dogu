import Combine

extension Future where Failure == Error {
  public convenience init(from throwingFunction: @escaping () throws -> Output) {
    self.init { promise in
      do {
        let value = try throwingFunction()
        promise(.success(value))
      } catch {
        promise(.failure(error))
      }
    }
  }

  public convenience init(from throwingFunction: @escaping () async throws -> Output) {
    self.init { promise in
      Task {
        do {
          let value = try await throwingFunction()
          promise(.success(value))
        } catch {
          promise(.failure(error))
        }
      }
    }
  }
}

extension Future where Failure == Never {
  public convenience init(from function: @escaping () -> Output) {
    self.init { promise in
      let value = function()
      promise(.success(value))
    }
  }

  public convenience init(from function: @escaping () async -> Output) {
    self.init { promise in
      Task {
        let value = await function()
        promise(.success(value))
      }
    }
  }
}
