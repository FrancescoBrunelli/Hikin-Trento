export const getBasicInfo = async ({
  latitude = 46.07,
  longitude = 11.12,
  radius = 0,
  show_managed = true,
  show_unmanaged = true
} = {}) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radius: String(radius),
    show_managed: String(show_managed),
    show_unmanaged: String(show_unmanaged)
  });
  const res = await fetch(`/api/structures/basicInfo?${params}`);
  const data = await res.json();
  return data.structures ?? [];
};

export const searchStructures = async (query: string) => {
  const res = await fetch(`/api/structures/search?q=${query}`);
  const data = await res.json();
  return data.structures ?? [];
};