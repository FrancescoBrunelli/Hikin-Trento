export const searchStructures = async (query: string) => {
  const res = await fetch(`/api/structures/search?q=${query}`);
  const data = await res.json();
  return data.structures ?? [];
};