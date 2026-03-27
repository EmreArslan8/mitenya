export const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır';
  if (!/[A-Z]/.test(password)) return 'En az bir büyük harf içermelidir';
  if (!/[a-z]/.test(password)) return 'En az bir küçük harf içermelidir';
  if (!/[0-9]/.test(password)) return 'En az bir rakam içermelidir';
  return null;
};
