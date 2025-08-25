import SwiftUI

struct HomeView: View {
    @EnvironmentObject var auth: AuthViewModel
    
    var body: some View {
        VStack {
            Text("🚀 Welcome, \(auth.user ?? "Guest")!")
            Button("Logout") { auth.logout() }
        }
    }
}
