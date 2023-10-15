import AVFoundation
import CoreGraphics
import CoreMotion
import Foundation
import SQLite
import UIKit

class Frame: NSObject, ObservableObject {
    @Published var image: CGImage?
    private var metadata: FrameData?
    private let db: Connection

    private var permissionGranted = true
    private let captureSession = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "sessionQueue")
    private let context = CIContext()

    @Published var isScanning: Bool
    private var startDirection: CLLocationDirection?

    var sessionId = UUID()

    let maptodon_raw = Table("maptodon_raw")
    let session_id = Expression<UUID>("session_id")
    let uuid = Expression<UUID>("uuid")
    let lat = Expression<Double>("lat")
    let long = Expression<Double>("long")
    let orientation_x = Expression<Double>("orientation_x")
    let orientation_y = Expression<Double>("orientation_y")
    let orientation_z = Expression<Double>("orientation_z")
    let ts = Expression<Date>("ts")
    let image_blob = Expression<Blob>("image_blob")

    override init() {
        db = try! Connection(URL.documentsDirectory.absoluteString + "/db.sqlite")
        isScanning = false
        super.init()
        try! db.run(maptodon_raw.create(ifNotExists: true) { t in
            t.column(uuid, primaryKey: true)
            t.column(session_id)
            t.column(lat)
            t.column(long)
            t.column(orientation_x)
            t.column(orientation_y)
            t.column(orientation_z)
            t.column(ts)
            t.column(image_blob)
        })

        checkPermission()
        sessionQueue.async { [unowned self] in
            self.setupCaptureSession()
            self.captureSession.startRunning()
        }
    }

    func checkPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: // The user has previously granted access to the camera.
            permissionGranted = true

        case .notDetermined: // The user has not yet been asked for camera access.
            requestPermission()

        // Combine the two other cases into the default case
        default:
            permissionGranted = false
        }
    }

    func requestPermission() {
        // Strong reference not a problem here but might become one in the future.
        AVCaptureDevice.requestAccess(for: .video) { [unowned self] granted in
            self.permissionGranted = granted
        }
    }

    func setupCaptureSession() {
        let videoOutput = AVCaptureVideoDataOutput()

        guard permissionGranted else { return }
        guard let videoDevice = AVCaptureDevice.default(.builtInUltraWideCamera, for: .video, position: .back) else { return }
        try? videoDevice.lockForConfiguration()
        videoDevice.videoZoomFactor = 1
        videoDevice.unlockForConfiguration()
        print(String(describing: videoDevice.activeVideoMaxFrameDuration))
        guard let videoDeviceInput = try? AVCaptureDeviceInput(device: videoDevice) else { return }
        guard captureSession.canAddInput(videoDeviceInput) else { return }
        captureSession.addInput(videoDeviceInput)

        videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue(label: "sampleBufferQueue"))
        captureSession.addOutput(videoOutput)

        videoOutput.connection(with: .video)?.videoOrientation = .portrait
    }

    func startScanning() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        isScanning = true
        sessionId = UUID()
        let tmp = LocationHandler.shared.currentDirection()
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
            self.startDirection = tmp
        }
    }

    func stopScanning() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        isScanning = false
        startDirection = nil
        for t in try! db.prepare(maptodon_raw.select(uuid, ts)) {
            print("uuid: \(t[uuid]), ts: \(t[ts])")
        }
        // try! db.run(maptodon_raw.drop())
    }
}

extension Frame: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from _: AVCaptureConnection) {
        guard let cgImage = imageFromSampleBuffer(sampleBuffer: sampleBuffer), let coordinate = LocationHandler.shared.currentCoordinate(), let acceleration = MotionControlHandler.shared.currentMotion() else { return }

        DispatchQueue.main.async { [unowned self] in
            self.image = cgImage
            if self.isScanning {
                guard let startDirection else { return }
                let lower = startDirection - 15 > 0 ? startDirection - 15 : 360 - startDirection + 15
                let upper = (startDirection + 15 < 360) ? startDirection + 15 : startDirection + 15 - 360
                guard (lower <= upper ? lower ... upper : upper ... lower).contains(LocationHandler.shared.currentDirection()!) else { return }
                self.stopScanning()
            }

            DispatchQueue.global(qos: .utility).async { [unowned self] in
                if self.isScanning {
                    try! db.run(maptodon_raw.insert(
                        session_id <- sessionId,
                        uuid <- UUID(),
                        lat <- coordinate.latitude,
                        long <- coordinate.longitude,
                        orientation_x <- acceleration.x,
                        orientation_y <- acceleration.y,
                        orientation_z <- acceleration.z,
                        ts <- Date(),
                        image_blob <- UIImage(cgImage: cgImage).jpegData(compressionQuality: 1.0)!.datatypeValue
                    ))
                }
            }
        }
    }

    private func imageFromSampleBuffer(sampleBuffer: CMSampleBuffer) -> CGImage? {
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return nil }
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let rect = ciImage.extent.applying(CGAffineTransform(scaleX: 0.5, y: 0.5))
        guard let cgImage = context.createCGImage(ciImage, from: rect) else { return nil }

        return cgImage
    }
}

struct FrameData {
    init(lat: Double, long: Double, orientation_x: Double, orientation_y: Double, orientation_z: Double, image_blob: CGImage) {
        uuid = UUID()
        self.lat = lat
        self.long = long
        self.orientation_x = orientation_x
        self.orientation_y = orientation_y
        self.orientation_z = orientation_z
        ts = Date()
        self.image_blob = UIImage(cgImage: image_blob).jpegData(compressionQuality: 1.0)!.datatypeValue
    }

    var uuid: UUID
    var lat: Double
    var long: Double
    var orientation_x: Double
    var orientation_y: Double
    var orientation_z: Double
    var ts: Date
    var image_blob: Blob
}
