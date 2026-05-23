export const successResponse =(ress, message, data = null, status = 200) => {
    return ress.status(status).json({
        success: true,
        message,
        data,
    })
}


export const errorResponse = (ress, message, data = null, status = 400) => {
    return ress.status(status).json({
        success: false,
        message,
        data,
    })
}

