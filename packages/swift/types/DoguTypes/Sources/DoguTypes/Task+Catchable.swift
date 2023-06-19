import Combine

extension Task where Success == Void, Failure == Error {
  public static func catchable(_ function: @escaping () async throws -> Success, catch: @escaping (Error) -> Void) {
    Task<Void, Never> {
      do {
        try await function()
      } catch {
        `catch`(error)
      }
    }
  }
}
