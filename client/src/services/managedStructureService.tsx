export const managedStructureBasicInfo = async (token) => {
  const response = await fetch("", {
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
}


export const updateStructureInfo = async (
  token: string,
  structureData: {
    name_owner: string;
    surname_owner: string;
    telephone: string;
  },
) => {
  const response = await fetch("http://localhost:3000/api/structures/basicInfo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(structureData),
  });

  const data = (await response).json();
  if (!response.ok) {
      throw new Error("Failed to update user info");
    }
  
    return data;
};


export const updateStructurePassword = async(
  token: string, 
  structureData: {
    curr_password: string;
    new_password: string;
    confirm_password: string;
  },
) => {
  const response = await fetch("http://localhost:3000/api/structures/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(structureData),
  });

  const data = (await response).json();
  if (!response.ok) {
    throw new Error("Failed to update new password");
  }
  return data;
}

