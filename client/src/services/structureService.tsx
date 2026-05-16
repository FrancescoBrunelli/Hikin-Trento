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

export const searchStructures = async (query: string, filters: {managed? : boolean} = {}) => {
  const params = new URLSearchParams({q : query})
  if (filters.managed !== undefined) params.append('managed', String(filters.managed))
  const res = await fetch(`/api/structures/search?${params}`);
  const data = await res.json();
  return data.structures ?? [];
};

export const signUpStructure = async (payload: Record<string, any>) => {
  const response = await fetch(
    "http://localhost:3000/api/auth/register_structure",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  // backend returned error
  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.error || "Structure signup failed"
    );
  }

  // success
  return await response.json();
};

