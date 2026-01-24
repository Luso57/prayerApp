//
//  FamilyActivityPickerPresenter.swift
//  help
//
//  Created by Alexander Corea on 1/24/26.
//

import Foundation
import UIKit
import SwiftUI
import FamilyControls

@MainActor
enum FamilyActivityPickerPresenter {
    static func present(currentSelection: FamilyActivitySelection?) async throws -> FamilyActivitySelection {
        let vc = UIHostingController(rootView: PickerView(selection: currentSelection ?? FamilyActivitySelection()))
        vc.modalPresentationStyle = .formSheet

        guard let top = topViewController() else {
            throw NSError(domain: "NoTopVC", code: 0)
        }

        top.present(vc, animated: true)

        return try await vc.rootView.waitForSelection()
    }

    private static func topViewController() -> UIViewController? {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene else { return nil }
        guard let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else { return nil }
        var top = root
        while let presented = top.presentedViewController { top = presented }
        return top
    }
}

private struct PickerView: View {
    @State var selection: FamilyActivitySelection
    @Environment(\.dismiss) private var dismiss

    // completion via continuation
    private let continuation = PickerContinuation.shared

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle("Choose apps to lock")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") {
                            continuation.finish(selection)
                            dismiss()
                        }
                    }
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            continuation.cancel()
                            dismiss()
                        }
                    }
                }
        }
    }

    func waitForSelection() async throws -> FamilyActivitySelection {
        try await continuation.wait()
    }
}

@MainActor
private final class PickerContinuation {
    static let shared = PickerContinuation()

    private var cont: CheckedContinuation<FamilyActivitySelection, Error>?

    func wait() async throws -> FamilyActivitySelection {
        try await withCheckedThrowingContinuation { cont in
            self.cont = cont
        }
    }

    func finish(_ selection: FamilyActivitySelection) {
        cont?.resume(returning: selection)
        cont = nil
    }

    func cancel() {
        cont?.resume(throwing: NSError(domain: "CANCELLED", code: 1))
        cont = nil
    }
}
