import SwiftUI
import FamilyControls

@available(iOS 16.0, *)
struct AppPickerView: View {
  @Binding var isPresented: Bool
  @State private var selection = FamilyActivitySelection()
  var onSelectionComplete: (FamilyActivitySelection) -> Void
  
  var body: some View {
    NavigationView {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Choose Activities")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button("Cancel") {
              isPresented = false
            }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button("Done") {
              onSelectionComplete(selection)
              isPresented = false
            }
          }
        }
    }
  }
}

@available(iOS 16.0, *)
class AppPickerHostingController: UIHostingController<AppPickerViewWrapper> {
  init(onSelectionComplete: @escaping (FamilyActivitySelection) -> Void, onDismiss: @escaping () -> Void) {
    let wrapper = AppPickerViewWrapper(onSelectionComplete: onSelectionComplete, onDismiss: onDismiss)
    super.init(rootView: wrapper)
    self.modalPresentationStyle = .fullScreen
  }
  
  @MainActor required dynamic init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
}

@available(iOS 16.0, *)
struct AppPickerViewWrapper: View {
  @State private var selection = FamilyActivitySelection()
  var onSelectionComplete: (FamilyActivitySelection) -> Void
  var onDismiss: () -> Void
  
  var body: some View {
    NavigationView {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Choose Activities")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .cancellationAction) {
            Button("Cancel") {
              onDismiss()
            }
          }
          ToolbarItem(placement: .confirmationAction) {
            Button("Done") {
              onSelectionComplete(selection)
              onDismiss()
            }
          }
        }
    }
  }
}
