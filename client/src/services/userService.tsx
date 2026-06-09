export const userBasicInfo = async (token) => {
  const response = await fetch("/api/user/basicInfo", {
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
  const response = await fetch("/api/user/basicInfo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = (await response).json();
  if (!response.ok) {
      throw new Error("Failed to update user info");
    }
  
    return data;
};


export const updateUserPassword = async(
  token: string, 
  userData: {
    curr_password: string;
    new_password: string;
    confirm_password: string;
  },
) => {
  const response = await fetch("/api/user/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = (await response).json();
  if (!response.ok) {
    throw new Error("Failed to update new password");
  }
  return data;
}