import Foundation

class APIService {
    func fetchData(completion: @escaping (Result<String, Error>) -> Void) {
        guard let url = URL(string: "https://api.example.com/data") else { return }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            if let data = data, let text = String(data: data, encoding: .utf8) {
                completion(.success(text))
            }
        }.resume()
    }
}
