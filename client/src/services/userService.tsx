export const userBasicInfo = async (token) => {
  const response = await fetch(
    "http://localhost:3000/api/user/basicInfo",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  return await response.json();
};