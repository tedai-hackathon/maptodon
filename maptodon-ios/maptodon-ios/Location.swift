import CoreLocation
import Foundation

class LocationHandler: ObservableObject {
    static let shared = LocationHandler()
    private init() {
        manager = CLLocationManager() // Creating a location manager instance is safe to call here in `MainActor`.
        manager.requestWhenInUseAuthorization()
        manager.startUpdatingLocation()
        manager.startUpdatingHeading()
    }

    deinit {
        manager.stopUpdatingLocation()
        manager.stopUpdatingHeading()
    }

    private let manager: CLLocationManager

    func currentCoordinate() -> CLLocationCoordinate2D? {
        if manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways {
            return manager.location?.coordinate
        } else {
            return nil
        }
    }

    func currentDirection() -> CLLocationDirection? {
        if manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways {
            return manager.heading?.trueHeading
        } else {
            return nil
        }
    }
}
