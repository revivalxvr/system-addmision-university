import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
   
    // 1. Ambil nilai token terlebih dahulu dari header
    const token = authHeader && authHeader.split(" ")[1];

    // 2. Baru lakukan pengecekan apakah token tersebut ada atau kosong
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token tidak ditemukan" });
    }

    try {
        // 3. Verifikasi token JWT
        const decoded = jsonwebtoken.verify(token, JWT_SECRET);
        
        // 4. Simpan data user hasil decode ke properti req.user
        req.user = decoded;
        
        // 5. Lolos, lanjut ke controller utama (misal: getFaculties)
        next();
    } catch (error) {
        // Jika token palsu atau sudah kedaluwarsa
        return res.status(401).json({ message: "Unauthorized: Token tidak valid" });
    }
};