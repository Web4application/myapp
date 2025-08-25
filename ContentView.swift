import SwiftUI

struct ContentView: View {
    @StateObject var auth = AuthViewModel()
    
    var body: some View {
        if auth.user == nil {
            AuthView().environmentObject(auth)
        } else {
            HomeView().environmentObject(auth)
        }
    }
}
