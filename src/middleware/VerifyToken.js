import prisma from '../config/Prisma.js';
import jsonwebtoken from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";


export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
   
    // Ambil nilai token terlebih dahulu dari header
    const token = authHeader && authHeader.split(" ")[1];

    // Baru lakukan pengecekan apakah token tersebut ada atau kosong
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token tidak ditemukan" });
    }

    try {
        // Verifikasi token JWT
        const decoded = jsonwebtoken.verify(token, JWT_SECRET);
        
        // Cek apakah data user ini masih ada di database
        const userAktif = await prisma.userSiakad.findUnique({
            where: { id: decoded.id } // Pastikan nama field ID sesuai (misal string atau number)
        });

        // Jika user ternyata sudah dihapus oleh Admin lain dari DB
        if (!userAktif) {
            // hapus juga cookie-nya dari sini
            res.clearCookie("token");
            res.clearCookie("email");
            res.clearCookie("userId");

            return res.status(401).json({ 
                message: "Unauthorized: Akun Anda telah dihapus oleh Admin. Sesi dikeluarkan." 
            });
        }

        // Simpan data user asli dari database ke properti req.user (lebih aman daripada data decode JWT saja)
        req.user = userAktif;
        
        // Lolos, lanjut ke controller utama
        next();
    } catch (error) {
        // Jika token palsu, sudah kedaluwarsa, atau terjadi error DB
        return res.status(401).json({ message: "Unauthorized: Token tidak valid atau sesi berakhir" });
    }
};