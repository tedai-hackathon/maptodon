//
//  ContentView.swift
//  maptodon-ios
//
//  Created by Kotaro Suto on 2023/10/14.
//

import CoreMotion
import SwiftUI

struct ContentView: View {
    var body: some View {
        CameraView(frame: Frame())
    }
}

struct CameraView: View {
    @StateObject var frame: Frame

    var body: some View {
        ZStack {
            FrameView(frame: frame)
            VStack {
                MessageView(frame: frame)
                // ShareLink(item: URL(string: URL.documentsDirectory.absoluteString + "/db.sqlite")!)
                ShutterButtonView(frame: frame)
            }
            .frame(width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height)
        }
    }
}

struct FrameView: View {
    @StateObject var frame: Frame
    private let label = Text("frame")
    @State private var isAnimating: Bool = false

    var body: some View {
        if let image = frame.image {
            ZStack {
                Image(image, scale: 1.0, orientation: .up, label: label)
                if frame.isScanning {
                    Color.white
                        .opacity(isAnimating ? 0.5 : 0.2)
                        .animation(.linear(duration: 1.5).repeatForever(), value: isAnimating)
                        .onAppear {
                            isAnimating = true
                        }
                }
            }
        } else {
            Color.black
        }
    }
}

struct MessageView: View {
    @StateObject var frame: Frame

    var body: some View {
        Spacer()
        if frame.isScanning {
            Image(systemName: "arrowshape.right.fill")
                .resizable()
                .frame(width: 100, height: 100)
                .symbolEffect(.pulse.wholeSymbol, options: .speed(1.0).repeating)
                .foregroundColor(.green)
        } else {
            Text("Look Straight")
                .font(.largeTitle)
                .bold()
                .padding()
        }
        Spacer()
    }
}

struct ShutterButtonView: View {
    @StateObject var frame: Frame

    var body: some View {
        Button(action: {
            if frame.isScanning {
                frame.stopScanning()
            } else {
                frame.startScanning()
            }
        }, label: {
            Image(systemName: frame.isScanning ? "stop.circle" : "record.circle")
                .resizable()
                .frame(width: 100, height: 100)
                .foregroundColor(frame.isScanning ? .red : .green)
                .padding(30)
        })
    }
}

#Preview {
    ContentView()
}
