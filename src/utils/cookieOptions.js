const cookieOptions = (req)  => {

    const isProdaction = process.env.NODE_ENV === 'production'
    
    return {
        httpOnly: true,
        secure: isProdaction && req.hostname !== 'localhost',
        sameSite: "Strict",
        path:"/",
        maxAge: 24 * 60 * 60 * 1000,  // 1 day
    }
}

export default cookieOptions;