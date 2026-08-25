// Límites de subida de imágenes, compartidos por el avatar de usuario
// (updateUserSchema) y la foto de peña (gangImageSchema), y por los
// componentes que validan en cliente antes de enviar (Q7).
// 4MB y no 5: las funciones serverless de Vercel rechazan con 413 los
// cuerpos de más de 4,5MB antes de que la action llegue a ejecutarse.
export const MAX_FILE_SIZE = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
