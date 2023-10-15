import CoreMotion
import Foundation

class MotionControlHandler: ObservableObject {
    static let shared = MotionControlHandler()
    private let manager: CMMotionManager
    private init() {
        manager = CMMotionManager()
        manager.deviceMotionUpdateInterval = 0.01
        manager.startDeviceMotionUpdates(using: .xArbitraryZVertical)
    }

    deinit {
        manager.stopDeviceMotionUpdates()
    }

    func currentMotion() -> CMAcceleration? {
        if manager.isDeviceMotionAvailable {
            return manager.deviceMotion?.gravity
        } else {
            return nil
        }
    }
}
