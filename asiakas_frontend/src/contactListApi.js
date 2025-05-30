export const getContactList = () => {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contacts/all`).then(
    (response) => {
      if (!response.ok)
        throw new Error("error in fetch: " + response.statusText);

      return response.json();
    }
  );
};

export const addContact = (newContact) => {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contacts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newContact),
  }).then((response) => {
    if (!response.ok) throw new Error("error in fetch: " + response.statusText);

    return response.json();
  });
};

export const fetchOrganizations = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/organizations/all`
  );
  if (!response.ok) throw new Error("Failed to fetch organizations");
  return response.json();
};

export const fetchCallLists = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/callinglist/all`
  );
  if (!response.ok) throw new Error("Failed to fetch Calling Lists");
  return response.json();
};

export const fullContactsCallLists = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/concalllist/all`
  );
  if (!response.ok) throw new Error("Failed to fetch contacts from Call Lists");  
  return response.json();
};

export const removeContactsCallLists = async (contactIds) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/concalllist/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactIds),
    });

  if (!response.ok) throw new Error("Failed to remove Contacts and Call Lists assosiations");  
  return response.json();
};