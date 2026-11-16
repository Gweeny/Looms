export const PASSWORD_RULES = [
  {
    id: "length",
    label: "8 caractères minimum",
    test: (p: string) => p.length >= 8,
  },
  { id: "digit", label: "Un chiffre", test: (p: string) => /\d/.test(p) },
  { id: "upper", label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  {
    id: "special",
    label: "Un caractère spécial",
    test: (p: string) => /[^a-zA-Z0-9]/.test(p),
  },
];
export function isPasswordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
