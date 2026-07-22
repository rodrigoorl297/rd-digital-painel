export const user = {
  name: "Orlando",
  displayName: "Orlando",
  firstName: "Orlando",
  email: "orlando@gmail.com",
};

export const companies = [
  {
    id: "empresa-rd",
    name: "RD Digital",
  },
];

export const credits = {
  balance: 0,
  used: 0,
  purchased: 0,
};

export const disparos: Array<{
  id: string;
  name: string;
  status: string;
  draft: boolean;
  date: string;
  company: string;
  product: string;
  metric: string;
}> = [];

export const listas: Array<{
  id: string;
  name: string;
  rows: string | null;
  date: string;
}> = [];

export const creditTransactions: Array<{
  id: string;
  name: string;
  company: string;
  date: string;
  amount: number;
}> = [];

export function formatNumber(n: number) {
  return n.toLocaleString("pt-BR");
}
