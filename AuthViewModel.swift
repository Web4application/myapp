import Foundation

class AuthViewModel: ObservableObject {
    @Published var user: String? = nil
    
    func login(email: String, password: String) {
        guard let url = URL(string: "https://api.example.com/login") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONEncoder().encode(["email": email, "password": password])
        
        URLSession.shared.dataTask(with: req) { data, _, _ in
            if let data = data, let response = try? JSONDecoder().decode(UserResponse.self, from: data) {
                DispatchQueue.main.async {
                    self.user = response.user
                }
            }
        }.resume()
    }
    
    func signup(email: String, password: String) {
        // Same idea as login → call your FastAPI /signup
    }
    
    func logout() {
        user = nil
    }
}

struct UserResponse: Codable {
    let user: String
}
