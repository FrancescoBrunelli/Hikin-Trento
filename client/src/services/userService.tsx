export const userBasicInfo = async (token) => {
  const response = await fetch("http://localhost:3000/api/user/basicInfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  return await response.json();
};




export const updateUserInfo = async (
  token: string,
  userData: {
    name: string;
    surname: string;
    username: string;
  },
) => {
  const response = await fetch("http://localhost:3000/api/user/basicInfo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = (await response).json();
  if (!response.ok) {
      throw new Error(data.error || "Failed to update user info");
    }
  
    return data;
};
